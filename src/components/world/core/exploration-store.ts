'use client';

import { isWorldNodeId, type WorldNodeId } from './types';

export type ExplorationPhase = 'idle' | 'exploring' | 'focused' | 'returning';

export type ExplorationState = {
  readonly phase: ExplorationPhase;
  /** The node the camera is flying to or resting on. */
  readonly active: WorldNodeId | null;
  readonly hovered: WorldNodeId | null;
  readonly visited: readonly WorldNodeId[];
};

export type ExplorationAction =
  | { readonly type: 'hover'; readonly id: WorldNodeId | null }
  | { readonly type: 'focus'; readonly id: WorldNodeId }
  | { readonly type: 'release' }
  /** The camera reached its pose. Only the rig sends this. */
  | { readonly type: 'settle' };

export const initialExploration: ExplorationState = {
  phase: 'idle',
  active: null,
  hovered: null,
  visited: [],
};

/**
 * One transition table for the whole experience. Every visual state in the
 * world and in the overlay is read from this — there are no parallel booleans
 * to fall out of sync.
 */
export function reduce(
  state: ExplorationState,
  action: ExplorationAction,
): ExplorationState {
  switch (action.type) {
    case 'hover': {
      if (state.hovered === action.id) return state;
      if (state.phase === 'focused' || state.phase === 'returning') {
        return { ...state, hovered: action.id };
      }
      return {
        ...state,
        hovered: action.id,
        phase: action.id === null ? 'idle' : 'exploring',
      };
    }

    case 'focus': {
      if (state.phase === 'focused' && state.active === action.id) return state;
      return {
        phase: 'focused',
        active: action.id,
        hovered: action.id,
        visited: state.visited.includes(action.id)
          ? state.visited
          : [...state.visited, action.id],
      };
    }

    case 'release': {
      if (state.active === null && state.phase !== 'focused') return state;
      return { ...state, phase: 'returning', active: null };
    }

    case 'settle': {
      if (state.phase !== 'returning') return state;
      return { ...state, phase: state.hovered === null ? 'idle' : 'exploring' };
    }
  }
}

const HASH_PREFIX = 'explore-';

let state: ExplorationState = initialExploration;
const listeners = new Set<() => void>();

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function getSnapshot(): ExplorationState {
  return state;
}

export function getServerSnapshot(): ExplorationState {
  return initialExploration;
}

function writeHash(next: ExplorationState, previous: ExplorationState): void {
  if (next.active === previous.active) return;
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const owned = url.hash.startsWith(`#${HASH_PREFIX}`);

  if (next.active) url.hash = `${HASH_PREFIX}${next.active}`;
  else if (owned) url.hash = '';
  else return;

  window.history.replaceState(window.history.state, '', url.href.replace(/#$/, ''));
}

export function dispatch(action: ExplorationAction): void {
  const next = reduce(state, action);
  if (next === state) return;

  const previous = state;
  state = next;
  writeHash(next, previous);
  listeners.forEach((listener) => listener());
}

export function hoverNode(id: WorldNodeId | null): void {
  dispatch({ type: 'hover', id });
}

export function focusNode(id: WorldNodeId): void {
  dispatch({ type: 'focus', id });
}

export function releaseNode(): void {
  dispatch({ type: 'release' });
}

export function settleCamera(): void {
  dispatch({ type: 'settle' });
}

export function toggleNode(id: WorldNodeId): void {
  if (state.phase === 'focused' && state.active === id) releaseNode();
  else focusNode(id);
}

/** `#explore-projects` opens the world already focused on projects. */
export function nodeFromHash(hash: string): WorldNodeId | null {
  const value = hash.replace(/^#/, '');
  if (!value.startsWith(HASH_PREFIX)) return null;

  const id = value.slice(HASH_PREFIX.length);
  return isWorldNodeId(id) ? id : null;
}

export function adoptHash(hash: string): void {
  const id = nodeFromHash(hash);
  if (id) focusNode(id);
  else if (state.active !== null) releaseNode();
}

/** Test seam: the module store is a singleton for the life of the page. */
export function resetExploration(): void {
  state = initialExploration;
  listeners.forEach((listener) => listener());
}
