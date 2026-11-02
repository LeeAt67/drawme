import { ChartSpecError } from './parse';
import type {
  ChartSpec,
  NetworkEdge,
  NetworkNode,
  RenderWarning,
  SequenceMessage,
  TreeNode,
} from './spec';

export type ChartSource = {
  format: 'mermaid' | 'markdown';
  content: string;
  warnings: RenderWarning[];
};

/** Mermaid 的 id 只接受字母、数字、下划线和短横线。 */
function toMermaidId(id: string, prefix: string): string {
  const normalized = id.replace(/[^A-Za-z0-9_-]/g, '_');
  return /^[A-Za-z_]/.test(normalized) ? normalized : `${prefix}${normalized}`;
}

function escapeLabel(label: string): string {
  return label
    .replace(/"/g, "'")
    .replace(/\r?\n+/g, ' ')
    .trim();
}

function nodeSyntax(node: NetworkNode, id: string): string {
  const label = escapeLabel(node.label);
  switch (node.shape) {
    case 'diamond':
      return `${id}{"${label}"}`;
    case 'circle':
      return `${id}(("${label}"))`;
    case 'cylinder':
      return `${id}[("${label}")]`;
    case 'hexagon':
      return `${id}{{"${label}"}}`;
    case 'round':
      return `${id}("${label}")`;
    default:
      return `${id}["${label}"]`;
  }
}

function edgeSyntax(edge: NetworkEdge, from: string, to: string): string {
  const label = edge.label ? `|"${escapeLabel(edge.label)}"|` : '';
  if (edge.arrow === 'none') {
    return `  ${from} ---${label} ${to}`;
  }
  if (edge.style === 'dashed') {
    return edge.arrow === 'both' ? `  ${from} <-.->${label} ${to}` : `  ${from} -.->${label} ${to}`;
  }
  return edge.arrow === 'both' ? `  ${from} <-->${label} ${to}` : `  ${from} -->${label} ${to}`;
}

function buildNetworkSource(spec: Extract<ChartSpec, { shape: 'network' }>): string {
  const direction = spec.layout?.direction || 'TB';
  const idMap = new Map<string, string>();
  const lines: string[] = [`flowchart ${direction}`];

  for (const node of spec.nodes) {
    idMap.set(node.id, toMermaidId(node.id, 'n_'));
  }

  const groups = spec.groups || [];
  const groupedNodes = new Map<string, NetworkNode[]>();
  for (const node of spec.nodes) {
    if (node.group) {
      const bucket = groupedNodes.get(node.group) || [];
      bucket.push(node);
      groupedNodes.set(node.group, bucket);
    }
  }

  for (const group of groups) {
    const members = groupedNodes.get(group.id) || [];
    const groupId = toMermaidId(group.id, 'g_');
    lines.push(`  subgraph ${groupId}["${escapeLabel(group.label || group.id)}"]`);
    for (const node of members) {
      lines.push(`    ${nodeSyntax(node, idMap.get(node.id) as string)}`);
    }
    lines.push('  end');
  }

  for (const node of spec.nodes) {
    if (node.group) {
      continue;
    }
    lines.push(`  ${nodeSyntax(node, idMap.get(node.id) as string)}`);
  }

  for (const edge of spec.edges) {
    lines.push(edgeSyntax(edge, idMap.get(edge.from) as string, idMap.get(edge.to) as string));
  }

  return lines.join('\n');
}

function buildMindmapSource(spec: Extract<ChartSpec, { shape: 'tree' }>): string {
  const lines: string[] = [];

  const walk = (node: TreeNode, depth: number): void => {
    const label = node.note ? `${node.label}（${node.note}）` : node.label;
    if (depth === 0) {
      lines.push(`# ${label}`);
      return;
    }
    lines.push(`${'  '.repeat(depth - 1)}- ${label}`);
  };

  const visit = (node: TreeNode, depth: number): void => {
    walk(node, depth);
    for (const child of node.children || []) {
      visit(child, depth + 1);
    }
  };

  visit(spec.root, 0);
  return lines.join('\n');
}

function messageArrow(message: SequenceMessage): string {
  if (message.style === 'async') {
    return '-)';
  }
  if (message.style === 'return') {
    return '-->>';
  }
  return '->>';
}

function buildSequenceSource(spec: Extract<ChartSpec, { shape: 'sequence' }>): string {
  const idMap = new Map<string, string>();
  for (const actor of spec.actors) {
    idMap.set(actor.id, toMermaidId(actor.id, 'p_'));
  }

  const lines = ['sequenceDiagram'];
  for (const actor of spec.actors) {
    const keyword = actor.kind === 'actor' ? 'actor' : 'participant';
    lines.push(`  ${keyword} ${idMap.get(actor.id) as string} as ${escapeLabel(actor.label)}`);
  }
  for (const message of spec.messages) {
    const from = idMap.get(message.from) as string;
    const to = idMap.get(message.to) as string;
    lines.push(`  ${from}${messageArrow(message)}${to}: ${escapeLabel(message.label)}`);
  }
  return lines.join('\n');
}

const UNSUPPORTED_HINTS: Record<string, string> = {
  timeline:
    'Timeline charts are not editable yet. Use create_diagram with format "mermaid" and a gantt chart, or describe the milestones as a flowchart.',
  matrix:
    'Matrix charts are not editable yet. Use create_diagram with format "mermaid" (flowchart) or format "markdown".',
  data: 'Data charts are not editable yet. Use create_diagram with format "markdown", or describe the numbers as a flowchart/table text.',
};

/**
 * P0 渲染通道：把 ChartSpec 折成 mermaid / markdown，复用现成转换器。
 * 只覆盖能产出可编辑元素的族：network、tree、sequence。
 */
export function buildChartSource(spec: ChartSpec): ChartSource {
  const warnings: RenderWarning[] = [];

  if (spec.shape === 'network') {
    if (spec.nodes.some((node) => node.group) === false && spec.edges.length === 0) {
      warnings.push({
        code: 'layout-fallback',
        message: 'No edges were provided; the nodes will be laid out as isolated blocks.',
      });
    }
    return { format: 'mermaid', content: buildNetworkSource(spec), warnings };
  }
  if (spec.shape === 'tree') {
    return { format: 'markdown', content: buildMindmapSource(spec), warnings };
  }
  if (spec.shape === 'sequence') {
    return { format: 'mermaid', content: buildSequenceSource(spec), warnings };
  }

  throw new ChartSpecError([
    {
      code: 'unsupported-kind',
      path: 'kind',
      message: `Chart kind "${spec.kind}" cannot be rendered as editable elements yet.`,
      hint: UNSUPPORTED_HINTS[spec.shape],
    },
  ]);
}
