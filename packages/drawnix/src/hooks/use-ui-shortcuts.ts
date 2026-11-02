import { PlaitBoard } from '@plait/core';
import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { layoutForAgentOpenChange } from '../components/shell/use-layout';
import type { DrawnixState, LeftPanelTab } from './use-drawnix';

type UseUiShortcutsOptions = {
  board: PlaitBoard | null;
  setAppState: Dispatch<SetStateAction<DrawnixState>>;
};

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"], .slate-editable-container')
  );
};

const isBackslash = (event: KeyboardEvent) =>
  event.code === 'Backslash' || event.key === '\\' || event.key === '|';

export const useUiShortcuts = ({ board, setAppState }: UseUiShortcutsOptions) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || isEditableTarget(event.target)) {
        return;
      }
      if (board && PlaitBoard.hasBeenTextEditing(board)) {
        return;
      }

      const mod = event.metaKey || event.ctrlKey;
      const updateLayout = (partial: Partial<DrawnixState['layout']>) => {
        setAppState((currentState) => ({
          ...currentState,
          layout: { ...currentState.layout, ...partial },
        }));
      };

      if (mod && event.shiftKey && isBackslash(event)) {
        event.preventDefault();
        setAppState((currentState) => ({
          ...currentState,
          layout: { ...currentState.layout, uiHidden: !currentState.layout.uiHidden },
        }));
        return;
      }

      if (mod && !event.shiftKey && isBackslash(event)) {
        event.preventDefault();
        setAppState((currentState) => {
          const arePanelsOpen =
            currentState.layout.leftPanelOpen || currentState.layout.contextPanelOpen;
          return {
            ...currentState,
            layout: {
              ...currentState.layout,
              leftPanelOpen: !arePanelsOpen,
              contextPanelOpen: false,
            },
          };
        });
        return;
      }

      const tabKeys: Record<string, LeftPanelTab> = {
        Digit1: 'file',
        Digit2: 'layers',
        Digit3: 'assets',
      };
      const tab = tabKeys[event.code];
      if (event.altKey && !mod && tab) {
        event.preventDefault();
        updateLayout({ leftPanelOpen: true, leftPanelTab: tab });
        return;
      }

      if (event.altKey && !mod && event.code === 'Digit0') {
        event.preventDefault();
        setAppState((currentState) => {
          return {
            ...currentState,
            layout: {
              ...currentState.layout,
              ...(currentState.layout.agentOpen
                ? layoutForAgentOpenChange.close
                : layoutForAgentOpenChange.open),
            },
          };
        });
        return;
      }

      if (event.key === 'Escape') {
        setAppState((currentState) => {
          if (!currentState.layout.uiHidden) {
            return currentState;
          }
          return {
            ...currentState,
            layout: { ...currentState.layout, uiHidden: false },
          };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, setAppState]);
};
