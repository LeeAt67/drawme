import { describe, expect, it, vi } from 'vitest';
import { requestAgentCompletion } from './service';

const baseOptions = {
  baseUrl: 'https://api.example.com/v1',
  apiKey: 'sk-test',
  model: 'test-model',
  timeoutMs: 5000,
  messages: [{ role: 'user' as const, content: 'hello' }],
};

const createJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as unknown as Response;

describe('requestAgentCompletion', () => {
  it('forwards messages and injects the server-side model and tools', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        choices: [
          {
            message: {
              content: 'done',
              tool_calls: [
                {
                  id: 'call-1',
                  type: 'function',
                  function: { name: 'create_diagram', arguments: '{"format":"mermaid"}' },
                },
              ],
            },
          },
        ],
      })
    );

    const message = await requestAgentCompletion({
      ...baseOptions,
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(message).toEqual({
      role: 'assistant',
      content: 'done',
      tool_calls: [
        {
          id: 'call-1',
          type: 'function',
          function: { name: 'create_diagram', arguments: '{"format":"mermaid"}' },
        },
      ],
    });

    const [endpoint, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(endpoint).toBe('https://api.example.com/v1/chat/completions');
    expect((request.headers as Record<string, string>).Authorization).toBe('Bearer sk-test');

    const body = JSON.parse(String(request.body));
    expect(body.model).toBe('test-model');
    expect(body.messages).toEqual([{ role: 'user', content: 'hello' }]);
    expect(body.tools.map((tool: { function: { name: string } }) => tool.function.name)).toEqual([
      'create_chart',
      'create_diagram',
      'inspect_board',
    ]);
    expect(body.tool_choice).toBe('auto');
    expect(body.stream).toBe(false);
  });

  it('sanitizes malformed tool calls', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        choices: [
          {
            message: {
              content: null,
              tool_calls: [{ id: 'call-1' }, null, { id: 'call-2', function: { name: 'x' } }],
            },
          },
        ],
      })
    );

    const message = await requestAgentCompletion({
      ...baseOptions,
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(message.tool_calls).toBeUndefined();
  });

  it('maps upstream errors to ApiError', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ error: { message: 'Invalid API key' } }, 401));

    await expect(
      requestAgentCompletion({ ...baseOptions, fetchImpl: fetchMock as unknown as typeof fetch })
    ).rejects.toMatchObject({
      statusCode: 502,
      code: 'upstream_error',
      message: 'Invalid API key',
    });
  });

  it('preserves upstream rate limits', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ error: { message: 'Slow down' } }, 429));

    await expect(
      requestAgentCompletion({ ...baseOptions, fetchImpl: fetchMock as unknown as typeof fetch })
    ).rejects.toMatchObject({ statusCode: 429, code: 'upstream_rate_limited' });
  });

  it('maps timeouts and network failures', async () => {
    const timeoutFetch = vi
      .fn()
      .mockRejectedValue(new DOMException('The operation timed out', 'TimeoutError'));
    await expect(
      requestAgentCompletion({ ...baseOptions, fetchImpl: timeoutFetch as unknown as typeof fetch })
    ).rejects.toMatchObject({ statusCode: 504, code: 'upstream_timeout' });

    const networkFetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(
      requestAgentCompletion({ ...baseOptions, fetchImpl: networkFetch as unknown as typeof fetch })
    ).rejects.toMatchObject({ statusCode: 502, code: 'upstream_unreachable' });
  });

  it('reports client aborts separately from timeouts', async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchMock = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    await expect(
      requestAgentCompletion({
        ...baseOptions,
        signal: controller.signal,
        fetchImpl: fetchMock as unknown as typeof fetch,
      })
    ).rejects.toMatchObject({ statusCode: 499, code: 'request_aborted' });
  });

  it('rejects invalid and empty upstream responses', async () => {
    const invalidJsonFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('invalid json');
      },
      text: async () => 'not-json',
    } as unknown as Response);

    await expect(
      requestAgentCompletion({
        ...baseOptions,
        fetchImpl: invalidJsonFetch as unknown as typeof fetch,
      })
    ).rejects.toMatchObject({ statusCode: 502, code: 'invalid_upstream_response' });

    const emptyFetch = vi.fn().mockResolvedValue(createJsonResponse({ choices: [] }));
    await expect(
      requestAgentCompletion({ ...baseOptions, fetchImpl: emptyFetch as unknown as typeof fetch })
    ).rejects.toMatchObject({ statusCode: 502, code: 'empty_upstream_response' });
  });

  it('rejects a missing endpoint without calling fetch', async () => {
    const fetchMock = vi.fn();
    await expect(
      requestAgentCompletion({
        ...baseOptions,
        baseUrl: '  ',
        fetchImpl: fetchMock as unknown as typeof fetch,
      })
    ).rejects.toMatchObject({ statusCode: 503, code: 'agent_not_configured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
