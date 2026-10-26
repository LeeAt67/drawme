import type { AgentDiagramFormat } from './types';

export const CREATE_DIAGRAM_TOOL_NAME = 'create_diagram';

export const CREATE_DIAGRAM_TOOL_DEFINITION = {
  type: 'function',
  function: {
    name: CREATE_DIAGRAM_TOOL_NAME,
    description:
      'Create a diagram and insert it into the current whiteboard. Use Mermaid for processes, flows, systems and sequences. Use Markdown for mind maps and hierarchical outlines.',
    parameters: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['mermaid', 'markdown'],
          description: 'The source syntax used to generate the diagram.',
        },
        content: {
          type: 'string',
          description: 'Valid Mermaid or Markdown source. Do not wrap the source in a code fence.',
        },
        title: {
          type: 'string',
          description: 'A short human-readable title for the inserted diagram.',
        },
      },
      required: ['format', 'content'],
      additionalProperties: false,
    },
  },
} as const;

export type ParsedCreateDiagramArguments = {
  format: AgentDiagramFormat;
  content: string;
  title?: string;
};

function stripMarkdownCodeFence(value: string): string {
  const trimmedValue = value.trim();
  const fencedMatch = trimmedValue.match(/^```(?:mermaid|markdown|md)?\s*\n([\s\S]*?)\n```$/i);
  return fencedMatch ? fencedMatch[1].trim() : trimmedValue;
}

export function parseCreateDiagramArguments(rawArguments: unknown): ParsedCreateDiagramArguments {
  let parsedArguments: unknown = rawArguments;

  if (typeof rawArguments === 'string') {
    try {
      parsedArguments = JSON.parse(rawArguments);
    } catch {
      throw new Error('Tool arguments are not valid JSON.');
    }
  }

  if (!parsedArguments || typeof parsedArguments !== 'object') {
    throw new Error('Tool arguments must be an object.');
  }

  const { format, content, title } = parsedArguments as {
    format?: unknown;
    content?: unknown;
    title?: unknown;
  };

  if (format !== 'mermaid' && format !== 'markdown') {
    throw new Error('Diagram format must be either "mermaid" or "markdown".');
  }
  if (typeof content !== 'string') {
    throw new Error('Diagram content must be a string.');
  }

  const normalizedContent = stripMarkdownCodeFence(content);
  if (!normalizedContent) {
    throw new Error('Diagram content cannot be empty.');
  }
  if (normalizedContent.length > 20000) {
    throw new Error('Diagram content is too large.');
  }

  return {
    format,
    content: normalizedContent,
    title: typeof title === 'string' && title.trim() ? title.trim().slice(0, 120) : undefined,
  };
}
