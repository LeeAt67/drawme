import { fetchAuthSession, loginAgent, logoutAgent } from '../agent/auth';
import type { AgentUser } from '../agent/types';

/**
 * The signed-in account of the whole project. Agent access, cloud board sync
 * and future OAuth providers all share this single session.
 */
export type AuthUser = AgentUser;

export type AuthStatus = 'unknown' | 'signed-out' | 'signed-in';

export type AuthSnapshot = {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  authRequired: boolean;
  dialogOpen: boolean;
};

const initialSnapshot: AuthSnapshot = {
  status: 'unknown',
  user: null,
  error: null,
  authRequired: true,
  dialogOpen: false,
};

let snapshot: AuthSnapshot = initialSnapshot;
const listeners = new Set<() => void>();
let refreshPromise: Promise<AuthUser | null> | null = null;

function emit(nextSnapshot: AuthSnapshot): void {
  snapshot = nextSnapshot;
  for (const listener of listeners) {
    listener();
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function applyUser(user: AuthUser | null, authRequired = snapshot.authRequired): void {
  emit({
    ...snapshot,
    status: user ? 'signed-in' : 'signed-out',
    user,
    error: null,
    authRequired,
  });
}

export function getAuthSnapshot(): AuthSnapshot {
  return snapshot;
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function openAuthDialog(): void {
  if (!snapshot.dialogOpen) {
    emit({ ...snapshot, dialogOpen: true });
  }
}

export function closeAuthDialog(): void {
  if (snapshot.dialogOpen) {
    emit({ ...snapshot, dialogOpen: false });
  }
}

/**
 * Marks the local session as signed out without calling the API, for cases
 * where a protected request already returned 401 because the cookie expired.
 */
export function markSignedOut(): void {
  applyUser(null, true);
}

export async function refreshAuthSession(): Promise<AuthUser | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const { user, authRequired } = await fetchAuthSession();
      applyUser(user, authRequired);
      return user;
    } catch (error) {
      // A network/server failure must not leave the UI stuck in "unknown":
      // show the signed-out state so the sign-in entry stays reachable.
      emit({
        ...snapshot,
        status: snapshot.user ? 'signed-in' : 'signed-out',
        error: getErrorMessage(error),
        authRequired: true,
      });
      return snapshot.user;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function signInWithPassword(email: string, password: string): Promise<AuthUser> {
  const user = await loginAgent(email, password);
  applyUser(user, true);
  return user;
}

export async function signOut(): Promise<void> {
  await logoutAgent();
  applyUser(null, true);
}
