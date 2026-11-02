export type AgentDiagramFormat = 'mermaid' | 'markdown';

export type AgentServerConfig = {
  configured: boolean;
  model: string;
};

export type AgentUser = {
  id: string;
  email: string;
  displayName: string;
};

export type AgentConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AgentToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export type AgentToolExecution = {
  ok: boolean;
  summary: string;
  output: Record<string, unknown>;
};

export type AgentToolEvent = {
  id: string;
  name: string;
  ok: boolean;
  summary: string;
};

export type AgentTurnResult = {
  content: string;
  toolEvents: AgentToolEvent[];
};

export type AgentBoardContext = {
  elementCount: number;
  selectionCount: number;
};

export type AgentInsertionCursor = {
  x: number;
  y: number;
};
