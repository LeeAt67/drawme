import { getSelectedElements, PlaitBoard, PlaitElement } from '@plait/core';

export type BoardInspectScope = 'summary' | 'selection' | 'all';

export type InspectArguments = {
  scope: BoardInspectScope;
  limit: number;
};

export type BoardElementSummary = {
  id: string;
  type: string;
  label: string;
};

export type BoardInspection = {
  elementCount: number;
  selectionCount: number;
  typeCounts: Record<string, number>;
  elements?: BoardElementSummary[];
  truncated?: boolean;
};

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 80;
const MAX_LABEL_LENGTH = 120;

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function textOf(value: unknown, depth = 0): string | undefined {
  if (depth > 4) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value.trim() || undefined;
  }
  if (Array.isArray(value)) {
    const parts = value.map((item) => textOf(item, depth + 1)).filter(Boolean);
    return parts.length ? parts.join('') : undefined;
  }
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }
  return (
    textOf(record.text, depth + 1) ||
    textOf(record.topic, depth + 1) ||
    textOf(record.label, depth + 1)
  );
}

export function readElementLabel(element: PlaitElement): string {
  const record = element as unknown as UnknownRecord;
  const data = asRecord(record.data);
  const label =
    textOf(data?.text) || textOf(data?.topic) || textOf(data?.label) || textOf(record.text) || '';
  const normalized = label.replace(/\s+/g, ' ').trim();
  return normalized.length > MAX_LABEL_LENGTH
    ? `${normalized.slice(0, MAX_LABEL_LENGTH)}…`
    : normalized;
}

export function parseInspectArguments(rawArguments: unknown): InspectArguments {
  let parsed: unknown = rawArguments;
  if (typeof rawArguments === 'string') {
    try {
      parsed = rawArguments.trim() ? JSON.parse(rawArguments) : {};
    } catch {
      throw new Error('Tool arguments are not valid JSON.');
    }
  }
  const record = asRecord(parsed) || {};
  const scope = record.scope === 'selection' || record.scope === 'all' ? record.scope : 'summary';
  const rawLimit =
    typeof record.limit === 'number' && Number.isFinite(record.limit)
      ? record.limit
      : DEFAULT_LIMIT;
  return { scope, limit: Math.max(1, Math.min(MAX_LIMIT, Math.floor(rawLimit))) };
}

function flattenElements(elements: PlaitElement[], collected: PlaitElement[]): void {
  for (const element of elements) {
    collected.push(element);
    const children = (element as unknown as { children?: PlaitElement[] }).children;
    if (Array.isArray(children) && children.length) {
      flattenElements(children, collected);
    }
  }
}

export function inspectBoard(board: PlaitBoard, options: InspectArguments): BoardInspection {
  const allElements: PlaitElement[] = [];
  flattenElements(board.children as PlaitElement[], allElements);
  const selectedIds = new Set(getSelectedElements(board).map((element) => element.id));

  const typeCounts: Record<string, number> = {};
  for (const element of allElements) {
    const type = element.type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }

  const inspection: BoardInspection = {
    elementCount: allElements.length,
    selectionCount: selectedIds.size,
    typeCounts,
  };

  if (options.scope === 'summary') {
    return inspection;
  }

  const source =
    options.scope === 'selection'
      ? allElements.filter((element) => selectedIds.has(element.id))
      : allElements;

  const listed = source.slice(0, options.limit).map((element) => ({
    id: element.id,
    type: element.type || 'unknown',
    label: readElementLabel(element),
  }));

  inspection.elements = listed;
  if (source.length > listed.length) {
    inspection.truncated = true;
  }
  return inspection;
}
