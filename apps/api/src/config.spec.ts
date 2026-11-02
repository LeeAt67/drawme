import { describe, expect, it } from 'vitest';
import {
  DEFAULT_AGENT_API_BASE_URL,
  DEFAULT_AGENT_MODEL,
  DEFAULT_AGENT_TIMEOUT_MS,
  DEFAULT_API_PORT,
  DEFAULT_AUTH_ADMIN_EMAIL,
  DEFAULT_SESSION_COOKIE_NAME,
  DEFAULT_SESSION_TTL_HOURS,
  getChatCompletionsUrl,
  isAgentConfigured,
  isAuthConfigured,
  MAX_AUTH_OAUTH_PROVIDERS,
  normalizeBaseUrl,
  readApiConfig,
  readAuthOAuthProviders,
} from './config';

describe('api config', () => {
  it('applies defaults when the environment is empty', () => {
    const config = readApiConfig({});

    expect(config.baseUrl).toBe(DEFAULT_AGENT_API_BASE_URL);
    expect(config.model).toBe(DEFAULT_AGENT_MODEL);
    expect(config.timeoutMs).toBe(DEFAULT_AGENT_TIMEOUT_MS);
    expect(config.port).toBe(DEFAULT_API_PORT);
    expect(config.apiKey).toBe('');
    expect(config.sessionCookieName).toBe(DEFAULT_SESSION_COOKIE_NAME);
    expect(config.sessionTtlMs).toBe(DEFAULT_SESSION_TTL_HOURS * 60 * 60 * 1000);
    expect(config.cookieSecure).toBe(false);
    expect(config.authAdminEmail).toBe(DEFAULT_AUTH_ADMIN_EMAIL);
    expect(config.authAdminPassword).toBe('');
    expect(config.authAdminPasswordHash).toBe('');
    expect(config.authOAuthProviders).toEqual([]);
    expect(config.allowedOrigins).toContain('http://localhost:7200');
    expect(isAgentConfigured(config)).toBe(false);
    expect(isAuthConfigured(config)).toBe(false);
  });

  it('reads and trims environment values', () => {
    const config = readApiConfig({
      AGENT_API_BASE_URL: ' https://api.example.com/v1/// ',
      AGENT_API_KEY: ' sk-test ',
      AGENT_MODEL: ' test-model ',
      PORT: '9000',
      HOST: '127.0.0.1',
      AGENT_TIMEOUT_MS: '15000',
      AGENT_RATE_LIMIT_PER_MINUTE: '5',
      AUTH_ADMIN_EMAIL: ' Admin@Example.COM ',
      AUTH_ADMIN_PASSWORD: 'test-password',
      AUTH_RATE_LIMIT_PER_MINUTE: '4',
      SESSION_TTL_HOURS: '24',
      ALLOWED_ORIGINS: 'https://drawme.example.com, https://admin.example.com/',
    });

    expect(config.baseUrl).toBe('https://api.example.com/v1');
    expect(config.apiKey).toBe('sk-test');
    expect(config.model).toBe('test-model');
    expect(config.port).toBe(9000);
    expect(config.host).toBe('127.0.0.1');
    expect(config.timeoutMs).toBe(15000);
    expect(config.rateLimitPerMinute).toBe(5);
    expect(config.authAdminEmail).toBe('admin@example.com');
    expect(config.authAdminPassword).toBe('test-password');
    expect(config.authRateLimitPerMinute).toBe(4);
    expect(config.sessionTtlMs).toBe(24 * 60 * 60 * 1000);
    expect(config.allowedOrigins).toContain('https://drawme.example.com');
    expect(config.allowedOrigins).toContain('https://admin.example.com');
    expect(isAgentConfigured(config)).toBe(true);
    expect(isAuthConfigured(config)).toBe(true);
  });

  it('clamps numeric values and falls back for invalid input', () => {
    const config = readApiConfig({
      AGENT_TIMEOUT_MS: '10',
      PORT: 'not-a-port',
      AGENT_RATE_LIMIT_PER_MINUTE: '-1',
    });

    expect(config.timeoutMs).toBe(1000);
    expect(config.port).toBe(DEFAULT_API_PORT);
    expect(config.rateLimitPerMinute).toBe(0);
  });

  it('builds a chat completions URL from a base or full endpoint', () => {
    expect(getChatCompletionsUrl('https://api.example.com/v1///')).toBe(
      'https://api.example.com/v1/chat/completions'
    );
    expect(getChatCompletionsUrl('https://api.example.com/v1/chat/completions/')).toBe(
      'https://api.example.com/v1/chat/completions'
    );
    expect(getChatCompletionsUrl('   ')).toBe('');
    expect(normalizeBaseUrl(' https://api.example.com/v1/ ')).toBe('https://api.example.com/v1');
  });

  it('requires both an endpoint and a key to be configured', () => {
    const baseConfig = readApiConfig({ AGENT_API_KEY: 'sk-test' });
    expect(isAgentConfigured(baseConfig)).toBe(true);
    expect(isAgentConfigured({ ...baseConfig, baseUrl: '' })).toBe(false);
    expect(isAgentConfigured({ ...baseConfig, model: '' })).toBe(false);
  });

  it('uses secure __Host cookies in production and requires matching secure config', () => {
    const config = readApiConfig({ NODE_ENV: 'production', AUTH_ADMIN_PASSWORD: 'secret' });
    expect(config.cookieSecure).toBe(true);
    expect(config.sessionCookieName).toBe('__Host-drawme_session');
    expect(config.allowedOrigins).toEqual([]);

    expect(() =>
      readApiConfig({ SESSION_COOKIE_NAME: '__Host-drawme_session', COOKIE_SECURE: 'false' })
    ).toThrow(/COOKIE_SECURE=true/);
  });

  it('supports an explicit password hash without keeping the plaintext password', () => {
    const config = readApiConfig({
      AUTH_ADMIN_EMAIL: 'owner@example.com',
      AUTH_ADMIN_PASSWORD_HASH: 'scrypt$c2FsdA$aGFzaA',
    });
    expect(config.authAdminPassword).toBe('');
    expect(isAuthConfigured(config)).toBe(true);
  });

  it('parses configured OAuth providers and ignores unsafe or malformed entries', () => {
    const providers = readAuthOAuthProviders(
      JSON.stringify([
        { id: ' GitHub ', name: ' GitHub ', startUrl: '/api/auth/oauth/github/start' },
        { id: 'google', name: 'Google', startUrl: 'https://accounts.example.com/oauth' },
        { id: 'evil', name: 'Evil', startUrl: '//evil.example.com/steal' },
        { id: 'bad id', name: 'Bad', startUrl: '/api/auth/bad' },
        { id: 'github', name: 'Duplicate', startUrl: '/api/auth/duplicate' },
        { id: 'empty', name: '   ', startUrl: '/api/auth/empty' },
        'not-an-object',
      ])
    );

    expect(providers).toEqual([
      { id: 'github', name: 'GitHub', startUrl: '/api/auth/oauth/github/start' },
      { id: 'google', name: 'Google', startUrl: 'https://accounts.example.com/oauth' },
    ]);
  });

  it('treats invalid OAuth provider JSON as no providers and caps the list', () => {
    expect(readAuthOAuthProviders(undefined)).toEqual([]);
    expect(readAuthOAuthProviders('not json')).toEqual([]);
    expect(readAuthOAuthProviders('{"id":"github"}')).toEqual([]);

    const manyProviders = Array.from({ length: MAX_AUTH_OAUTH_PROVIDERS + 3 }, (_, index) => ({
      id: `provider_${index}`,
      name: `Provider ${index}`,
      startUrl: `/api/auth/oauth/provider_${index}/start`,
    }));
    expect(readAuthOAuthProviders(JSON.stringify(manyProviders))).toHaveLength(
      MAX_AUTH_OAUTH_PROVIDERS
    );
  });

  it('reads AUTH_OAUTH_PROVIDERS into the runtime config', () => {
    const config = readApiConfig({
      AUTH_OAUTH_PROVIDERS:
        '[{"id":"github","name":"GitHub","startUrl":"/api/auth/oauth/github/start"}]',
    });

    expect(config.authOAuthProviders).toEqual([
      { id: 'github', name: 'GitHub', startUrl: '/api/auth/oauth/github/start' },
    ]);
  });
});
