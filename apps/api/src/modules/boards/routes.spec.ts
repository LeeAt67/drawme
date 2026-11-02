import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '../../app';
import type { ApiConfig } from '../../config';
import { InMemoryBoardStore } from './store';

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

const servers: FastifyInstance[] = [];

async function createAuthenticatedServer() {
  const boardStore = new InMemoryBoardStore(() => 1_000);
  const server = await createServer({ config: createConfig(), boardStore });
  servers.push(server);

  const loginResponse = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email: 'admin@example.com', password: 'test-password' },
  });
  expect(loginResponse.statusCode).toBe(200);
  const setCookie = loginResponse.headers['set-cookie'];
  const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return { server, cookie: (cookieHeader || '').split(';')[0] || '' };
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

describe('board routes', () => {
  it('uses the local user when authentication is disabled', async () => {
    const boardStore = new InMemoryBoardStore(() => 1_000);
    const server = await createServer({
      config: createConfig({ authDisabled: true }),
      boardStore,
    });
    servers.push(server);

    const saveResponse = await server.inject({
      method: 'POST',
      url: '/api/boards/main',
      payload: { title: 'Local board', content: { children: [] } },
    });
    const listResponse = await server.inject({ method: 'GET', url: '/api/boards' });

    expect(saveResponse.statusCode).toBe(200);
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().boards).toEqual([
      expect.objectContaining({ id: 'main', title: 'Local board', revision: 1 }),
    ]);
  });

  it('requires authentication', async () => {
    const server = await createServer({
      config: createConfig(),
      boardStore: new InMemoryBoardStore(),
    });
    servers.push(server);

    const response = await server.inject({ method: 'GET', url: '/api/boards' });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('authentication_required');
  });

  it('creates, lists and loads a board', async () => {
    const { server, cookie } = await createAuthenticatedServer();
    const content = {
      children: [{ id: 'node-1', type: 'geometry' }],
      viewport: { zoom: 1 },
      theme: 'default',
    };

    const saveResponse = await server.inject({
      method: 'POST',
      url: '/api/boards/main',
      headers: { cookie },
      payload: { title: 'Planning board', content },
    });

    expect(saveResponse.statusCode).toBe(200);
    expect(saveResponse.json().board).toMatchObject({
      id: 'main',
      title: 'Planning board',
      schemaVersion: 1,
      revision: 1,
      content,
    });

    const getResponse = await server.inject({
      method: 'GET',
      url: '/api/boards/main',
      headers: { cookie },
    });
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().board.revision).toBe(1);

    const listResponse = await server.inject({
      method: 'GET',
      url: '/api/boards',
      headers: { cookie },
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().boards).toEqual([
      {
        id: 'main',
        title: 'Planning board',
        schemaVersion: 1,
        revision: 1,
        createdAt: 1_000,
        updatedAt: 1_000,
      },
    ]);
  });

  it('returns 404 for a missing board', async () => {
    const { server, cookie } = await createAuthenticatedServer();
    const response = await server.inject({
      method: 'GET',
      url: '/api/boards/missing',
      headers: { cookie },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('board_not_found');
  });

  it('overwrites an existing board on every save', async () => {
    const { server, cookie } = await createAuthenticatedServer();
    await server.inject({
      method: 'POST',
      url: '/api/boards/main',
      headers: { cookie },
      payload: { content: { children: [{ id: 'first' }] } },
    });

    const response = await server.inject({
      method: 'POST',
      url: '/api/boards/main',
      headers: { cookie },
      payload: { content: { children: [{ id: 'second' }] } },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().board.revision).toBe(2);
    expect(response.json().board.content.children).toEqual([{ id: 'second' }]);
  });

  it('validates board ids and request bodies', async () => {
    const { server, cookie } = await createAuthenticatedServer();
    const invalidIdResponse = await server.inject({
      method: 'GET',
      url: '/api/boards/bad%20id',
      headers: { cookie },
    });
    const invalidBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/boards/main',
      headers: { cookie },
      payload: { content: { children: 'not-an-array' } },
    });

    expect(invalidIdResponse.statusCode).toBe(400);
    expect(invalidBodyResponse.statusCode).toBe(400);
    expect(invalidBodyResponse.json().error.code).toBe('invalid_request');
  });

  it('allows larger board payloads than the agent endpoint', async () => {
    const { server, cookie } = await createAuthenticatedServer();
    const largeContent = 'x'.repeat(400_000);

    const response = await server.inject({
      method: 'POST',
      url: '/api/boards/main',
      headers: { cookie },
      payload: {
        content: { children: [{ id: 'node-1', text: largeContent }] },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().board.content.children[0].text).toHaveLength(400_000);
  });
});
