'use client';

import { useCallback, useState } from 'react';

import { HeroSceneMount } from '@/components/hero3d/HeroSceneMount';

import { useWorldRuntime } from './core/useWorldRuntime';
import { ExplorationOverlay } from './ui/ExplorationOverlay';

/**
 * The hero's interactive layer, assembled.
 *
 * Two halves, deliberately independent: a WebGL world that can be absent, and
 * an HTML exploration layer that never is. The overlay is told whether the
 * canvas is live so it can position itself against real nodes — but every
 * destination in it works either way.
 */
export function ExplorationWorld() {
  const { live, quality, reducedMotion } = useWorldRuntime();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const onReady = useCallback(() => setReady(true), []);
  const onFail = useCallback(() => setFailed(true), []);

  const rendering = live && !failed;

  return (
    <>
      <HeroSceneMount
        live={rendering}
        quality={quality}
        reducedMotion={reducedMotion}
        onReady={onReady}
        onFail={onFail}
      />

      <ExplorationOverlay live={rendering && ready} loading={rendering && !ready} />
    </>
  );
}
