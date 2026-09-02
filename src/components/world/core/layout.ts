import type { HeroComposition } from '@/design-system';

import type { Vec3 } from './types';

export type WorldLayout = {
  /** How large the world reads against the hero copy. */
  readonly scale: number;
  /** Where its centre sits, in world units, relative to the camera's axis. */
  readonly offset: Vec3;
  /** True when the composition puts the world beside the copy, not under it. */
  readonly wide: boolean;
};

export type LayoutFrame = {
  /** Canvas width, CSS pixels. */
  readonly width: number;
  /** Canvas height, CSS pixels — the whole hero, fold or no fold. */
  readonly height: number;
  /** Where the usable band starts, in pixels from the top of the canvas. */
  readonly top?: number;
  /** How tall that band is. Defaults to the rest of the canvas. */
  readonly band?: number;
  readonly composition?: HeroComposition;
};

/** Half the world height the camera takes in at its home distance. */
export const VIEW_EXTENT = 5.3;

/** The unscaled reach of the node graph, from `graph.ts`. */
const REACH = { x: 5.5, y: 3.3 } as const;

/**
 * Where the world sits in the frame, as a share of the half-frame. `width` is
 * its half-extent and `centre` how far off-axis it sits — tuned so the node
 * labels clear the hero copy, not just the nodes themselves.
 */
const FILL = {
  beside: { width: 0.36, height: 0.8, centre: 0.56 },
  edge: { width: 0.19, height: 0.62, centre: 0.73 },
  under: { width: 0.86, height: 0.42, centre: 0 },
} as const;

/**
 * Hero compositions whose copy claims the full measure — centred or edge to
 * edge. They leave no column to sit beside, so the world becomes a compact
 * instrument at the margin instead of a landscape.
 */
const FULL_MEASURE: ReadonlySet<HeroComposition> = new Set<HeroComposition>([
  'axial',
  'editorial',
  'poster',
  'modular',
]);

/**
 * The world composes into the band of the hero the visitor can actually use:
 * beside the copy on a desktop, beneath it on a phone, below whatever the theme
 * has parked at the top, and never past the edge of the frame. Hero heights
 * vary by a factor of two across the fifty design systems, so this is derived
 * on every resize rather than tuned per theme.
 */
export function worldLayout({
  width,
  height,
  top = 0,
  band,
  composition = 'atmospheric',
}: LayoutFrame): WorldLayout {
  const wide = width >= 900;
  const fill = !wide
    ? FILL.under
    : FULL_MEASURE.has(composition)
      ? FILL.edge
      : FILL.beside;

  const usable = Math.max(1, Math.min(band ?? height - top, height - top));
  const perPixel = height > 0 ? (2 * VIEW_EXTENT) / height : 0;

  const halfWidth = VIEW_EXTENT * (height > 0 ? width / height : 1.6);
  const halfBand = (usable * perPixel) / 2;

  // World y of the band's centre: the canvas centre is at zero and y grows up.
  const centreY = (height / 2 - (top + usable / 2)) * perPixel;

  const scale = Math.min(
    (fill.width * halfWidth) / REACH.x,
    (fill.height * halfBand) / REACH.y,
  );

  const offset: Vec3 = wide
    ? [fill.centre * halfWidth, centreY, 0]
    : [0, centreY - halfBand * 0.44, 0];

  return { scale, offset, wide };
}

export function placeInWorld(position: Vec3, layout: WorldLayout): Vec3 {
  return [
    position[0] * layout.scale + layout.offset[0],
    position[1] * layout.scale + layout.offset[1],
    position[2] * layout.scale + layout.offset[2],
  ];
}
