import { useState } from 'react';
import { useI18n } from '../i18n';
import type { AgentProviderConfig } from './types';

type AgentSettingsProps = {
  config: AgentProviderConfig;
  onSave: (config: AgentProviderConfig) => void;
  onCancel: () => void;
};

const PROVIDER_PRESETS: Array<{
  label: string;
  config: Pick<AgentProviderConfig, 'baseUrl' | 'model'>;
}> = [
  {
    label: 'OpenAI',
    config: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  },
  {
    label: 'DeepSeek',
    config: { baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  },
  {
    label: 'Ollama',
    config: { baseUrl: 'http://localhost:11434/v1', model: 'qwen2.5:7b' },
  },
];

export const AgentSettings = ({ config, onSave, onCancel }: AgentSettingsProps) => {
  const { t } = useI18n();
  const [draft, setDraft] = useState(config);
  const [error, setError] = useState<string | null>(null);

  const updateDraft = (partialConfig: Partial<AgentProviderConfig>) => {
    setDraft((currentDraft) => ({ ...currentDraft, ...partialConfig }));
    setError(null);
  };

  const submit = () => {
    if (!draft.baseUrl.trim() || !draft.model.trim()) {
      setError(t('agent.settings.invalid'));
      return;
    }
    onSave(draft);
  };

  return (
    <div className="agent-settings">
      <div className="agent-settings__intro">
        <h3>{t('agent.settings.title')}</h3>
        <p>{t('agent.settings.description')}</p>
      </div>

      <div className="agent-settings__presets" aria-label={t('agent.settings.presets')}>
        {PROVIDER_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="agent-settings__preset"
            onClick={() => updateDraft(preset.config)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <label className="agent-settings__field">
        <span>{t('agent.settings.baseUrl')}</span>
        <input
          value={draft.baseUrl}
          onChange={(event) => updateDraft({ baseUrl: event.target.value })}
          placeholder="https://api.openai.com/v1"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <label className="agent-settings__field">
        <span>{t('agent.settings.model')}</span>
        <input
          value={draft.model}
          onChange={(event) => updateDraft({ model: event.target.value })}
          placeholder="gpt-4o-mini"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <label className="agent-settings__field">
        <span>{t('agent.settings.apiKey')}</span>
        <input
          type="password"
          value={draft.apiKey}
          onChange={(event) => updateDraft({ apiKey: event.target.value })}
          placeholder={t('agent.settings.apiKeyPlaceholder')}
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      {error && (
        <div className="agent-settings__error" role="alert">
          {error}
        </div>
      )}

      <div className="agent-settings__actions">
        <button type="button" className="agent-button agent-button--ghost" onClick={onCancel}>
          {t('agent.settings.cancel')}
        </button>
        <button type="button" className="agent-button agent-button--primary" onClick={submit}>
          {t('agent.settings.save')}
        </button>
      </div>
    </div>
  );
};
