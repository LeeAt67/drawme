import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { getSelectedElements, toHostPoint, toViewBoxPoint } from '@plait/core';
import { useBoard } from '@drawme/react-board';
import { isAgentPanelOpen, useDrawnix } from '../hooks/use-drawnix';
import { useI18n } from '../i18n';
import { AnnotateIcon, CloseIcon, SendIcon, SparklesIcon, StopIcon } from '../components/icons';
import { runAgentTurn } from './agent-service';
import { parseChartSpec } from './chart/parse';
import { buildChartSource } from './chart/source';
import { inspectBoard, parseInspectArguments } from './tools/inspect';
import { fetchAgentServerConfig, isAuthenticationError } from './config';
import { insertAgentDiagram } from './diagram';
import { buildAgentSystemPrompt } from './prompt';
import { parseCreateDiagramArguments } from './tool-definition';
import {
  buildAnnotationMessage,
  createBoardAnnotation,
  getAnnotationInsertionPoint,
  normalizeRect,
} from './annotation';
import type { BoardAnnotation } from './annotation';
import { markSignedOut, openAuthDialog } from '../auth/session';
import { useAuthSession } from '../auth/use-auth-session';
import { useLayout } from '../components/shell/use-layout';
import type {
  AgentConversationMessage,
  AgentInsertionCursor,
  AgentServerConfig,
  AgentToolEvent,
} from './types';
import './agent-panel.scss';

type AgentMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  annotation?: BoardAnnotation;
  historyContent?: string;
  toolEvents?: AgentToolEvent[];
  isError?: boolean;
};

type ScreenRect = { x: number; y: number; width: number; height: number };
type LayerPoint = { x: number; y: number };

const createMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const MIN_ANNOTATION_SIZE = 12;

const normalizeScreenRect = (start: LayerPoint, end: LayerPoint): ScreenRect => ({
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
  width: Math.abs(end.x - start.x),
  height: Math.abs(end.y - start.y),
});

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};

