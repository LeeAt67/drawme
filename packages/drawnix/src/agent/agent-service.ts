import { getChatCompletionsUrl } from './config';
import { CREATE_DIAGRAM_TOOL_DEFINITION, CREATE_DIAGRAM_TOOL_NAME } from './tool-definition';
import type {
  AgentConversationMessage,
  AgentProviderConfig,
  AgentToolCall,
  AgentToolEvent,
  AgentToolExecution,
  AgentTurnResult,
} from './types';

type ApiToolCall = {
  id?: string;
  type?: string;
  function?: {
    name?: string;
    arguments?: string;
  };
};

type ApiMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  tool_calls?: ApiToolCall[];
  tool_call_id?: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
      tool_calls?: ApiToolCall[];
    };
  }>;
  error?: {
    message?: string;
  };
};

export type RunAgentTurnOptions = {
  config: AgentProviderConfig;
  systemPrompt: string;
  history: AgentConversationMessage[];
  executeTool: (toolCall: AgentToolCall) => Promise<AgentToolExecution>;
  signal?: AbortSignal;
  onProgress?: (message: string) => void;
  fetchImpl?: typeof fetch;
  maxSteps?: number;
};

const MAX_AGENT_STEPS = 5;

function getApiErrorMessage(responseBody: string, status: number): string {
  try {
    const parsedBody = JSON.parse(responseBody) as ChatCompletionResponse;
    return parsedBody.error?.message || `Request failed with status ${status}.`;
  } catch {
    return responseBody.trim() || `Request failed with status ${status}.`;
  }
}

async function requestChatCompletion(
  config: AgentProviderConfig,
  messages: ApiMessage[],
  signal: AbortSignal | undefined,
  fetchImpl: typeof fetch
): Promise<ApiMessage> {
  const endpoint = getChatCompletionsUrl(config.baseUrl);
  if (!endpoint) {
    throw new Error('Agent API address is not configured.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({
      model: config.model,
      messages,
      tools: [CREATE_DIAGRAM_TOOL_DEFINITION],
      tool_choice: 'auto',
      stream: false,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(getApiErrorMessage(responseBody, response.status));
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const assistantMessage = data.choices?.[0]?.message;
  if (!assistantMessage) {
    throw new Error(data.error?.message || 'The model returned an empty response.');
  }

  return {
    role: 'assistant',
    content: assistantMessage.content || '',
    tool_calls: assistantMessage.tool_calls,
  };
}

function normalizeToolCalls(toolCalls: ApiToolCall[] | undefined): AgentToolCall[] {
  return (toolCalls || [])
    .filter((toolCall) => toolCall.function?.name)
    .map((toolCall, index) => ({
      id: toolCall.id || `tool-call-${Date.now()}-${index}`,
      name: toolCall.function?.name || '',
      arguments: toolCall.function?.arguments || '{}',
    }));
}

export async function runAgentTurn({
  config,
  systemPrompt,
  history,
  executeTool,
  signal,
  onProgress,
  fetchImpl = fetch,
  maxSteps = MAX_AGENT_STEPS,
}: RunAgentTurnOptions): Promise<AgentTurnResult> {
  const messages: ApiMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];
  const toolEvents: AgentToolEvent[] = [];
  let lastAssistantContent = '';

  for (let step = 0; step < maxSteps; step += 1) {
    const assistantMessage = await requestChatCompletion(config, messages, signal, fetchImpl);
    const assistantContent = assistantMessage.content?.trim();
    if (assistantContent) {
      lastAssistantContent = assistantContent;
      onProgress?.(assistantContent);
    }

    const toolCalls = normalizeToolCalls(assistantMessage.tool_calls);
    if (!toolCalls.length) {
      return {
        content: assistantContent || lastAssistantContent || '完成。',
        toolEvents,
      };
    }

    messages.push(assistantMessage);
    for (const toolCall of toolCalls) {
      let execution: AgentToolExecution;
      if (toolCall.name !== CREATE_DIAGRAM_TOOL_NAME) {
        execution = {
          ok: false,
          summary: `Unknown tool: ${toolCall.name}`,
          output: { error: `Unknown tool: ${toolCall.name}` },
        };
      } else {
        execution = await executeTool(toolCall);
      }

      toolEvents.push({
        id: toolCall.id,
        name: toolCall.name,
        ok: execution.ok,
        summary: execution.summary,
      });
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(execution.output),
      });
    }
  }

  return {
    content:
      lastAssistantContent ||
      '已连续调用多轮工具，为避免无限循环已停止。请检查画布或缩小需求范围。',
    toolEvents,
  };
}
