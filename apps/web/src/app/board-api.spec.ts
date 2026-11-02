import { describe, expect, it, vi } from 'vitest';
import {
  BOARD_API_BASE_PATH,
  BoardApiError,
  MAIN_BOARD_ID,
  fetchBoard,
  saveBoard,
} from './board-api';

const createJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  }) as unknown as Response;

const boardRecord = {
  id: MAIN_BOARD_ID,
  title: 'Main board',
  schemaVersion: 1,
  revision: 2,
  content: { children: [] },
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_100,
};

describe('board API client', () => {
  it('reads a board with same-origin credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({ board: boardRecord }));

    const result = await fetchBoard(MAIN_BOARD_ID, fetchMock as unknown as typeof fetch);

    expect(result).toEqual({ status: 'ok', board: boardRecord });
    expect(fetchMock).toHaveBeenCalledWith(`${BOARD_API_BASE_PATH}/${MAIN_BOARD_ID}`, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });
  });

  it('maps 401 and 404 to signed-out and missing states', async () => {
    const unauthorized = vi
      .fn()
      .mockResolvedValue(
        createJsonResponse({ error: { code: 'authentication_required', message: 'Sign in.' } }, 401)
      );
    const missing = vi
      .fn()
      .mockResolvedValue(
        createJsonResponse({ error: { code: 'board_not_found', message: 'Missing.' } }, 404)
      );

    await expect(
      fetchBoard(MAIN_BOARD_ID, unauthorized as unknown as typeof fetch)
    ).resolves.toEqual({ status: 'unauthorized' });
    await expect(fetchBoard(MAIN_BOARD_ID, missing as unknown as typeof fetch)).resolves.toEqual({
      status: 'missing',
    });
  });

  it('saves a board and returns the new snapshot', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ board: { ...boardRecord, revision: 3 } }));

    const saved = await saveBoard(
      { content: { children: [] } },
      fetchMock as unknown as typeof fetch
    );

    expect(saved.revision).toBe(3);
    expect(fetchMock).toHaveBeenCalledWith(`${BOARD_API_BASE_PATH}/${MAIN_BOARD_ID}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        title: 'Main board',
        content: { children: [] },
      }),
    });
  });

  it('maps server failures to a board API error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse(
        {
          error: {
            code: 'board_store_unavailable',
            message: 'Board storage is unavailable.',
          },
        },
        503
      )
    );

    const error = await saveBoard(
      { content: { children: [] } },
      fetchMock as unknown as typeof fetch
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(BoardApiError);
    expect((error as BoardApiError).status).toBe(503);
    expect((error as BoardApiError).code).toBe('board_store_unavailable');
  });

  it('rejects invalid board payloads', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ board: { ...boardRecord, revision: 0 } }));

    const error = await fetchBoard(MAIN_BOARD_ID, fetchMock as unknown as typeof fetch).catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(BoardApiError);
    expect((error as BoardApiError).code).toBe('invalid_response');
  });
});
