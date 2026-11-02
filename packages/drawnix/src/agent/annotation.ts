import { getRectangleByElements, RectangleClient } from '@plait/core';
import type { PlaitBoard, PlaitElement } from '@plait/core';
import type { Language } from '../i18n/types';

export type AnnotationPoint = {
  x: number;
  y: number;
};

export type AnnotationElementSample = {
  id: string;
  type: string;
  text?: string;
};

export type BoardAnnotation = {
  id: string;
  rect: RectangleClient;
  elementCount: number;
  typeCounts: Record<string, number>;
  texts: string[];
  elements: AnnotationElementSample[];
  createdAt: number;
};

export type AnnotationSummary = Pick<
  BoardAnnotation,
  'elementCount' | 'typeCounts' | 'texts' | 'elements'
>;

const MAX_TEXT_LENGTH = 80;
const MAX_TEXT_SAMPLES = 6;
const MAX_ELEMENT_SAMPLES = 12;

export const normalizeRect = (start: AnnotationPoint, end: AnnotationPoint): RectangleClient => ({
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
  width: Math.abs(end.x - start.x),
  height: Math.abs(end.y - start.y),
});

const collectText = (node: unknown, output: string[], depth: number) => {
  if (depth > 6 || output.length >= 3 || node === null || typeof node !== 'object') {
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      collectText(item, output, depth + 1);
    }
    return;
  }
  const record = node as Record<string, unknown>;
  if (typeof record.text === 'string') {
    const value = record.text.trim();
    if (value && !output.includes(value)) {
      output.push(value);
    }
  }
  for (const key of ['data', 'topic', 'text', 'children'] as const) {
    if (key in record) {
      collectText(record[key], output, depth + 1);
    }
  }
};

export const readElementText = (element: PlaitElement): string => {
  const pieces: string[] = [];
  collectText(element, pieces, 0);
  return pieces.join(' / ').slice(0, MAX_TEXT_LENGTH);
};

export const summarizeElements = (elements: PlaitElement[]): AnnotationSummary => {
  const typeCounts: Record<string, number> = {};
  const texts: string[] = [];
  const samples: AnnotationElementSample[] = [];

  for (const element of elements) {
    const type = typeof element.type === 'string' ? element.type : 'element';
    typeCounts[type] = (typeCounts[type] ?? 0) + 1;
    const text = readElementText(element);
    if (text && !texts.includes(text) && texts.length < MAX_TEXT_SAMPLES) {
      texts.push(text);
    }
    if (samples.length < MAX_ELEMENT_SAMPLES) {
      samples.push({ id: element.id, type, text: text || undefined });
    }
  }

  return {
    elementCount: elements.length,
    typeCounts,
    texts,
    elements: samples,
  };
};

export const collectElementsInRect = (board: PlaitBoard, rect: RectangleClient): PlaitElement[] => {
  return board.children.filter((element) => {
    try {
      const bounds = getRectangleByElements(board, [element], true);
      return RectangleClient.isHit(bounds, rect);
    } catch {
      return false;
    }
  });
};

export const createBoardAnnotation = (
  board: PlaitBoard,
  rect: RectangleClient
): BoardAnnotation => ({
  id: `annotation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  rect,
  createdAt: Date.now(),
  ...summarizeElements(collectElementsInRect(board, rect)),
});

const formatTypeCounts = (typeCounts: Record<string, number>, zh: boolean) => {
  const entries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    return '';
  }
  return entries.map(([type, count]) => `${type}×${count}`).join(zh ? '、' : ', ');
};

export const buildAnnotationMessage = (
  text: string,
  annotation: BoardAnnotation,
  language: Language
): string => {
  const zh = language === 'zh';
  const { rect, elementCount, typeCounts, texts } = annotation;
  const size = `${Math.round(rect.width)}×${Math.round(rect.height)}`;
  const typeSummary = formatTypeCounts(typeCounts, zh);
  const lines: string[] = [];

  if (zh) {
    lines.push('[画布批注]');
    lines.push(
      `区域：x=${Math.round(rect.x)}，y=${Math.round(rect.y)}，宽=${Math.round(rect.width)}，高=${Math.round(rect.height)}（画布坐标，尺寸 ${size}）`
    );
    lines.push(
      elementCount > 0
        ? `区域内元素：${elementCount} 个${typeSummary ? `（${typeSummary}）` : ''}`
        : '区域内元素：没有元素（空白区域）'
    );
    if (texts.length) {
      lines.push(`文本片段：${texts.map((item) => `"${item}"`).join('、')}`);
    }
    lines.push('请在理解这块区域现有内容的基础上完成下面的要求。');
  } else {
    lines.push('[Canvas annotation]');
    lines.push(
      `Region: x=${Math.round(rect.x)}, y=${Math.round(rect.y)}, width=${Math.round(rect.width)}, height=${Math.round(rect.height)} (canvas coordinates, size ${size})`
    );
    lines.push(
      elementCount > 0
        ? `Elements in region: ${elementCount}${typeSummary ? ` (${typeSummary})` : ''}`
        : 'Elements in region: none (empty area)'
    );
    if (texts.length) {
      lines.push(`Text snippets: ${texts.map((item) => `"${item}"`).join(', ')}`);
    }
    lines.push('Use the current content of this region as context when answering.');
  }

  lines.push('');
  lines.push(text);
  return lines.join('\n');
};

export const getAnnotationInsertionPoint = (annotation: BoardAnnotation): AnnotationPoint => ({
  x: annotation.rect.x,
  y: annotation.rect.y + annotation.rect.height + 80,
});
