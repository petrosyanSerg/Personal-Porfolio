'use client';

import { useEffect, useRef, useState } from 'react';

import { useDesignSystem } from '@/design-system';
import { useDeviceCapability } from '@/hooks/useDeviceCapability';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

import { useScenePalette } from './core/palette';
import { resolveQuality } from './core/quality';
import { sceneComponents } from './sceneRegistry';
import styles from './HeroScene.module.scss';

export function HeroSceneMount() {
  const design = useDesignSystem();
  const capability = useDeviceCapability();
  const reducedMotion = usePrefersReducedMotion();
  const palette = useScenePalette();
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

  const smallDevice = capability === 'low';
  const allowed =
    capability !== 'none' && !(smallDevice && design.scene.mobile === 'disabled');

  const Scene = sceneComponents[design.id];
  const quality = allowed
    ? resolveQuality(capability, design.scene, reducedMotion)
    : 'low';

  return (
    <div
      ref={container}
      className={styles.stage}
      data-scene-slot
      data-scene={design.id}
      data-bleed
      aria-hidden="true"
    >
      {allowed && near ? (
        <Scene quality={quality} reducedMotion={reducedMotion} palette={palette} />
      ) : null}
    </div>
  );
}
