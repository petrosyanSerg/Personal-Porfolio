'use client';

import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { NoToneMapping } from 'three';

import { useScenePalette } from '@/components/hero3d/core/palette';
import type { SceneQuality } from '@/components/hero3d/core/quality';
import { useDesignSystemId } from '@/design-system';

import { releaseNode } from '../core/exploration-store';
import { clearAnchors } from '../core/projection';
import { useWorldTheme } from '../core/worldTheme';

import { WorldScene } from './WorldScene';

type CanvasProps = {
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
  readonly onReady: () => void;
};

export default function WorldCanvas({ quality, reducedMotion, onReady }: CanvasProps) {
  const design = useDesignSystemId();
  const palette = useScenePalette();
  const theme = useWorldTheme();

  // Labels are positioned from the frame loop; when the canvas goes away they
  // have to stop claiming a position on screen.
  useEffect(() => clearAnchors, []);

  return (
    <Canvas
      frameloop={reducedMotion ? 'demand' : 'always'}
      dpr={quality === 'high' ? [1, 2] : quality === 'medium' ? [1, 1.6] : [1, 1.25]}
      camera={{ position: [0, 0.3, 13.8], fov: 42, near: 0.4, far: 220 }}
      gl={{
        antialias: quality === 'high',
        alpha: true,
        powerPreference: 'low-power',
        toneMapping: NoToneMapping,
      }}
      // R3F defaults the container to `touch-action: none`, which would take
      // the page's vertical scroll hostage on a phone.
      style={{ background: 'transparent', touchAction: 'pan-y' }}
      onCreated={onReady}
      onPointerMissed={() => releaseNode()}
    >
      <WorldScene
        design={design}
        theme={theme}
        palette={palette}
        quality={quality}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}
