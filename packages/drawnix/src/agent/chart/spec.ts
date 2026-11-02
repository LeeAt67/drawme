import type { PlaitBoard, PlaitElement } from '@plait/core';

/** 结构族：决定布局与渲染通道，与图表名字无关。 */
export type ChartShape = 'network' | 'tree' | 'sequence' | 'timeline' | 'matrix' | 'data';

/** 语义类型：决定默认样式与文案指引。 */
export const CHART_KINDS = [
  'flowchart',
  'state',
  'er',
  'class',
  'dependency',
  'org',
  'architecture',
  'mindmap',
  'outline',
  'taxonomy',
  'sequence',
  'gantt',
  'roadmap',
  'timeline',
  'table',
  'matrix2x2',
  'swot',
  'comparison',
  'bar',
  'line',
  'pie',
  'area',
  'kpi',
] as const;

export type ChartKind = (typeof CHART_KINDS)[number];

export const KIND_TO_SHAPE: Record<ChartKind, ChartShape> = {
  flowchart: 'network',
  state: 'network',
  er: 'network',
  class: 'network',
  dependency: 'network',
  org: 'network',
  architecture: 'network',
  mindmap: 'tree',
  outline: 'tree',
  taxonomy: 'tree',
  sequence: 'sequence',
  gantt: 'timeline',
  roadmap: 'timeline',
  timeline: 'timeline',
  table: 'matrix',
  matrix2x2: 'matrix',
  swot: 'matrix',
  comparison: 'matrix',
  bar: 'data',
  line: 'data',
  pie: 'data',
  area: 'data',
  kpi: 'data',
};

export type ChartNodeShape = 'rect' | 'round' | 'diamond' | 'circle' | 'cylinder' | 'hexagon';

export type NetworkNode = {
  id: string;
  label: string;
  shape?: ChartNodeShape;
  group?: string;
  note?: string;
};

export type NetworkEdge = {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
  arrow?: 'forward' | 'both' | 'none';
};

export type NetworkGroup = {
  id: string;
  label?: string;
};

export type TreeNode = {
  label: string;
  note?: string;
  children?: TreeNode[];
};

export type SequenceActor = {
  id: string;
  label: string;
  kind?: 'actor' | 'system' | 'database';
};

export type SequenceMessage = {
  from: string;
  to: string;
  label: string;
  style?: 'sync' | 'async' | 'return';
};

export type TimelineEvent = {
  id: string;
  label: string;
  start: string;
  end?: string;
  milestone?: boolean;
  group?: string;
};

export type MatrixRow = {
  label: string;
  cells: (string | null)[];
};

export type DataSeries = {
  label: string;
  values: number[];
  type?: 'bar' | 'line' | 'area';
};

export type NetworkPayload = {
  shape: 'network';
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  groups?: NetworkGroup[];
};

export type TreePayload = {
  shape: 'tree';
  root: TreeNode;
};

export type SequencePayload = {
  shape: 'sequence';
  actors: SequenceActor[];
  messages: SequenceMessage[];
};

export type TimelinePayload = {
  shape: 'timeline';
  unit: 'day' | 'week' | 'month' | 'quarter';
  events: TimelineEvent[];
};

export type MatrixPayload = {
  shape: 'matrix';
  columns: string[];
  rows: MatrixRow[];
};

export type DataPayload = {
  shape: 'data';
  categories: string[];
  series: DataSeries[];
};

export type ChartPayload =
  | NetworkPayload
  | TreePayload
  | SequencePayload
  | TimelinePayload
  | MatrixPayload
  | DataPayload;

export type ChartLayoutHint = {
  direction?: 'TB' | 'LR' | 'RL' | 'BT';
  density?: 'compact' | 'normal' | 'roomy';
};

export type ChartStyle = {
  accent?: string;
  palette?: 'default' | 'mono' | 'warm' | 'cool';
};

export type ChartSpec = {
  version: 1;
  kind: ChartKind;
  title?: string;
  layout?: ChartLayoutHint;
  style?: ChartStyle;
} & ChartPayload;

/** 模型对 mermaid / markdown 的逃生通道，产物通常不可编辑。 */
export type RawChartSource = {
  kind: 'raw';
  source: 'mermaid' | 'markdown';
  code: string;
};

export type RenderCapability = 'editable' | 'image';

export type RenderWarning = {
  code: 'degraded-to-image' | 'label-truncated' | 'layout-fallback' | 'unsupported-style';
  message: string;
};

export type RenderErrorCode =
  | 'invalid-node-ref'
  | 'invalid-range'
  | 'cycle'
  | 'too-large'
  | 'empty'
  | 'render-failed';

export type RenderError = {
  code: RenderErrorCode;
  message: string;
  /** 指向 spec 中的字段路径，便于模型定向修复。 */
  path?: string;
};

export type RenderResult = {
  elements: PlaitElement[];
  capability: RenderCapability;
  bounds: { width: number; height: number };
  warnings: RenderWarning[];
};

export type RenderContext = {
  theme: string;
  fontSize: number;
  measureText: (
    text: string,
    font: { size: number; weight?: number }
  ) => { width: number; height: number };
  /** 只读：取视口与缩放，不得修改画布。 */
  board: PlaitBoard;
};

export type ChartRenderer = {
  id: string;
  shape: ChartShape;
  /** 精确支持的 kind；省略表示按 shape 兜底。 */
  kinds?: ChartKind[];
  capability: (spec: ChartSpec) => RenderCapability;
  render: (spec: ChartSpec, context: RenderContext) => Promise<RenderResult>;
};

export function resolveChartShape(kind: ChartKind): ChartShape {
  return KIND_TO_SHAPE[kind];
}
