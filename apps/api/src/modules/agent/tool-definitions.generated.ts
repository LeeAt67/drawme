/**
 * AUTO-GENERATED FILE. Do not edit by hand.
 * Source: packages/drawnix/src/agent/tools/registry.ts
 * Regenerate: npm run sync:agent-tools
 */
export const AGENT_TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'create_chart',
      description:
        'Create an editable diagram from a structured chart spec. Prefer this tool for every new diagram: it validates the spec and returns structured errors you can fix. Use nodes/edges for flowcharts, root for mind maps, actors/messages for sequence diagrams.',
      parameters: {
        type: 'object',
        properties: {
          kind: {
            type: 'string',
            enum: [
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
            ],
            description:
              'Semantic chart type. network kinds render as flowcharts, tree kinds as mind maps, sequence kinds as sequence diagrams. timeline/matrix/data kinds are not editable yet.',
          },
          title: {
            type: 'string',
            description: 'Short human-readable title (max 120 characters).',
          },
          layout: {
            type: 'object',
            properties: {
              direction: {
                type: 'string',
                enum: ['TB', 'LR', 'RL', 'BT'],
                description: 'Flow direction for network charts.',
              },
              density: {
                type: 'string',
                enum: ['compact', 'normal', 'roomy'],
              },
            },
            additionalProperties: false,
          },
          nodes: {
            type: 'array',
            maxItems: 80,
            description:
              'Required for network kinds (flowchart, state, er, class, dependency, org, architecture).',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Stable id using letters, digits, _ or -.',
                },
                label: {
                  type: 'string',
                },
                shape: {
                  type: 'string',
                  enum: ['rect', 'round', 'diamond', 'circle', 'cylinder', 'hexagon'],
                },
                group: {
                  type: 'string',
                  description: 'Optional group id, must be declared in groups.',
                },
                note: {
                  type: 'string',
                },
              },
              required: ['id', 'label'],
              additionalProperties: false,
            },
          },
          edges: {
            type: 'array',
            maxItems: 160,
            description: 'Required for network kinds. from/to must reference node ids.',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                },
                to: {
                  type: 'string',
                },
                label: {
                  type: 'string',
                },
                style: {
                  type: 'string',
                  enum: ['solid', 'dashed'],
                },
                arrow: {
                  type: 'string',
                  enum: ['forward', 'both', 'none'],
                },
              },
              required: ['from', 'to'],
              additionalProperties: false,
            },
          },
          groups: {
            type: 'array',
            maxItems: 20,
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
                label: {
                  type: 'string',
                },
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          root: {
            type: 'object',
            properties: {
              label: {
                type: 'string',
                description: 'Short node text (max 80 characters).',
              },
              note: {
                type: 'string',
                description: 'Optional secondary line shown under the label.',
              },
              children: {
                type: 'array',
                maxItems: 24,
                description: 'Nested child nodes. Keep the tree at most 4 levels deep.',
                items: {
                  type: 'object',
                  properties: {
                    label: {
                      type: 'string',
                      description: 'Short node text (max 80 characters).',
                    },
                    note: {
                      type: 'string',
                      description: 'Optional secondary line shown under the label.',
                    },
                    children: {
                      type: 'array',
                      maxItems: 24,
                      description: 'Nested child nodes. Keep the tree at most 4 levels deep.',
                      items: {
                        type: 'object',
                        properties: {
                          label: {
                            type: 'string',
                            description: 'Short node text (max 80 characters).',
                          },
                          note: {
                            type: 'string',
                            description: 'Optional secondary line shown under the label.',
                          },
                          children: {
                            type: 'array',
                            maxItems: 24,
                            description: 'Nested child nodes. Keep the tree at most 4 levels deep.',
                            items: {
                              type: 'object',
                              properties: {
                                label: {
                                  type: 'string',
                                  description: 'Short node text (max 80 characters).',
                                },
                                note: {
                                  type: 'string',
                                  description: 'Optional secondary line shown under the label.',
                                },
                              },
                              required: ['label'],
                            },
                          },
                        },
                        required: ['label'],
                      },
                    },
                  },
                  required: ['label'],
                },
              },
            },
            required: ['label'],
            description: 'Required for tree kinds (mindmap, outline, taxonomy).',
          },
          actors: {
            type: 'array',
            maxItems: 20,
            description: 'Required for sequence charts.',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
                label: {
                  type: 'string',
                },
                kind: {
                  type: 'string',
                  enum: ['actor', 'system', 'database'],
                },
              },
              required: ['id', 'label'],
              additionalProperties: false,
            },
          },
          messages: {
            type: 'array',
            maxItems: 60,
            description: 'Required for sequence charts. from/to must reference actor ids.',
            items: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                },
                to: {
                  type: 'string',
                },
                label: {
                  type: 'string',
                },
                style: {
                  type: 'string',
                  enum: ['sync', 'async', 'return'],
                },
              },
              required: ['from', 'to', 'label'],
              additionalProperties: false,
            },
          },
          unit: {
            type: 'string',
            enum: ['day', 'week', 'month', 'quarter'],
            description: 'Required for timeline kinds (not editable yet).',
          },
          events: {
            type: 'array',
            maxItems: 60,
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
                label: {
                  type: 'string',
                },
                start: {
                  type: 'string',
                },
                end: {
                  type: 'string',
                },
                milestone: {
                  type: 'boolean',
                },
                group: {
                  type: 'string',
                },
              },
              required: ['id', 'label', 'start'],
              additionalProperties: false,
            },
          },
          columns: {
            type: 'array',
            maxItems: 12,
            items: {
              type: 'string',
            },
            description: 'Required for matrix kinds.',
          },
          rows: {
            type: 'array',
            maxItems: 30,
            items: {
              type: 'object',
              properties: {
                label: {
                  type: 'string',
                },
                cells: {
                  type: 'array',
                  items: {
                    type: ['string', 'null'],
                  },
                },
              },
              required: ['label', 'cells'],
              additionalProperties: false,
            },
          },
          categories: {
            type: 'array',
            maxItems: 24,
            items: {
              type: 'string',
            },
            description: 'Required for data kinds.',
          },
          series: {
            type: 'array',
            maxItems: 8,
            items: {
              type: 'object',
              properties: {
                label: {
                  type: 'string',
                },
                values: {
                  type: 'array',
                  items: {
                    type: 'number',
                  },
                },
                type: {
                  type: 'string',
                  enum: ['bar', 'line', 'area'],
                },
              },
              required: ['label', 'values'],
              additionalProperties: false,
            },
          },
        },
        required: ['kind'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_diagram',
      description:
        'Escape hatch: insert a diagram from raw Mermaid or Markdown source. Only use it when create_chart cannot express the request (gantt, ER, class diagrams with methods, or the user pasted their own source).',
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
            description:
              'Valid Mermaid or Markdown source. Do not wrap the source in a code fence.',
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
  },
  {
    type: 'function',
    function: {
      name: 'inspect_board',
      description:
        'Read the current whiteboard before changing it. Returns element counts and a flat list of elements with their type and label. Use this when the user refers to existing content ("this chart", "the selected box") instead of guessing.',
      parameters: {
        type: 'object',
        properties: {
          scope: {
            type: 'string',
            enum: ['summary', 'selection', 'all'],
            description:
              'summary returns counts only, selection returns selected elements, all returns every element.',
          },
          limit: {
            type: 'integer',
            description: 'Maximum number of elements to list (default 40, max 80).',
          },
        },
        additionalProperties: false,
      },
    },
  },
] as const;
