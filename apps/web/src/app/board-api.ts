export const BOARD_API_BASE_PATH = '/api/boards';
export const MAIN_BOARD_ID = 'main';
export const MAIN_BOARD_TITLE = 'Main board';

export type BoardContent = {
  children: unknown[];
  viewport?: unknown;
  theme?: unknown;
  [key: string]: unknown;
};

export type BoardSnapshot = {
  id: string;
  title: string;
  schemaVersion: number;
  revision: number;
  content: BoardContent;
  createdAt: number;
  updatedAt: number;
};

export type BoardFetchResult =
  | { status: 'ok'; board: BoardSnapshot }
  | { status: 'missing' }
  | { status: 'unauthorized' };

export type SaveBoardInput = {
  boardId?: string;
  title?: string;
  content: BoardContent;
};

export class BoardApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'BoardApiError';
  }
}

type ErrorBody = {
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

async function readResponseBody(response: Response): Promise<unknown> {
  let rawBody = '';
  try {
    rawBody = await response.text();
  } catch {
    return null;
  }
  if (!rawBody) {
    return null;
  }
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return null;
  }
}

function toBoardApiError(body: unknown, status: number): BoardApiError {
  const error = (body as ErrorBody | null)?.error;
  const code = typeof error?.code === 'string' && error.code ? error.code : 'request_failed';
  const message =
    typeof error?.message === 'string' && error.message
      ? error.message
      : `Board request failed with status ${status}.`;
  return new BoardApiError(status, code, message);
}

function normalizeBoard(value: unknown): BoardSnapshot | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const content = record.content;
  if (!content || typeof content !== 'object') {
    return null;
  }
  const children = (content as Record<string, unknown>).children;
  if (
    typeof record.id !== 'string' ||
    !record.id ||
    typeof record.title !== 'string' ||
    typeof record.schemaVersion !== 'number' ||
    typeof record.revision !== 'number' ||
    !Number.isInteger(record.revision) ||
    record.revision < 1 ||
    typeof record.createdAt !== 'number' ||
    typeof record.updatedAt !== 'number' ||
    !Array.isArray(children)
  ) {
    return null;
  }
  return {
    id: record.id,
    title: record.title,
    schemaVersion: record.schemaVersion,
    revision: record.revision,
    content: content as BoardContent,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function boardEndpoint(boardId: string): string {
  return `${BOARD_API_BASE_PATH}/${encodeURIComponent(boardId)}`;
}

export async function fetchBoard(
  boardId: string = MAIN_BOARD_ID,
  fetchImpl: typeof fetch = fetch
): Promise<BoardFetchResult> {
  const response = await fetchImpl(boardEndpoint(boardId), {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });
  const body = await readResponseBody(response);
  if (response.status === 401) {
    return { status: 'unauthorized' };
  }
  if (response.status === 404) {
    return { status: 'missing' };
  }
  if (!response.ok) {
    throw toBoardApiError(body, response.status);
  }
  const board = normalizeBoard((body as { board?: unknown } | null)?.board);
  if (!board) {
    throw new BoardApiError(
      response.status,
      'invalid_response',
      'The server returned an invalid board.'
    );
  }
  return { status: 'ok', board };
}

export async function saveBoard(
  input: SaveBoardInput,
  fetchImpl: typeof fetch = fetch
): Promise<BoardSnapshot> {
  const boardId = input.boardId ?? MAIN_BOARD_ID;
  const response = await fetchImpl(boardEndpoint(boardId), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      title: input.title ?? MAIN_BOARD_TITLE,
      content: input.content,
    }),
  });
  const body = await readResponseBody(response);
  if (!response.ok) {
    throw toBoardApiError(body, response.status);
  }
  const board = normalizeBoard((body as { board?: unknown } | null)?.board);
  if (!board) {
    throw new BoardApiError(
      response.status,
      'invalid_response',
      'The server returned an invalid board.'
    );
  }
  return board;
}
