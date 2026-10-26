import { describe, expect, it } from 'vitest';
import {
  AGENT_PROVIDER_STORAGE_KEY,
  DEFAULT_AGENT_PROVIDER_CONFIG,
  getChatCompletionsUrl,
  isAgentProviderConfigReady,
  loadAgentProviderConfig,
  normalizeAgentProviderConfig,
  saveAgentProviderConfig,
} from './config';

const createStorage = (initialValue: string | null = null) => {
  let value = initialValue;

  return {
    getItem: (key: string) => (key === AGENT_PROVIDER_STORAGE_KEY ? value : null),
    setItem: (key: string, nextValue: string) => {
      if (key === AGENT_PROVIDER_STORAGE_KEY) {
        value = nextValue;
      }
    },
    getValue: () => value,
  };
};

describe('agent provider config', () => {
  it('normalizes a base URL into a chat completions endpoint', () => {
    expect(getChatCompletionsUrl(' https://api.example.com/v1/// ')).toBe(
      'https://api.example.com/v1/chat/completions'
    );
  });

  it('keeps a full chat completions URL unchanged', () => {
    expect(getChatCompletionsUrl('https://api.example.com/v1/chat/completions/')).toBe(
      'https://api.example.com/v1/chat/completions'
    );
  });

  it('returns an empty endpoint when the base URL is empty', () => {
    expect(getChatCompletionsUrl('   ')).toBe('');
  });

  it('trims values and applies defaults when normalizing config', () => {
    expect(
      normalizeAgentProviderConfig({
        baseUrl: ' https://api.example.com/v1/ ',
        apiKey: ' sk-test ',
        model: ' model-name ',
      })
    ).toEqual({
      baseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-test',
      model: 'model-name',
    });

    expect(normalizeAgentProviderConfig(null)).toEqual(DEFAULT_AGENT_PROVIDER_CONFIG);
  });

  it('checks whether the provider config is usable', () => {
    expect(
      isAgentProviderConfigReady({
        baseUrl: 'https://api.example.com/v1',
        apiKey: '',
        model: 'model-name',
      })
    ).toBe(true);
    expect(
      isAgentProviderConfigReady({
        baseUrl: ' ',
        apiKey: 'key',
        model: 'model-name',
      })
    ).toBe(false);
  });

  it('loads and saves config through the provided storage', () => {
    const storage = createStorage(
      JSON.stringify({
        baseUrl: ' https://api.example.com/v1/ ',
        apiKey: ' sk-test ',
        model: ' model-name ',
      })
    );

    expect(loadAgentProviderConfig(storage)).toEqual({
      baseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-test',
      model: 'model-name',
    });

    saveAgentProviderConfig(
      {
        baseUrl: ' https://second.example.com/v1/ ',
        apiKey: ' second-key ',
        model: ' second-model ',
      },
      storage
    );

    expect(JSON.parse(storage.getValue() || '{}')).toEqual({
      baseUrl: 'https://second.example.com/v1',
      apiKey: 'second-key',
      model: 'second-model',
    });
  });

  it('falls back to defaults for missing or invalid stored data', () => {
    expect(loadAgentProviderConfig(createStorage())).toEqual(DEFAULT_AGENT_PROVIDER_CONFIG);
    expect(loadAgentProviderConfig(createStorage('{invalid-json'))).toEqual(
      DEFAULT_AGENT_PROVIDER_CONFIG
    );
  });
});
