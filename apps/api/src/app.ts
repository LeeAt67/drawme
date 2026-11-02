import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import type { ApiConfig } from './config';
import { registerAgentRoutes } from './modules/agent/routes';
import { createRequireAuth } from './modules/auth/guard';
import { createOriginGuard } from './modules/auth/origin';
import { registerAuthRoutes } from './modules/auth/routes';
import { createConfiguredUserStore } from './modules/auth/seed';
import { registerBoardRoutes } from './modules/boards/routes';
import { InMemoryBoardStore } from './modules/boards/store';
import type { BoardStore } from './modules/boards/types';
import { InMemorySessionStore, type SessionStore } from './modules/auth/session-store';
import type { UserStore } from './modules/auth/user-store';
import { ApiError } from './shared/errors';

export type CreateServerOptions = {
  config: ApiConfig;
  fetchImpl?: typeof fetch;
  logger?: FastifyServerOptions['logger'];
  sessionStore?: SessionStore;
  userStore?: UserStore;
  boardStore?: BoardStore;
};

function errorBody(code: string, message: string): { error: { code: string; message: string } } {
  return { error: { code, message } };
}

function resolveWebDistDir(config: ApiConfig): string | null {
  if (!config.webDistDir) {
    return null;
  }
  const webDistDir = resolve(process.cwd(), config.webDistDir);
  return existsSync(resolve(webDistDir, 'index.html')) ? webDistDir : null;
}

export async function createServer({
  config,
  fetchImpl,
  logger = false,
  sessionStore = new InMemorySessionStore(),
  userStore,
  boardStore = new InMemoryBoardStore(),
}: CreateServerOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger,
    bodyLimit: 256 * 1024,
    trustProxy: true,
  });

  // Error handlers are inherited by child plugin contexts at registration time,
  // so this must be set before registering routes below.
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiError) {
      return reply.code(error.statusCode).send(errorBody(error.code, error.message));
    }

    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 413) {
      return reply.code(413).send(errorBody('payload_too_large', 'Request body is too large.'));
    }
    if (statusCode === 415) {
      return reply
        .code(415)
        .send(errorBody('unsupported_media_type', 'Unsupported request content type.'));
    }
    if (statusCode === 429) {
      return reply
        .code(429)
        .send(errorBody('rate_limited', 'Too many requests. Please retry later.'));
    }
    if (statusCode === 400) {
      const message = error instanceof Error ? error.message : 'Invalid request.';
      return reply.code(400).send(errorBody('invalid_request', message));
    }

    request.log.error({ err: error }, 'Unhandled API error');
    return reply.code(500).send(errorBody('internal_error', 'Internal server error.'));
  });

  await app.register(fastifyCookie);
  await app.register(fastifyRateLimit, { global: false });

  const resolvedUserStore = userStore ?? (await createConfiguredUserStore(config));
  const requireAuth = createRequireAuth({
    config,
    sessionStore,
    userStore: resolvedUserStore,
  });

  app.addHook('onRequest', createOriginGuard(config));
  app.get('/api/health', async () => ({ ok: true }));

  const webDistDir = resolveWebDistDir(config);
  if (webDistDir) {
    await app.register(fastifyStatic, { root: webDistDir, prefix: '/' });
  }

  app.setNotFoundHandler((request, reply) => {
    if (!request.url.startsWith('/api/') && webDistDir) {
      return reply.type('text/html').sendFile('index.html');
    }
    return reply.code(404).send(errorBody('not_found', 'Not found.'));
  });

  await app.register(registerAuthRoutes, {
    prefix: '/api/auth',
    config,
    sessionStore,
    userStore: resolvedUserStore,
    requireAuth,
  });

  await app.register(registerBoardRoutes, {
    prefix: '/api/boards',
    boardStore,
    requireAuth,
  });

  await app.register(registerAgentRoutes, {
    prefix: '/api/agent',
    config,
    fetchImpl,
    requireAuth,
  });

  if (config.webDistDir && !webDistDir) {
    app.log.warn(
      { webDistDir: config.webDistDir },
      'WEB_DIST_DIR does not contain index.html; static hosting disabled'
    );
  }

  return app;
}
