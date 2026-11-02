import { KIND_TO_SHAPE, resolveChartShape } from './spec';
import type {
  ChartKind,
  ChartSpec,
  DataSeries,
  MatrixRow,
  NetworkEdge,
  NetworkNode,
  RenderErrorCode,
  SequenceActor,
  SequenceMessage,
  TimelineEvent,
  TreeNode,
} from './spec';

export type ChartSpecProblem = {
  code: RenderErrorCode | 'unsupported-kind';
  message: string;
  path?: string;
  hint?: string;
};

export class ChartSpecError extends Error {
  readonly problems: ChartSpecProblem[];

  constructor(problems: ChartSpecProblem[]) {
    super(problems[0]?.message || 'Invalid chart spec.');
    this.name = 'ChartSpecError';
    this.problems = problems;
  }
}

const MAX_NODES = 80;
const MAX_EDGES = 160;
const MAX_ITEMS = 60;
const MAX_LABEL_LENGTH = 160;
const MAX_TREE_DEPTH = 4;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readLabel(value: unknown, path: string, problems: ChartSpecProblem[]): string {
  if (typeof value !== 'string' || !value.trim()) {
    problems.push({
      code: 'empty',
      path,
      message: 'Label is required.',
      hint: 'Provide a short non-empty label.',
    });
    return '';
  }
  const label = value.trim();
  if (label.length > MAX_LABEL_LENGTH) {
    problems.push({
      code: 'too-large',
      path,
      message: `Label exceeds ${MAX_LABEL_LENGTH} characters.`,
      hint: 'Shorten the label and move the detail into a note.',
    });
    return label.slice(0, MAX_LABEL_LENGTH);
  }
  return label;
}

function readId(value: unknown, path: string, problems: ChartSpecProblem[]): string {
  if (typeof value !== 'string' || !value.trim()) {
    problems.push({
      code: 'empty',
      path,
      message: 'Id is required.',
      hint: 'Use a short stable id such as "start".',
    });
    return '';
  }
  const id = value.trim();
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    problems.push({
      code: 'invalid-node-ref',
      path,
      message: `Id "${id}" contains unsupported characters.`,
      hint: 'Id may only contain letters, digits, underscore and dash.',
    });
  }
  return id;
}

function collectUniqueId(
  id: string,
  path: string,
  seen: Set<string>,
  problems: ChartSpecProblem[]
): void {
  if (!id) {
    return;
  }
  if (seen.has(id)) {
    problems.push({
      code: 'invalid-node-ref',
      path,
      message: `Duplicate id "${id}".`,
      hint: 'Every node, actor and event needs a unique id.',
    });
    return;
  }
  seen.add(id);
}

function assertRef(
  id: string,
  path: string,
  known: Set<string>,
  problems: ChartSpecProblem[]
): void {
  if (id && !known.has(id)) {
    problems.push({
      code: 'invalid-node-ref',
      path,
      message: `Unknown reference "${id}".`,
      hint: `Use one of: ${[...known].slice(0, 12).join(', ')}.`,
    });
  }
}

