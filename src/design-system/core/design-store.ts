'use client';

import {
  DESIGN_ATTRIBUTE,
  DESIGN_SESSION_KEY,
  DESIGN_STORAGE_KEY,
  defaultDesignSystem,
} from './runtime';
import { isDesignSystemId, type DesignSystemId } from './types';

const listeners = new Set<() => void>();

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function getSnapshot(): DesignSystemId {
  const value = document.documentElement.getAttribute(DESIGN_ATTRIBUTE);
  return isDesignSystemId(value) ? value : defaultDesignSystem;
}

export function getServerSnapshot(): DesignSystemId {
  return defaultDesignSystem;
}

function persist(id: DesignSystemId): void {
  try {
    localStorage.setItem(DESIGN_STORAGE_KEY, id);
  } catch {
    // Private mode or blocked storage — the choice still applies to this visit.
  }

  try {
    sessionStorage.setItem(DESIGN_SESSION_KEY, id);
  } catch {
    // Same again, and less consequential: this key is only a cache.
  }
}

type StartViewTransition = (callback: () => void) => { ready: Promise<void> };

const ANCHOR_BAND = 160;

type Anchor = { element: Element; offset: number };

function captureAnchor(): Anchor | null {
  const candidates = document.querySelectorAll('main [id], main > section');
  let anchor: Anchor | null = null;

  for (const element of candidates) {
    const offset = element.getBoundingClientRect().top;
    if (offset > ANCHOR_BAND) continue;
    if (!anchor || offset > anchor.offset) anchor = { element, offset };
  }

  return anchor;
}

const ANCHOR_STABLE_FRAMES = 3;
const ANCHOR_MIN_WATCH_MS = 700;
const ANCHOR_MAX_FRAMES = 120;
const ANCHOR_TIMEOUT_MS = 6000;

function settleAnchor(anchor: Anchor | null): void {
  if (!anchor) return;

  const started = performance.now();
  const deadline = started + ANCHOR_TIMEOUT_MS;
  let stable = 0;
  let frames = 0;
  let expected = window.scrollY;

  const step = () => {
    frames += 1;

    if (Math.abs(window.scrollY - expected) > 2) return;
    if (!anchor.element.isConnected) return;

    const drift = anchor.element.getBoundingClientRect().top - anchor.offset;

    if (Math.abs(drift) < 1) {
      stable += 1;
      const watchedLongEnough = performance.now() - started >= ANCHOR_MIN_WATCH_MS;
      if (stable >= ANCHOR_STABLE_FRAMES && watchedLongEnough) return;
    } else {
      stable = 0;
      window.scrollTo({ top: window.scrollY + drift, behavior: 'instant' });
      expected = window.scrollY;
    }

    if (frames < ANCHOR_MAX_FRAMES && performance.now() < deadline) {
      requestAnimationFrame(step);
    }
  };

  step();
}

export function setDesignSystem(id: DesignSystemId): void {
  persist(id);

  const root = document.documentElement;
  const doc = document as Document & { startViewTransition?: StartViewTransition };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const anchor = captureAnchor();

  const apply = () => {
    root.setAttribute(DESIGN_ATTRIBUTE, id);
    listeners.forEach((listener) => listener());
  };

  if (!doc.startViewTransition || reduced) {
    apply();
    settleAnchor(anchor);
    return;
  }

  root.dataset.designTransition = 'true';

  const transition = doc.startViewTransition(apply);

  void transition.ready
    .catch(() => {
      // Superseded. `apply` has already run, so there is nothing to undo.
    })
    .finally(() => {
      settleAnchor(anchor);

      window.setTimeout(() => {
        delete root.dataset.designTransition;
      }, 700);
    });
}
