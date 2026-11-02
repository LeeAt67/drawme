export const BOARD_SCHEMA_VERSION = 1;
export const DEFAULT_WORKSPACE_ID = 'workspace_default';
export const DEFAULT_BOARD_ID = 'main';
export const DEFAULT_BOARD_TITLE = 'Main board';

export type BoardContent = {
  children: unknown[];
  viewport?: unknown;
  theme?: unknown;
  [key: string]: unknown;
};

export type BoardRecord = {
  id: string;
  workspaceId: string;
  ownerId: string;
  title: string;
  schemaVersion: number;
  revision: number;
  content: BoardContent;
  createdAt: number;
  updatedAt: number;
};

export type BoardSummary = Pick<
  BoardRecord,
  'id' | 'title' | 'schemaVersion' | 'revision' | 'createdAt' | 'updatedAt'
>;

export type SaveBoardInput = {
  workspaceId: string;
  ownerId: string;
  boardId: string;
  title?: string;
  content: BoardContent;
};

export interface BoardStore {
  list(workspaceId: string, ownerId: string): Promise<BoardSummary[]>;
  get(workspaceId: string, ownerId: string, boardId: string): Promise<BoardRecord | null>;
  save(input: SaveBoardInput): Promise<BoardRecord>;
}
