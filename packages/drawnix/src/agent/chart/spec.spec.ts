import { describe, expect, it } from 'vitest';
import { KIND_TO_SHAPE, resolveChartShape } from './spec';
import type { ChartKind, ChartShape } from './spec';

const ALL_KINDS: ChartKind[] = [
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
];

const ALL_SHAPES: ChartShape[] = ['network', 'tree', 'sequence', 'timeline', 'matrix', 'data'];

describe('chart spec', () => {
  it('maps every kind to a known shape', () => {
    const mappedKinds = Object.keys(KIND_TO_SHAPE) as ChartKind[];
    expect(mappedKinds.sort()).toEqual([...ALL_KINDS].sort());
    for (const kind of ALL_KINDS) {
      expect(ALL_SHAPES).toContain(KIND_TO_SHAPE[kind]);
    }
  });

  it('covers every shape with at least one kind', () => {
    const usedShapes = new Set(Object.values(KIND_TO_SHAPE));
    expect([...usedShapes].sort()).toEqual([...ALL_SHAPES].sort());
  });

  it('resolves shape through resolveChartShape', () => {
    expect(resolveChartShape('flowchart')).toBe('network');
    expect(resolveChartShape('mindmap')).toBe('tree');
    expect(resolveChartShape('sequence')).toBe('sequence');
    expect(resolveChartShape('gantt')).toBe('timeline');
    expect(resolveChartShape('swot')).toBe('matrix');
    expect(resolveChartShape('pie')).toBe('data');
  });
});