function parseNetwork(
  source: Record<string, unknown>,
  base: Omit<ChartSpec, 'shape'>,
  problems: ChartSpecProblem[]
): ChartSpec {
  const rawNodes = Array.isArray(source.nodes) ? source.nodes : [];
  const rawEdges = Array.isArray(source.edges) ? source.edges : [];
  if (!rawNodes.length) {
    problems.push({
      code: 'empty',
      path: 'nodes',
      message: 'A network chart needs at least one node.',
      hint: 'Add nodes (and optional edges) before retrying.',
    });
  }
  if (rawNodes.length > MAX_NODES) {
    problems.push({
      code: 'too-large',
      path: 'nodes',
      message: `At most ${MAX_NODES} nodes are allowed.`,
    });
  }
  if (rawEdges.length > MAX_EDGES) {
    problems.push({
      code: 'too-large',
      path: 'edges',
      message: `At most ${MAX_EDGES} edges are allowed.`,
    });
  }

  const seen = new Set<string>();
  const nodes: NetworkNode[] = rawNodes.slice(0, MAX_NODES).map((rawNode, index) => {
    const path = `nodes[${index}]`;
    if (!isRecord(rawNode)) {
      problems.push({ code: 'invalid-node-ref', path, message: 'Node must be an object.' });
      return { id: '', label: '' };
    }
    const id = readId(rawNode.id, `${path}.id`, problems);
    collectUniqueId(id, `${path}.id`, seen, problems);
    const node: NetworkNode = { id, label: readLabel(rawNode.label, `${path}.label`, problems) };
    if (typeof rawNode.shape === 'string') {
      node.shape = rawNode.shape as NetworkNode['shape'];
    }
    if (typeof rawNode.group === 'string' && rawNode.group.trim()) {
      node.group = rawNode.group.trim();
    }
    if (typeof rawNode.note === 'string' && rawNode.note.trim()) {
      node.note = rawNode.note.trim().slice(0, MAX_LABEL_LENGTH);
    }
    return node;
  });

  const nodeIds = new Set(nodes.map((node) => node.id).filter(Boolean));
  const rawGroups = Array.isArray(source.groups) ? source.groups : [];
  const groups = rawGroups.slice(0, 20).flatMap((rawGroup, index) => {
    if (!isRecord(rawGroup)) {
      return [];
    }
    const id = readId(rawGroup.id, `groups[${index}].id`, problems);
    if (!id) {
      return [];
    }
    return [
      {
        id,
        label:
          typeof rawGroup.label === 'string'
            ? rawGroup.label.trim().slice(0, MAX_LABEL_LENGTH)
            : undefined,
      },
    ];
  });
  const groupIds = new Set(groups.map((group) => group.id));
  for (const [index, node] of nodes.entries()) {
    if (node.group && !groupIds.has(node.group)) {
      problems.push({
        code: 'invalid-node-ref',
        path: `nodes[${index}].group`,
        message: `Unknown group "${node.group}".`,
        hint: 'Declare the group in the groups array first.',
      });
    }
  }

  const edges: NetworkEdge[] = rawEdges.slice(0, MAX_EDGES).map((rawEdge, index) => {
    const path = `edges[${index}]`;
    if (!isRecord(rawEdge)) {
      problems.push({ code: 'invalid-node-ref', path, message: 'Edge must be an object.' });
      return { from: '', to: '' };
    }
    const from = readId(rawEdge.from, `${path}.from`, problems);
    const to = readId(rawEdge.to, `${path}.to`, problems);
    assertRef(from, `${path}.from`, nodeIds, problems);
    assertRef(to, `${path}.to`, nodeIds, problems);
    const edge: NetworkEdge = { from, to };
    if (typeof rawEdge.label === 'string' && rawEdge.label.trim()) {
      edge.label = rawEdge.label.trim().slice(0, MAX_LABEL_LENGTH);
    }
    if (rawEdge.style === 'dashed') {
      edge.style = 'dashed';
    }
    if (rawEdge.arrow === 'both' || rawEdge.arrow === 'none') {
      edge.arrow = rawEdge.arrow;
    }
    return edge;
  });

  return { ...base, shape: 'network', nodes, edges, groups: groups.length ? groups : undefined };
}

function parseTree(
  source: Record<string, unknown>,
  base: Omit<ChartSpec, 'shape'>,
  problems: ChartSpecProblem[]
): ChartSpec {
  let count = 0;

  const parseNode = (rawNode: unknown, path: string, depth: number): TreeNode => {
    count += 1;
    if (depth > MAX_TREE_DEPTH) {
      problems.push({
        code: 'too-large',
        path,
        message: `Tree depth exceeds ${MAX_TREE_DEPTH}.`,
        hint: 'Flatten deep branches or split into several charts.',
      });
      return { label: '' };
    }
    if (!isRecord(rawNode)) {
      problems.push({ code: 'invalid-node-ref', path, message: 'Tree node must be an object.' });
      return { label: '' };
    }
    const node: TreeNode = { label: readLabel(rawNode.label, `${path}.label`, problems) };
    if (typeof rawNode.note === 'string' && rawNode.note.trim()) {
      node.note = rawNode.note.trim().slice(0, MAX_LABEL_LENGTH);
    }
    if (Array.isArray(rawNode.children) && rawNode.children.length) {
      node.children = rawNode.children
        .slice(0, 24)
        .map((child, index) => parseNode(child, `${path}.children[${index}]`, depth + 1));
    }
    return node;
  };

  if (!isRecord(source.root)) {
    problems.push({
      code: 'empty',
      path: 'root',
      message: 'A tree chart needs a root node.',
      hint: 'Provide root: { label } with nested children.',
    });
    return { ...base, shape: 'tree', root: { label: '' } };
  }

  const root = parseNode(source.root, 'root', 0);
  if (count > MAX_ITEMS) {
    problems.push({
      code: 'too-large',
      path: 'root',
      message: `At most ${MAX_ITEMS} tree nodes are allowed.`,
    });
  }
  return { ...base, shape: 'tree', root };
}

