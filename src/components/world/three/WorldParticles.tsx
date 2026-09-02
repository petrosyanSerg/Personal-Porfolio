'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, type Points } from 'three';

import type { ScenePalette } from '@/components/hero3d/core/palette';
import { count as scaleCount, type SceneQuality } from '@/components/hero3d/core/quality';

import { srand } from '@/components/hero3d/core/motion';
import type { WorldTheme } from '../core/types';

import { useDisposable } from './geometry';

type ParticleProps = {
  readonly theme: WorldTheme;
  readonly palette: ScenePalette;
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
};

const SPREAD = 11;

/** Atmosphere, not decoration: the motes give the world depth cues so the
 * camera moves read as travel rather than as a zoom. */
export function WorldParticles({
  theme,
  palette,
  quality,
  reducedMotion,
}: ParticleProps) {
  const points = useRef<Points>(null);

  const total = scaleCount(quality, theme.motes === 'spark' ? 220 : 150);

  const geometry = useDisposable(
    useMemo(() => {
      const positions = new Float32Array(total * 3);
      const snap = theme.motes === 'grid' ? 1.1 : 0;

      for (let i = 0; i < total; i += 1) {
        const x = srand(i * 1.13) * SPREAD;
        const y = srand(i * 2.71) * SPREAD * 0.6;
        const z = srand(i * 3.97) * SPREAD * 0.55 - 2;

        positions[i * 3] = snap ? Math.round(x / snap) * snap : x;
        positions[i * 3 + 1] = snap ? Math.round(y / snap) * snap : y;
        positions[i * 3 + 2] = snap ? Math.round(z / snap) * snap : z;
      }

      const buffer = new BufferGeometry();
      buffer.setAttribute('position', new BufferAttribute(positions, 3));
      return buffer;
    }, [total, theme.motes]),
  );

  useFrame((state) => {
    const field = points.current;
    if (!field || reducedMotion) return;

    const t = state.clock.elapsedTime;

    if (theme.motes === 'grid') {
      field.rotation.y = 0;
      field.position.y = ((t * 0.28) % 1.1) - 0.55;
    } else {
      field.rotation.y = t * (theme.motes === 'spark' ? 0.045 : 0.018);
      field.position.y = Math.sin(t * 0.22) * 0.35;
    }
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color={theme.motes === 'spark' ? palette.teal : palette.accentText}
        size={theme.motes === 'spark' ? 0.05 : 0.075}
        sizeAttenuation
        transparent
        opacity={theme.motes === 'grid' ? 0.5 : 0.34}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}
