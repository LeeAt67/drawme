import classNames from 'classnames';
import type { ReactNode } from 'react';
import { getSelectedElements } from '@plait/core';
import { useBoard } from '@drawme/react-board';
import { useI18n } from '../../i18n';
import {
  getElementState,
  getFontSizeFromMarks,
  hasFillProperty,
  hasStrokeProperty,
  hasStrokeStyleProperty,
  hasTextProperty,
} from '../toolbar/popup-toolbar/element-style';
import { PopupFillButton } from '../toolbar/popup-toolbar/fill-button';
import { PopupStrokeButton } from '../toolbar/popup-toolbar/stroke-button';
import { PopupFontColorButton } from '../toolbar/popup-toolbar/font-color-button';
import { PopupFontSizeControl } from '../toolbar/popup-toolbar/font-size-control';
import { PopupLinkButton } from '../toolbar/popup-toolbar/link-button';
import { FontColorIcon } from '../icons';
import { isWhite, removeHexAlpha } from '../../utils/color';

type PropertyRowProps = {
  label: string;
  children: ReactNode;
};

const PropertyRow = ({ label, children }: PropertyRowProps) => (
  <div className="dx-property-row">
    <span className="dx-property-row__label">{label}</span>
    <div className="dx-property-row__control">{children}</div>
  </div>
);

export const PropertiesPanel = () => {
  const board = useBoard();
  const { t } = useI18n();
  const selectedElements = getSelectedElements(board);

  if (selectedElements.length === 0) {
    return <p className="dx-panel-empty">{t('layout.properties.empty')}</p>;
  }

  if (selectedElements.length > 1) {
    return (
      <p className="dx-panel-empty">
        {t('layout.properties.multi').replace('{count}', String(selectedElements.length))}
      </p>
    );
  }

  const element = selectedElements[0];
  const state = getElementState(board);
  const hasFill = hasFillProperty(board, element);
  const hasStroke = hasStrokeProperty(board, element);
  const hasText = hasTextProperty(board, element);

  return (
    <div className="dx-properties">
      <section className="dx-properties__section">
        <h3 className="dx-properties__heading">{t('layout.properties')}</h3>
        {hasFill && (
          <PropertyRow label={t('layout.properties.fill')}>
            <PopupFillButton
              board={board}
              currentColor={state.fill}
              title={t('layout.properties.fill')}
            >
              <label
                className={classNames('dx-color-label', {
                  'is-white': state.fill && isWhite(removeHexAlpha(state.fill)),
                })}
                style={{ backgroundColor: state.fill }}
              />
            </PopupFillButton>
          </PropertyRow>
        )}
        {hasStroke && (
          <PropertyRow label={t('layout.properties.stroke')}>
            <PopupStrokeButton
              board={board}
              currentColor={state.strokeColor}
              currentStyle={state.strokeStyle}
              title={t('layout.properties.stroke')}
              hasStrokeStyle={hasStrokeStyleProperty(board, element)}
            >
              <label
                className="dx-stroke-label"
                style={{ borderColor: state.strokeColor }}
              />
            </PopupStrokeButton>
          </PropertyRow>
        )}
        {hasText && (
          <>
            <PropertyRow label={t('layout.properties.size')}>
              <PopupFontSizeControl
                board={board}
                currentFontSize={getFontSizeFromMarks(state.marks)}
                title={t('layout.properties.size')}
              />
            </PropertyRow>
            <PropertyRow label={t('layout.properties.text')}>
              <PopupFontColorButton
                board={board}
                currentColor={state.marks?.color}
                title={t('layout.properties.text')}
                fontColorIcon={<FontColorIcon currentColor={state.marks?.color} />}
              />
            </PropertyRow>
            <PropertyRow label={t('layout.properties.link')}>
              <PopupLinkButton board={board} title={t('layout.properties.link')} />
            </PropertyRow>
          </>
        )}
      </section>
    </div>
  );
};