export const AgentPanel = () => {
  const board = useBoard();
  const { appState, showToast } = useDrawnix();
  const { closeAgent } = useLayout();
  const { t, language } = useI18n();
  const [serverConfig, setServerConfig] = useState<AgentServerConfig | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activity, setActivity] = useState('');
  const [annotationMode, setAnnotationMode] = useState(false);
  const [draftRect, setDraftRect] = useState<ScreenRect | null>(null);
  const [annotation, setAnnotation] = useState<BoardAnnotation | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const annotationLayerRef = useRef<HTMLDivElement>(null);
  const annotationStartRef = useRef<LayerPoint | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const serverConfigLoadingRef = useRef(false);
  const isOpen = isAgentPanelOpen(appState);
  const { status, authRequired } = useAuthSession();
  // Do not flash the sign-in dialog while the first session probe is still
  // in flight; only an explicit signed-out result means sign-in is required.
  const loginRequired = authRequired && status === 'signed-out';

  const loadServerConfig = useCallback(async () => {
    if (serverConfigLoadingRef.current) {
      return null;
    }
    serverConfigLoadingRef.current = true;
    try {
      const nextConfig = await fetchAgentServerConfig();
      setServerConfig(nextConfig);
      return nextConfig;
    } catch (error) {
      setServerConfig(null);
      if (isAuthenticationError(error)) {
        markSignedOut();
      } else {
        showToast({ message: getErrorMessage(error), type: 'error' });
      }
      return null;
    } finally {
      serverConfigLoadingRef.current = false;
    }
  }, [showToast]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (status === 'signed-in') {
      void loadServerConfig();
    } else if (status === 'signed-out') {
      setServerConfig(null);
      setMessages([]);
      setInput('');
    }
  }, [isOpen, status, loadServerConfig]);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }
  }, [messages, activity, isRunning]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setAnnotationMode(false);
      setDraftRect(null);
      annotationStartRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!annotationMode) {
      return;
    }
    annotationLayerRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setAnnotationMode(false);
      setDraftRect(null);
      annotationStartRef.current = null;
      textareaRef.current?.focus();
    };
    window.addEventListener('keydown', handleEscape, true);
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [annotationMode]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 168)}px`;
  }, [input, isOpen]);

  if (!isOpen) {
    return null;
  }

  const stopAgent = () => {
    abortControllerRef.current?.abort();
  };

  const toggleAnnotationMode = () => {
    setAnnotationMode((current) => {
      if (!current) {
        setDraftRect(null);
      }
      return !current;
    });
  };

  const toLayerPoint = (clientX: number, clientY: number): LayerPoint => {
    const bounds = annotationLayerRef.current?.getBoundingClientRect();
    return {
      x: clientX - (bounds?.left ?? 0),
      y: clientY - (bounds?.top ?? 0),
    };
  };

  const commitAnnotation = (screenRect: ScreenRect) => {
    const bounds = annotationLayerRef.current?.getBoundingClientRect();
    if (!bounds) {
      return;
    }
    const startHost = toHostPoint(board, bounds.left + screenRect.x, bounds.top + screenRect.y);
    const endHost = toHostPoint(
      board,
      bounds.left + screenRect.x + screenRect.width,
      bounds.top + screenRect.y + screenRect.height
    );
    const start = toViewBoxPoint(board, startHost);
    const end = toViewBoxPoint(board, endHost);
    setAnnotation(
      createBoardAnnotation(
        board,
        normalizeRect({ x: start[0], y: start[1] }, { x: end[0], y: end[1] })
      )
    );
    setAnnotationMode(false);
    setDraftRect(null);
    annotationStartRef.current = null;
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleAnnotationPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers (tests, automation) have no capturable pointer id.
    }
    const origin = toLayerPoint(event.clientX, event.clientY);
    annotationStartRef.current = origin;
    setDraftRect({ x: origin.x, y: origin.y, width: 0, height: 0 });
  };

  const handleAnnotationPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = annotationStartRef.current;
    if (!start) {
      return;
    }
    setDraftRect(normalizeScreenRect(start, toLayerPoint(event.clientX, event.clientY)));
  };

  const handleAnnotationPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = annotationStartRef.current;
    if (!start) {
      return;
    }
    const rect = normalizeScreenRect(start, toLayerPoint(event.clientX, event.clientY));
    if (rect.width < MIN_ANNOTATION_SIZE || rect.height < MIN_ANNOTATION_SIZE) {
      annotationStartRef.current = null;
      setDraftRect(null);
      return;
    }
    commitAnnotation(rect);
  };

  const handleAnnotationPointerCancel = () => {
    annotationStartRef.current = null;
    setDraftRect(null);
  };

  const sendMessage = async (messageText = input) => {
    const normalizedMessage = messageText.trim();
    const pendingAnnotation = annotation;
    if ((!normalizedMessage && !pendingAnnotation) || isRunning) {
      return;
    }
    if (loginRequired) {
      openAuthDialog();
      return;
    }
    if (serverConfig?.configured !== true) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: 'assistant',
          content: `${t('agent.settings.notConfigured')} ${t('agent.settings.unconfiguredHint')}`,
          isError: true,
        },
      ]);
      void loadServerConfig();
      return;
    }

    const displayMessage = normalizedMessage || t('agent.annotation.defaultPrompt');
    const userMessage: AgentMessage = {
      id: createMessageId(),
      role: 'user',
      content: displayMessage,
      annotation: pendingAnnotation ?? undefined,
      historyContent: pendingAnnotation
        ? buildAnnotationMessage(displayMessage, pendingAnnotation, language)
        : undefined,
    };
    const nextMessages = [...messages, userMessage];
    const history: AgentConversationMessage[] = nextMessages
      .filter((message) => !message.isError)
      .map((message) => ({
        role: message.role,
        content: message.historyContent ?? message.content,
      }));

    setMessages(nextMessages);
    setInput('');
    setAnnotation(null);
    setActivity(t('agent.thinking'));
    setIsRunning(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let insertionCursor: AgentInsertionCursor | undefined = pendingAnnotation
      ? getAnnotationInsertionPoint(pendingAnnotation)
      : undefined;

    try {
      const result = await runAgentTurn({
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
          const reportFailure = (error: unknown, metadata: Record<string, unknown> = {}) => {
            const problems = (
              error as {
                problems?: Array<{ code: string; message: string; path?: string; hint?: string }>;
              }
            ).problems;
            const problem = problems?.[0];
            const errorMessage = problem?.message || getErrorMessage(error);
            return {
              ok: false as const,
              summary: `${t('agent.tool.failed')}: ${errorMessage}`,
              output: {
                ok: false,
                error: problem
                  ? { ...problem, problems }
                  : { code: 'tool_failed', message: errorMessage },
                ...metadata,
              },
            };
          };

          if (toolCall.name === 'inspect_board') {
            try {
              const inspection = inspectBoard(board, parseInspectArguments(toolCall.arguments));
              setActivity(t('agent.tool.inspected'));
              return {
                ok: true,
                summary: `${t('agent.tool.inspected')} · ${inspection.elementCount}`,
                output: { ok: true, ...inspection },
              };
            } catch (error) {
              return reportFailure(error);
            }
          }

          if (toolCall.name === 'create_chart') {
            setActivity(t('agent.tool.generating'));
            let rawSpec: unknown;
            try {
              rawSpec = toolCall.arguments.trim() ? JSON.parse(toolCall.arguments) : {};
            } catch {
              return reportFailure({
                problems: [{ code: 'empty', message: 'Tool arguments are not valid JSON.' }],
              });
            }

            let spec;
            try {
              spec = parseChartSpec(rawSpec);
            } catch (error) {
              return reportFailure(error, { kind: (rawSpec as { kind?: unknown })?.kind ?? null });
            }

            let source;
            try {
              source = buildChartSource(spec);
            } catch (error) {
              return reportFailure(error, { kind: spec.kind });
            }

            try {
              setActivity(t('agent.tool.inserting'));
              const inserted = await insertAgentDiagram(
                board,
                source.format,
                source.content,
                insertionCursor
              );
              insertionCursor = inserted.nextCursor;
              return {
                ok: true,
                summary: `${t('agent.tool.inserted')} · ${inserted.elementCount}`,
                output: {
                  ok: true,
                  kind: spec.kind,
                  title: spec.title || null,
                  elementCount: inserted.elementCount,
                  warnings: source.warnings,
                },
              };
            } catch (error) {
              return reportFailure(
                {
                  problems: [
                    {
                      code: 'render-failed',
                      message: getErrorMessage(error),
                      hint: 'Simplify the chart, or fall back to create_diagram with raw mermaid source.',
                    },
                  ],
                },
                { kind: spec.kind }
              );
            }
          }

          if (toolCall.name === 'create_diagram') {
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
                  ok: true,
                  format: arguments_.format,
                  title: arguments_.title || null,
                  elementCount: insertedDiagram.elementCount,
                },
              };
            } catch (error) {
              return reportFailure(error);
            }
          }

          return {
            ok: false,
            summary: `Unknown tool: ${toolCall.name}`,
            output: {
              ok: false,
              error: { code: 'unknown_tool', message: `Unknown tool: ${toolCall.name}` },
            },
          };
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
      if (isAuthenticationError(error)) {
        markSignedOut();
        openAuthDialog();
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createMessageId(),
            role: 'assistant',
            content: t('agent.auth.sessionExpired'),
            isError: true,
          },
        ]);
      } else if (error instanceof DOMException && error.name === 'AbortError') {
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

  const hasThread = messages.length > 0 || isRunning;

  return (
    <>
      {annotationMode && (
        <div
          ref={annotationLayerRef}
          className="dx-agent__annotation-layer"
          role="application"
          tabIndex={-1}
          aria-label={t('agent.annotate.hint')}
          onPointerDown={handleAnnotationPointerDown}
          onPointerMove={handleAnnotationPointerMove}
          onPointerUp={handleAnnotationPointerUp}
          onPointerCancel={handleAnnotationPointerCancel}
        >
          <div className="dx-agent__annotation-hint">
            <span aria-hidden="true">{AnnotateIcon}</span>
            <span>{t('agent.annotate.hint')}</span>
          </div>
          {draftRect && (
            <div
              className="dx-agent__annotation-box"
              style={{
                left: draftRect.x,
                top: draftRect.y,
                width: draftRect.width,
                height: draftRect.height,
              }}
            />
          )}
        </div>
      )}
      <section className="dx-agent" aria-label={t('agent.title')}>
        {hasThread && (
          <div className="dx-agent__thread" ref={messagesRef} aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`dx-agent__message${
                  message.role === 'user' ? ' dx-agent__message--user' : ''
                }${message.isError ? ' dx-agent__message--error' : ''}`}
              >
                <div className="dx-agent__bubble">{message.content}</div>
                {message.annotation && (
                  <span className="dx-agent__annotation-tag">
                    <span aria-hidden="true">{AnnotateIcon}</span>
                    <span>{t('agent.annotation.title')}</span>
                    <span>
                      {(message.annotation.elementCount > 0
                        ? t('agent.annotation.elements')
                        : t('agent.annotation.empty')
                      ).replace('{count}', String(message.annotation.elementCount))}
                    </span>
                  </span>
                )}
                {message.toolEvents?.length ? (
                  <div className="dx-agent__tools">
                    {message.toolEvents.map((toolEvent) => (
                      <div
                        key={toolEvent.id}
                        className={`dx-agent__tool${toolEvent.ok ? '' : ' dx-agent__tool--error'}`}
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
              <div className="dx-agent__running" role="status">
                <span className="dx-agent__dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>{activity || t('agent.thinking')}</span>
              </div>
            )}
          </div>
        )}

        {annotation && !annotationMode && (
          <div className="dx-agent__annotation-chip">
            <span className="dx-agent__annotation-chip-icon" aria-hidden="true">
              {AnnotateIcon}
            </span>
            <span className="dx-agent__annotation-chip-text">
              <span className="dx-agent__annotation-chip-title">{t('agent.annotation.title')}</span>
              <span className="dx-agent__annotation-chip-meta">
                {(annotation.elementCount > 0
                  ? t('agent.annotation.elements')
                  : t('agent.annotation.empty')
                ).replace('{count}', String(annotation.elementCount))}
                {' · '}
                {t('agent.annotation.region')
                  .replace('{width}', String(Math.round(annotation.rect.width)))
                  .replace('{height}', String(Math.round(annotation.rect.height)))}
              </span>
            </span>
            <button
              type="button"
              className="dx-agent__annotation-chip-remove"
              title={t('agent.annotation.remove')}
              aria-label={t('agent.annotation.remove')}
              onClick={() => setAnnotation(null)}
            >
              {CloseIcon}
            </button>
          </div>
        )}

        <form
          className="dx-agent__composer"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
        >
          <span className="dx-agent__badge" aria-hidden="true">
            {SparklesIcon}
          </span>
          <button
            type="button"
            className={`dx-agent__action dx-agent__action--annotate${
              annotationMode ? ' is-active' : ''
            }`}
            title={t('agent.annotate')}
            aria-label={t('agent.annotate')}
            aria-pressed={annotationMode}
            onClick={toggleAnnotationMode}
          >
            {AnnotateIcon}
          </button>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            placeholder={t('agent.placeholder')}
            aria-label={t('agent.placeholder')}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && !isRunning) {
                event.stopPropagation();
                closeAgent();
                return;
              }
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void sendMessage();
              }
            }}
          />
          {isRunning ? (
            <button
              type="button"
              className="dx-agent__action dx-agent__action--stop"
              title={t('agent.stop')}
              aria-label={t('agent.stop')}
              onClick={stopAgent}
            >
              {StopIcon}
            </button>
          ) : (
            <button
              type="submit"
              className="dx-agent__action dx-agent__action--send"
              title={t('agent.send')}
              aria-label={t('agent.send')}
              disabled={!input.trim() && !annotation}
            >
              {SendIcon}
            </button>
          )}
          <button
            type="button"
            className="dx-agent__action dx-agent__action--ghost"
            title={t('agent.close')}
            aria-label={t('agent.close')}
            onClick={closeAgent}
          >
            {CloseIcon}
          </button>
        </form>
      </section>
    </>
  );
};
