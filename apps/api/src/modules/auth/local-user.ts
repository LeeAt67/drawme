import type { AuthUser } from './user-store';

/**
 * Single-user identity used while authentication is disabled. It keeps board
 * ownership and logging working without inventing a fake login flow.
 */
export const LOCAL_USER_ID = 'user_local';

export const LOCAL_USER: AuthUser = {
  id: LOCAL_USER_ID,
  email: 'local@drawme.local',
  displayName: 'Local user',
  passwordHash: '',
  createdAt: 0,
};
