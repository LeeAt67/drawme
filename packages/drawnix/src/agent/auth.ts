import { AgentApiError, createAgentApiError, readJsonBody } from './config';
import type { AgentUser } from './types';

export const AUTH_API_BASE_PATH = '/api/auth';
export const AUTH_LOGIN_ENDPOINT = `${AUTH_API_BASE_PATH}/login`;
export const AUTH_LOGOUT_ENDPOINT = `${AUTH_API_BASE_PATH}/logout`;
export const AUTH_ME_ENDPOINT = `${AUTH_API_BASE_PATH}/me`;
export const AUTH_CHANGED_EVENT = 'drawme:auth-changed';

function notifyAuthChanged(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

type AuthUserResponse = {
  user?: unknown;
};

export function normalizeAgentUser(value: unknown): AgentUser | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== 'string' ||
    !record.id.trim() ||
    typeof record.email !== 'string' ||
    !record.email.trim()
  ) {
    return null;
  }
  return {
    id: record.id.trim(),
    email: record.email.trim(),
    displayName:
      typeof record.displayName === 'string' && record.displayName.trim()
        ? record.displayName.trim()
        : record.email.trim(),
  };
}

function readUserResponse(body: unknown, status: number): AgentUser {
  const user = normalizeAgentUser((body as AuthUserResponse | null)?.user);
  if (!user) {
    throw new AgentApiError(status, 'invalid_response', 'The server returned an invalid user.');
  }
  return user;
}

export async function fetchCurrentUser(fetchImpl: typeof fetch = fetch): Promise<AgentUser | null> {
  const session = await fetchAuthSession(fetchImpl);
  return session.user;
}

export type AuthSessionState = {
  user: AgentUser | null;
  authRequired: boolean;
};

/**
 * Reads the project session together with whether this deployment actually
 * requires sign-in. Servers with authentication disabled still return a local
 * user, but the UI must hide the login entry in that mode.
 */
export async function fetchAuthSession(fetchImpl: typeof fetch = fetch): Promise<AuthSessionState> {
  const response = await fetchImpl(AUTH_ME_ENDPOINT, {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });
  const { body, rawBody } = await readJsonBody(response);
  if (response.status === 401) {
    return { user: null, authRequired: true };
  }
  if (!response.ok) {
    throw createAgentApiError(body, response.status, rawBody);
  }

  const record = body as { user?: unknown; authRequired?: unknown } | null;
  const authRequired = record?.authRequired !== false;
  if (!record?.user) {
    if (!authRequired) {
      return { user: null, authRequired: false };
    }
    throw new AgentApiError(
      response.status,
      'invalid_response',
      'The server returned an invalid user.'
    );
  }
  return { user: readUserResponse(body, response.status), authRequired };
}

export async function loginAgent(
  email: string,
  password: string,
  fetchImpl: typeof fetch = fetch
): Promise<AgentUser> {
  const response = await fetchImpl(AUTH_LOGIN_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({ email, password }),
  });
  const { body, rawBody } = await readJsonBody(response);
  if (!response.ok) {
    throw createAgentApiError(body, response.status, rawBody);
  }
  const user = readUserResponse(body, response.status);
  notifyAuthChanged();
  return user;
}

export async function logoutAgent(fetchImpl: typeof fetch = fetch): Promise<void> {
  const response = await fetchImpl(AUTH_LOGOUT_ENDPOINT, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });
  const { body, rawBody } = await readJsonBody(response);
  if (!response.ok) {
    throw createAgentApiError(body, response.status, rawBody);
  }
  notifyAuthChanged();
}
