import { PlaitPointerType } from '@plait/core';
import { ArrowLineShape, BasicShapes } from '@plait/draw';
import { describe, expect, it, vi } from 'vitest';
import { FreehandShape } from '../plugins/freehand/type';
import {
  layoutForAgentOpenChange,
  layoutForToolbarCollapseChange,
} from '../components/shell/use-layout';
import {
  clampPanelWidth,
  CONTEXT_PANEL_WIDTH_MAX,
  CONTEXT_PANEL_WIDTH_MIN,
  createDefaultLayoutState,
  createDefaultToolState,
  isAgentPanelOpen,
  LEFT_PANEL_WIDTH_MAX,
  LEFT_PANEL_WIDTH_MIN,
  mergeLayoutState,
  mergeToolState,
} from './use-drawnix';

vi.mock('@plait/core', () => ({
  DEFAULT_COLOR: '#000000',
  PlaitPointerType: {
    hand: 'hand',
    selection: 'selection',
  },
  ThemeColorMode: {
    default: 'default',
    colorful: 'colorful',
    soft: 'soft',
    retro: 'retro',
    dark: 'dark',
    starry: 'starry',
  },
}));

vi.mock('@plait/draw', () => ({
  ArrowLineShape: {
    straight: 'straight',
  },
  BasicShapes: {
    rectangle: 'rectangle',
    diamond: 'diamond',
  },
}));

vi.mock('@plait/mind', () => ({
  MindPointerType: {
    mind: 'mind',
  },
}));

describe('drawnix tool state', () => {
  it('creates the default persistent tool state', () => {
    const toolState = createDefaultToolState();

    expect(toolState.pointer).toBe(PlaitPointerType.hand);
    expect(toolState.lastShapePointer).toBe(BasicShapes.rectangle);
    expect(toolState.lastArrowPointer).toBe(ArrowLineShape.straight);
    expect(toolState.lastFreehandPointer).toBe(FreehandShape.feltTipPen);
    expect(toolState.activeFreehandPresetIndex).toBe(0);
    expect(toolState.freehandPresets.length).toBeGreaterThan(0);
  });

  it('merges stored partial tool state with safe defaults', () => {
    const storedPresets = [{ strokeColor: '#ff0000', strokeWidth: 8 }];

    const toolState = mergeToolState({
      pointer: BasicShapes.diamond,
      freehandPresets: storedPresets,
    });

    expect(toolState.pointer).toBe(BasicShapes.diamond);
    expect(toolState.lastShapePointer).toBe(BasicShapes.rectangle);
    expect(toolState.lastArrowPointer).toBe(ArrowLineShape.straight);
    expect(toolState.freehandPresets).toEqual(storedPresets);
    expect(toolState.freehandPresets).not.toBe(storedPresets);
    expect(toolState.freehandPresets[0]).not.toBe(storedPresets[0]);
  });
});

describe('drawnix layout state', () => {
  it('opens the left panel by default on desktop and keeps it closed on mobile', () => {
    const desktop = createDefaultLayoutState(false);
    const mobile = createDefaultLayoutState(true);

    expect(desktop.leftPanelOpen).toBe(true);
    expect(desktop.leftPanelTab).toBe('file');
    expect(desktop.contextPanelOpen).toBe(false);
    expect(desktop.uiHidden).toBe(false);
    expect(mobile.leftPanelOpen).toBe(false);
  });

  it('clamps panel widths into their allowed range', () => {
    expect(clampPanelWidth(120, LEFT_PANEL_WIDTH_MIN, LEFT_PANEL_WIDTH_MAX)).toBe(
      LEFT_PANEL_WIDTH_MIN
    );
    expect(clampPanelWidth(9999, LEFT_PANEL_WIDTH_MIN, LEFT_PANEL_WIDTH_MAX)).toBe(
      LEFT_PANEL_WIDTH_MAX
    );
    expect(clampPanelWidth(Number.NaN, CONTEXT_PANEL_WIDTH_MIN, CONTEXT_PANEL_WIDTH_MAX)).toBe(
      CONTEXT_PANEL_WIDTH_MIN
    );
    expect(clampPanelWidth(300.6, LEFT_PANEL_WIDTH_MIN, LEFT_PANEL_WIDTH_MAX)).toBe(301);
  });

  it('merges persisted layout state and clamps stored widths', () => {
    const layout = mergeLayoutState(false, {
      leftPanelWidth: 9999,
      contextPanelWidth: 10,
      contextPanelOpen: true,
      contextPanelTab: 'agent' as never,
      uiHidden: true,
    });

    expect(layout.leftPanelWidth).toBe(LEFT_PANEL_WIDTH_MAX);
    expect(layout.contextPanelWidth).toBe(CONTEXT_PANEL_WIDTH_MIN);
    expect(layout.contextPanelOpen).toBe(true);
    expect(layout.contextPanelTab).toBe('properties');
    expect(layout.uiHidden).toBe(true);
  });

  it('falls back to defaults when nothing was persisted', () => {
    const layout = mergeLayoutState(true, null);

    expect(layout).toEqual(createDefaultLayoutState(true));
  });

  it('reports the agent composer only when agentOpen is set', () => {
    const base = createDefaultLayoutState(false);

    expect(isAgentPanelOpen({ layout: base })).toBe(false);
    expect(
      isAgentPanelOpen({
        layout: { ...base, agentOpen: true, toolbarCollapsed: true },
      })
    ).toBe(true);
    expect(
      isAgentPanelOpen({
        layout: { ...base, agentOpen: false, toolbarCollapsed: true },
      })
    ).toBe(false);
  });

  it('keeps the agent composer and the toolbar mutually exclusive', () => {
    expect(layoutForAgentOpenChange.open).toEqual({
      agentOpen: true,
      toolbarCollapsed: true,
    });
    expect(layoutForAgentOpenChange.close).toEqual({
      agentOpen: false,
      toolbarCollapsed: false,
    });
    expect(layoutForToolbarCollapseChange.collapse).toEqual({
      toolbarCollapsed: true,
      agentOpen: false,
    });
    expect(layoutForToolbarCollapseChange.expand).toEqual({
      toolbarCollapsed: false,
      agentOpen: false,
    });
  });
});
