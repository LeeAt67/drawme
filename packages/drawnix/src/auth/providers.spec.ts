import { describe, expect, it, vi } from 'vitest';
import { AUTH_PROVIDERS_ENDPOINT, fetchAuthProviders } from './providers';

const createJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }) as unknown as Response;

describe('auth providers client', () => {
  it('reads providers with same-origin credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        providers: [
          { id: ' github ', name: ' GitHub ', startUrl: ' /api/auth/oauth/github/start ' },
          { id: 'google', name: 'Google', startUrl: 'https://accounts.example.com/oauth' },
        ],
      })
    );

    const providers = await fetchAuthProviders(fetchMock as unknown as typeof fetch);

    expect(providers).toEqual([
      { id: 'github', name: 'GitHub', startUrl: '/api/auth/oauth/github/start' },
      { id: 'google', name: 'Google', startUrl: 'https://accounts.example.com/oauth' },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(AUTH_PROVIDERS_ENDPOINT, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });
  });

  it('drops malformed providers instead of breaking the dialog', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        providers: [
          { id: 'github', name: 'GitHub', startUrl: '/oauth/github' },
          { id: '', name: 'No id', startUrl: '/oauth/none' },
          { id: 'missing-url', name: 'Missing URL' },
          { id: 'missing-name', name: '', startUrl: '/oauth/none' },
          null,
          'not-an-object',
        ],
      })
    );

    await expect(fetchAuthProviders(fetchMock as unknown as typeof fetch)).resolves.toEqual([
      { id: 'github', name: 'GitHub', startUrl: '/oauth/github' },
    ]);
  });

  it('returns an empty list for a missing endpoint or an invalid payload', async () => {
    const notFound = vi.fn().mockResolvedValue(createJsonResponse({}, 404));
    const invalidPayload = vi.fn().mockResolvedValue(createJsonResponse({ providers: 'nope' }));
    const networkError = vi.fn().mockRejectedValue(new Error('offline'));

    await expect(fetchAuthProviders(notFound as unknown as typeof fetch)).resolves.toEqual([]);
    await expect(fetchAuthProviders(invalidPayload as unknown as typeof fetch)).resolves.toEqual(
      []
    );
    await expect(fetchAuthProviders(networkError as unknown as typeof fetch)).resolves.toEqual([]);
  });
});
