import type { FastifyInstance } from 'fastify';
import type { ApiConfig } from '../../config';
import { ApiError } from '../../shared/errors';
import type { AuthGuard } from './guard';
import { getDummyPasswordHash, verifyPassword } from './password';
import { loginRequestSchema } from './schema';
import { clearSessionCookie, readSessionCookie, setSessionCookie } from './session-cookie';
import type { SessionStore } from './session-store';
import { toPublicUser, type UserStore } from './user-store';
import type {} from './types';

export type RegisterAuthRoutesOptions = {
  config: ApiConfig;
  sessionStore: SessionStore;
  userStore: UserStore;
  requireAuth: AuthGuard;
};

export async function registerAuthRoutes(
  app: FastifyInstance,
  { config, sessionStore, userStore, requireAuth }: RegisterAuthRoutesOptions
): Promise<void> {
  const loginRouteOptions =
    config.authRateLimitPerMinute > 0
      ? {
          config: {
            rateLimit: {
              max: config.authRateLimitPerMinute,
              timeWindow: '1 minute',
              keyGenerator: (request: { ip: string }) => request.ip,
            },
          },
        }
      : {};

  app.get('/providers', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store');
    return { providers: config.authDisabled ? [] : config.authOAuthProviders };
  });

  app.post('/login', loginRouteOptions, async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    if (config.authDisabled) {
      throw new ApiError(409, 'auth_disabled', 'Authentication is disabled on this server.');
    }
    const parsedBody = loginRequestSchema.safeParse(request.body);
    if (!parsedBody.success) {
      const issue = parsedBody.error.issues[0];
      throw new ApiError(400, 'invalid_request', issue?.message || 'Invalid request body.');
    }

    const user = await userStore.findByEmail(parsedBody.data.email);
    const passwordHash = user?.passwordHash || (await getDummyPasswordHash());
    const passwordMatches = await verifyPassword(parsedBody.data.password, passwordHash);
    if (!user || !passwordMatches) {
      throw new ApiError(401, 'invalid_credentials', 'Email or password is incorrect.');
    }

    const previousToken = readSessionCookie(request, config);
    if (previousToken) {
      await sessionStore.delete(previousToken);
    }

    const created = await sessionStore.create(user.id, config.sessionTtlMs);
    setSessionCookie(reply, config, created.token, created.session.expiresAt);
    request.log.info({ userId: user.id }, 'User signed in');
    return { user: toPublicUser(user) };
  });

  app.post('/logout', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const token = readSessionCookie(request, config);
    if (token) {
      await sessionStore.delete(token);
    }
    clearSessionCookie(reply, config);
    return { ok: true };
  });

  app.get('/me', { onRequest: requireAuth }, async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    if (!request.authContext) {
      throw new ApiError(401, 'authentication_required', 'Sign in to continue.');
    }
    return {
      user: toPublicUser(request.authContext.user),
      authRequired: !config.authDisabled,
    };
  });
}
