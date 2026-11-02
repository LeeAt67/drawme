import { AGENT_CHAT_ENDPOINT, createAgentApiError } from './config';
import { isAgentTool } from './tools/registry';
import type {
  AgentConversationMessage,
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

type AgentChatResponse = {
  message?: {
    content?: string | null;
    tool_calls?: ApiToolCall[];
  };
  error?: {
    message?: string;
  };
};

export type RunAgentTurnOptions = {
  systemPrompt: string;
  history: AgentConversationMessage[];
  executeTool: (toolCall: AgentToolCall) => Promise<AgentToolExecution>;
  signal?: AbortSignal;
  onProgress?: (message: string) => void;
  fetchImpl?: typeof fetch;
  maxSteps?: number;
  /** 单轮最多执行多少个工具调用，防止一次铺满整块画布。 */
  maxToolCalls?: number;
  /** 收敛用：修复轮把模型强制指回某个工具。 */
  toolChoice?: 'auto' | { type: 'function'; function: { name: string } };
};

const MAX_AGENT_STEPS = 5;
const MAX_TOOL_CALLS_PER_TURN = 8;

async function requestChatCompletion(
  messages: ApiMessage[],
  signal: AbortSignal | undefined,
  fetchImpl: typeof fetch,
  toolChoice: RunAgentTurnOptions['toolChoice']
): Promise<ApiMessage> {
  const response = await fetchImpl(AGENT_CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({ messages, tool_choice: toolChoice }),
  });

  const rawBody = await response.text();
  let data: AgentChatResponse | null = null;
  try {
    data = rawBody ? (JSON.parse(rawBody) as AgentChatResponse) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw createAgentApiError(data, response.status, rawBody);
  }

  const assistantMessage = data?.message;
  if (!assistantMessage) {
    throw new Error(data?.error?.message || 'The model returned an empty response.');
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
  systemPrompt,
  history,
  executeTool,
  signal,
  onProgress,
  fetchImpl = fetch,
  maxSteps = MAX_AGENT_STEPS,
  maxToolCalls = MAX_TOOL_CALLS_PER_TURN,
  toolChoice = 'auto',
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
  let executedToolCalls = 0;
  let budgetExhausted = false;

  for (let step = 0; step < maxSteps; step += 1) {
    const assistantMessage = await requestChatCompletion(messages, signal, fetchImpl, toolChoice);
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
      if (executedToolCalls >= maxToolCalls) {
        budgetExhausted = true;
        execution = {
          ok: false,
          summary: 'Tool budget exhausted for this turn.',
          output: {
            ok: false,
            error: {
              code: 'tool_budget_exceeded',
              message: `At most ${maxToolCalls} tool calls are allowed per turn.`,
              hint: 'Insert what is already generated, then ask the user before creating more.',
            },
          },
        };
      } else if (!isAgentTool(toolCall.name)) {
        execution = {
          ok: false,
          summary: `Unknown tool: ${toolCall.name}`,
          output: {
            ok: false,
            error: { code: 'unknown_tool', message: `Unknown tool: ${toolCall.name}` },
          },
        };
      } else {
        executedToolCalls += 1;
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

    if (budgetExhausted) {
      break;
    }
  }

  return {
    content:
      lastAssistantContent ||
      '已连续调用多轮工具，为避免无限循环已停止。请检查画布或缩小需求范围。',
    toolEvents,
  };
}
