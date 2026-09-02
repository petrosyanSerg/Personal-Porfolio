'use client';

import { useDesignSystem } from '@/design-system';
import type { DesignFamily, DesignSystem, DesignSystemId } from '@/design-system';

import type { WorldDialect, WorldTheme } from './types';

/**
 * Eight dialects, one per design family. This is the whole reason there is a
 * single world implementation instead of fifty: a design system contributes
 * configuration, not a scene.
 */
const byFamily: Readonly<Record<DesignFamily, WorldDialect>> = {
  classical: {
    node: 'plate',
    surface: 'solid',
    link: 'line',
    motes: 'none',
    ground: 'plane',
    light: 'studio',
    motion: 'float',
    weight: 1,
  },
  ornamental: {
    node: 'octahedron',
    surface: 'wire',
    link: 'line',
    motes: 'drift',
    ground: 'plane',
    light: 'dramatic',
    motion: 'float',
    weight: 1.05,
  },
  atmospheric: {
    node: 'sphere',
    surface: 'glow',
    link: 'beam',
    motes: 'drift',
    ground: 'horizon',
    light: 'ambient',
    motion: 'float',
    weight: 1,
  },
  modernist: {
    node: 'box',
    surface: 'flat',
    link: 'line',
    motes: 'none',
    ground: 'grid',
    light: 'flat',
    motion: 'still',
    weight: 1.12,
  },
  retro: {
    node: 'box',
    surface: 'wire',
    link: 'dashed',
    motes: 'grid',
    ground: 'grid',
    light: 'flat',
    motion: 'pulse',
    weight: 1.08,
  },
  digital: {
    node: 'octahedron',
    surface: 'glow',
    link: 'beam',
    motes: 'spark',
    ground: 'grid',
    light: 'ambient',
    motion: 'pulse',
    weight: 0.96,
  },
  expressive: {
    node: 'crystal',
    surface: 'solid',
    link: 'line',
    motes: 'spark',
    ground: 'none',
    light: 'dramatic',
    motion: 'orbit',
    weight: 1.15,
  },
  domestic: {
    node: 'sphere',
    surface: 'solid',
    link: 'line',
    motes: 'drift',
    ground: 'plane',
    light: 'studio',
    motion: 'float',
    weight: 1.02,
  },
};

/**
 * Where a world wants to speak for itself. Small deltas only — anything that
 * needs more than this belongs in the family dialect above.
 */
const overrides: Readonly<Partial<Record<DesignSystemId, Partial<WorldDialect>>>> = {
  neoclassical: { node: 'ring', ground: 'plane', motion: 'still' },
  cybercore: { node: 'box', surface: 'wire', motes: 'grid', ground: 'grid' },
  'pixel-art': { node: 'box', surface: 'flat', link: 'dashed', motion: 'pulse' },
  aurora: { motes: 'drift', ground: 'horizon', link: 'beam' },
  brutalism: { node: 'box', surface: 'flat', link: 'line', motes: 'none', weight: 1.3 },
  'neo-brutalism': { node: 'box', surface: 'flat', motes: 'none', weight: 1.26 },
  bauhaus: { node: 'ring', surface: 'flat', ground: 'grid' },
  synthwave: { node: 'box', surface: 'glow', ground: 'grid', link: 'beam' },
  vaporwave: { node: 'plate', surface: 'glow', ground: 'grid' },
  y2k: { node: 'sphere', surface: 'glow', motes: 'spark' },
  glassmorphism: { node: 'plate', surface: 'glow', ground: 'none' },
  gothic: { node: 'crystal', surface: 'wire', light: 'dramatic' },
  tenebrism: { light: 'dramatic', motes: 'none', ground: 'none' },
  steampunk: { node: 'ring', surface: 'solid', link: 'line' },
  japandi: { node: 'sphere', surface: 'solid', motes: 'none', motion: 'still' },
  'wabi-sabi': { node: 'sphere', surface: 'solid', motes: 'none' },
  memphis: { node: 'crystal', surface: 'flat', motes: 'spark', motion: 'orbit' },
  kawaii: { node: 'sphere', surface: 'solid', motion: 'orbit' },
  'conceptual-sketch': { surface: 'wire', link: 'dashed', motes: 'none' },
  utilitarian: { node: 'box', surface: 'flat', link: 'dashed', ground: 'grid' },
  'bento-box': { node: 'box', surface: 'flat', ground: 'grid', motion: 'still' },
  'modular-typography': { node: 'box', surface: 'flat', ground: 'grid' },
  rebus: { node: 'box', surface: 'flat', motes: 'none' },
  'luxury-typography': { node: 'plate', surface: 'solid', motes: 'none' },
  ethereal: { motes: 'drift', light: 'ambient', ground: 'horizon' },
  pointillism: { motes: 'spark', surface: 'glow' },
  'frutiger-aero': { node: 'sphere', surface: 'glow', motes: 'drift' },
  nautical: { node: 'ring', link: 'line', ground: 'horizon' },
  'wild-west': { node: 'crystal', surface: 'solid', ground: 'horizon' },
  'mystical-western': { node: 'crystal', surface: 'wire', light: 'dramatic' },
  graffiti: { node: 'crystal', surface: 'flat', motes: 'spark' },
  'pop-art': { node: 'sphere', surface: 'flat', weight: 1.2 },
  surrealism: { node: 'crystal', surface: 'glow', motion: 'orbit' },
  scrapbook: { node: 'plate', surface: 'flat', motion: 'orbit' },
  'mixed-media': { node: 'plate', surface: 'solid', motes: 'spark' },
  kitsch: { node: 'crystal', surface: 'glow', motes: 'spark' },
};

export function worldThemeFor(design: DesignSystem): WorldTheme {
  return { id: design.id, ...byFamily[design.family], ...overrides[design.id] };
}

export function useWorldTheme(): WorldTheme {
  return worldThemeFor(useDesignSystem());
}
