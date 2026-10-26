import type { AgentProviderConfig } from './types';

export const AGENT_PROVIDER_STORAGE_KEY = 'drawnix.agent.provider';

export const DEFAULT_AGENT_PROVIDER_CONFIG: AgentProviderConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
};

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

const getBrowserStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

export function getChatCompletionsUrl(baseUrl: string): string {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (!normalizedBaseUrl) {
    return '';
  }
  if (/\/chat\/completions$/i.test(normalizedBaseUrl)) {
    return normalizedBaseUrl;
  }
  return `${normalizedBaseUrl}/chat/completions`;
}

export function normalizeAgentProviderConfig(
  config: Partial<AgentProviderConfig> | null | undefined
): AgentProviderConfig {
  return {
    baseUrl: normalizeBaseUrl(config?.baseUrl || DEFAULT_AGENT_PROVIDER_CONFIG.baseUrl),
    apiKey: (config?.apiKey || '').trim(),
    model: (config?.model || DEFAULT_AGENT_PROVIDER_CONFIG.model).trim(),
  };
}

export function isAgentProviderConfigReady(config: AgentProviderConfig): boolean {
  return Boolean(normalizeBaseUrl(config.baseUrl) && config.model.trim());
}

export function loadAgentProviderConfig(storage?: ReadableStorage): AgentProviderConfig {
  const resolvedStorage = storage ?? getBrowserStorage();
  if (!resolvedStorage) {
    return { ...DEFAULT_AGENT_PROVIDER_CONFIG };
  }

  try {
    const rawValue = resolvedStorage.getItem(AGENT_PROVIDER_STORAGE_KEY);
    if (!rawValue) {
      return { ...DEFAULT_AGENT_PROVIDER_CONFIG };
    }
    return normalizeAgentProviderConfig(JSON.parse(rawValue) as Partial<AgentProviderConfig>);
  } catch {
    return { ...DEFAULT_AGENT_PROVIDER_CONFIG };
  }
}

export function saveAgentProviderConfig(
  config: AgentProviderConfig,
  storage?: WritableStorage
): AgentProviderConfig {
  const normalizedConfig = normalizeAgentProviderConfig(config);
  const resolvedStorage = storage ?? getBrowserStorage();
  resolvedStorage?.setItem(AGENT_PROVIDER_STORAGE_KEY, JSON.stringify(normalizedConfig));
  return normalizedConfig;
}
