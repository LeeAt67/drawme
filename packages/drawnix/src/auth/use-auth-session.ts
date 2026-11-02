import { useEffect, useSyncExternalStore } from 'react';
import { getAuthSnapshot, refreshAuthSession, subscribeAuth, type AuthSnapshot } from './session';

/**
 * Subscribes to the project-level session. The first mounted consumer
 * resolves the current user, so the top bar and the agent panel always agree.
 */
export function useAuthSession(): AuthSnapshot {
  const snapshot = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthSnapshot);

  useEffect(() => {
    if (snapshot.status === 'unknown') {
      void refreshAuthSession();
    }
  }, [snapshot.status]);

  return snapshot;
}
