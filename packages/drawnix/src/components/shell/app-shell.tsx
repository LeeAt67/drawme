import classNames from 'classnames';
import type { CSSProperties, ReactNode } from 'react';
import type { DrawnixSaveState } from '../../hooks/use-drawnix';
import { useI18n } from '../../i18n';
import { ZenIcon } from '../icons';
import { ContextPanel } from './context-panel';
import { LeftPanel } from './left-panel';
import { NavRail } from './nav-rail';
import { TopBar } from './top-bar';
import { useLayout } from './use-layout';
import './app-shell.scss';

type AppShellProps = {
  title?: string;
  saveState?: DrawnixSaveState;
  children: ReactNode;
};

export const AppShell = ({ title, saveState, children }: AppShellProps) => {
  const { t } = useI18n();
  const { layout, closePanels, toggleUiHidden } = useLayout();
  const shellStyle = {
    '--dx-left-panel-w': `${layout.leftPanelWidth}px`,
    '--dx-context-panel-w': `${layout.contextPanelWidth}px`,
    '--dx-canvas-left': `${layout.leftPanelOpen ? layout.leftPanelWidth : 0}px`,
    '--dx-canvas-right': `${layout.contextPanelOpen ? layout.contextPanelWidth : 0}px`,
  } as CSSProperties;

  return (
    <div
      className={classNames('dx-shell', {
        'dx-shell--zen': layout.uiHidden,
        'dx-shell--left-open': layout.leftPanelOpen,
        'dx-shell--right-open': layout.contextPanelOpen,
      })}
      style={shellStyle}
    >
      <TopBar title={title} saveState={saveState} />
      <div className="dx-shell__body">
        <NavRail />
        <LeftPanel />
        <main className="dx-canvas">{children}</main>
        <ContextPanel />
        {(layout.leftPanelOpen || layout.contextPanelOpen) && (
          <div className="dx-scrim" aria-hidden="true" onClick={closePanels} />
        )}
      </div>
      {layout.uiHidden && (
        <button
          type="button"
          className="dx-zen-exit"
          title={t('layout.zenHint').replace('{shortcut}', 'Ctrl/⌘ + Shift + \\')}
          onClick={toggleUiHidden}
        >
          {ZenIcon}
          <span>{t('layout.exitZen')}</span>
        </button>
      )}
    </div>
  );
};

