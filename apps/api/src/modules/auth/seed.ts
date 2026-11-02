import type { ApiConfig } from '../../config';
import { hashPassword, isPasswordHash } from './password';
import { InMemoryUserStore } from './user-store';

export async function createConfiguredUserStore(
  config: Pick<ApiConfig, 'authAdminEmail' | 'authAdminPassword' | 'authAdminPasswordHash'>
): Promise<InMemoryUserStore> {
  const store = new InMemoryUserStore();
  if (!config.authAdminEmail) {
    return store;
  }

  if (config.authAdminPasswordHash && !isPasswordHash(config.authAdminPasswordHash)) {
    throw new Error('AUTH_ADMIN_PASSWORD_HASH must be a valid scrypt hash.');
  }

  const passwordHash =
    config.authAdminPasswordHash ||
    (config.authAdminPassword ? await hashPassword(config.authAdminPassword) : '');
  if (!passwordHash) {
    return store;
  }

  store.addUser({
    id: 'user_admin',
    email: config.authAdminEmail,
    displayName: 'Administrator',
    passwordHash,
    createdAt: Date.now(),
  });
  return store;
}
