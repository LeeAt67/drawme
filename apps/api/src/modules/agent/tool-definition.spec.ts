import { describe, expect, it } from 'vitest';
import { AGENT_TOOL_DEFINITIONS as clientToolDefinitions } from '../../../../../packages/drawnix/src/agent/tools/registry';
import { AGENT_TOOL_DEFINITIONS as serverToolDefinitions } from './tool-definition';

describe('agent tool definitions', () => {
  it('stay in sync with the web client registry', () => {
    expect(serverToolDefinitions).toEqual(clientToolDefinitions);
  });

  it('exposes unique tool names', () => {
    const names = serverToolDefinitions.map((definition) => definition.function.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('create_chart');
    expect(names).toContain('create_diagram');
    expect(names).toContain('inspect_board');
  });
});
