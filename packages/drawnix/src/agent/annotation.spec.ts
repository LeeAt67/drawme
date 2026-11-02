import { describe, expect, it } from 'vitest';
import type { PlaitElement } from '@plait/core';
import {
  buildAnnotationMessage,
  normalizeRect,
  readElementText,
  summarizeElements,
} from './annotation';
import type { BoardAnnotation } from './annotation';

const mindElement = {
  id: 'mind-1',
  type: 'mind',
  data: { topic: { children: [{ text: '用户注册流程' }] } },
  children: [
    {
      id: 'mind-2',
      type: 'mind_child',
      data: { topic: { children: [{ text: '填写邮箱' }] } },
      children: [],
    },
  ],
} as unknown as PlaitElement;

const geometryElement = {
  id: 'geo-1',
  type: 'geometry',
  text: { children: [{ text: '登录' }] },
} as unknown as PlaitElement;

describe('annotation geometry', () => {
  it('normalizes a rectangle drawn in any direction', () => {
    expect(normalizeRect({ x: 120, y: 80 }, { x: 20, y: 30 })).toEqual({
      x: 20,
      y: 30,
      width: 100,
      height: 50,
    });
  });
});

describe('annotation element summary', () => {
  it('reads text from mind topics and geometry text', () => {
    expect(readElementText(mindElement)).toBe('用户注册流程 / 填写邮箱');
    expect(readElementText(geometryElement)).toBe('登录');
  });

  it('counts element types and keeps unique text snippets', () => {
    const summary = summarizeElements([mindElement, geometryElement, geometryElement]);
    expect(summary.elementCount).toBe(3);
    expect(summary.typeCounts).toEqual({ mind: 1, geometry: 2 });
    expect(summary.texts).toEqual(['用户注册流程 / 填写邮箱', '登录']);
    expect(summary.elements[0]).toEqual({
      id: 'mind-1',
      type: 'mind',
      text: '用户注册流程 / 填写邮箱',
    });
  });

  it('returns an empty summary for an empty region', () => {
    expect(summarizeElements([])).toEqual({
      elementCount: 0,
      typeCounts: {},
      texts: [],
      elements: [],
    });
  });
});

describe('annotation prompt', () => {
  const annotation: BoardAnnotation = {
    id: 'annotation-1',
    rect: { x: 10, y: 20, width: 300, height: 200 },
    elementCount: 2,
    typeCounts: { mind: 1, geometry: 1 },
    texts: ['用户注册流程', '登录'],
    elements: [],
    createdAt: 0,
  };

  it('prepends a structured Chinese context block', () => {
    const message = buildAnnotationMessage('把这块区域改成英文', annotation, 'zh');
    expect(message).toContain('[画布批注]');
    expect(message).toContain('区域内元素：2 个（mind×1、geometry×1）');
    expect(message).toContain('文本片段："用户注册流程"、"登录"');
    expect(message.trimEnd().endsWith('把这块区域改成英文')).toBe(true);
  });

  it('uses an English context block for other languages', () => {
    const message = buildAnnotationMessage('Translate this area', annotation, 'en');
    expect(message).toContain('[Canvas annotation]');
    expect(message).toContain('Elements in region: 2 (mind×1, geometry×1)');
    expect(message).toContain('Text snippets: "用户注册流程", "登录"');
  });

  it('marks an empty region explicitly', () => {
    const message = buildAnnotationMessage(
      '在这里画一个流程图',
      {
        ...annotation,
        elementCount: 0,
        typeCounts: {},
        texts: [],
      },
      'zh'
    );
    expect(message).toContain('没有元素（空白区域）');
  });
});
