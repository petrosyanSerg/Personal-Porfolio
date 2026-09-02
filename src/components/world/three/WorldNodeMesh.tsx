'use client';

import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import {
  Color,
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
} from 'three';

import type { ScenePalette } from '@/components/hero3d/core/palette';
import type { SceneQuality } from '@/components/hero3d/core/quality';

import { getSnapshot, hoverNode, toggleNode } from '../core/exploration-store';
import { publishAnchor } from '../core/projection';
import type { WorldNode, WorldTheme } from '../core/types';

import { damp } from './damp';
import {
  createHaloGeometry,
  createNodeGeometry,
  INTERACTIVE_LAYER,
  useDisposable,
} from './geometry';

type NodeMaterial = MeshBasicMaterial | MeshStandardMaterial;

type NodeProps = {
  readonly node: WorldNode;
  readonly theme: WorldTheme;
  readonly palette: ScenePalette;
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
};

const RADIUS = 0.52;

/** Half the width of the widest node label, in CSS pixels. */
const LABEL_REACH = 96;

/**
 * Below this world scale the six labels would overlap each other — which
 * happens on the hero compositions whose copy claims the full measure. There
 * the constellation stays abstract and names itself on approach; the map in the
 * bar names everything, always.
 */
const LABEL_SCALE_MIN = 0.34;

function Surface({
  theme,
  color,
}: {
  readonly theme: WorldTheme;
  readonly color: string;
}) {
  switch (theme.surface) {
    case 'wire':
      return <meshBasicMaterial color={color} wireframe transparent />;
    case 'glow':
      return <meshBasicMaterial color={color} transparent toneMapped={false} />;
    case 'flat':
      return (
        <meshStandardMaterial
          color={color}
          flatShading
          roughness={0.95}
          metalness={0}
          transparent
        />
      );
    case 'solid':
    default:
      return (
        <meshStandardMaterial
          color={color}
          roughness={0.42}
          metalness={0.14}
          transparent
        />
      );
  }
}

export function WorldNodeMesh({
  node,
  theme,
  palette,
  quality,
  reducedMotion,
}: NodeProps) {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const lift = useRef(0);

  const radius = RADIUS * theme.weight;

  const geometry = useDisposable(
    useMemo(
      () => createNodeGeometry(theme.node, radius, quality),
      [theme.node, radius, quality],
    ),
  );

  const haloGeometry = useDisposable(
    useMemo(() => createHaloGeometry(radius, quality), [radius, quality]),
  );

  const colors = useMemo(
    () => ({
      rest: new Color(palette.textMuted).lerp(new Color(palette.accent), 0.45),
      live: new Color(palette.accent),
      dim: new Color(palette.textMuted),
      scratch: new Color(),
    }),
    [palette.accent, palette.textMuted],
  );

  const scratch = useMemo(() => ({ world: new Vector3(), projected: new Vector3() }), []);

  const seed = node.index * 1.7;

  useFrame((state, delta) => {
    const rig = group.current;
    const mesh = body.current;
    if (!rig || !mesh) return;

    const dt = Math.min(delta, 0.05);
    const { phase, active, hovered } = getSnapshot();

    const isActive = active === node.id;
    const isHovered = hovered === node.id;
    const someoneElse = active !== null && !isActive;

    const targetScale = isActive ? 0.55 : isHovered ? 1.15 : someoneElse ? 0.78 : 1;
    const targetLift = isActive ? 0.32 : isHovered ? 0.12 : 0;
    const targetHalo = isActive ? 0.95 : isHovered ? 0.6 : someoneElse ? 0 : 0.22;
    const targetOpacity = someoneElse ? 0.4 : 1;

    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    const float =
      theme.motion === 'still' || reducedMotion
        ? 0
        : theme.motion === 'pulse'
          ? Math.sin(t * 1.6 + seed) * 0.045
          : Math.sin(t * 0.62 + seed) * 0.12;

    rig.scale.setScalar(damp(rig.scale.x, targetScale, 7, dt));
    lift.current = damp(lift.current, targetLift, 6, dt);
    rig.position.y = node.position[1] + float + lift.current;

    if (theme.motion === 'orbit' && !reducedMotion) {
      mesh.rotation.y = t * 0.4 + seed;
      mesh.rotation.x = Math.sin(t * 0.3 + seed) * 0.3;
    } else if (theme.node === 'ring') {
      mesh.rotation.x = Math.PI / 2.6;
      mesh.rotation.z = reducedMotion ? seed : t * 0.18 + seed;
    } else if (!reducedMotion) {
      mesh.rotation.y = damp(mesh.rotation.y, isHovered || isActive ? t * 0.6 : 0, 2, dt);
    }

    const material = mesh.material as NodeMaterial;
    colors.scratch.copy(
      someoneElse ? colors.dim : isHovered || isActive ? colors.live : colors.rest,
    );
    material.color.lerp(colors.scratch, 1 - Math.exp(-6 * dt));
    material.opacity = damp(material.opacity, targetOpacity, 6, dt);

    if (halo.current) {
      const haloMaterial = halo.current.material as NodeMaterial;
      haloMaterial.opacity = damp(haloMaterial.opacity, targetHalo, 7, dt);
      halo.current.rotation.z += reducedMotion ? 0 : dt * (isActive ? 0.7 : 0.2);
    }

    // Publish the screen position of the node so its HTML label can ride along.
    scratch.world.set(node.position[0], rig.position.y, node.position[2]);
    rig.parent?.localToWorld(scratch.world);
    scratch.projected.copy(scratch.world).project(state.camera);

    const screenX = (scratch.projected.x * 0.5 + 0.5) * state.size.width;
    const roomy = (rig.parent?.scale.x ?? 1) >= LABEL_SCALE_MIN;

    publishAnchor(node.id, {
      x: screenX,
      y: (-scratch.projected.y * 0.5 + 0.5) * state.size.height,
      depth: scratch.projected.z,
      visible:
        scratch.projected.z < 1 &&
        (phase !== 'focused' || isActive) &&
        (roomy || isHovered || isActive),
      flip: screenX > state.size.width - LABEL_REACH,
    });
  });

  const enter = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    hoverNode(node.id);
    document.body.style.cursor = 'pointer';
  };

  const leave = () => {
    hoverNode(null);
    document.body.style.cursor = '';
  };

  const select = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    document.body.style.cursor = '';
    toggleNode(node.id);
  };

  return (
    <group
      ref={group}
      position={[node.position[0], node.position[1], node.position[2]]}
      onPointerOver={enter}
      onPointerOut={leave}
      onClick={select}
    >
      {/* A generous, fully transparent hit volume: pointer targets stay
          comfortable while the visible node keeps its exact silhouette. */}
      <mesh
        ref={(mesh) => {
          if (mesh) mesh.layers.enable(INTERACTIVE_LAYER);
        }}
      >
        <sphereGeometry args={[radius * 2.2, 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh ref={body} geometry={geometry}>
        <Surface theme={theme} color={palette.accent} />
      </mesh>

      <mesh ref={halo} geometry={haloGeometry}>
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
