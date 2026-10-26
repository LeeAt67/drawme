import {
  getViewportOrigination,
  PlaitBoard,
  PlaitElement,
  PlaitGroupElement,
  Point,
  RectangleClient,
  WritableClipboardOperationType,
} from '@plait/core';
import type { AgentDiagramFormat, AgentInsertionCursor } from './types';

export type InsertedAgentDiagram = {
  elementCount: number;
  width: number;
  height: number;
  nextCursor: AgentInsertionCursor;
};

function getElementBounds(elements: PlaitElement[]): {
  width: number;
  height: number;
} {
  const elementsWithBounds = elements.filter(
    (element) => !PlaitGroupElement.isGroup(element) && Array.isArray(element.points)
  );
  const rectangles = elementsWithBounds.map((element) =>
    RectangleClient.getRectangleByPoints(element.points as Point[])
  );

  if (!rectangles.length) {
    return { width: 320, height: 240 };
  }

  const boundingRectangle = RectangleClient.getBoundingRectangle(rectangles);
  return {
    width: boundingRectangle.width,
    height: boundingRectangle.height,
  };
}

export async function parseDiagramElements(
  format: AgentDiagramFormat,
  content: string
): Promise<PlaitElement[]> {
  if (format === 'mermaid') {
    const mermaidModule = await import('@plait-board/mermaid-to-drawnix');
    let result;
    try {
      result = await mermaidModule.parseMermaidToDrawnix(content);
    } catch {
      result = await mermaidModule.parseMermaidToDrawnix(content.replace(/"/g, "'"));
    }
    if (!result.elements?.length) {
      throw new Error('Mermaid did not produce any drawing elements.');
    }
    return result.elements;
  }

  const markdownModule = await import('@plait-board/markdown-to-drawnix');
  const mindElement = markdownModule.parseMarkdownToDrawnix(content);
  if (!mindElement) {
    throw new Error('Markdown did not produce a mind map.');
  }
  mindElement.points = [[0, 0]];
  return [mindElement];
}

function getCenteredStartPoint(
  board: PlaitBoard,
  width: number,
  height: number
): AgentInsertionCursor {
  const boardContainerRect = PlaitBoard.getBoardContainer(board).getBoundingClientRect();
  const zoom = board.viewport.zoom || 1;
  const origination = getViewportOrigination(board) || [0, 0];
  const centerX = origination[0] + boardContainerRect.width / 2 / zoom;
  const centerY = origination[1] + boardContainerRect.height / 2 / zoom;

  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
  };
}

export async function insertAgentDiagram(
  board: PlaitBoard,
  format: AgentDiagramFormat,
  content: string,
  cursor?: AgentInsertionCursor
): Promise<InsertedAgentDiagram> {
  const elements = await parseDiagramElements(format, content);
  const bounds = getElementBounds(elements);
  const startPoint = cursor || getCenteredStartPoint(board, bounds.width, bounds.height);

  board.insertFragment(
    {
      elements: JSON.parse(JSON.stringify(elements)) as PlaitElement[],
    },
    [startPoint.x, startPoint.y],
    WritableClipboardOperationType.paste
  );

  return {
    elementCount: elements.length,
    width: bounds.width,
    height: bounds.height,
    nextCursor: {
      x: startPoint.x + bounds.width + 80,
      y: startPoint.y,
    },
  };
}
