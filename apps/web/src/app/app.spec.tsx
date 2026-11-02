import { StrictMode } from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './app';

const drawnixHandle = vi.hoisted(() => ({
  props: {} as Record<string, unknown>,
  pendingInitialChange: null as unknown,
  initialChangeDelayMs: 0,
}));

vi.mock('@drawme/drawnix', () => ({
  AUTH_CHANGED_EVENT: 'drawme:auth-changed',
  Drawnix: (props: Record<string, unknown>) => {
    drawnixHandle.props = props;
    const initialChange = drawnixHandle.pendingInitialChange;
    if (initialChange) {
      drawnixHandle.pendingInitialChange = null;
      setTimeout(
        () => (props.onChange as (value: unknown) => void)(initialChange),
        drawnixHandle.initialChangeDelayMs
      );
    }
    return null;
  },
  fetchCurrentUser: async () => ({
    id: 'user_local',
    email: 'local@drawme.local',
    displayName: 'Local user',
  }),
}));

vi.mock('localforage', () => {
  const store = new Map<string, unknown>();
  return {
    default: {
      INDEXEDDB: 'INDEXEDDB',
      LOCALSTORAGE: 'LOCALSTORAGE',
      config: () => undefined,
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: unknown) => {
        store.set(key, value);
      },
    },
  };
});

type BoardContent = { children: unknown[] };

type FakeServer = {
  fetch: typeof fetch;
  posts: BoardContent[];
  revision: () => number;
  content: () => BoardContent | null;
  seed: (content: BoardContent) => void;
  setLatency: (ms: number) => void;
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const createFakeServer = (): FakeServer => {
  const posts: BoardContent[] = [];
  let revision = 0;
  let saved: BoardContent | null = null;
  let latencyMs = 5;
  const wait = () => new Promise((resolve) => setTimeout(resolve, latencyMs));
  const toBoard = () => ({
    id: 'main',
    title: 'Main board',
    schemaVersion: 1,
    revision,
    content: saved ?? { children: [] },
    createdAt: 1,
    updatedAt: 2,
  });

  const fetchImpl = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    await wait();
    if ((init?.method ?? 'GET') === 'GET') {
      if (!saved) {
        return jsonResponse(
          { error: { code: 'board_not_found', message: 'Board not found.' } },
          404
        );
      }
      return jsonResponse({ board: toBoard() });
    }
    const body = JSON.parse(String(init?.body ?? '{}')) as { content: BoardContent };
    posts.push(body.content);
    saved = body.content;
    revision += 1;
    return jsonResponse({ board: toBoard() });
  }) as typeof fetch;

  return {
    fetch: fetchImpl,
    posts,
    revision: () => revision,
    content: () => saved,
    seed: (content) => {
      saved = content;
      revision = 1;
    },
    setLatency: (ms) => {
      latencyMs = ms;
    },
  };
};

describe('App board sync', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    drawnixHandle.pendingInitialChange = null;
    drawnixHandle.initialChangeDelayMs = 0;
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('saves the remote board only once when StrictMode mounts twice', async () => {
    const server = createFakeServer();
    vi.stubGlobal('fetch', server.fetch);

    render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    await waitFor(() => expect(server.posts.length).toBeGreaterThan(0));
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(server.posts).toHaveLength(1);
    expect(server.revision()).toBe(1);
  });

  it('posts local edits after the debounce window', async () => {
    const server = createFakeServer();
    vi.stubGlobal('fetch', server.fetch);

    render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    await waitFor(() => expect(server.revision()).toBe(1));

    const onChange = drawnixHandle.props.onChange as (value: unknown) => void;
    act(() => {
      onChange({ children: [{ id: 'edited' }] });
    });

    await waitFor(() => expect(server.posts).toHaveLength(2), { timeout: 4000 });

    expect(server.revision()).toBe(2);
    expect(server.content()).toEqual({ children: [{ id: 'edited' }] });
  });

  it('ignores mount-time changes until the server snapshot is loaded', async () => {
    const server = createFakeServer();
    server.seed({ children: [{ id: 'server-node' }] });
    server.setLatency(60);
    vi.stubGlobal('fetch', server.fetch);
    drawnixHandle.pendingInitialChange = { children: [] };
    drawnixHandle.initialChangeDelayMs = 20;

    render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    await waitFor(() => expect(server.revision()).toBe(1));
    await new Promise((resolve) => setTimeout(resolve, 1200));

    expect(server.posts).toHaveLength(0);
    expect(server.content()).toEqual({ children: [{ id: 'server-node' }] });
  });
});
