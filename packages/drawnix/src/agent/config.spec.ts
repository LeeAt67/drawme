import { describe, expect, it, vi } from 'vitest';
import {
  AGENT_CONFIG_ENDPOINT,
  AgentApiError,
  fetchAgentServerConfig,
  getApiErrorMessage,
  isAuthenticationError,
  normalizeAgentServerConfig,
} from './config';

const createJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }) as unknown as Response;

describe('agent server config', () => {
  it('normalizes the configured flag and trims the model name', () => {
    expect(normalizeAgentServerConfig({ configured: true, model: ' gpt-4o-mini ' })).toEqual({
      configured: true,
      model: 'gpt-4o-mini',
    });
  });

  it('treats non-true configured values as not configured', () => {
    expect(normalizeAgentServerConfig({ configured: 'yes', model: 42 })).toEqual({
      configured: false,
      model: '',
    });
    expect(normalizeAgentServerConfig(null)).toEqual({ configured: false, model: '' });
  });

  it('extracts API error messages with a raw body and status fallback', () => {
    expect(getApiErrorMessage({ error: { message: ' upstream failed ' } }, 500)).toBe(
      'upstream failed'
    );
    expect(getApiErrorMessage(null, 502, 'bad gateway')).toBe('bad gateway');
    expect(getApiErrorMessage(null, 503, '')).toBe('Request failed with status 503.');
  });

  it('fetches the server config from the same-origin endpoint', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ configured: true, model: 'gpt-4o-mini' }));

    const config = await fetchAgentServerConfig(fetchMock as unknown as typeof fetch);

    expect(config).toEqual({ configured: true, model: 'gpt-4o-mini' });
    expect(fetchMock).toHaveBeenCalledWith(AGENT_CONFIG_ENDPOINT, {
      headers: { Accept: 'application/json' },
    });
  });

  it('surfaces the server error message when the request fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createJsonResponse(
          { error: { code: 'agent_not_configured', message: 'Agent is not configured.' } },
          503
        )
      );

    await expect(fetchAgentServerConfig(fetchMock as unknown as typeof fetch)).rejects.toThrow(
      'Agent is not configured.'
    );
  });

  it('keeps the HTTP status and error code on API errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createJsonResponse(
          { error: { code: 'authentication_required', message: 'Sign in to continue.' } },
          401
        )
      );

    const error = await fetchAgentServerConfig(fetchMock as unknown as typeof fetch).catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(AgentApiError);
    expect(error).toMatchObject({
      status: 401,
      code: 'authentication_required',
      message: 'Sign in to continue.',
      name: 'AgentApiError',
    });
    expect(isAuthenticationError(error)).toBe(true);
    expect(isAuthenticationError(new Error('network down'))).toBe(false);
  });

  it('falls back to a generic error code for malformed error bodies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({ error: { code: 42 } }, 500));

    await expect(
      fetchAgentServerConfig(fetchMock as unknown as typeof fetch)
    ).rejects.toMatchObject({
      status: 500,
      code: 'request_failed',
    });
  });

  it('uses same-origin agent endpoints', () => {
    expect(AGENT_CONFIG_ENDPOINT).toBe('/api/agent/config');
  });
});
