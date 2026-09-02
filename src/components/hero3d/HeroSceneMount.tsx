'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

import { useDesignSystemId } from '@/design-system';
import { WorldBoundary } from '@/components/world/three/WorldBoundary';

import type { SceneQuality } from './core/quality';
import styles from './HeroScene.module.scss';

const WorldCanvas = dynamic(() => import('@/components/world/three/WorldCanvas'), {
  ssr: false,
});

type MountProps = {
  /** False when the device, the theme's mobile policy or WebGL says no. */
  readonly live: boolean;
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
  readonly onReady: () => void;
  readonly onFail: () => void;
};

/**
 * The WebGL half of the hero. It stays a separate mount from the exploration
 * overlay on purpose: three.js is code-split behind this boundary, only loads
 * when the hero is near the viewport, and can fail without taking anything
 * readable down with it.
 */
export function HeroSceneMount({
  live,
  quality,
  reducedMotion,
  onReady,
  onFail,
}: MountProps) {
  const design = useDesignSystemId();
  const container = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setNear(Boolean(entry?.isIntersecting)),
      { rootMargin: '200px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={container}
      className={styles.stage}
      data-scene-slot
      data-scene={design}
      data-bleed
      aria-hidden="true"
    >
      {live && near ? (
        <WorldBoundary onFail={onFail}>
          <WorldCanvas
            quality={quality}
            reducedMotion={reducedMotion}
            onReady={onReady}
          />
        </WorldBoundary>
      ) : null}
    </div>
  );
}
