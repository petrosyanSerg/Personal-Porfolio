import { THEME_STORAGE_KEY, themes, type Theme } from './theme';

export type { Theme };

const listeners = new Set<() => void>();

function isTheme(value: string | null): value is Theme {
  return value !== null && (themes as readonly string[]).includes(value);
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function getSnapshot(): Theme {
  const attribute = document.documentElement.getAttribute('data-theme');
  return isTheme(attribute) ? attribute : 'dark';
}

export function getServerSnapshot(): Theme {
  return 'dark';
}

export function nextTheme(current: Theme): Theme {
  const index = themes.indexOf(current);
  return themes[(index + 1) % themes.length] ?? 'dark';
}

function persist(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage — the choice still applies to this visit.
  }
}

function apply(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  listeners.forEach((listener) => listener());
}

type StartViewTransition = (callback: () => void) => { ready: Promise<void> };

export function setTheme(theme: Theme, origin?: { x: number; y: number }): void {
  persist(theme);

  const doc = document as Document & { startViewTransition?: StartViewTransition };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!doc.startViewTransition || reduced || !origin) {
    apply(theme);
    return;
  }

  const root = document.documentElement;
  root.style.setProperty('--theme-origin-x', `${origin.x}px`);
  root.style.setProperty('--theme-origin-y', `${origin.y}px`);
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );
  root.style.setProperty('--theme-origin-r', `${radius}px`);
  root.dataset.themeTransition = 'true';

  const transition = doc.startViewTransition(() => apply(theme));
  void transition.ready.finally(() => {
    window.setTimeout(() => {
      delete root.dataset.themeTransition;
    }, 600);
  });
}
