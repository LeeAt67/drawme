import { describe, expect, it } from 'vitest';
import { hashSessionToken, InMemorySessionStore } from './session-store';

describe('InMemorySessionStore', () => {
  it('creates opaque sessions and looks them up by token', async () => {
    let now = 1_000;
    const store = new InMemorySessionStore(() => now);
    const created = await store.create('user-1', 5_000);

    expect(created.token).toHaveLength(43);
    expect(created.session.id).toBe(hashSessionToken(created.token));
    expect(created.session.id).not.toBe(created.token);
    expect(await store.get(created.token)).toEqual(created.session);
  });

  it('expires and deletes sessions', async () => {
    let now = 1_000;
    const store = new InMemorySessionStore(() => now);
    const created = await store.create('user-1', 5_000);

    now = 6_000;
    expect(await store.get(created.token)).toBeNull();

    const second = await store.create('user-1', 5_000);
    await store.delete(second.token);
    expect(await store.get(second.token)).toBeNull();
  });
});
