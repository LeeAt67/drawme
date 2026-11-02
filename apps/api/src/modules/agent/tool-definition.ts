import { AGENT_TOOL_DEFINITIONS } from './tool-definitions.generated';

export { AGENT_TOOL_DEFINITIONS };

export const AGENT_TOOL_NAMES: string[] = AGENT_TOOL_DEFINITIONS.map(
  (definition) => definition.function.name
);

export function isAgentToolName(name: string): boolean {
  return AGENT_TOOL_NAMES.includes(name);
}
