import { z } from 'zod';
import { isAgentToolName } from './tool-definition';

const MAX_MESSAGES = 60;
const MAX_TOOL_CALLS = 10;
const MAX_CONTENT_LENGTH = 60_000;
const MAX_TOTAL_CONTENT_LENGTH = 200_000;

const toolCallSchema = z.object({
  id: z.string().min(1).max(200),
  type: z.literal('function').optional(),
  function: z.object({
    name: z.string().min(1).max(120),
    arguments: z.string().max(MAX_CONTENT_LENGTH),
  }),
});

const messageSchema = z
  .object({
    role: z.enum(['system', 'user', 'assistant', 'tool']),
    content: z.string().max(MAX_CONTENT_LENGTH).nullable().optional(),
    tool_calls: z.array(toolCallSchema).max(MAX_TOOL_CALLS).optional(),
    tool_call_id: z.string().min(1).max(200).optional(),
  })
  .superRefine((message, context) => {
    const content = message.content?.trim() || '';

    if (message.role === 'tool') {
      if (!message.tool_call_id) {
        context.addIssue({ code: 'custom', message: 'Tool messages require tool_call_id.' });
      }
      if (!content) {
        context.addIssue({ code: 'custom', message: 'Tool messages require content.' });
      }
      return;
    }

    if (message.role === 'assistant') {
      if (!content && !message.tool_calls?.length) {
        context.addIssue({
          code: 'custom',
          message: 'Assistant messages require content or tool_calls.',
        });
      }
      return;
    }

    if (!content) {
      context.addIssue({ code: 'custom', message: 'Message content cannot be empty.' });
    }
  });

export const agentChatRequestSchema = z
  .object({
    messages: z.array(messageSchema).min(1).max(MAX_MESSAGES),
    tool_choice: z
      .union([
        z.literal('auto'),
        z.object({
          type: z.literal('function'),
          function: z.object({ name: z.string().min(1).max(120) }),
        }),
      ])
      .optional(),
  })
  .superRefine((request, context) => {
    const totalLength = request.messages.reduce(
      (length, message) => length + (message.content?.length || 0),
      0
    );
    if (totalLength > MAX_TOTAL_CONTENT_LENGTH) {
      context.addIssue({ code: 'custom', message: 'Conversation is too large.' });
    }

    const forcedTool =
      typeof request.tool_choice === 'object' ? request.tool_choice.function.name : null;
    if (forcedTool && !isAgentToolName(forcedTool)) {
      context.addIssue({
        code: 'custom',
        path: ['tool_choice', 'function', 'name'],
        message: `Unknown tool: ${forcedTool}.`,
      });
    }
  });

export type AgentChatMessage = z.infer<typeof messageSchema>;
export type AgentChatRequest = z.infer<typeof agentChatRequestSchema>;
