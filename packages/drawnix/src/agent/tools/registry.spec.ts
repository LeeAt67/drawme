import { describe, expect, it } from 'vitest';
import {
  AGENT_TOOL_DEFINITIONS,
  AGENT_TOOL_NAMES,
  getAgentToolDefinition,
  isAgentTool,
} from './registry';

const ALLOWED_TYPES = new Set([
  'string',
  'number',
  'integer',
  'boolean',
  'array',
  'object',
  'null',
]);

function collectTypes(
  schema: unknown,
  path: string,
  found: { path: string; type: unknown }[]
): void {
  if (!schema || typeof schema !== 'object') {
    return;
  }
  const record = schema as Record<string, unknown>;
  if ('type' in record) {
    found.push({ path, type: record.type });
  }
  const properties = record.properties as Record<string, unknown> | undefined;
  for (const [key, value] of Object.entries(properties || {})) {
    collectTypes(value, `${path}.properties.${key}`, found);
  }
  if (record.items) {
    collectTypes(record.items, `${path}.items`, found);
  }
}

describe('agent tool registry', () => {
  it('exposes unique, known tool names', () => {
    const names = AGENT_TOOL_DEFINITIONS.map((definition) => definition.function.name);
    expect(new Set(names).size).toBe(AGENT_TOOL_NAMES.length);
    expect(AGENT_TOOL_NAMES).toEqual(['create_chart', 'create_diagram', 'inspect_board']);
    expect(isAgentTool('create_chart')).toBe(true);
    expect(isAgentTool('delete_everything')).toBe(false);
    expect(getAgentToolDefinition('inspect_board')?.function.parameters.type).toBe('object');
  });

  it('keeps every schema closed and valid JSON', () => {
    for (const definition of AGENT_TOOL_DEFINITIONS) {
      const { name, parameters } = definition.function;
      expect(parameters.type, name).toBe('object');
      expect(parameters.additionalProperties, name).toBe(false);
      expect(() => JSON.stringify(parameters), name).not.toThrow();

      const types: { path: string; type: unknown }[] = [];
      collectTypes(parameters, name, types);
      for (const entry of types) {
        const values = Array.isArray(entry.type) ? entry.type : [entry.type];
        for (const value of values) {
          expect(ALLOWED_TYPES.has(String(value)), `${entry.path} -> ${String(value)}`).toBe(true);
        }
      }
    }
  });

  it('requires kind for create_chart and content for create_diagram', () => {
    expect(getAgentToolDefinition('create_chart')?.function.parameters.required).toEqual(['kind']);
    expect(getAgentToolDefinition('create_diagram')?.function.parameters.required).toEqual([
      'format',
      'content',
    ]);
  });
});
