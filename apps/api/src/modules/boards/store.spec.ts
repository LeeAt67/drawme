import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { FileBoardStore, InMemoryBoardStore } from './store';

const temporaryDirectories: string[] = [];

async function createTemporaryStore(): Promise<{ store: FileBoardStore; filePath: string }> {
  const directory = await mkdtemp(join(tmpdir(), 'drawme-boards-'));
  temporaryDirectories.push(directory);
  const filePath = join(directory, 'boards.json');
  return { store: new FileBoardStore(filePath, () => 1_000), filePath };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true }))
  );
});

describe('board stores', () => {
  it('creates and updates a board with incremented revisions', async () => {
    const store = new InMemoryBoardStore(() => 1_000);
    const created = await store.save({
      workspaceId: 'workspace_a',
      ownerId: 'owner_a',
      boardId: 'main',
      content: { children: [] },
    });

    expect(created.revision).toBe(1);
    expect(created.schemaVersion).toBe(1);

    const updated = await store.save({
      workspaceId: 'workspace_a',
      ownerId: 'owner_a',
      boardId: 'main',
      content: { children: [{ id: 'node-1' }] },
    });

    expect(updated.revision).toBe(2);
    expect(updated.createdAt).toBe(1_000);
    expect(updated.content.children).toEqual([{ id: 'node-1' }]);
  });

  it('overwrites with the latest write', async () => {
    const store = new InMemoryBoardStore();
    await store.save({
      workspaceId: 'workspace_a',
      ownerId: 'owner_a',
      boardId: 'main',
      content: { children: [] },
    });

    const overwritten = await store.save({
      workspaceId: 'workspace_a',
      ownerId: 'owner_a',
      boardId: 'main',
      content: { children: [{ id: 'node-2' }] },
    });

    expect(overwritten.revision).toBe(2);
    expect(overwritten.content.children).toEqual([{ id: 'node-2' }]);
  });

  it('isolates boards by workspace and owner', async () => {
    const store = new InMemoryBoardStore();
    await store.save({
      workspaceId: 'workspace_a',
      ownerId: 'owner_a',
      boardId: 'main',
      content: { children: [] },
    });

    await expect(store.get('workspace_b', 'owner_a', 'main')).resolves.toBeNull();
    await expect(store.get('workspace_a', 'owner_b', 'main')).resolves.toBeNull();
  });

  it('persists boards across store instances', async () => {
    const { store, filePath } = await createTemporaryStore();
    await store.save({
      workspaceId: 'workspace_a',
      ownerId: 'owner_a',
      boardId: 'main',
      title: 'Persistent board',
      content: { children: [{ id: 'node-1' }] },
    });

    const reloadedStore = new FileBoardStore(filePath);
    const reloaded = await reloadedStore.get('workspace_a', 'owner_a', 'main');

    expect(reloaded?.title).toBe('Persistent board');
    expect(reloaded?.revision).toBe(1);
    expect(reloaded?.content.children).toEqual([{ id: 'node-1' }]);
  });
});
