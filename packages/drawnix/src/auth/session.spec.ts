import { afterEach, describe, expect, it, vi } from 'vitest';

const createJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }) as unknown as Response;

const loadSession = async () => {
  vi.resetModules();
  return import('./session');
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('auth session store', () => {
  it('keeps the local user signed in without showing sign-in UI', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        createJsonResponse({
          user: { id: 'user_local', email: 'local@drawme.local', displayName: 'Local user' },
          authRequired: false,
        })
      )
    );
    const session = await loadSession();

    await expect(session.refreshAuthSession()).resolves.toMatchObject({ id: 'user_local' });
    expect(session.getAuthSnapshot()).toMatchObject({
      status: 'signed-in',
      authRequired: false,
      user: { id: 'user_local' },
    });
  });

  it('treats a 401 session probe as signed out', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          createJsonResponse(
            { error: { code: 'authentication_required', message: 'Sign in to continue.' } },
            401
          )
        )
    );
    const session = await loadSession();

    await expect(session.refreshAuthSession()).resolves.toBeNull();
    expect(session.getAuthSnapshot()).toMatchObject({
      status: 'signed-out',
      user: null,
      error: null,
    });
  });

  it('falls back to signed out when the session probe fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const session = await loadSession();

    await expect(session.refreshAuthSession()).resolves.toBeNull();
    expect(session.getAuthSnapshot().status).toBe('signed-out');
    expect(session.getAuthSnapshot().error).toContain('offline');
  });

  it('signs in, opens and closes the global dialog', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        createJsonResponse({
          user: { id: 'user_admin', email: 'admin@example.com', displayName: 'Administrator' },
        })
      )
    );
    const session = await loadSession();

    session.openAuthDialog();
    expect(session.getAuthSnapshot().dialogOpen).toBe(true);

    await expect(session.signInWithPassword('admin@example.com', 'secret')).resolves.toMatchObject({
      email: 'admin@example.com',
    });
    expect(session.getAuthSnapshot()).toMatchObject({
      status: 'signed-in',
      user: { id: 'user_admin' },
      error: null,
      dialogOpen: true,
    });

    session.closeAuthDialog();
    expect(session.getAuthSnapshot().dialogOpen).toBe(false);
  });

  it('clears the snapshot on sign out and when a protected request says 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse({ ok: true })));
    const session = await loadSession();

    await session.signOut();
    expect(session.getAuthSnapshot()).toMatchObject({ status: 'signed-out', user: null });

    session.markSignedOut();
    expect(session.getAuthSnapshot()).toMatchObject({ status: 'signed-out', user: null });
  });
});
