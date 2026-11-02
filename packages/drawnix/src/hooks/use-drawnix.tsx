/**
 * A React context for sharing the board object, in a way that re-renders the
 * context whenever changes occur.
 */
import { PlaitBoard, PlaitPointerType } from '@plait/core';
import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import { MindPointerType } from '@plait/mind';
import { ArrowLineShape, BasicShapes, DrawPointerType } from '@plait/draw';
import { FreehandShape } from '../plugins/freehand/type';
import { Editor } from 'slate';
import { LinkElement } from '@plait/common';
import { DEFAULT_FREEHAND_PRESETS, FreehandDrawOptions } from '../plugins/freehand/presets';
import { DrawnixFileHandle } from '../data/json';
import type { DrawnixToastOptions } from '../components/toast/toast';

export enum DialogType {
  mermaidToDrawnix = 'mermaidToDrawnix',
  markdownToDrawnix = 'markdownToDrawnix',
}

export type DrawnixPointerType =
  | PlaitPointerType
  | MindPointerType
  | DrawPointerType
  | FreehandShape;

export type DrawnixFreehandPointer = FreehandShape.feltTipPen | FreehandShape.eraser;

export type DrawnixToolState = {
  pointer: DrawnixPointerType;
  lastShapePointer: DrawPointerType;
  lastArrowPointer: ArrowLineShape;
  lastFreehandPointer: DrawnixFreehandPointer;
  activeFreehandPresetIndex: number;
  freehandPresets: FreehandDrawOptions[];
};

export const createDefaultToolState = (): DrawnixToolState => ({
  pointer: PlaitPointerType.hand,
  lastShapePointer: BasicShapes.rectangle,
  lastArrowPointer: ArrowLineShape.straight,
  lastFreehandPointer: FreehandShape.feltTipPen,
  activeFreehandPresetIndex: 0,
  freehandPresets: DEFAULT_FREEHAND_PRESETS.map((preset) => ({ ...preset })),
});

export const mergeToolState = (toolState?: Partial<DrawnixToolState>): DrawnixToolState => {
  const defaultToolState = createDefaultToolState();
  const freehandPresets = toolState?.freehandPresets?.length
    ? toolState.freehandPresets
    : defaultToolState.freehandPresets;

  return {
    ...defaultToolState,
    ...toolState,
    freehandPresets: freehandPresets.map((preset) => ({ ...preset })),
  };
};

export interface DrawnixBoard extends PlaitBoard {
  appState: DrawnixState;
  showToast?: (toast: DrawnixToastOptions) => void;
}

export type LinkState = {
  targetDom: HTMLElement;
  editor: Editor;
  targetElement: LinkElement;
  isEditing: boolean;
  isHovering: boolean;
  isHoveringOrigin: boolean;
};

export type LeftPanelTab = 'file' | 'layers' | 'assets';

export type ContextPanelTab = 'properties';

export type DrawnixSaveState = 'local' | 'saving' | 'saved' | 'conflict' | 'error';

export type DrawnixLayoutState = {
  leftPanelOpen: boolean;
  leftPanelTab: LeftPanelTab;
  leftPanelWidth: number;
  contextPanelOpen: boolean;
  contextPanelTab: ContextPanelTab;
  contextPanelWidth: number;
  toolbarCollapsed: boolean;
  agentOpen: boolean;
  uiHidden: boolean;
};

export const LEFT_PANEL_WIDTH_MIN = 200;
export const LEFT_PANEL_WIDTH_MAX = 420;
export const LEFT_PANEL_WIDTH_DEFAULT = 260;
export const CONTEXT_PANEL_WIDTH_MIN = 260;
export const CONTEXT_PANEL_WIDTH_MAX = 480;
export const CONTEXT_PANEL_WIDTH_DEFAULT = 320;

export const clampPanelWidth = (width: number, min: number, max: number) => {
  if (!Number.isFinite(width)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.round(width)));
};

export const createDefaultLayoutState = (isMobile: boolean): DrawnixLayoutState => ({
  leftPanelOpen: !isMobile,
  leftPanelTab: 'file',
  leftPanelWidth: LEFT_PANEL_WIDTH_DEFAULT,
  contextPanelOpen: false,
  contextPanelTab: 'properties',
  contextPanelWidth: CONTEXT_PANEL_WIDTH_DEFAULT,
  toolbarCollapsed: false,
  agentOpen: false,
  uiHidden: false,
});

export const mergeLayoutState = (
  isMobile: boolean,
  layout?: Partial<DrawnixLayoutState> | null
): DrawnixLayoutState => {
  const defaults = createDefaultLayoutState(isMobile);
  return {
    ...defaults,
    ...layout,
    contextPanelTab: 'properties',
    toolbarCollapsed: Boolean(layout?.toolbarCollapsed),
    agentOpen: false,
    leftPanelWidth: clampPanelWidth(
      layout?.leftPanelWidth ?? defaults.leftPanelWidth,
      LEFT_PANEL_WIDTH_MIN,
      LEFT_PANEL_WIDTH_MAX
    ),
    contextPanelWidth: clampPanelWidth(
      layout?.contextPanelWidth ?? defaults.contextPanelWidth,
      CONTEXT_PANEL_WIDTH_MIN,
      CONTEXT_PANEL_WIDTH_MAX
    ),
  };
};

export type DrawnixState = {
  toolState: DrawnixToolState;
  isMobile: boolean;
  isPencilMode: boolean;
  fileHandle: DrawnixFileHandle;
  openDialogType: DialogType | null;
  openCleanConfirm: boolean;
  layout: DrawnixLayoutState;
  copyTransparent: boolean;
  exportTransparent: boolean;
  linkState?: LinkState | null;
};

export const isAgentPanelOpen = (state: Pick<DrawnixState, 'layout'>) => state.layout.agentOpen;

export const DrawnixContext = createContext<{
  appState: DrawnixState;
  setAppState: Dispatch<SetStateAction<DrawnixState>>;
  showToast: (toast: DrawnixToastOptions) => void;
} | null>(null);

export const useDrawnix = (): {
  appState: DrawnixState;
  setAppState: Dispatch<SetStateAction<DrawnixState>>;
  showToast: (toast: DrawnixToastOptions) => void;
} => {
  const context = useContext(DrawnixContext);

  if (!context) {
    throw new Error(
      `The \`useDrawnix\` hook must be used inside the <Drawnix> component's context.`
    );
  }

  return context;
};

export const useSetPointer = () => {
  const { setAppState } = useDrawnix();
  return (pointer: DrawnixPointerType) => {
    setAppState((appState) => ({
      ...appState,
      toolState: {
        ...appState.toolState,
        pointer,
      },
    }));
  };
};
