import type { AgentServerConfig } from './types';

export const AGENT_API_BASE_PATH = '/api/agent';
export const AGENT_CONFIG_ENDPOINT = `${AGENT_API_BASE_PATH}/config`;
export const AGENT_CHAT_ENDPOINT = `${AGENT_API_BASE_PATH}/chat`;

type AgentApiErrorBody = {
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

export class AgentApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AgentApiError';
    this.status = status;
    this.code = code;
  }
}

export function getApiErrorMessage(body: unknown, status: number, rawBody = ''): string {
  const message = (body as AgentApiErrorBody | null)?.error?.message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }
  return rawBody.trim() || `Request failed with status ${status}.`;
}

export function getApiErrorCode(body: unknown): string {
  const code = (body as AgentApiErrorBody | null)?.error?.code;
  return typeof code === 'string' && code.trim() ? code.trim() : 'request_failed';
}

export function createAgentApiError(body: unknown, status: number, rawBody = ''): AgentApiError {
  return new AgentApiError(
    status,
    getApiErrorCode(body),
    getApiErrorMessage(body, status, rawBody)
  );
}

export function isAuthenticationError(error: unknown): boolean {
  return error instanceof AgentApiError && error.status === 401;
}

export function normalizeAgentServerConfig(value: unknown): AgentServerConfig {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    configured: record.configured === true,
    model: typeof record.model === 'string' ? record.model.trim() : '',
  };
}

export async function readJsonBody(
  response: Response
): Promise<{ body: unknown; rawBody: string }> {
  const rawBody = await response.text();
  if (!rawBody.trim()) {
    return { body: null, rawBody };
  }
  try {
    return { body: JSON.parse(rawBody), rawBody };
  } catch {
    return { body: null, rawBody };
  }
}

export async function fetchAgentServerConfig(
  fetchImpl: typeof fetch = fetch
): Promise<AgentServerConfig> {
  const response = await fetchImpl(AGENT_CONFIG_ENDPOINT, {
    headers: { Accept: 'application/json' },
  });
  const { body, rawBody } = await readJsonBody(response);

  if (!response.ok) {
    throw createAgentApiError(body, response.status, rawBody);
  }

  return normalizeAgentServerConfig(body);
}
