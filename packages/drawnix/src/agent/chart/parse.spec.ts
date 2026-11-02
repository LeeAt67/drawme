import { describe, expect, it } from 'vitest';
import { ChartSpecError, parseChartSpec } from './parse';

describe('parseChartSpec', () => {
  it('normalizes a network spec', () => {
    const spec = parseChartSpec({
      kind: 'flowchart',
      title: '  Login flow  ',
      layout: { direction: 'LR' },
      nodes: [
        { id: 'start', label: 'Start', shape: 'round' },
        { id: 'check', label: 'Valid?', shape: 'diamond' },
        { id: 'end', label: 'Done' },
      ],
      edges: [
        { from: 'start', to: 'check' },
        { from: 'check', to: 'end', label: 'yes' },
      ],
    });

    expect(spec.version).toBe(1);
    expect(spec.shape).toBe('network');
    expect(spec.title).toBe('Login flow');
    expect(spec.layout?.direction).toBe('LR');
    if (spec.shape === 'network') {
      expect(spec.nodes).toHaveLength(3);
      expect(spec.edges[1].label).toBe('yes');
    }
  });

  it('reports the path of an unknown edge target', () => {
    try {
      parseChartSpec({
        kind: 'flowchart',
        nodes: [{ id: 'a', label: 'A' }],
        edges: [{ from: 'a', to: 'missing' }],
      });
      throw new Error('expected parseChartSpec to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ChartSpecError);
      const problems = (error as ChartSpecError).problems;
      expect(problems[0].code).toBe('invalid-node-ref');
      expect(problems[0].path).toBe('edges[0].to');
    }
  });

  it('rejects matrix rows whose cell count does not match the columns', () => {
    expect(() =>
      parseChartSpec({
        kind: 'swot',
        columns: ['S', 'W', 'O', 'T'],
        rows: [{ label: 'Product', cells: ['fast', 'costly'] }],
      })
    ).toThrow(ChartSpecError);

    try {
      parseChartSpec({
        kind: 'swot',
        columns: ['S', 'W'],
        rows: [{ label: 'Product', cells: ['fast'] }],
      });
    } catch (error) {
      expect((error as ChartSpecError).problems[0].code).toBe('invalid-range');
      expect((error as ChartSpecError).problems[0].path).toBe('rows[0].cells');
    }
  });

  it('rejects unknown kinds and empty payloads', () => {
    expect(() => parseChartSpec({ kind: 'sankey' })).toThrow(ChartSpecError);
    expect(() => parseChartSpec({ kind: 'mindmap' })).toThrow(ChartSpecError);
  });

  it('caps tree depth and requires a root', () => {
    expect(() => parseChartSpec({ kind: 'mindmap', root: { label: 'Root' } })).not.toThrow();
    expect(() => parseChartSpec({ kind: 'mindmap' })).toThrow(ChartSpecError);
  });
});
