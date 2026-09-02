'use client';

import { useEffect, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { NoToneMapping } from 'three';

import { useInWorldSlot } from './core/slot';
import type { ScenePalette } from './core/palette';
import type { SceneQuality } from './core/quality';

export type SceneProps = {
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
  readonly palette: ScenePalette;
};

type CanvasProps = SceneProps & {
  readonly camera: { position: [number, number, number]; fov: number };
  readonly fog?: [number, number];
  readonly fogColor?: string;
  readonly shadows?: boolean;
  readonly children: ReactNode;
};

function Settle() {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    let frame = 0;
    let handle = 0;

    const tick = () => {
      invalidate();
      if (++frame < 3) handle = requestAnimationFrame(tick);
    };

    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [invalidate]);

  return null;
}

export function HeroCanvas({
  camera,
  fog,
  fogColor,
  shadows = false,
  quality,
  reducedMotion,
  palette,
  children,
}: CanvasProps) {
  const inWorld = useInWorldSlot();

  // Inside the world the scene is the far environment: one canvas, one camera,
  // one fog band, and no second WebGL context to pay for.
  if (inWorld) return <>{children}</>;

  return (
    <Canvas
      shadows={shadows && quality === 'high'}
      frameloop={reducedMotion ? 'demand' : 'always'}
      dpr={quality === 'high' ? [1, 2] : quality === 'medium' ? [1, 1.6] : [1, 1.25]}
      camera={{ position: camera.position, fov: camera.fov, near: 0.1, far: 120 }}
      gl={{
        antialias: quality === 'high',
        alpha: true,
        powerPreference: 'low-power',
        toneMapping: NoToneMapping,
      }}
      style={{ background: 'transparent' }}
    >
      {fog ? <fog attach="fog" args={[fogColor ?? palette.bg, ...fog]} /> : null}
      {reducedMotion ? <Settle /> : null}
      {children}
    </Canvas>
  );
}
