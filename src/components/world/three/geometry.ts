'use client';

import { useEffect } from 'react';
import {
  BoxGeometry,
  CircleGeometry,
  ConeGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  TorusGeometry,
  type BufferGeometry,
} from 'three';

import type { SceneQuality } from '@/components/hero3d/core/quality';

import type { WorldDialect } from '../core/types';

/** Interactive objects also live on this layer so the raycaster can ignore the
 * environment entirely — one ring test instead of walking the backdrop. */
export const INTERACTIVE_LAYER = 1;

function segments(quality: SceneQuality, high: number, low: number): number {
  if (quality === 'high') return high;
  if (quality === 'medium') return Math.max(low, Math.round(high * 0.65));
  return low;
}

export function createNodeGeometry(
  shape: WorldDialect['node'],
  radius: number,
  quality: SceneQuality,
): BufferGeometry {
  switch (shape) {
    case 'box':
      return new BoxGeometry(radius * 1.5, radius * 1.5, radius * 1.5);
    case 'octahedron':
      return new OctahedronGeometry(radius, quality === 'low' ? 0 : 1);
    case 'ring':
      return new TorusGeometry(
        radius,
        radius * 0.3,
        segments(quality, 16, 8),
        segments(quality, 40, 16),
      );
    case 'crystal':
      return new ConeGeometry(radius, radius * 2.4, segments(quality, 6, 4), 1);
    case 'plate':
      return new CircleGeometry(radius * 1.25, segments(quality, 48, 12));
    case 'sphere':
    default:
      return new IcosahedronGeometry(radius, quality === 'high' ? 3 : 1);
  }
}

/** A thin ring that reads as focus, not as furniture. */
export function createHaloGeometry(radius: number, quality: SceneQuality): TorusGeometry {
  return new TorusGeometry(
    radius * 1.7,
    radius * 0.045,
    quality === 'low' ? 4 : 8,
    segments(quality, 56, 24),
  );
}

/**
 * Geometry built imperatively is disposed imperatively. Every world primitive
 * that allocates on the GPU releases it when the theme, the quality tier or the
 * component changes — the fifty-theme switcher makes this non-optional.
 */
export function useDisposable<T extends { dispose: () => void }>(resource: T): T {
  useEffect(() => () => resource.dispose(), [resource]);
  return resource;
}
