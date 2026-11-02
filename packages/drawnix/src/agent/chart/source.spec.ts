import { describe, expect, it } from 'vitest';
import { ChartSpecError, parseChartSpec } from './parse';
import { buildChartSource } from './source';

describe('buildChartSource', () => {
  it('emits a mermaid flowchart for network charts', () => {
    const spec = parseChartSpec({
      kind: 'architecture',
      layout: { direction: 'LR' },
      nodes: [
        { id: 'web', label: 'Web', shape: 'round', group: 'client' },
        { id: 'api', label: 'API', shape: 'hexagon', group: 'server' },
        { id: 'db', label: 'Postgres', shape: 'cylinder', group: 'server' },
      ],
      groups: [
        { id: 'client', label: 'Client' },
        { id: 'server', label: 'Server' },
      ],
      edges: [
        { from: 'web', to: 'api', label: 'HTTPS' },
        { from: 'api', to: 'db', style: 'dashed', arrow: 'both' },
      ],
    });

    const source = buildChartSource(spec);
    expect(source.format).toBe('mermaid');
    expect(source.content).toContain('flowchart LR');
    expect(source.content).toContain('subgraph client["Client"]');
    expect(source.content).toContain('web("Web")');
    expect(source.content).toContain('api{{"API"}}');
    expect(source.content).toContain('db[("Postgres")]');
    expect(source.content).toContain('web -->|"HTTPS"| api');
    expect(source.content).toContain('api <-.-> db');
  });

  it('emits markdown for tree charts', () => {
    const spec = parseChartSpec({
      kind: 'mindmap',
      root: {
        label: 'Launch',
        children: [{ label: 'Design', children: [{ label: 'Wireframes' }] }, { label: 'Build' }],
      },
    });

    const source = buildChartSource(spec);
    expect(source.format).toBe('markdown');
    const lines = source.content.split('\n');
    expect(lines[0]).toBe('# Launch');
    expect(lines).toContain('- Design');
    expect(lines).toContain('  - Wireframes');
    expect(lines).toContain('- Build');
  });

  it('emits a sequence diagram with arrow styles', () => {
    const spec = parseChartSpec({
      kind: 'sequence',
      actors: [
        { id: 'user', label: 'User', kind: 'actor' },
        { id: 'api', label: 'API', kind: 'system' },
        { id: 'db', label: 'DB', kind: 'database' },
      ],
      messages: [
        { from: 'user', to: 'api', label: 'POST /orders' },
        { from: 'api', to: 'db', label: 'insert', style: 'async' },
        { from: 'api', to: 'user', label: '201 Created', style: 'return' },
      ],
    });

    const source = buildChartSource(spec);
    expect(source.format).toBe('mermaid');
    expect(source.content).toContain('sequenceDiagram');
    expect(source.content).toContain('actor user as User');
    expect(source.content).toContain('participant api as API');
    expect(source.content).toContain('user->>api: POST /orders');
    expect(source.content).toContain('api-)db: insert');
    expect(source.content).toContain('api-->>user: 201 Created');
  });

  it('returns a structured error for shapes that are not editable yet', () => {
    const spec = parseChartSpec({
      kind: 'gantt',
      unit: 'week',
      events: [{ id: 'm1', label: 'Kickoff', start: '2026-01-05' }],
    });

    try {
      buildChartSource(spec);
      throw new Error('expected buildChartSource to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ChartSpecError);
      const problem = (error as ChartSpecError).problems[0];
      expect(problem.code).toBe('unsupported-kind');
      expect(problem.hint).toContain('create_diagram');
    }
  });
});
