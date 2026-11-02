import { useI18n } from '../../i18n';
import { CONTEXT_PANEL_WIDTH_MAX, CONTEXT_PANEL_WIDTH_MIN } from '../../hooks/use-drawnix';
import { CloseIcon } from '../icons';
import { PropertiesPanel } from './properties-panel';
import { ResizableDivider } from './resizable-divider';
import { useLayout } from './use-layout';

export const ContextPanel = () => {
  const { t } = useI18n();
  const { layout, setContextPanelWidth, setLayout } = useLayout();

  if (!layout.contextPanelOpen) {
    return null;
  }

  return (
    <>
      <ResizableDivider
        side="right"
        width={layout.contextPanelWidth}
        min={CONTEXT_PANEL_WIDTH_MIN}
        max={CONTEXT_PANEL_WIDTH_MAX}
        ariaLabel={t('layout.resizePanel')}
        onChange={setContextPanelWidth}
      />
      <aside
        className="dx-context-panel"
        style={{ width: layout.contextPanelWidth }}
        aria-label={t('layout.properties')}
      >
        <header className="dx-panel__header dx-context-panel__header">
          <div className="dx-context-panel__title">{t('layout.properties')}</div>
          <button
            type="button"
            className="dx-icon-button"
            title={t('layout.collapsePanel')}
            aria-label={t('layout.collapsePanel')}
            onClick={() => setLayout({ contextPanelOpen: false })}
          >
            {CloseIcon}
          </button>
        </header>
        <div className="dx-context-panel__body" role="tabpanel">
          <PropertiesPanel />
        </div>
      </aside>
    </>
  );
};
