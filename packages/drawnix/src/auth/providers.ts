import { readJsonBody } from '../agent/config';

export const AUTH_PROVIDERS_ENDPOINT = '/api/auth/providers';

/**
 * A sign-in method advertised by the API. Password sign-in is handled by the
 * built-in form; OAuth providers point at a server-side start URL.
 */
export type AuthProvider = {
  id: string;
  name: string;
  startUrl: string;
};

function normalizeProvider(value: unknown): AuthProvider | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== 'string' ||
    !record.id.trim() ||
    typeof record.name !== 'string' ||
    !record.name.trim() ||
    typeof record.startUrl !== 'string' ||
    !record.startUrl.trim()
  ) {
    return null;
  }
  return {
    id: record.id.trim(),
    name: record.name.trim(),
    startUrl: record.startUrl.trim(),
  };
}

/**
 * Reads the configured OAuth providers. A missing endpoint or a malformed
 * payload simply means "no extra sign-in methods", never a broken dialog.
 */
export async function fetchAuthProviders(fetchImpl: typeof fetch = fetch): Promise<AuthProvider[]> {
  try {
    const response = await fetchImpl(AUTH_PROVIDERS_ENDPOINT, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });
    if (!response.ok) {
      return [];
    }
    const { body } = await readJsonBody(response);
    const providers = (body as { providers?: unknown } | null)?.providers;
    if (!Array.isArray(providers)) {
      return [];
    }
    return providers
      .map(normalizeProvider)
      .filter((provider): provider is AuthProvider => provider !== null);
  } catch {
    return [];
  }
}
