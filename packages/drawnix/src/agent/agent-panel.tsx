import { useEffect, useRef, useState } from 'react';
import { getSelectedElements } from '@plait/core';
import { useBoard } from '@drawme/react-board';
import { useDrawnix } from '../hooks/use-drawnix';
import { useI18n } from '../i18n';
import { CloseIcon, SendIcon, SettingsIcon, SparklesIcon, StopIcon } from '../components/icons';
import { AgentSettings } from './agent-settings';
import { runAgentTurn } from './agent-service';
import {
  isAgentProviderConfigReady,
  loadAgentProviderConfig,
  saveAgentProviderConfig,
} from './config';
import { insertAgentDiagram } from './diagram';
import { buildAgentSystemPrompt } from './prompt';
import { parseCreateDiagramArguments } from './tool-definition';
import type {
  AgentConversationMessage,
  AgentInsertionCursor,
  AgentProviderConfig,
  AgentToolEvent,
} from './types';
import './agent-panel.scss';

type AgentMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolEvents?: AgentToolEvent[];
  isError?: boolean;
};

const createMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};

export const AgentPanel = () => {
  const board = useBoard();
  const { appState, setAppState, showToast } = useDrawnix();
  const { t, language } = useI18n();
  const [config, setConfig] = useState<AgentProviderConfig>(() => loadAgentProviderConfig());
  const [settingsOpen, setSettingsOpen] = useState(() => !loadAgentProviderConfig().apiKey);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activity, setActivity] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }
  }, [messages, activity, isRunning]);

  if (!appState.agentPanelOpen) {
    return null;
  }

  const closePanel = () => {
    setAppState((currentState) => ({ ...currentState, agentPanelOpen: false }));
  };

  const saveConfig = (nextConfig: AgentProviderConfig) => {
    const savedConfig = saveAgentProviderConfig(nextConfig);
    setConfig(savedConfig);
    setSettingsOpen(false);
    showToast({ message: t('agent.settings.saved'), type: 'success' });
  };

  const stopAgent = () => {
    abortControllerRef.current?.abort();
  };

  const sendMessage = async (messageText = input) => {
    const normalizedMessage = messageText.trim();
    if (!normalizedMessage || isRunning) {
      return;
    }
    if (!isAgentProviderConfigReady(config)) {
      setSettingsOpen(true);
      return;
    }

    const userMessage: AgentMessage = {
      id: createMessageId(),
      role: 'user',
      content: normalizedMessage,
    };
    const nextMessages = [...messages, userMessage];
    const history: AgentConversationMessage[] = nextMessages
      .filter((message) => !message.isError)
      .map((message) => ({ role: message.role, content: message.content }));

    setMessages(nextMessages);
    setInput('');
    setActivity(t('agent.thinking'));
    setIsRunning(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let insertionCursor: AgentInsertionCursor | undefined;

    try {
      const result = await runAgentTurn({
        config,
        systemPrompt: buildAgentSystemPrompt({
          language,
          context: {
            elementCount: board.children.length,
            selectionCount: getSelectedElements(board).length,
          },
        }),
        history,
        signal: abortController.signal,
        onProgress: (progress) => {
          setActivity(progress);
        },
        executeTool: async (toolCall) => {
          try {
            const arguments_ = parseCreateDiagramArguments(toolCall.arguments);
            setActivity(t('agent.tool.inserting'));
            const insertedDiagram = await insertAgentDiagram(
              board,
              arguments_.format,
              arguments_.content,
              insertionCursor
            );
            insertionCursor = insertedDiagram.nextCursor;
            return {
              ok: true,
              summary: `${t('agent.tool.inserted')} · ${insertedDiagram.elementCount}`,
              output: {
                inserted: true,
                format: arguments_.format,
                title: arguments_.title || null,
                elementCount: insertedDiagram.elementCount,
              },
            };
          } catch (error) {
            const errorMessage = getErrorMessage(error);
            return {
              ok: false,
              summary: `${t('agent.tool.failed')}: ${errorMessage}`,
              output: { inserted: false, error: errorMessage },
            };
          }
        },
      });

      const assistantMessage: AgentMessage = {
        id: createMessageId(),
        role: 'assistant',
        content: result.content,
        toolEvents: result.toolEvents,
      };
      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
      if (result.toolEvents.some((toolEvent) => toolEvent.ok)) {
        showToast({ message: t('agent.toast.inserted'), type: 'success' });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createMessageId(),
            role: 'assistant',
            content: t('agent.error.aborted'),
            isError: true,
          },
        ]);
      } else {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createMessageId(),
            role: 'assistant',
            content: `${t('agent.error.request')}: ${getErrorMessage(error)}`,
            isError: true,
          },
        ]);
      }
    } finally {
      abortControllerRef.current = null;
      setActivity('');
      setIsRunning(false);
    }
  };

  const suggestions = [
    t('agent.suggestion.flow'),
    t('agent.suggestion.architecture'),
    t('agent.suggestion.retro'),
  ];

  return (
    <aside className="agent-panel" aria-label={t('agent.title')}>
      <header className="agent-panel__header">
        <div className="agent-panel__brand">
          <span className="agent-panel__brand-icon">{SparklesIcon}</span>
          <span>
            <strong>{t('agent.title')}</strong>
            <small>{t('agent.subtitle')}</small>
          </span>
        </div>
        <div className="agent-panel__header-actions">
          <button
            type="button"
            className={`agent-icon-button${settingsOpen ? ' agent-icon-button--active' : ''}`}
            title={t('agent.settings')}
            aria-label={t('agent.settings')}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            {SettingsIcon}
          </button>
          <button
            type="button"
            className="agent-icon-button"
            title={t('agent.close')}
            aria-label={t('agent.close')}
            onClick={closePanel}
          >
            {CloseIcon}
          </button>
        </div>
      </header>

      {settingsOpen ? (
        <AgentSettings
          config={config}
          onSave={saveConfig}
          onCancel={() => setSettingsOpen(false)}
        />
      ) : (
        <>
          <div className="agent-panel__messages" ref={messagesRef} aria-live="polite">
            {messages.length === 0 && (
              <div className="agent-empty">
                <div className="agent-empty__icon">{SparklesIcon}</div>
                <h3>{t('agent.empty.title')}</h3>
                <p>{t('agent.empty.description')}</p>
                <div className="agent-empty__suggestions">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="agent-suggestion"
                      onClick={() => void sendMessage(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`agent-message agent-message--${message.role}${
                  message.isError ? ' agent-message--error' : ''
                }`}
              >
                <div className="agent-message__role">
                  {message.role === 'user' ? t('agent.message.you') : t('agent.message.agent')}
                </div>
                <div className="agent-message__content">{message.content}</div>
                {message.toolEvents?.length ? (
                  <div className="agent-message__tools">
                    {message.toolEvents.map((toolEvent) => (
                      <div
                        key={toolEvent.id}
                        className={`agent-tool-event${toolEvent.ok ? '' : ' agent-tool-event--error'}`}
                      >
                        <span aria-hidden="true">{toolEvent.ok ? '✓' : '!'}</span>
                        {toolEvent.summary}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {isRunning && (
              <div className="agent-running" role="status">
                <span className="agent-running__dots" aria-hidden="true">
                  <i></i>
                  <i></i>
                  <i></i>
                </span>
                <span>{activity || t('agent.thinking')}</span>
              </div>
            )}
          </div>

          <form
            className="agent-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <textarea
              rows={2}
              value={input}
              placeholder={t('agent.placeholder')}
              aria-label={t('agent.placeholder')}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
            />
            <div className="agent-composer__footer">
              <span>{t('agent.composer.hint')}</span>
              {isRunning ? (
                <button
                  type="button"
                  className="agent-button agent-button--stop"
                  onClick={stopAgent}
                >
                  {StopIcon}
                  {t('agent.stop')}
                </button>
              ) : (
                <button
                  type="submit"
                  className="agent-button agent-button--primary agent-button--send"
                  disabled={!input.trim()}
                >
                  {SendIcon}
                  {t('agent.send')}
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </aside>
  );
};
