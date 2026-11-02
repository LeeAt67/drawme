import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
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
  sessionTtlMs: 60_000,
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

const createJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as unknown as Response;

const servers: FastifyInstance[] = [];

async function createTestServer(config: ApiConfig, fetchImpl?: typeof fetch) {
  const server = await createServer({ config, fetchImpl });
  servers.push(server);
  return server;
}

async function login(server: FastifyInstance): Promise<string> {
  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email: 'admin@example.com', password: 'test-password' },
  });
  expect(response.statusCode).toBe(200);
  const setCookie = response.headers['set-cookie'];
  const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return (cookieHeader || '').split(';')[0] || '';
}

async function createAuthenticatedServer(config: ApiConfig, fetchImpl?: typeof fetch) {
  const server = await createTestServer(config, fetchImpl);
  const cookie = await login(server);
  return { server, cookie };
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

describe('agent routes', () => {
  it('serves agent endpoints without a session when authentication is disabled', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        choices: [{ message: { content: 'Local agent reply.' } }],
      })
    );
    const server = await createTestServer(
      createConfig({ authDisabled: true }),
      fetchMock as unknown as typeof fetch
    );

    const configResponse = await server.inject({ method: 'GET', url: '/api/agent/config' });
    const chatResponse = await server.inject({
      method: 'POST',
      url: '/api/agent/chat',
      payload: { messages: [{ role: 'user', content: 'hello' }] },
    });

    expect(configResponse.statusCode).toBe(200);
    expect(configResponse.json()).toEqual({ configured: true, model: 'test-model' });
    expect(chatResponse.statusCode).toBe(200);
    expect(chatResponse.json()).toEqual({
      message: { role: 'assistant', content: 'Local agent reply.' },
    });
  });

  it('requires a session before exposing agent endpoints', async () => {
    const server = await createTestServer(createConfig());
    const configResponse = await server.inject({ method: 'GET', url: '/api/agent/config' });
    const chatResponse = await server.inject({
      method: 'POST',
      url: '/api/agent/chat',
      payload: { messages: [{ role: 'user', content: 'hello' }] },
    });

    expect(configResponse.statusCode).toBe(401);
    expect(chatResponse.statusCode).toBe(401);
    expect(configResponse.json().error.code).toBe('authentication_required');
  });

  it('exposes the server config without leaking the API key', async () => {
    const { server, cookie } = await createAuthenticatedServer(createConfig());
    const response = await server.inject({
      method: 'GET',
      url: '/api/agent/config',
      headers: { cookie },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ configured: true, model: 'test-model' });
    expect(response.body).not.toContain('sk-test');
    expect(response.body).not.toContain('api.example.com');
  });

  it('reports an unconfigured server', async () => {
    const { server, cookie } = await createAuthenticatedServer(createConfig({ apiKey: '' }));
    const response = await server.inject({
      method: 'GET',
      url: '/api/agent/config',
      headers: { cookie },
    });

    expect(response.json()).toEqual({ configured: false, model: 'test-model' });
  });

  it('rejects chat when the server is not configured', async () => {
    const fetchMock = vi.fn();
    const { server, cookie } = await createAuthenticatedServer(
      createConfig({ apiKey: '' }),
      fetchMock as unknown as typeof fetch
    );

    const response = await server.inject({
      method: 'POST',
      url: '/api/agent/chat',
      headers: { cookie },
      payload: { messages: [{ role: 'user', content: 'hello' }] },
    });

    expect(response.statusCode).toBe(503);
    expect(response.json().error.code).toBe('agent_not_configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects invalid chat payloads', async () => {
    const { server, cookie } = await createAuthenticatedServer(createConfig());

    const response = await server.inject({
      method: 'POST',
      url: '/api/agent/chat',
      headers: { cookie },
      payload: { messages: [{ role: 'user', content: '   ' }] },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('invalid_request');
  });

  it('proxies chat requests and returns the assistant message', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        choices: [{ message: { content: 'Here is your flow.' } }],
      })
    );
    const { server, cookie } = await createAuthenticatedServer(
      createConfig(),
      fetchMock as unknown as typeof fetch
    );

    const response = await server.inject({
      method: 'POST',
      url: '/api/agent/chat',
      headers: { cookie },
      payload: {
        model: 'client-model',
        tools: [],
        messages: [{ role: 'user', content: 'draw a flow' }],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: { role: 'assistant', content: 'Here is your flow.' },
    });

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body));
    expect(body.model).toBe('test-model');
    expect(body.tools.map((tool: { function: { name: string } }) => tool.function.name)).toContain(
      'create_diagram'
    );
  });

  it('maps upstream failures to API errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ error: { message: 'Invalid API key' } }, 401));
    const { server, cookie } = await createAuthenticatedServer(
      createConfig(),
      fetchMock as unknown as typeof fetch
    );

    const response = await server.inject({
      method: 'POST',
      url: '/api/agent/chat',
      headers: { cookie },
      payload: { messages: [{ role: 'user', content: 'hello' }] },
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      error: { code: 'upstream_error', message: 'Invalid API key' },
    });
  });

  it('rejects oversized request bodies', async () => {
    const { server, cookie } = await createAuthenticatedServer(createConfig());

    const response = await server.inject({
      method: 'POST',
      url: '/api/agent/chat',
      headers: { 'content-type': 'application/json', cookie },
      payload: JSON.stringify({
        messages: [{ role: 'user', content: 'a'.repeat(300_000) }],
      }),
    });

    expect(response.statusCode).toBe(413);
    expect(response.json().error.code).toBe('payload_too_large');
  });

  it('returns JSON 404s for unknown API routes', async () => {
    const server = await createTestServer(createConfig());
    const response = await server.inject({ method: 'GET', url: '/api/unknown' });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('not_found');
  });
});
