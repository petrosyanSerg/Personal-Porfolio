'use client';

import { createContext, useContext } from 'react';

/**
 * True while a theme scene is being rendered *inside* the exploration world's
 * canvas rather than as a standalone background. In that mode the scene keeps
 * its geometry and its animation but gives up ownership of the canvas, the
 * camera and the fog — the world owns those.
 */
export const WorldSlotContext = createContext(false);

export function useInWorldSlot(): boolean {
  return useContext(WorldSlotContext);
}
