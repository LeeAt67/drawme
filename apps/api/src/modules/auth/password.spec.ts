import { describe, expect, it } from 'vitest';
import { hashPassword, isPasswordHash, verifyPassword } from './password';

describe('password hashing', () => {
  it('hashes passwords with a random scrypt salt and verifies them', async () => {
    const firstHash = await hashPassword('correct horse battery staple');
    const secondHash = await hashPassword('correct horse battery staple');

    expect(isPasswordHash(firstHash)).toBe(true);
    expect(firstHash).toMatch(/^scrypt\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/);
    expect(firstHash).not.toBe(secondHash);
    await expect(verifyPassword('correct horse battery staple', firstHash)).resolves.toBe(true);
    await expect(verifyPassword('wrong password', firstHash)).resolves.toBe(false);
  });

  it('rejects malformed hashes and empty passwords', async () => {
    expect(isPasswordHash('plain-text')).toBe(false);
    await expect(verifyPassword('anything', 'not-a-hash')).resolves.toBe(false);
    await expect(hashPassword('')).rejects.toThrow(/empty/);
  });
});
