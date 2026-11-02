import { Buffer } from 'node:buffer';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const HASH_PREFIX = 'scrypt';

let dummyPasswordHashPromise: Promise<string> | null = null;

export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error('Password cannot be empty.');
  }
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${HASH_PREFIX}$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
}

export function isPasswordHash(value: string): boolean {
  const parts = value.split('$');
  return parts.length === 3 && parts[0] === HASH_PREFIX && Boolean(parts[1]) && Boolean(parts[2]);
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const parts = encodedHash.split('$');
  if (parts.length !== 3 || parts[0] !== HASH_PREFIX) {
    return false;
  }

  const salt = Buffer.from(parts[1], 'base64url');
  const expectedKey = Buffer.from(parts[2], 'base64url');
  if (!salt.length || expectedKey.length !== KEY_LENGTH) {
    return false;
  }

  const actualKey = (await scrypt(password, salt, expectedKey.length)) as Buffer;
  return actualKey.length === expectedKey.length && timingSafeEqual(actualKey, expectedKey);
}

export function getDummyPasswordHash(): Promise<string> {
  dummyPasswordHashPromise ??= hashPassword(randomBytes(24).toString('base64url'));
  return dummyPasswordHashPromise;
}
