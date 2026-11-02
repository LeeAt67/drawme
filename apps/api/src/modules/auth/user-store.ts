export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: number;
};

export type PublicUser = {
  id: string;
  email: string;
  displayName: string;
};

export interface UserStore {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toPublicUser(user: AuthUser): PublicUser {
  return {
    id: user.id,
    email: normalizeEmail(user.email),
    displayName: user.displayName,
  };
}

export class InMemoryUserStore implements UserStore {
  private readonly usersById = new Map<string, AuthUser>();
  private readonly usersByEmail = new Map<string, AuthUser>();

  constructor(users: AuthUser[] = []) {
    for (const user of users) {
      this.addUser(user);
    }
  }

  addUser(user: AuthUser): void {
    const normalizedUser = { ...user, email: normalizeEmail(user.email) };
    this.usersById.set(normalizedUser.id, normalizedUser);
    this.usersByEmail.set(normalizedUser.email, normalizedUser);
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.usersByEmail.get(normalizeEmail(email)) ?? null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    return this.usersById.get(id) ?? null;
  }
}
