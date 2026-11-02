import type { AuthSession } from './session-store';
import type { AuthUser } from './user-store';

export type AuthContext = {
  user: AuthUser;
  session: AuthSession;
};

declare module 'fastify' {
  interface FastifyRequest {
    authContext?: AuthContext;
  }
}
