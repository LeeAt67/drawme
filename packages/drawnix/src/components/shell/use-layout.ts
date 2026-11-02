import {
  clampPanelWidth,
  CONTEXT_PANEL_WIDTH_MAX,
  CONTEXT_PANEL_WIDTH_MIN,
  isAgentPanelOpen,
  LEFT_PANEL_WIDTH_MAX,
  LEFT_PANEL_WIDTH_MIN,
  useDrawnix,
} from '../../hooks/use-drawnix';
import type { DrawnixLayoutState, LeftPanelTab } from '../../hooks/use-drawnix';

export type LayoutUpdater = (partial: Partial<DrawnixLayoutState>) => void;

export const layoutForAgentOpenChange = {
  open: { agentOpen: true, toolbarCollapsed: true },
  close: { agentOpen: false, toolbarCollapsed: false },
} as const satisfies Record<string, Partial<DrawnixLayoutState>>;

export const layoutForToolbarCollapseChange = {
  collapse: { toolbarCollapsed: true, agentOpen: false },
  expand: { toolbarCollapsed: false, agentOpen: false },
} as const satisfies Record<string, Partial<DrawnixLayoutState>>;

export const useLayout = () => {
  const { appState, setAppState } = useDrawnix();
  const layout = appState.layout;

  const setLayout: LayoutUpdater = (partial) => {
    setAppState((currentState) => ({
      ...currentState,
      layout: {
        ...currentState.layout,
        ...partial,
      },
    }));
  };

  const setLeftPanelWidth = (width: number) => {
    setLayout({
      leftPanelWidth: clampPanelWidth(width, LEFT_PANEL_WIDTH_MIN, LEFT_PANEL_WIDTH_MAX),
    });
  };

  const setContextPanelWidth = (width: number) => {
    setLayout({
      contextPanelWidth: clampPanelWidth(width, CONTEXT_PANEL_WIDTH_MIN, CONTEXT_PANEL_WIDTH_MAX),
    });
  };

  const openLeftPanel = (tab: LeftPanelTab) => {
    setLayout({ leftPanelOpen: true, leftPanelTab: tab });
  };

  const toggleLeftPanel = (tab: LeftPanelTab) => {
    setLayout({
      leftPanelOpen: !(layout.leftPanelOpen && layout.leftPanelTab === tab),
      leftPanelTab: tab,
    });
  };

  const openContextPanel = () => {
    setLayout({ contextPanelOpen: true, contextPanelTab: 'properties' });
  };

  const toggleContextPanel = () => {
    setLayout({
      contextPanelOpen: !(layout.contextPanelOpen && layout.contextPanelTab === 'properties'),
      contextPanelTab: 'properties',
    });
  };

  const setAgentOpen = (open: boolean) => {
    setLayout(open ? layoutForAgentOpenChange.open : layoutForAgentOpenChange.close);
  };

  const toggleAgent = () => {
    setAgentOpen(!layout.agentOpen);
  };

  const closeAgent = () => {
    setAgentOpen(false);
  };

  const setToolbarCollapsed = (collapsed: boolean) => {
    setLayout(
      collapsed ? layoutForToolbarCollapseChange.collapse : layoutForToolbarCollapseChange.expand
    );
  };

  const toggleToolbarCollapsed = () => {
    setToolbarCollapsed(!layout.toolbarCollapsed);
  };

  const collapseToolbar = () => setToolbarCollapsed(true);

  const expandToolbar = () => setToolbarCollapsed(false);

  const closeContextPanel = () => setLayout({ contextPanelOpen: false });

  const closePanels = () => setLayout({ leftPanelOpen: false, contextPanelOpen: false });

  const toggleUiHidden = () => setLayout({ uiHidden: !layout.uiHidden });

  return {
    layout,
    setLayout,
    setLeftPanelWidth,
    setContextPanelWidth,
    openLeftPanel,
    toggleLeftPanel,
    openContextPanel,
    toggleContextPanel,
    setAgentOpen,
    toggleAgent,
    closeAgent,
    setToolbarCollapsed,
    toggleToolbarCollapsed,
    collapseToolbar,
    expandToolbar,
    closeContextPanel,
    closePanels,
    toggleUiHidden,
    isAgentOpen: isAgentPanelOpen(appState),
  };
};
