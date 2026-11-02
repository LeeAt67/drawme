import { PagesIcon, PlusIcon } from '../icons';
import { useI18n } from '../../i18n';

export const PagesList = () => {
  const { t } = useI18n();

  return (
    <div className="dx-pages-list">
      <div className="dx-pages-list__item is-active" aria-current="page">
        {PagesIcon}
        <span>{t('layout.page.default')}</span>
      </div>
      <button
        type="button"
        className="dx-pages-list__add"
        disabled
        title={t('layout.pages.comingSoon')}
      >
        {PlusIcon}
        <span>{t('layout.pages.new')}</span>
      </button>
    </div>
  );
};
