'use client';

import { useSyncExternalStore } from 'react';

import { subscribe as subscribeDesign } from '@/design-system/core/design-store';
import { subscribe as subscribeTheme } from '@/lib/theme-store';

export type ScenePalette = {
  readonly bg: string;
  readonly surface: string;
  readonly surfaceHigh: string;
  readonly border: string;
  readonly text: string;
  readonly textMuted: string;
  readonly accent: string;
  readonly accentText: string;
  readonly teal: string;
};

const ROLES = [
  ['bg', '--color-bg', '#0a0b0f'],
  ['surface', '--color-surface', '#12141c'],
  ['surfaceHigh', '--color-surface-3', '#212533'],
  ['border', '--color-border-strong', '#333a4f'],
  ['text', '--color-text', '#eaecf2'],
  ['textMuted', '--color-text-muted', '#848ca0'],
  ['accent', '--color-accent', '#5b7cff'],
  ['accentText', '--color-accent-text', '#93a9ff'],
  ['teal', '--color-teal', '#35d8c4'],
] as const satisfies readonly (readonly [keyof ScenePalette, string, string])[];

function build(read: (variable: string, fallback: string) => string): ScenePalette {
  const palette = {} as Record<keyof ScenePalette, string>;

  for (const [role, variable, fallback] of ROLES) {
    palette[role] = read(variable, fallback);
  }

  return palette as ScenePalette;
}

const SERVER: ScenePalette = build((_variable, fallback) => fallback);

function readFromDocument(variable: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

  if (value === '') return fallback;

  if (value.includes('/')) return value.replace(/\s*\/\s*[\d.]+%?\s*\)/, ')');
  return value;
}

let cache: { key: string; palette: ScenePalette } | null = null;

function getSnapshot(): ScenePalette {
  const root = document.documentElement;
  const key = `${root.getAttribute('data-theme') ?? 'dark'}:${
    root.getAttribute('data-design') ?? 'aurora'
  }`;

  if (cache?.key !== key) {
    cache = { key, palette: build(readFromDocument) };
  }

  return cache.palette;
}

function getServerSnapshot(): ScenePalette {
  return SERVER;
}

function subscribe(callback: () => void): () => void {
  const offTheme = subscribeTheme(callback);
  const offDesign = subscribeDesign(callback);

  return () => {
    offTheme();
    offDesign();
  };
}

export function useScenePalette(): ScenePalette {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
