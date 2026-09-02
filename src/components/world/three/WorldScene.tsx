'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

import type { ScenePalette } from '@/components/hero3d/core/palette';
import type { SceneQuality } from '@/components/hero3d/core/quality';
import { WorldSlotContext } from '@/components/hero3d/core/slot';
import { sceneComponents } from '@/components/hero3d/sceneRegistry';
import type { DesignSystemId } from '@/design-system';

import { worldNodes } from '../core/graph';
import type { WorldTheme } from '../core/types';

import { CameraRig } from './CameraRig';
import { INTERACTIVE_LAYER } from './geometry';
import { NodeDetail } from './NodeDetail';
import { WorldConnections } from './WorldConnections';
import { WorldCore } from './WorldCore';
import { WorldEnvironment } from './WorldEnvironment';
import { WorldNodeMesh } from './WorldNodeMesh';
import { WorldParticles } from './WorldParticles';
import { useWorldLayout } from './useWorldLayout';

type SceneProps = {
  readonly design: DesignSystemId;
  readonly theme: WorldTheme;
  readonly palette: ScenePalette;
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
};

/**
 * The design system's own scene, demoted to the far environment of the world.
 * It keeps its geometry, its animation and its identity; it gives up the
 * canvas, the camera and the fog. Fifty scenes, still one WebGL context.
 */
function WorldBackdrop({ design, palette, quality, reducedMotion }: SceneProps) {
  const Scene = sceneComponents[design];

  // Distance and scale are paired so the scene keeps the angular size it was
  // composed for: the same picture, just further away.
  return (
    <group position={[0, 0, -17]} scale={2.8}>
      <WorldSlotContext.Provider value={true}>
        <Scene quality={quality} reducedMotion={reducedMotion} palette={palette} />
      </WorldSlotContext.Provider>
    </group>
  );
}

export function WorldScene(props: SceneProps) {
  const { palette, quality, reducedMotion, theme } = props;
  const raycaster = useThree((state) => state.raycaster);

  // Only the node hit volumes opt into this layer, so a pointer move tests six
  // spheres instead of every instance in the environment.
  useEffect(() => {
    raycaster.layers.set(INTERACTIVE_LAYER);
  }, [raycaster]);

  const layout = useWorldLayout();
  const parts = { theme, palette, quality, reducedMotion };

  return (
    <>
      <fog attach="fog" args={[palette.bg, 22, 78]} />

      <CameraRig layout={layout} reducedMotion={reducedMotion} />

      {quality === 'low' ? null : <WorldBackdrop {...props} />}

      <group position={[...layout.offset]} scale={layout.scale}>
        <WorldEnvironment theme={theme} palette={palette} quality={quality} />
        <WorldCore theme={theme} palette={palette} reducedMotion={reducedMotion} />
        <WorldConnections {...parts} />

        {theme.motes === 'none' || quality === 'low' ? null : (
          <WorldParticles {...parts} />
        )}

        {worldNodes.map((node) => (
          <WorldNodeMesh key={node.id} node={node} {...parts} />
        ))}

        {worldNodes.map((node) => (
          <NodeDetail key={`${node.id}-detail`} node={node} {...parts} />
        ))}
      </group>
    </>
  );
}
