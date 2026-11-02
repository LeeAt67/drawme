import Stack from '../../stack';
import { FontColorIcon } from '../../icons';
import {
  ATTACHED_ELEMENT_CLASS_NAME,
  getRectangleByElements,
  getSelectedElements,
  isDragging,
  isMovingElements,
  isSelectionMoving,
  PlaitBoard,
  RectangleClient,
  toHostPointFromViewBoxPoint,
  toScreenPointFromHostPoint,
} from '@plait/core';
import { useEffect, useRef, useState } from 'react';
import { useBoard } from '@drawme/react-board';
import { flip, offset, useFloating } from '@floating-ui/react';
import { Island } from '../../island';
import classNames from 'classnames';
import { useI18n } from '../../../i18n';
import './popup-toolbar.scss';
import { ArrowLineHandle, PlaitDrawElement } from '@plait/draw';
import { CustomText, StrokeStyle } from '@plait/common';
import { PopupFontColorButton } from './font-color-button';
import { PopupFontSizeControl } from './font-size-control';
import { PopupStrokeButton } from './stroke-button';
import { PopupFillButton } from './fill-button';
import { isWhite, removeHexAlpha } from '../../../utils/color';
import { PopupLinkButton } from './link-button';
import { ArrowMarkButton } from './arrow-mark-button';
import { MoreOptionsButton } from './more-options-button';
import {
  getElementState,
  getFontSizeFromMarks,
  hasFillProperty,
  hasStrokeProperty,
  hasStrokeStyleProperty,
  hasTextProperty,
} from './element-style';

export const PopupToolbar = () => {
  const board = useBoard();
  const { t } = useI18n();
  const selectedElements = getSelectedElements(board);
  const [movingOrDragging, setMovingOrDragging] = useState(false);
  const movingOrDraggingRef = useRef(movingOrDragging);
  const hasImage = selectedElements.some(PlaitDrawElement.isImage);
  const open = selectedElements.length > 0 && !isSelectionMoving(board);
  const { viewport, selection, children } = board;
  const { refs, floatingStyles } = useFloating({
    placement: 'right-start',
    middleware: [offset(32), flip()],
  });
  let state: {
    fill: string | undefined;
    strokeColor?: string;
    strokeStyle?: StrokeStyle;
    hasFill?: boolean;
    hasText?: boolean;
    fontColor?: string;
    hasFontColor?: boolean;
    hasStroke?: boolean;
    hasStrokeStyle?: boolean;
    marks?: Omit<CustomText, 'text'>;
    // Line state
    isLine?: boolean;
    source?: ArrowLineHandle;
    target?: ArrowLineHandle;
  } = {
    fill: 'red',
  };
  if (open && !movingOrDragging && !hasImage) {
    const hasFill =
      selectedElements.some((value) => hasFillProperty(board, value)) &&
      !PlaitBoard.hasBeenTextEditing(board);
    const hasText = selectedElements.some((value) => hasTextProperty(board, value));
    const hasStroke =
      selectedElements.some((value) => hasStrokeProperty(board, value)) &&
      !PlaitBoard.hasBeenTextEditing(board);
    const hasStrokeStyle =
      selectedElements.some((value) => hasStrokeStyleProperty(board, value)) &&
      !PlaitBoard.hasBeenTextEditing(board);
    const isLine = selectedElements.every((value) => PlaitDrawElement.isArrowLine(value));
    state = {
      ...getElementState(board),
      hasFill,
      hasFontColor: hasText,
      hasStroke,
      hasStrokeStyle,
      hasText,
      isLine,
    };
  }
  useEffect(() => {
    if (open) {
      const hasSelected = selectedElements.length > 0;
      if (!movingOrDragging && hasSelected) {
        const elements = getSelectedElements(board);
        const rectangle = getRectangleByElements(board, elements, false);
        const [start, end] = RectangleClient.getPoints(rectangle);
        const screenStart = toScreenPointFromHostPoint(
          board,
          toHostPointFromViewBoxPoint(board, start)
        );
        const screenEnd = toScreenPointFromHostPoint(
          board,
          toHostPointFromViewBoxPoint(board, end)
        );
        const width = screenEnd[0] - screenStart[0];
        const height = screenEnd[1] - screenStart[1];
        refs.setPositionReference({
          getBoundingClientRect() {
            return {
              width,
              height,
              x: screenStart[0],
              y: screenStart[1],
              top: screenStart[1],
              left: screenStart[0],
              right: screenStart[0] + width,
              bottom: screenStart[1] + height,
            };
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport, selection, children, movingOrDragging]);

  useEffect(() => {
    movingOrDraggingRef.current = movingOrDragging;
  }, [movingOrDragging]);

  useEffect(() => {
    const { pointerUp, pointerMove } = board;

    board.pointerMove = (event: PointerEvent) => {
      if ((isMovingElements(board) || isDragging(board)) && !movingOrDraggingRef.current) {
        setMovingOrDragging(true);
      }
      pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
      if (movingOrDraggingRef.current && (isMovingElements(board) || isDragging(board))) {
        setMovingOrDragging(false);
      }
      pointerUp(event);
    };

    return () => {
      board.pointerUp = pointerUp;
      board.pointerMove = pointerMove;
    };
  }, [board]);

  return (
    <>
      {open && !movingOrDragging && (
        <Island
          padding={1}
          className={classNames('popup-toolbar', ATTACHED_ELEMENT_CLASS_NAME)}
          ref={refs.setFloating}
          style={floatingStyles}
        >
          <Stack.Row gap={1}>
            {state.hasText && (
              <PopupFontSizeControl
                board={board}
                key={'font-size'}
                currentFontSize={getFontSizeFromMarks(state.marks)}
                title={t('popupToolbar.fontSize')}
              />
            )}
            {state.hasFontColor && (
              <PopupFontColorButton
                board={board}
                key={0}
                currentColor={state.marks?.color}
                title={t('popupToolbar.fontColor')}
                fontColorIcon={<FontColorIcon currentColor={state.marks?.color} />}
              ></PopupFontColorButton>
            )}
            {state.hasStroke && (
              <PopupStrokeButton
                board={board}
                key={1}
                currentColor={state.strokeColor}
                currentStyle={state.strokeStyle}
                title={t('popupToolbar.stroke')}
                hasStrokeStyle={state.hasStrokeStyle || false}
              >
                <label
                  className={classNames('stroke-label', 'color-label')}
                  style={{ borderColor: state.strokeColor }}
                ></label>
              </PopupStrokeButton>
            )}
            {state.hasFill && (
              <PopupFillButton
                board={board}
                key={2}
                currentColor={state.fill}
                title={t('popupToolbar.fillColor')}
              >
                <label
                  className={classNames('fill-label', 'color-label', {
                    'color-white': state.fill && isWhite(removeHexAlpha(state.fill)),
                  })}
                  style={{ backgroundColor: state.fill }}
                ></label>
              </PopupFillButton>
            )}
            {state.hasText && (
              <PopupLinkButton
                board={board}
                key={3}
                title={t('popupToolbar.link')}
              ></PopupLinkButton>
            )}
            {state.isLine && (
              <>
                <ArrowMarkButton board={board} key={4} end={'source'} endProperty={state.source} />
                <ArrowMarkButton board={board} key={5} end={'target'} endProperty={state.target} />
              </>
            )}
            <MoreOptionsButton board={board} key={6} />
          </Stack.Row>
        </Island>
      )}
    </>
  );
};

export {
  getElementState,
  getFontSizeFromMarks,
  hasFillProperty,
  hasStrokeProperty,
  hasStrokeStyleProperty,
  hasTextProperty,
} from './element-style';
