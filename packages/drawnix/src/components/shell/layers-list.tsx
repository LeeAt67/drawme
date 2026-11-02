import {
  BoardTransforms,
  getRectangleByElements,
  getSelectedElements,
  PlaitElement,
  RectangleClient,
  Transforms,
} from '@plait/core';
import { useBoard } from '@drawme/react-board';
import { MindElement } from '@plait/mind';
import { useI18n } from '../../i18n';

const getElementLabel = (
  board: ReturnType<typeof useBoard>,
  element: PlaitElement,
  fallback: string
) => {
  if (MindElement.isMindElement(board, element)) {
    const topic = (element as MindElement & { data?: { topic?: string } }).data?.topic;
    if (typeof topic === 'string' && topic.trim()) {
      return topic.trim();
    }
  }
  const text = (element as PlaitElement & { text?: string }).text;
  if (typeof text === 'string' && text.trim()) {
    return text.trim().slice(0, 40);
  }
  return fallback;
};

export const LayersList = () => {
  const board = useBoard();
  const { t } = useI18n();
  const selectedIds = new Set(getSelectedElements(board).map((element) => element.id));
  const elements = board.children ?? [];

  if (elements.length === 0) {
    return <p className="dx-panel-empty">{t('layout.layers.empty')}</p>;
  }

  return (
    <div className="dx-layers-list">
      {elements.map((element) => {
        const selected = selectedIds.has(element.id);
        return (
          <button
            key={element.id}
            type="button"
            className={`dx-layers-list__item${selected ? ' is-active' : ''}`}
            onClick={() => {
              try {
                const rectangle = getRectangleByElements(board, [element], false);
                const [start, end] = RectangleClient.getPoints(rectangle);
                Transforms.setSelection(board, { anchor: start, focus: end });
                BoardTransforms.moveToCenter(board, [
                  (start[0] + end[0]) / 2,
                  (start[1] + end[1]) / 2,
                ]);
              } catch {
                Transforms.setSelection(board, null);
              }
            }}
          >
            <span className="dx-layers-list__swatch" aria-hidden="true" />
            <span className="dx-layers-list__label">
              {getElementLabel(board, element, t('layout.layer.unnamed'))}
            </span>
          </button>
        );
      })}
    </div>
  );
};
