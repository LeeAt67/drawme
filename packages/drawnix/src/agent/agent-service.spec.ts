import { describe, expect, it, vi } from 'vitest';
import { runAgentTurn } from './agent-service';
import { AGENT_CHAT_ENDPOINT } from './config';

const createJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }) as unknown as Response;

const createDirectResponse = (content: string) =>
  createJsonResponse({ message: { role: 'assistant', content } });

const createToolCallResponse = (argumentsValue: Record<string, unknown>) =>
  createJsonResponse({
    message: {
      role: 'assistant',
      content: '',
      tool_calls: [
        {
          id: 'call-1',
          type: 'function',
          function: {
            name: 'create_diagram',
            arguments: JSON.stringify(argumentsValue),
          },
        },
      ],
    },
  });

describe('runAgentTurn', () => {
  it('returns a direct assistant response without calling tools', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(createDirectResponse('I can help with that.'));
    const executeTool = vi.fn();
    const onProgress = vi.fn();

    const result = await runAgentTurn({
      systemPrompt: 'system prompt',
      history: [{ role: 'user', content: 'hello' }],
      executeTool,
      onProgress,
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(result).toEqual({
      content: 'I can help with that.',
      toolEvents: [],
    });
    expect(executeTool).not.toHaveBeenCalled();
    expect(onProgress).toHaveBeenCalledWith('I can help with that.');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('posts messages to the same-origin agent endpoint without credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(createDirectResponse('ok'));

    await runAgentTurn({
      systemPrompt: 'system prompt',
      history: [{ role: 'user', content: 'hello' }],
      executeTool: vi.fn(),
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(AGENT_CHAT_ENDPOINT);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(String(init.body))).toEqual({
      tool_choice: 'auto',
      messages: [
        { role: 'system', content: 'system prompt' },
        { role: 'user', content: 'hello' },
      ],
    });
  });

  it('executes create_diagram tool calls and feeds the result back to the model', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createToolCallResponse({
          format: 'mermaid',
          content: 'flowchart TD\n A --> B',
        })
      )
      .mockResolvedValueOnce(createDirectResponse('The flow is on the board.'));
    const executeTool = vi.fn().mockResolvedValue({
      ok: true,
      summary: 'Diagram inserted',
      output: { inserted: true, elementCount: 2 },
    });

    const result = await runAgentTurn({
      systemPrompt: 'system prompt',
      history: [{ role: 'user', content: 'draw a flow' }],
      executeTool,
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(executeTool).toHaveBeenCalledWith({
      id: 'call-1',
      name: 'create_diagram',
      arguments: JSON.stringify({
        format: 'mermaid',
        content: 'flowchart TD\n A --> B',
      }),
    });
    expect(result).toEqual({
      content: 'The flow is on the board.',
      toolEvents: [
        {
          id: 'call-1',
          name: 'create_diagram',
          ok: true,
          summary: 'Diagram inserted',
        },
      ],
    });

    const secondRequestBody = JSON.parse(
      String((fetchMock.mock.calls[1] as [string, RequestInit])[1].body)
    );
    expect(secondRequestBody.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'tool',
          tool_call_id: 'call-1',
          content: JSON.stringify({ inserted: true, elementCount: 2 }),
        }),
      ])
    );
  });

  it('reports failed tool executions to the model and result', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createToolCallResponse({ format: 'mermaid', content: 'bad' }))
      .mockResolvedValueOnce(createDirectResponse('The diagram could not be inserted.'));
    const executeTool = vi.fn().mockResolvedValue({
      ok: false,
      summary: 'Diagram insertion failed',
      output: { inserted: false, error: 'Invalid mermaid' },
    });

    const result = await runAgentTurn({
      systemPrompt: 'system prompt',
      history: [{ role: 'user', content: 'draw a flow' }],
      executeTool,
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(result.toolEvents[0].ok).toBe(false);
    expect(result.content).toBe('The diagram could not be inserted.');
  });

  it('rejects unknown tools without invoking the executor', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonResponse({
          message: {
            role: 'assistant',
            content: '',
            tool_calls: [
              {
                id: 'call-unknown',
                type: 'function',
                function: { name: 'delete_board', arguments: '{}' },
              },
            ],
          },
        })
      )
      .mockResolvedValueOnce(createDirectResponse('I cannot do that.'));
    const executeTool = vi.fn();

    const result = await runAgentTurn({
      systemPrompt: 'system prompt',
      history: [{ role: 'user', content: 'delete it' }],
      executeTool,
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(executeTool).not.toHaveBeenCalled();
    expect(result.toolEvents[0]).toMatchObject({
      id: 'call-unknown',
      name: 'delete_board',
      ok: false,
    });
  });

  it('stops after the configured number of model steps', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createToolCallResponse({ format: 'markdown', content: '# A' }));
    const executeTool = vi.fn().mockResolvedValue({
      ok: true,
      summary: 'Diagram inserted',
      output: { inserted: true },
    });

    const result = await runAgentTurn({
      systemPrompt: 'system prompt',
      history: [{ role: 'user', content: 'loop' }],
      executeTool,
      fetchImpl: fetchMock as unknown as typeof fetch,
      maxSteps: 2,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(executeTool).toHaveBeenCalledTimes(2);
    expect(result.toolEvents).toHaveLength(2);
    expect(result.content).toContain('已连续调用多轮工具');
  });

  it('surfaces API error messages from the proxy', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonResponse({ error: { code: 'upstream_error', message: 'Invalid API key' } }, 401)
      );

    await expect(
      runAgentTurn({
        systemPrompt: 'system prompt',
        history: [{ role: 'user', content: 'hello' }],
        executeTool: vi.fn(),
        fetchImpl: fetchMock as unknown as typeof fetch,
      })
    ).rejects.toThrow('Invalid API key');
  });

  it('rejects an empty assistant message', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(createJsonResponse({}));

    await expect(
      runAgentTurn({
        systemPrompt: 'system prompt',
        history: [{ role: 'user', content: 'hello' }],
        executeTool: vi.fn(),
        fetchImpl: fetchMock as unknown as typeof fetch,
      })
    ).rejects.toThrow('The model returned an empty response.');
  });
});
