import { describe, expect, it } from 'vitest';
import { agentChatRequestSchema } from './schema';

describe('agentChatRequestSchema', () => {
  it('accepts a plain user message', () => {
    const result = agentChatRequestSchema.safeParse({
      messages: [{ role: 'user', content: 'draw a flow' }],
      model: 'ignored-client-value',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.messages).toEqual([{ role: 'user', content: 'draw a flow' }]);
    }
  });

  it('accepts assistant tool calls and tool results', () => {
    const result = agentChatRequestSchema.safeParse({
      messages: [
        { role: 'user', content: 'draw a flow' },
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'call-1',
              type: 'function',
              function: { name: 'create_diagram', arguments: '{}' },
            },
          ],
        },
        { role: 'tool', tool_call_id: 'call-1', content: '{"inserted":true}' },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('rejects malformed messages', () => {
    expect(agentChatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
    expect(
      agentChatRequestSchema.safeParse({ messages: [{ role: 'function', content: 'x' }] }).success
    ).toBe(false);
    expect(
      agentChatRequestSchema.safeParse({ messages: [{ role: 'user', content: '   ' }] }).success
    ).toBe(false);
    expect(
      agentChatRequestSchema.safeParse({
        messages: [{ role: 'assistant', content: '' }],
      }).success
    ).toBe(false);
    expect(
      agentChatRequestSchema.safeParse({
        messages: [{ role: 'tool', content: 'ok' }],
      }).success
    ).toBe(false);
  });

  it('rejects oversized conversations', () => {
    const messages = Array.from({ length: 61 }, () => ({ role: 'user', content: 'hi' }));
    expect(agentChatRequestSchema.safeParse({ messages }).success).toBe(false);

    const largeMessages = [
      { role: 'user', content: 'a'.repeat(59_000) },
      { role: 'user', content: 'b'.repeat(59_000) },
      { role: 'user', content: 'c'.repeat(59_000) },
      { role: 'user', content: 'd'.repeat(59_000) },
    ];
    expect(agentChatRequestSchema.safeParse({ messages: largeMessages }).success).toBe(false);
  });
});
