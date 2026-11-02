import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ApiConfig } from '../../config';
import { ApiError } from '../../shared/errors';
import { clearSessionCookie, readSessionCookie } from './session-cookie';
import type { SessionStore } from './session-store';
import { LOCAL_USER } from './local-user';
import type { UserStore } from './user-store';
import type { AuthContext } from './types';

export type RequireAuthOptions = {
  config: ApiConfig;
  sessionStore: SessionStore;
  userStore: UserStore;
};

export type AuthGuard = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

export function createRequireAuth({
  config,
  sessionStore,
  userStore,
}: RequireAuthOptions): AuthGuard {
  return async (request, reply) => {
    if (config.authDisabled) {
      request.authContext = {
        user: LOCAL_USER,
        session: {
          id: 'local-session',
          userId: LOCAL_USER.id,
          createdAt: 0,
          expiresAt: Number.MAX_SAFE_INTEGER,
        },
      };
      return;
    }

    const token = readSessionCookie(request, config);
    if (!token) {
      throw new ApiError(401, 'authentication_required', 'Sign in to continue.');
    }

    const session = await sessionStore.get(token);
    if (!session) {
      clearSessionCookie(reply, config);
      throw new ApiError(401, 'authentication_required', 'Your session has expired.');
    }

    const user = await userStore.findById(session.userId);
    if (!user) {
      await sessionStore.delete(token);
      clearSessionCookie(reply, config);
      throw new ApiError(401, 'authentication_required', 'Your session is no longer valid.');
    }

    request.authContext = { user, session } satisfies AuthContext;
  };
}
