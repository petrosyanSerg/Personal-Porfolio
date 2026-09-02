'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Matrix4,
  Quaternion,
  Vector3,
  type InstancedMesh,
  type LineSegments,
} from 'three';

import type { ScenePalette } from '@/components/hero3d/core/palette';
import type { SceneQuality } from '@/components/hero3d/core/quality';

import { getSnapshot } from '../core/exploration-store';
import { positionOf, worldEdges } from '../core/graph';
import type { WorldTheme } from '../core/types';

import { useDisposable } from './geometry';

type ConnectionProps = {
  readonly theme: WorldTheme;
  readonly palette: ScenePalette;
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
};

/**
 * The edges are the architecture claim: everything hangs off one core, and the
 * build chain — stack, architecture, projects, experience — is drawn on top of
 * it. Pulses travel the edges so the graph reads as a system under load rather
 * than a diagram.
 */
export function WorldConnections({
  theme,
  palette,
  quality,
  reducedMotion,
}: ConnectionProps) {
  const lines = useRef<LineSegments>(null);
  const pulses = useRef<InstancedMesh>(null);

  const ends = useMemo(
    () =>
      worldEdges.map(([from, to]) => ({
        from: new Vector3(...positionOf(from)),
        to: new Vector3(...positionOf(to)),
        nodes: [from, to] as const,
      })),
    [],
  );

  const geometry = useDisposable(
    useMemo(() => {
      const positions = new Float32Array(ends.length * 6);
      const colors = new Float32Array(ends.length * 6);

      ends.forEach((edge, i) => {
        positions.set([edge.from.x, edge.from.y, edge.from.z], i * 6);
        positions.set([edge.to.x, edge.to.y, edge.to.z], i * 6 + 3);
      });

      const buffer = new BufferGeometry();
      buffer.setAttribute('position', new BufferAttribute(positions, 3));
      buffer.setAttribute('color', new BufferAttribute(colors, 3));
      return buffer;
    }, [ends]),
  );

  const scratch = useMemo(
    () => ({
      matrix: new Matrix4(),
      position: new Vector3(),
      scale: new Vector3(),
      rotation: new Quaternion(),
      rest: new Color(),
      live: new Color(),
      mixed: new Color(),
    }),
    [],
  );

  const showPulses = !reducedMotion && quality !== 'low' && theme.motion !== 'still';

  useFrame((state) => {
    const segments = lines.current;
    if (!segments) return;

    const { active, hovered } = getSnapshot();
    const attribute = segments.geometry.getAttribute('color') as BufferAttribute;

    scratch.rest.set(palette.border);
    scratch.live.set(palette.accent);

    ends.forEach((edge, i) => {
      const touched =
        edge.nodes.includes(active ?? 'core') || edge.nodes.includes(hovered ?? 'core');
      const dim = active !== null && !edge.nodes.includes(active);

      scratch.mixed.copy(touched ? scratch.live : scratch.rest);
      if (dim) scratch.mixed.multiplyScalar(0.45);

      for (let v = 0; v < 2; v += 1) {
        const at = i * 6 + v * 3;
        attribute.array[at] = scratch.mixed.r;
        attribute.array[at + 1] = scratch.mixed.g;
        attribute.array[at + 2] = scratch.mixed.b;
      }
    });

    attribute.needsUpdate = true;

    const mesh = pulses.current;
    if (!mesh || !showPulses) return;

    const t = state.clock.elapsedTime;

    ends.forEach((edge, i) => {
      const travel = (t * 0.24 + i * 0.19) % 1;
      scratch.position.lerpVectors(edge.from, edge.to, travel);
      const fade = Math.sin(travel * Math.PI);
      scratch.scale.setScalar(0.055 * fade + 0.012);
      scratch.matrix.compose(scratch.position, scratch.rotation, scratch.scale);
      mesh.setMatrixAt(i, scratch.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <lineSegments
        ref={(node) => {
          lines.current = node;
          // Dashed links need per-vertex distances; they are cheap and static.
          if (node) node.computeLineDistances();
        }}
        geometry={geometry}
      >
        {theme.link === 'dashed' ? (
          <lineDashedMaterial
            vertexColors
            transparent
            opacity={0.85}
            dashSize={0.24}
            gapSize={0.16}
            scale={1}
          />
        ) : (
          <lineBasicMaterial
            vertexColors
            transparent
            opacity={theme.link === 'beam' ? 0.95 : 0.7}
            toneMapped={false}
          />
        )}
      </lineSegments>

      {showPulses ? (
        <instancedMesh ref={pulses} args={[undefined, undefined, ends.length]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color={palette.teal} toneMapped={false} />
        </instancedMesh>
      ) : null}
    </group>
  );
}