function parseSequence(
  source: Record<string, unknown>,
  base: Omit<ChartSpec, 'shape'>,
  problems: ChartSpecProblem[]
): ChartSpec {
  const rawActors = Array.isArray(source.actors) ? source.actors : [];
  const rawMessages = Array.isArray(source.messages) ? source.messages : [];
  if (!rawActors.length) {
    problems.push({
      code: 'empty',
      path: 'actors',
      message: 'A sequence chart needs at least one actor.',
      hint: 'Declare participants first, then reference them in messages.',
    });
  }
  if (!rawMessages.length) {
    problems.push({
      code: 'empty',
      path: 'messages',
      message: 'A sequence chart needs at least one message.',
    });
  }
  if (rawMessages.length > MAX_ITEMS) {
    problems.push({
      code: 'too-large',
      path: 'messages',
      message: `At most ${MAX_ITEMS} messages are allowed.`,
    });
  }

  const seen = new Set<string>();
  const actors: SequenceActor[] = rawActors.slice(0, 20).map((rawActor, index) => {
    const path = `actors[${index}]`;
    if (!isRecord(rawActor)) {
      problems.push({ code: 'invalid-node-ref', path, message: 'Actor must be an object.' });
      return { id: '', label: '' };
    }
    const id = readId(rawActor.id, `${path}.id`, problems);
    collectUniqueId(id, `${path}.id`, seen, problems);
    const actor: SequenceActor = {
      id,
      label: readLabel(rawActor.label, `${path}.label`, problems),
    };
    if (rawActor.kind === 'system' || rawActor.kind === 'database' || rawActor.kind === 'actor') {
      actor.kind = rawActor.kind;
    }
    return actor;
  });

  const actorIds = new Set(actors.map((actor) => actor.id).filter(Boolean));
  const messages: SequenceMessage[] = rawMessages.slice(0, MAX_ITEMS).map((rawMessage, index) => {
    const path = `messages[${index}]`;
    if (!isRecord(rawMessage)) {
      problems.push({ code: 'invalid-node-ref', path, message: 'Message must be an object.' });
      return { from: '', to: '', label: '' };
    }
    const from = readId(rawMessage.from, `${path}.from`, problems);
    const to = readId(rawMessage.to, `${path}.to`, problems);
    assertRef(from, `${path}.from`, actorIds, problems);
    assertRef(to, `${path}.to`, actorIds, problems);
    const message: SequenceMessage = {
      from,
      to,
      label: readLabel(rawMessage.label, `${path}.label`, problems),
    };
    if (rawMessage.style === 'async' || rawMessage.style === 'return') {
      message.style = rawMessage.style;
    }
    return message;
  });

  return { ...base, shape: 'sequence', actors, messages };
}

function parseTimeline(
  source: Record<string, unknown>,
  base: Omit<ChartSpec, 'shape'>,
  problems: ChartSpecProblem[]
): ChartSpec {
  const unit = source.unit;
  if (unit !== 'day' && unit !== 'week' && unit !== 'month' && unit !== 'quarter') {
    problems.push({
      code: 'empty',
      path: 'unit',
      message: 'Timeline unit must be day, week, month or quarter.',
    });
  }
  const rawEvents = Array.isArray(source.events) ? source.events : [];
  if (!rawEvents.length) {
    problems.push({
      code: 'empty',
      path: 'events',
      message: 'A timeline needs at least one event.',
    });
  }
  const events: TimelineEvent[] = rawEvents.slice(0, MAX_ITEMS).map((rawEvent, index) => {
    const path = `events[${index}]`;
    if (!isRecord(rawEvent)) {
      problems.push({ code: 'invalid-node-ref', path, message: 'Event must be an object.' });
      return { id: '', label: '', start: '' };
    }
    return {
      id: readId(rawEvent.id, `${path}.id`, problems),
      label: readLabel(rawEvent.label, `${path}.label`, problems),
      start: readLabel(rawEvent.start, `${path}.start`, problems),
      end:
        typeof rawEvent.end === 'string' && rawEvent.end.trim() ? rawEvent.end.trim() : undefined,
      milestone: rawEvent.milestone === true,
      group:
        typeof rawEvent.group === 'string' && rawEvent.group.trim()
          ? rawEvent.group.trim()
          : undefined,
    };
  });
  const normalizedUnit = unit === 'week' || unit === 'quarter' || unit === 'month' ? unit : 'day';
  return { ...base, shape: 'timeline', unit: normalizedUnit, events };
}

