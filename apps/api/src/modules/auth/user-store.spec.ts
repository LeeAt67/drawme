import { describe, expect, it } from 'vitest';
import { createConfiguredUserStore } from './seed';
import { verifyPassword } from './password';
import { InMemoryUserStore, normalizeEmail, toPublicUser } from './user-store';

const createUser = () => ({
  id: 'user-1',
  email: ' Owner@Example.com ',
  displayName: 'Owner',
  passwordHash: 'scrypt$c2FsdA$aGFzaA',
  createdAt: 1,
});

describe('InMemoryUserStore', () => {
  it('normalizes emails and supports lookup by id and email', async () => {
    const store = new InMemoryUserStore([createUser()]);

    expect(normalizeEmail(' Owner@Example.com ')).toBe('owner@example.com');
    expect((await store.findByEmail('owner@example.com'))?.id).toBe('user-1');
    expect((await store.findById('user-1'))?.email).toBe('owner@example.com');
    expect(await store.findByEmail('missing@example.com')).toBeNull();
  });

  it('never exposes the password hash through the public user shape', () => {
    const publicUser = toPublicUser(createUser());
    expect(publicUser).toEqual({
      id: 'user-1',
      email: 'owner@example.com',
      displayName: 'Owner',
    });
    expect(publicUser).not.toHaveProperty('passwordHash');
  });
});

describe('createConfiguredUserStore', () => {
  it('seeds the admin user from a plaintext password', async () => {
    const store = await createConfiguredUserStore({
      authAdminEmail: 'ADMIN@example.com',
      authAdminPassword: 'test-password',
      authAdminPasswordHash: '',
    });
    const user = await store.findByEmail('admin@example.com');

    expect(user?.id).toBe('user_admin');
    await expect(verifyPassword('test-password', user?.passwordHash || '')).resolves.toBe(true);
  });

  it('accepts a precomputed hash and rejects malformed hashes', async () => {
    const validHash = 'scrypt$c2FsdA$aGFzaA';
    const store = await createConfiguredUserStore({
      authAdminEmail: 'admin@example.com',
      authAdminPassword: '',
      authAdminPasswordHash: validHash,
    });
    expect((await store.findByEmail('admin@example.com'))?.passwordHash).toBe(validHash);

    await expect(
      createConfiguredUserStore({
        authAdminEmail: 'admin@example.com',
        authAdminPassword: '',
        authAdminPasswordHash: 'plain-text',
      })
    ).rejects.toThrow(/valid scrypt hash/);
  });
});
