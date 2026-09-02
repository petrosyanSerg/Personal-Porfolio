'use client';

import { useEffect, useSyncExternalStore } from 'react';

import {
  adoptHash,
  getServerSnapshot,
  getSnapshot,
  subscribe,
  type ExplorationState,
} from './exploration-store';

export function useExploration(): ExplorationState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Deep links both ways: an arriving `#explore-<node>` opens that node, and the
 * browser's back/forward buttons move through the world with the visitor.
 */
export function useHashDeepLink(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    adoptHash(window.location.hash);

    const onHashChange = () => adoptHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
    };
  }, [enabled]);
}
