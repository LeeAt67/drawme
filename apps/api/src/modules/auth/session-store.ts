import { createHash, randomBytes } from 'node:crypto';

export type AuthSession = {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
};

export type CreatedSession = {
  token: string;
  session: AuthSession;
};

export interface SessionStore {
  create(userId: string, ttlMs: number): Promise<CreatedSession>;
  get(token: string): Promise<AuthSession | null>;
  delete(token: string): Promise<void>;
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export class InMemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, AuthSession>();

  constructor(private readonly now: () => number = Date.now) {}

  async create(userId: string, ttlMs: number): Promise<CreatedSession> {
    this.pruneExpired();
    const token = randomBytes(32).toString('base64url');
    const createdAt = this.now();
    const session: AuthSession = {
      id: hashSessionToken(token),
      userId,
      createdAt,
      expiresAt: createdAt + ttlMs,
    };
    this.sessions.set(session.id, session);
    return { token, session };
  }

  async get(token: string): Promise<AuthSession | null> {
    const session = this.sessions.get(hashSessionToken(token));
    if (!session) {
      return null;
    }
    if (session.expiresAt <= this.now()) {
      this.sessions.delete(session.id);
      return null;
    }
    return session;
  }

  async delete(token: string): Promise<void> {
    this.sessions.delete(hashSessionToken(token));
  }

  private pruneExpired(): void {
    const now = this.now();
    for (const [id, session] of this.sessions) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
      }
    }
  }
}
