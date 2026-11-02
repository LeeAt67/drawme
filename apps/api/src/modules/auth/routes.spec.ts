import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance, LightMyRequestResponse } from 'fastify';
import { createServer } from '../../app';
import type { ApiConfig } from '../../config';

const createConfig = (overrides: Partial<ApiConfig> = {}): ApiConfig => ({
  baseUrl: 'https://api.example.com/v1',
  apiKey: 'sk-test',
  model: 'test-model',
  timeoutMs: 5000,
  port: 0,
  host: '127.0.0.1',
  webDistDir: null,
  rateLimitPerMinute: 0,
  sessionCookieName: 'drawme_session',
  sessionTtlMs: 7 * 24 * 60 * 60 * 1000,
  cookieSecure: false,
  authAdminEmail: 'admin@example.com',
  authAdminPassword: 'test-password',
  authAdminPasswordHash: '',
  authRateLimitPerMinute: 0,
  authDisabled: false,
  authOAuthProviders: [],
  allowedOrigins: ['http://localhost:7200'],
  ...overrides,
});

const servers: FastifyInstance[] = [];

async function createTestServer(config: ApiConfig) {
  const server = await createServer({ config });
  servers.push(server);
  return server;
}

function getSetCookie(response: LightMyRequestResponse): string {
  const header = response.headers['set-cookie'];
  return Array.isArray(header) ? header[0] || '' : header || '';
}

function getCookieHeader(response: LightMyRequestResponse): string {
  return getSetCookie(response).split(';')[0] || '';
}

async function login(server: FastifyInstance, email = 'admin@example.com') {
  return server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email, password: 'test-password' },
  });
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

describe('auth routes', () => {
  it('advertises no OAuth providers by default', async () => {
    const server = await createTestServer(createConfig());
    const response = await server.inject({ method: 'GET', url: '/api/auth/providers' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.json()).toEqual({ providers: [] });
  });

  it('advertises configured OAuth providers without requiring a session', async () => {
    const server = await createTestServer(
      createConfig({
        authOAuthProviders: [
          { id: 'github', name: 'GitHub', startUrl: '/api/auth/oauth/github/start' },
        ],
      })
    );
    const response = await server.inject({ method: 'GET', url: '/api/auth/providers' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      providers: [{ id: 'github', name: 'GitHub', startUrl: '/api/auth/oauth/github/start' }],
    });
  });

  it('uses a local user and hides sign-in when authentication is disabled', async () => {
    const server = await createTestServer(
      createConfig({
        authDisabled: true,
        authOAuthProviders: [
          { id: 'github', name: 'GitHub', startUrl: '/api/auth/oauth/github/start' },
        ],
      })
    );

    const meResponse = await server.inject({ method: 'GET', url: '/api/auth/me' });
    const providersResponse = await server.inject({
      method: 'GET',
      url: '/api/auth/providers',
    });
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'admin@example.com', password: 'test-password' },
    });

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json()).toEqual({
      user: {
        id: 'user_local',
        email: 'local@drawme.local',
        displayName: 'Local user',
      },
      authRequired: false,
    });
    expect(providersResponse.json()).toEqual({ providers: [] });
    expect(loginResponse.statusCode).toBe(409);
    expect(loginResponse.json().error.code).toBe('auth_disabled');
  });

  it('signs in with an HttpOnly same-site cookie and returns the public user', async () => {
    const server = await createTestServer(createConfig());
    const response = await login(server, ' Admin@Example.com ');
    const setCookie = getSetCookie(response);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      user: {
        id: 'user_admin',
        email: 'admin@example.com',
        displayName: 'Administrator',
      },
    });
    expect(response.body).not.toContain('passwordHash');
    expect(setCookie).toContain('drawme_session=');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toMatch(/Max-Age=604800|Max-Age=604799/);
    expect(setCookie).not.toContain('Secure');
  });

  it('returns 401 for invalid credentials without revealing which field failed', async () => {
    const server = await createTestServer(createConfig());
    const wrongPassword = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'admin@example.com', password: 'wrong-password' },
    });
    const unknownUser = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'missing@example.com', password: 'wrong-password' },
    });

    expect(wrongPassword.statusCode).toBe(401);
    expect(unknownUser.statusCode).toBe(401);
    expect(wrongPassword.json()).toEqual(unknownUser.json());
    expect(wrongPassword.json().error.code).toBe('invalid_credentials');
  });

  it('reads the current user from the session and rejects missing sessions', async () => {
    const server = await createTestServer(createConfig());
    const loginResponse = await login(server);
    const meResponse = await server.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie: getCookieHeader(loginResponse) },
    });
    const anonymousResponse = await server.inject({ method: 'GET', url: '/api/auth/me' });

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json().user.email).toBe('admin@example.com');
    expect(anonymousResponse.statusCode).toBe(401);
    expect(anonymousResponse.json().error.code).toBe('authentication_required');
  });

  it('logs out by deleting the session and clearing the cookie', async () => {
    const server = await createTestServer(createConfig());
    const loginResponse = await login(server);
    const cookie = getCookieHeader(loginResponse);
    const logoutResponse = await server.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { cookie },
    });
    const meResponse = await server.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie },
    });

    expect(logoutResponse.statusCode).toBe(200);
    expect(getSetCookie(logoutResponse)).toContain('drawme_session=');
    expect(getSetCookie(logoutResponse)).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0/);
    expect(meResponse.statusCode).toBe(401);
  });

  it('uses a secure __Host cookie in production mode', async () => {
    const server = await createTestServer(
      createConfig({
        cookieSecure: true,
        sessionCookieName: '__Host-drawme_session',
        allowedOrigins: [],
      })
    );
    const response = await login(server);
    const setCookie = getSetCookie(response);

    expect(setCookie).toContain('__Host-drawme_session=');
    expect(setCookie).toContain('Secure');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).not.toContain('Domain=');
  });

  it('rejects cookie-authenticated state changes from an untrusted origin', async () => {
    const server = await createTestServer(createConfig());
    const loginResponse = await login(server);
    const cookie = getCookieHeader(loginResponse);

    const rejected = await server.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { cookie, origin: 'https://evil.example.com' },
    });
    const accepted = await server.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { cookie, origin: 'http://localhost:7200' },
    });

    expect(rejected.statusCode).toBe(403);
    expect(rejected.json().error.code).toBe('csrf_origin_rejected');
    expect(accepted.statusCode).toBe(200);
  });

  it('returns a JSON 415 instead of a 500 for unsupported media types', async () => {
    const server = await createTestServer(createConfig());
    const response = await server.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { 'content-type': 'application/xml' },
      payload: '<logout />',
    });

    expect(response.statusCode).toBe(415);
    expect(response.json().error.code).toBe('unsupported_media_type');
  });
});
