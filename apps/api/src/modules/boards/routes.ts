import type { FastifyInstance } from 'fastify';
import { ApiError } from '../../shared/errors';
import type { AuthGuard } from '../auth/guard';
import { boardIdSchema, saveBoardRequestSchema } from './schema';
import { DEFAULT_WORKSPACE_ID, type BoardRecord, type BoardStore } from './types';

export type RegisterBoardRoutesOptions = {
  requireAuth: AuthGuard;
  boardStore: BoardStore;
};

const BOARD_BODY_LIMIT = 2 * 1024 * 1024;

function toBoardResponse(record: BoardRecord) {
  return {
    id: record.id,
    title: record.title,
    schemaVersion: record.schemaVersion,
    revision: record.revision,
    content: record.content,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function getAuthContext(request: { authContext?: { user: { id: string } } }) {
  if (!request.authContext) {
    throw new ApiError(401, 'authentication_required', 'Sign in to continue.');
  }
  return request.authContext;
}

function parseBoardId(value: unknown): string {
  const parsed = boardIdSchema.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(400, 'invalid_request', 'Invalid board id.');
  }
  return parsed.data;
}

export async function registerBoardRoutes(
  app: FastifyInstance,
  { requireAuth, boardStore }: RegisterBoardRoutesOptions
): Promise<void> {
  app.get('/', { onRequest: requireAuth }, async (request) => {
    const auth = getAuthContext(request);
    const boards = await boardStore.list(DEFAULT_WORKSPACE_ID, auth.user.id);
    return { boards };
  });

  app.get('/:boardId', { onRequest: requireAuth }, async (request) => {
    const auth = getAuthContext(request);
    const boardId = parseBoardId((request.params as { boardId?: string }).boardId);
    const board = await boardStore.get(DEFAULT_WORKSPACE_ID, auth.user.id, boardId);
    if (!board) {
      throw new ApiError(404, 'board_not_found', 'Board not found.');
    }
    return { board: toBoardResponse(board) };
  });

  app.post(
    '/:boardId',
    { onRequest: requireAuth, bodyLimit: BOARD_BODY_LIMIT },
    async (request) => {
      const auth = getAuthContext(request);
      const boardId = parseBoardId((request.params as { boardId?: string }).boardId);
      const parsedBody = saveBoardRequestSchema.safeParse(request.body);
      if (!parsedBody.success) {
        const issue = parsedBody.error.issues[0];
        throw new ApiError(400, 'invalid_request', issue?.message || 'Invalid request body.');
      }

      const board = await boardStore.save({
        workspaceId: DEFAULT_WORKSPACE_ID,
        ownerId: auth.user.id,
        boardId,
        title: parsedBody.data.title,
        content: parsedBody.data.content,
      });
      return { board: toBoardResponse(board) };
    }
  );
}
