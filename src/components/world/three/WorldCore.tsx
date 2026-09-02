'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader, type Group, type Texture } from 'three';

import type { ScenePalette } from '@/components/hero3d/core/palette';
import { portraitFor, useDesignSystemId } from '@/design-system';

import { getSnapshot } from '../core/exploration-store';
import type { WorldTheme } from '../core/types';

import { damp } from './damp';

type CoreProps = {
  readonly theme: WorldTheme;
  readonly palette: ScenePalette;
  readonly reducedMotion: boolean;
};

const PLATE = { width: 1.5, height: 1.88 } as const;

/**
 * Loads the active theme's portrait and keeps exactly one on the GPU: the
 * previous texture is released the moment its replacement is ready, and the
 * last one is released on unmount. The state is keyed by URL, so a texture is
 * never rendered after it has been disposed.
 */
function usePortraitTexture(url: string | null): Texture | null {
  const [loaded, setLoaded] = useState<{ url: string; texture: Texture } | null>(null);
  const held = useRef<Texture | null>(null);

  useEffect(() => {
    if (!url) return;

    let live = true;

    new TextureLoader().load(
      url,
      (result) => {
        if (!live) {
          result.dispose();
          return;
        }

        result.colorSpace = SRGBColorSpace;
        held.current?.dispose();
        held.current = result;
        setLoaded({ url, texture: result });
      },
      undefined,
      () => {
        // A missing portrait is a gap in the artwork, not a broken world.
      },
    );

    return () => {
      live = false;
    };
  }, [url]);

  useEffect(
    () => () => {
      held.current?.dispose();
      held.current = null;
    },
    [],
  );

  return loaded && loaded.url === url ? loaded.texture : null;
}

/**
 * The centre of the world is the person. The active design system's portrait
 * hangs here as a plate; where a theme has no portrait the plate stays, lit in
 * the theme's own accent, so the composition never collapses.
 */
export function WorldCore({ theme, palette, reducedMotion }: CoreProps) {
  const design = useDesignSystemId();
  const group = useRef<Group>(null);
  const portrait = useMemo(() => portraitFor(design), [design]);
  const texture = usePortraitTexture(portrait?.about ?? null);

  useFrame((state, delta) => {
    const rig = group.current;
    if (!rig) return;

    const dt = Math.min(delta, 0.05);
    const { active } = getSnapshot();
    const focused = active === 'about';

    rig.scale.setScalar(damp(rig.scale.x, focused ? 1.28 : 1, 6, dt));

    if (reducedMotion) return;

    const t = state.clock.elapsedTime;
    rig.position.y = Math.sin(t * 0.5) * 0.08;
    rig.rotation.y = damp(rig.rotation.y, Math.sin(t * 0.24) * 0.16, 3, dt);
  });

  return (
    <group ref={group} position={[0, 0.75, 0]}>
      <mesh>
        <planeGeometry args={[PLATE.width, PLATE.height]} />
        {/* Keyed on the texture: a material that gains a map after it was
            compiled without one keeps rendering flat, so this asks for a fresh
            instance instead of mutating the old one. */}
        <meshBasicMaterial
          key={texture ? texture.uuid : 'plain'}
          map={texture}
          color={texture ? '#ffffff' : palette.surfaceHigh}
          toneMapped={false}
          transparent
        />
      </mesh>

      {/* The frame reads differently per dialect without a second model. */}
      <mesh position={[0, 0, -0.08]}>
        <planeGeometry args={[PLATE.width + 0.09, PLATE.height + 0.09]} />
        <meshBasicMaterial
          color={theme.surface === 'glow' ? palette.accent : palette.border}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh position={[0, -PLATE.height / 2 - 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.01, 6, 48]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
