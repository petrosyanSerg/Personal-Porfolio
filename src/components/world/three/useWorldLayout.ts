'use client';

import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';

import { hasCapability, useDesignSystem } from '@/design-system';

import { worldLayout, type WorldLayout } from '../core/layout';

/** Room the exploration bar needs at the foot of the visible area. */
const BAR_RESERVE = 150;

/** Room the themes that carry an instrument readout need at the top right. */
const READOUT_RESERVE = 190;

const MIN_BAND = 240;

/**
 * The canvas fills the hero, but the hero is often taller than the screen and
 * some themes park a readout in the top corner. This measures the band that is
 * actually free on arrival and hands it to the layout, so the world composes
 * into what the visitor can see and use rather than into the element it happens
 * to be drawn on.
 */
export function useWorldLayout(): WorldLayout {
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const design = useDesignSystem();

  return useMemo(() => {
    const canvasTop = gl.domElement.getBoundingClientRect().top + window.scrollY;
    const top = hasCapability(design.id, 'system-readout') ? READOUT_RESERVE : 0;

    const fold = window.innerHeight - canvasTop - BAR_RESERVE;
    const band = Math.max(MIN_BAND, Math.min(size.height - top, fold - top));

    return worldLayout({
      width: size.width,
      height: size.height,
      top,
      band,
      composition: design.hero,
    });
  }, [gl, size.width, size.height, design]);
}
