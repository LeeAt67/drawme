import { ChevronLeftIcon } from '../icons';
import { useI18n } from '../../i18n';
import { useLayout } from './use-layout';
import {
  LEFT_PANEL_WIDTH_MAX,
  LEFT_PANEL_WIDTH_MIN,
} from '../../hooks/use-drawnix';
import { ResizableDivider } from './resizable-divider';
import { PagesList } from './pages-list';
import { LayersList } from './layers-list';

export const LeftPanel = () => {
  const { t } = useI18n();
  const { layout, setLeftPanelWidth, setLayout } = useLayout();

  if (!layout.leftPanelOpen) {
    return null;
  }

  const title =
    layout.leftPanelTab === 'file'
      ? t('layout.pages')
      : layout.leftPanelTab === 'layers'
        ? t('layout.layers')
        : t('layout.assets');

  return (
    <>
      <aside
        className="dx-left-panel"
        style={{ width: layout.leftPanelWidth }}
        aria-label={title}
      >
        <header className="dx-panel__header">
          <span className="dx-panel__title">{title}</span>
          <button
            type="button"
            className="dx-icon-button"
            title={t('layout.collapsePanel')}
            aria-label={t('layout.collapsePanel')}
            onClick={() => setLayout({ leftPanelOpen: false })}
          >
            {ChevronLeftIcon}
          </button>
        </header>
        <div className="dx-panel__body">
          {layout.leftPanelTab === 'file' && <PagesList />}
          {layout.leftPanelTab === 'layers' && <LayersList />}
          {layout.leftPanelTab === 'assets' && (
            <p className="dx-panel-empty">{t('layout.assets.empty')}</p>
          )}
        </div>
      </aside>
      <ResizableDivider
        side="left"
        width={layout.leftPanelWidth}
        min={LEFT_PANEL_WIDTH_MIN}
        max={LEFT_PANEL_WIDTH_MAX}
        ariaLabel={t('layout.resizePanel')}
        onChange={setLeftPanelWidth}
      />
    </>
  );
};
