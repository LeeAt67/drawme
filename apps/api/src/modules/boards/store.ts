import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
  BOARD_SCHEMA_VERSION,
  DEFAULT_BOARD_TITLE,
  type BoardRecord,
  type BoardStore,
  type BoardSummary,
  type SaveBoardInput,
} from './types';

type BoardFile = {
  version: number;
  boards: BoardRecord[];
};

const BOARD_FILE_VERSION = 1;
const RECORD_KEY_SEPARATOR = '\u0000';

function recordKey(workspaceId: string, ownerId: string, boardId: string): string {
  return `${workspaceId}${RECORD_KEY_SEPARATOR}${ownerId}${RECORD_KEY_SEPARATOR}${boardId}`;
}

function cloneRecord(record: BoardRecord): BoardRecord {
  return structuredClone(record);
}

function toSummary(record: BoardRecord): BoardSummary {
  return {
    id: record.id,
    title: record.title,
    schemaVersion: record.schemaVersion,
    revision: record.revision,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

abstract class BaseBoardStore implements BoardStore {
  protected readonly records = new Map<string, BoardRecord>();

  constructor(protected readonly now: () => number = Date.now) {}

  protected listRecords(workspaceId: string, ownerId: string): BoardSummary[] {
    return [...this.records.values()]
      .filter((record) => record.workspaceId === workspaceId && record.ownerId === ownerId)
      .sort((left, right) => right.updatedAt - left.updatedAt)
      .map((record) => toSummary(cloneRecord(record)));
  }

  protected getRecord(workspaceId: string, ownerId: string, boardId: string): BoardRecord | null {
    const record = this.records.get(recordKey(workspaceId, ownerId, boardId));
    return record ? cloneRecord(record) : null;
  }

  protected saveRecord(input: SaveBoardInput): BoardRecord {
    const key = recordKey(input.workspaceId, input.ownerId, input.boardId);
    const existing = this.records.get(key);
    const currentRevision = existing?.revision ?? 0;

    const timestamp = this.now();
    const record: BoardRecord = {
      id: input.boardId,
      workspaceId: input.workspaceId,
      ownerId: input.ownerId,
      title: input.title?.trim() || existing?.title || DEFAULT_BOARD_TITLE,
      schemaVersion: BOARD_SCHEMA_VERSION,
      revision: currentRevision + 1,
      content: structuredClone(input.content),
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    this.records.set(key, record);
    return cloneRecord(record);
  }

  abstract list(workspaceId: string, ownerId: string): Promise<BoardSummary[]>;
  abstract get(workspaceId: string, ownerId: string, boardId: string): Promise<BoardRecord | null>;
  abstract save(input: SaveBoardInput): Promise<BoardRecord>;
}

export class InMemoryBoardStore extends BaseBoardStore {
  async list(workspaceId: string, ownerId: string): Promise<BoardSummary[]> {
    return this.listRecords(workspaceId, ownerId);
  }

  async get(workspaceId: string, ownerId: string, boardId: string): Promise<BoardRecord | null> {
    return this.getRecord(workspaceId, ownerId, boardId);
  }

  async save(input: SaveBoardInput): Promise<BoardRecord> {
    return this.saveRecord(input);
  }
}

export class FileBoardStore extends BaseBoardStore {
  private loaded = false;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly filePath: string,
    now: () => number = Date.now
  ) {
    super(now);
  }

  async list(workspaceId: string, ownerId: string): Promise<BoardSummary[]> {
    return this.runExclusive(async () => {
      await this.ensureLoaded();
      return this.listRecords(workspaceId, ownerId);
    });
  }

  async get(workspaceId: string, ownerId: string, boardId: string): Promise<BoardRecord | null> {
    return this.runExclusive(async () => {
      await this.ensureLoaded();
      return this.getRecord(workspaceId, ownerId, boardId);
    });
  }

  async save(input: SaveBoardInput): Promise<BoardRecord> {
    return this.runExclusive(async () => {
      await this.ensureLoaded();
      const record = this.saveRecord(input);
      await this.persist();
      return record;
    });
  }

  private runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation, operation);
    this.queue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) {
      return;
    }

    try {
      const rawFile = await readFile(this.filePath, 'utf8');
      const parsedFile = JSON.parse(rawFile) as unknown;
      if (!isBoardFile(parsedFile)) {
        throw new Error('Board data file is corrupted.');
      }
      for (const record of parsedFile.boards) {
        this.records.set(recordKey(record.workspaceId, record.ownerId, record.id), record);
      }
    } catch (error) {
      if (!isMissingFileError(error)) {
        throw error;
      }
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const payload: BoardFile = {
      version: BOARD_FILE_VERSION,
      boards: [...this.records.values()],
    };
    const temporaryPath = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    await rename(temporaryPath, this.filePath);
  }
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  );
}

function isBoardFile(value: unknown): value is BoardFile {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const file = value as Partial<BoardFile>;
  return (
    file.version === BOARD_FILE_VERSION &&
    Array.isArray(file.boards) &&
    file.boards.every((record) => isBoardRecord(record))
  );
}

function isBoardRecord(value: unknown): value is BoardRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Partial<BoardRecord>;
  return (
    typeof record.id === 'string' &&
    typeof record.workspaceId === 'string' &&
    typeof record.ownerId === 'string' &&
    typeof record.title === 'string' &&
    typeof record.schemaVersion === 'number' &&
    typeof record.revision === 'number' &&
    typeof record.createdAt === 'number' &&
    typeof record.updatedAt === 'number' &&
    Boolean(record.content) &&
    typeof record.content === 'object' &&
    Array.isArray(record.content?.children)
  );
}
