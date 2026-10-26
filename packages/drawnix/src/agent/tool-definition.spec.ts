import { describe, expect, it } from 'vitest';
import { parseCreateDiagramArguments } from './tool-definition';

describe('parseCreateDiagramArguments', () => {
  it('parses object arguments and trims the title', () => {
    expect(
      parseCreateDiagramArguments({
        format: 'mermaid',
        content: 'flowchart TD\n A --> B',
        title: '  Sign-up flow  ',
      })
    ).toEqual({
      format: 'mermaid',
      content: 'flowchart TD\n A --> B',
      title: 'Sign-up flow',
    });
  });

  it('parses JSON string arguments and strips a matching code fence', () => {
    expect(
      parseCreateDiagramArguments(
        JSON.stringify({
          format: 'mermaid',
          content: '```mermaid\nflowchart LR\n A --> B\n```',
        })
      )
    ).toEqual({
      format: 'mermaid',
      content: 'flowchart LR\n A --> B',
      title: undefined,
    });
  });

  it('strips markdown fences from mind-map content', () => {
    expect(
      parseCreateDiagramArguments({
        format: 'markdown',
        content: '```md\n# Product\n## API\n```',
      }).content
    ).toBe('# Product\n## API');
  });

  it('rejects invalid JSON, formats, content and sizes', () => {
    expect(() => parseCreateDiagramArguments('{invalid-json')).toThrow('not valid JSON');
    expect(() => parseCreateDiagramArguments({ format: 'plantuml', content: '@startuml' })).toThrow(
      'format'
    );
    expect(() => parseCreateDiagramArguments({ format: 'mermaid' })).toThrow('must be a string');
    expect(() => parseCreateDiagramArguments({ format: 'mermaid', content: '   ' })).toThrow(
      'cannot be empty'
    );
    expect(() =>
      parseCreateDiagramArguments({
        format: 'mermaid',
        content: 'A'.repeat(20001),
      })
    ).toThrow('too large');
  });

  it('caps long titles at 120 characters', () => {
    const parsed = parseCreateDiagramArguments({
      format: 'markdown',
      content: '# Topic',
      title: 'T'.repeat(150),
    });

    expect(parsed.title).toHaveLength(120);
  });
});