function parseMatrix(
  source: Record<string, unknown>,
  base: Omit<ChartSpec, 'shape'>,
  problems: ChartSpecProblem[]
): ChartSpec {
  const columns = (Array.isArray(source.columns) ? source.columns : [])
    .slice(0, 12)
    .map((column, index) => readLabel(column, `columns[${index}]`, problems));
  if (!columns.length) {
    problems.push({ code: 'empty', path: 'columns', message: 'A matrix needs column headers.' });
  }
  const rawRows = Array.isArray(source.rows) ? source.rows : [];
  if (!rawRows.length) {
    problems.push({ code: 'empty', path: 'rows', message: 'A matrix needs at least one row.' });
  }
  const rows: MatrixRow[] = rawRows.slice(0, 30).map((rawRow, index) => {
    const path = `rows[${index}]`;
    if (!isRecord(rawRow)) {
      problems.push({ code: 'invalid-node-ref', path, message: 'Row must be an object.' });
      return { label: '', cells: [] };
    }
    const cells = Array.isArray(rawRow.cells) ? rawRow.cells : [];
    if (columns.length && cells.length !== columns.length) {
      problems.push({
        code: 'invalid-range',
        path: `${path}.cells`,
        message: `Row has ${cells.length} cells but there are ${columns.length} columns.`,
        hint: 'Pad missing cells with null.',
      });
    }
    return {
      label: readLabel(rawRow.label, `${path}.label`, problems),
      cells: columns.map((_, cellIndex) => {
        const cell = cells[cellIndex];
        return typeof cell === 'string' && cell.trim()
          ? cell.trim().slice(0, MAX_LABEL_LENGTH)
          : null;
      }),
    };
  });
  return { ...base, shape: 'matrix', columns, rows };
}

function parseData(
  source: Record<string, unknown>,
  base: Omit<ChartSpec, 'shape'>,
  problems: ChartSpecProblem[]
): ChartSpec {
  const categories = (Array.isArray(source.categories) ? source.categories : [])
    .slice(0, 24)
    .map((category, index) => readLabel(category, `categories[${index}]`, problems));
  if (!categories.length) {
    problems.push({ code: 'empty', path: 'categories', message: 'A data chart needs categories.' });
  }
  const rawSeries = Array.isArray(source.series) ? source.series : [];
  if (!rawSeries.length) {
    problems.push({
      code: 'empty',
      path: 'series',
      message: 'A data chart needs at least one series.',
    });
  }
  const series: DataSeries[] = rawSeries.slice(0, 8).map((rawItem, index) => {
    const path = `series[${index}]`;
    if (!isRecord(rawItem)) {
      problems.push({ code: 'invalid-node-ref', path, message: 'Series must be an object.' });
      return { label: '', values: [] };
    }
    const values = (Array.isArray(rawItem.values) ? rawItem.values : []).map((value) =>
      typeof value === 'number' && Number.isFinite(value) ? value : 0
    );
    if (categories.length && values.length !== categories.length) {
      problems.push({
        code: 'invalid-range',
        path: `${path}.values`,
        message: `Series has ${values.length} values but there are ${categories.length} categories.`,
      });
    }
    const item: DataSeries = {
      label: readLabel(rawItem.label, `${path}.label`, problems),
      values: categories.map((_, valueIndex) => values[valueIndex] ?? 0),
    };
    if (rawItem.type === 'line' || rawItem.type === 'area' || rawItem.type === 'bar') {
      item.type = rawItem.type;
    }
    return item;
  });
  return { ...base, shape: 'data', categories, series };
}

const KINDS = Object.keys(KIND_TO_SHAPE) as ChartKind[];

export function parseChartSpec(raw: unknown): ChartSpec {
  const problems: ChartSpecProblem[] = [];
  if (!isRecord(raw)) {
    throw new ChartSpecError([{ code: 'empty', message: 'Chart spec must be an object.' }]);
  }

  const kind = raw.kind;
  if (typeof kind !== 'string' || !KINDS.includes(kind as ChartKind)) {
    throw new ChartSpecError([
      {
        code: 'empty',
        path: 'kind',
        message: `Unknown chart kind "${String(kind)}".`,
        hint: `Use one of: ${KINDS.join(', ')}.`,
      },
    ]);
  }

  const base: Omit<ChartSpec, 'shape'> = { version: 1, kind: kind as ChartKind };
  if (typeof raw.title === 'string' && raw.title.trim()) {
    base.title = raw.title.trim().slice(0, 120);
  }
  if (isRecord(raw.layout)) {
    const layout: ChartSpec['layout'] = {};
    const direction = raw.layout.direction;
    if (direction === 'TB' || direction === 'LR' || direction === 'RL' || direction === 'BT') {
      layout.direction = direction;
    }
    const density = raw.layout.density;
    if (density === 'compact' || density === 'normal' || density === 'roomy') {
      layout.density = density;
    }
    if (Object.keys(layout).length) {
      base.layout = layout;
    }
  }

  const shape = resolveChartShape(kind as ChartKind);
  let spec: ChartSpec;
  switch (shape) {
    case 'network':
      spec = parseNetwork(raw, base, problems);
      break;
    case 'tree':
      spec = parseTree(raw, base, problems);
      break;
    case 'sequence':
      spec = parseSequence(raw, base, problems);
      break;
    case 'timeline':
      spec = parseTimeline(raw, base, problems);
      break;
    case 'matrix':
      spec = parseMatrix(raw, base, problems);
      break;
    case 'data':
      spec = parseData(raw, base, problems);
      break;
  }

  if (problems.length) {
    throw new ChartSpecError(problems.slice(0, 8));
  }
  return spec;
}
