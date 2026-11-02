import classNames from 'classnames';
import type { ReactNode } from 'react';
import {
  AssetsIcon,
  LayersIcon,
  PagesIcon,
  SlidersIcon,
  SparklesIcon,
  ZenIcon,
} from '../icons';
import { useI18n } from '../../i18n';
import { useLayout } from './use-layout';
import type { LeftPanelTab } from '../../hooks/use-drawnix';

export const NavRail = () => {
  const { t } = useI18n();
  const {
    layout,
    toggleLeftPanel,
    toggleContextPanel,
    toggleAgent,
    toggleUiHidden,
    isAgentOpen,
  } = useLayout();

  const leftItems: { tab: LeftPanelTab; icon: ReactNode; label: string }[] = [
    { tab: 'file', icon: PagesIcon, label: t('layout.file') },
    { tab: 'layers', icon: LayersIcon, label: t('layout.layers') },
    { tab: 'assets', icon: AssetsIcon, label: t('layout.assets') },
  ];

  return (
    <nav className="dx-nav-rail" aria-label={t('layout.file')}>
      <div className="dx-nav-rail__group">
        {leftItems.map((item) => {
          const active = layout.leftPanelOpen && layout.leftPanelTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              className={classNames('dx-nav-rail__button', { 'is-active': active })}
              title={item.label}
              aria-label={item.label}
              aria-expanded={active}
              onClick={() => toggleLeftPanel(item.tab)}
            >
              {item.icon}
            </button>
          );
        })}
        <span className="dx-nav-rail__divider" aria-hidden="true" />
        <button
          type="button"
          className={classNames('dx-nav-rail__button', {
            'is-active': isAgentOpen,
          })}
          title={t('layout.agent')}
          aria-label={t('layout.agent')}
          aria-expanded={isAgentOpen}
          onClick={toggleAgent}
        >
          {SparklesIcon}
        </button>
        <button
          type="button"
          className={classNames('dx-nav-rail__button', {
            'is-active': layout.contextPanelOpen && layout.contextPanelTab === 'properties',
          })}
          title={t('layout.properties')}
          aria-label={t('layout.properties')}
          aria-expanded={layout.contextPanelOpen && layout.contextPanelTab === 'properties'}
          onClick={toggleContextPanel}
        >
          {SlidersIcon}
        </button>
      </div>
      <div className="dx-nav-rail__group dx-nav-rail__group--bottom">
        <button
          type="button"
          className="dx-nav-rail__button"
          title={t('layout.toggleUi')}
          aria-label={t('layout.toggleUi')}
          onClick={toggleUiHidden}
        >
          {ZenIcon}
        </button>
      </div>
    </nav>
  );
};
