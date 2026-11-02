import { describe, expect, it, vi } from 'vitest';
import {
  AUTH_LOGIN_ENDPOINT,
  AUTH_LOGOUT_ENDPOINT,
  AUTH_ME_ENDPOINT,
  fetchCurrentUser,
  fetchAuthSession,
  loginAgent,
  logoutAgent,
  normalizeAgentUser,
} from './auth';
import { AgentApiError } from './config';

const createJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }) as unknown as Response;

describe('agent auth client', () => {
  it('normalizes a public user and falls back to the email as display name', () => {
    expect(
      normalizeAgentUser({ id: 'user_1', email: ' Admin@Example.com ', displayName: '' })
    ).toEqual({
      id: 'user_1',
      email: 'Admin@Example.com',
      displayName: 'Admin@Example.com',
    });
    expect(normalizeAgentUser({ id: '', email: 'admin@example.com' })).toBeNull();
  });

  it('reads the current user with same-origin credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        user: { id: 'user_admin', email: 'admin@example.com', displayName: 'Administrator' },
      })
    );

    const user = await fetchCurrentUser(fetchMock as unknown as typeof fetch);

    expect(user).toEqual({
      id: 'user_admin',
      email: 'admin@example.com',
      displayName: 'Administrator',
    });
    expect(fetchMock).toHaveBeenCalledWith(AUTH_ME_ENDPOINT, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });
  });

  it('reads authRequired=false and the local user from a passwordless server', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        user: { id: 'user_local', email: 'local@drawme.local', displayName: 'Local user' },
        authRequired: false,
      })
    );

    await expect(fetchAuthSession(fetchMock as unknown as typeof fetch)).resolves.toEqual({
      user: {
        id: 'user_local',
        email: 'local@drawme.local',
        displayName: 'Local user',
      },
      authRequired: false,
    });
  });

  it('treats a 401 from the session endpoint as signed out', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createJsonResponse(
          { error: { code: 'authentication_required', message: 'Sign in to continue.' } },
          401
        )
      );

    await expect(fetchCurrentUser(fetchMock as unknown as typeof fetch)).resolves.toBeNull();
  });

  it('logs in with JSON credentials and returns the user', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        user: { id: 'user_admin', email: 'admin@example.com', displayName: 'Administrator' },
      })
    );

    const user = await loginAgent(
      'admin@example.com',
      'secret',
      fetchMock as unknown as typeof fetch
    );

    expect(user.email).toBe('admin@example.com');
    expect(fetchMock).toHaveBeenCalledWith(AUTH_LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email: 'admin@example.com', password: 'secret' }),
    });
  });

  it('throws a typed error for invalid credentials', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createJsonResponse(
          { error: { code: 'invalid_credentials', message: 'Email or password is incorrect.' } },
          401
        )
      );

    const error = await loginAgent(
      'admin@example.com',
      'wrong',
      fetchMock as unknown as typeof fetch
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(AgentApiError);
    expect(error).toMatchObject({
      status: 401,
      code: 'invalid_credentials',
      message: 'Email or password is incorrect.',
    });
  });

  it('logs out through the same-origin endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({ ok: true }));

    await logoutAgent(fetchMock as unknown as typeof fetch);

    expect(fetchMock).toHaveBeenCalledWith(AUTH_LOGOUT_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });
  });

  it('surfaces logout failures', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createJsonResponse(
          { error: { code: 'csrf_origin_rejected', message: 'Request origin is not allowed.' } },
          403
        )
      );

    await expect(logoutAgent(fetchMock as unknown as typeof fetch)).rejects.toMatchObject({
      status: 403,
      code: 'csrf_origin_rejected',
    });
  });
});
