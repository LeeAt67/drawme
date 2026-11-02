import { ApiError } from '../../shared/errors';
import { getChatCompletionsUrl } from '../../config';
import type { AgentChatMessage } from './schema';
import { AGENT_TOOL_DEFINITIONS } from './tool-definition';

export type AgentUpstreamToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

export type AgentAssistantMessage = {
  role: 'assistant';
  content: string | null;
  tool_calls?: AgentUpstreamToolCall[];
};

export type RequestAgentCompletionOptions = {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
  messages: AgentChatMessage[];
  toolChoice?: 'auto' | { type: 'function'; function: { name: string } };
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
};

const MAX_UPSTREAM_ERROR_LENGTH = 500;

function isAbortLike(error: unknown): boolean {
  return error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError');
}

function extractUpstreamErrorMessage(body: string): string {
  try {
    const parsedBody = JSON.parse(body) as { error?: { message?: unknown } };
    if (typeof parsedBody.error?.message === 'string' && parsedBody.error.message.trim()) {
      return parsedBody.error.message.trim();
    }
  } catch {
    // Fall back to the raw body below.
  }
  return body.trim();
}

function sanitizeToolCalls(value: unknown): AgentUpstreamToolCall[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const toolCalls = value.flatMap((toolCall) => {
    if (!toolCall || typeof toolCall !== 'object') {
      return [];
    }
    const record = toolCall as {
      id?: unknown;
      function?: { name?: unknown; arguments?: unknown };
    };
    if (
      typeof record.id !== 'string' ||
      !record.function ||
      typeof record.function.name !== 'string' ||
      typeof record.function.arguments !== 'string'
    ) {
      return [];
    }
    return [
      {
        id: record.id,
        type: 'function' as const,
        function: {
          name: record.function.name,
          arguments: record.function.arguments,
        },
      },
    ];
  });

  return toolCalls.length ? toolCalls : undefined;
}

export async function requestAgentCompletion({
  baseUrl,
  apiKey,
  model,
  timeoutMs,
  messages,
  toolChoice = 'auto',
  signal,
  fetchImpl = fetch,
}: RequestAgentCompletionOptions): Promise<AgentAssistantMessage> {
  const endpoint = getChatCompletionsUrl(baseUrl);
  if (!endpoint) {
    throw new ApiError(503, 'agent_not_configured', 'The agent model endpoint is not configured.');
  }
  if (!apiKey) {
    throw new ApiError(503, 'agent_not_configured', 'The agent API key is not configured.');
  }

  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const requestSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        tools: AGENT_TOOL_DEFINITIONS,
        tool_choice: toolChoice,
        stream: false,
      }),
      signal: requestSignal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw new ApiError(499, 'request_aborted', 'The client aborted the request.');
    }
    if (isAbortLike(error)) {
      throw new ApiError(504, 'upstream_timeout', 'The model request timed out.');
    }
    throw new ApiError(502, 'upstream_unreachable', 'Could not reach the model service.');
  }

  if (!response.ok) {
    const responseBody = await response.text().catch(() => '');
    const upstreamMessage =
      extractUpstreamErrorMessage(responseBody).slice(0, MAX_UPSTREAM_ERROR_LENGTH) ||
      `Model request failed with status ${response.status}.`;
    const statusCode = response.status === 429 ? 429 : 502;
    const code = response.status === 429 ? 'upstream_rate_limited' : 'upstream_error';
    throw new ApiError(statusCode, code, upstreamMessage);
  }

  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch {
    throw new ApiError(
      502,
      'invalid_upstream_response',
      'The model service returned invalid JSON.'
    );
  }

  const assistantMessage = (
    responseBody as { choices?: Array<{ message?: { content?: unknown; tool_calls?: unknown } }> }
  )?.choices?.[0]?.message;

  if (!assistantMessage || typeof assistantMessage !== 'object') {
    throw new ApiError(502, 'empty_upstream_response', 'The model returned an empty response.');
  }

  return {
    role: 'assistant',
    content: typeof assistantMessage.content === 'string' ? assistantMessage.content : null,
    tool_calls: sanitizeToolCalls(assistantMessage.tool_calls),
  };
}
