import {
  isClosedCustomGeometry,
  isClosedDrawElement,
  isDrawElementsIncludeText,
  PlaitDrawElement,
  getStrokeColorByElement as getStrokeColorByDrawElement,
  getStrokeStyleByElement,
} from '@plait/draw';
import { getStrokeColorByElement as getStrokeColorByMindElement, MindElement } from '@plait/mind';
import { CustomText } from '@plait/common';
import { getTextMarksByElement } from '@plait/text-plugins';
import { getSelectedElements, PlaitBoard, PlaitElement } from '@plait/core';
import { Freehand } from '../../../plugins/freehand/type';
import { NO_COLOR } from '../../../constants/color';

export const getMindElementState = (board: PlaitBoard, element: MindElement) => {
  const marks = getTextMarksByElement(element);
  return {
    fill: element.fill,
    strokeColor: getStrokeColorByMindElement(board, element),
    strokeStyle: getStrokeStyleByElement(board, element),
    marks,
  };
};

export const getDrawElementState = (board: PlaitBoard, element: PlaitDrawElement) => {
  const marks: Omit<CustomText, 'text'> = getTextMarksByElement(element);
  return {
    fill: element.fill,
    strokeColor: getStrokeColorByDrawElement(board, element),
    strokeStyle: getStrokeStyleByElement(board, element),
    marks,
    source: element?.source || {},
    target: element?.target || {},
  };
};

export const getElementState = (board: PlaitBoard) => {
  const selectedElement = getSelectedElements(board)[0];
  if (!selectedElement) {
    return {
      fill: undefined,
      strokeColor: undefined,
      strokeStyle: undefined,
      marks: {} as Omit<CustomText, 'text'>,
    };
  }
  if (MindElement.isMindElement(board, selectedElement)) {
    return getMindElementState(board, selectedElement);
  }
  return getDrawElementState(board, selectedElement as PlaitDrawElement);
};

export const hasFillProperty = (board: PlaitBoard, element: PlaitElement) => {
  if (MindElement.isMindElement(board, element)) {
    return true;
  }
  if (isClosedCustomGeometry(board, element)) {
    return true;
  }
  if (PlaitDrawElement.isDrawElement(element)) {
    return (
      PlaitDrawElement.isShapeElement(element) &&
      !PlaitDrawElement.isImage(element) &&
      !PlaitDrawElement.isText(element) &&
      isClosedDrawElement(element)
    );
  }
  return false;
};

export const hasStrokeProperty = (board: PlaitBoard, element: PlaitElement) => {
  if (MindElement.isMindElement(board, element)) {
    return true;
  }
  if (Freehand.isFreehand(element)) {
    return true;
  }
  if (PlaitDrawElement.isDrawElement(element)) {
    return (
      (PlaitDrawElement.isShapeElement(element) &&
        !PlaitDrawElement.isImage(element) &&
        !PlaitDrawElement.isText(element)) ||
      PlaitDrawElement.isArrowLine(element) ||
      PlaitDrawElement.isVectorLine(element) ||
      PlaitDrawElement.isTable(element)
    );
  }
  return false;
};

export const hasStrokeStyleProperty = (board: PlaitBoard, element: PlaitElement) => {
  return hasStrokeProperty(board, element);
};

export const hasTextProperty = (board: PlaitBoard, element: PlaitElement) => {
  if (MindElement.isMindElement(board, element)) {
    return true;
  }
  if (PlaitDrawElement.isDrawElement(element)) {
    return isDrawElementsIncludeText([element]);
  }
  return false;
};

export const getColorPropertyValue = (color: string) => {
  if (color === NO_COLOR) {
    return null;
  }
  return color;
};

export const getFontSizeFromMarks = (marks?: Omit<CustomText, 'text'>) => {
  const value = (marks as any)?.['font-size'];
  const size = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(size) && size > 0 ? size : undefined;
};
