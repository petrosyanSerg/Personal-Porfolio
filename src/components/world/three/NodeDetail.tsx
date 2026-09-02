'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Matrix4, Quaternion, Vector3, type Group, type InstancedMesh } from 'three';

import type { ScenePalette } from '@/components/hero3d/core/palette';
import type { SceneQuality } from '@/components/hero3d/core/quality';
import { architectureLayers } from '@/data/architecture';
import { experience } from '@/data/experience';
import { projects } from '@/data/projects';
import { skillGroups } from '@/data/skills';
import { monthsBetween } from '@/lib/format';

import { getSnapshot } from '../core/exploration-store';
import type { WorldNode, WorldTheme } from '../core/types';

import { damp } from './damp';

type DetailProps = {
  readonly node: WorldNode;
  readonly theme: WorldTheme;
  readonly palette: ScenePalette;
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
};

type Parts = Omit<DetailProps, 'node'>;

/** One role per slab, length proportional to how long it actually ran. */
function Timeline({ palette }: Parts) {
  const entries = useMemo(
    () =>
      [...experience]
        .sort((a, b) => a.start.localeCompare(b.start))
        .map((entry) => ({
          id: entry.id,
          months: monthsBetween(entry.start, entry.end),
          current: entry.end === null,
        })),
    [],
  );

  const longest = Math.max(...entries.map((entry) => entry.months), 1);

  return (
    <group position={[0, -0.4, 0]}>
      {entries.map((entry, index) => (
        <mesh
          key={entry.id}
          position={[(entry.months / longest) * 0.6, index * 0.52 - 0.6, 0]}
        >
          <boxGeometry args={[(entry.months / longest) * 2.4, 0.2, 0.2]} />
          <meshBasicMaterial
            color={entry.current ? palette.accent : palette.textMuted}
            transparent
            opacity={entry.current ? 0.95 : 0.6}
          />
        </mesh>
      ))}

      <mesh position={[0, -0.86, 0]}>
        <boxGeometry args={[0.05, 2.6, 0.05]} />
        <meshBasicMaterial color={palette.border} />
      </mesh>
    </group>
  );
}

/**
 * The dependency stack, widest at the base. Nothing lower may import anything
 * above it — the shape states the rule before the copy does.
 */
function Layers({ palette }: Parts) {
  return (
    <group position={[0, -0.2, 0]}>
      {architectureLayers.map((layer, index) => {
        const width = 0.9 + index * 0.34;

        return (
          <mesh key={layer} position={[0, 1.1 - index * 0.34, 0]}>
            <boxGeometry args={[width, 0.19, width * 0.55]} />
            <meshBasicMaterial
              color={index === 0 ? palette.accent : palette.textMuted}
              transparent
              opacity={0.85 - index * 0.07}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Six group hubs, every technology on the profile orbiting the group it belongs
 * to. Instanced: one draw call for the entire stack.
 */
function Network({ palette, quality, reducedMotion }: Parts) {
  const dots = useRef<InstancedMesh>(null);

  const placements = useMemo(() => {
    const out: { position: Vector3; scale: number }[] = [];

    skillGroups.forEach((group, groupIndex) => {
      const angle = (groupIndex / skillGroups.length) * Math.PI * 2;
      const hub = new Vector3(Math.cos(angle) * 1.25, Math.sin(angle) * 1.25, 0);

      group.skills.forEach((skill, skillIndex) => {
        const spin = (skillIndex / Math.max(1, group.skills.length)) * Math.PI * 2;
        const radius = 0.34 + (skillIndex % 3) * 0.12;

        out.push({
          position: new Vector3(
            hub.x + Math.cos(spin) * radius,
            hub.y + Math.sin(spin) * radius,
            Math.sin(spin * 2) * 0.22,
          ),
          scale:
            skill.depth === 'core' ? 0.075 : skill.depth === 'strong' ? 0.058 : 0.042,
        });
      });
    });

    return out;
  }, []);

  const scratch = useMemo(
    () => ({
      matrix: new Matrix4(),
      rotation: new Quaternion(),
      scale: new Vector3(),
      position: new Vector3(),
    }),
    [],
  );

  useFrame((state) => {
    const mesh = dots.current;
    if (!mesh) return;

    const t = reducedMotion ? 0 : state.clock.elapsedTime;

    placements.forEach((placement, index) => {
      const pulse = reducedMotion ? 1 : 1 + Math.sin(t * 1.4 + index * 0.7) * 0.16;

      scratch.position.copy(placement.position);
      scratch.scale.setScalar(placement.scale * pulse);
      scratch.matrix.compose(scratch.position, scratch.rotation, scratch.scale);
      mesh.setMatrixAt(index, scratch.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {skillGroups.map((group, index) => {
        const angle = (index / skillGroups.length) * Math.PI * 2;

        return (
          <mesh
            key={group.id}
            position={[Math.cos(angle) * 1.25, Math.sin(angle) * 1.25, 0]}
          >
            <sphereGeometry args={[0.12, quality === 'low' ? 6 : 12, 8]} />
            <meshBasicMaterial color={palette.accent} transparent opacity={0.9} />
          </mesh>
        );
      })}

      <instancedMesh ref={dots} args={[undefined, undefined, placements.length]}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshBasicMaterial color={palette.teal} transparent opacity={0.8} />
      </instancedMesh>
    </group>
  );
}

/** One plate per project. Commercial work sits forward and lit. */
function Modules({ palette, reducedMotion }: Parts) {
  const group = useRef<Group>(null);

  const cards = useMemo(
    () =>
      projects.map((project, index) => ({
        slug: project.slug,
        featured: project.featured,
        column: index % 3,
        row: Math.floor(index / 3),
      })),
    [],
  );

  useFrame((state) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.24) * 0.16;
  });

  return (
    <group ref={group}>
      {cards.map((card) => (
        <mesh
          key={card.slug}
          position={[
            (card.column - 1) * 0.74,
            0.68 - card.row * 0.7,
            card.featured ? 0.22 : 0,
          ]}
        >
          <planeGeometry args={[0.6, 0.52]} />
          <meshBasicMaterial
            color={card.featured ? palette.accent : palette.accentText}
            transparent
            opacity={card.featured ? 0.94 : 0.34}
          />
        </mesh>
      ))}
    </group>
  );
}

function Rings({ palette, reducedMotion, spread }: Parts & { readonly spread: number }) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;

    group.current.rotation.z += Math.min(delta, 0.05) * 0.14;
    group.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.04);
  });

  return (
    <group ref={group}>
      {[0, 1, 2].map((ring) => (
        <mesh key={ring} rotation={[Math.PI / 2.4, 0, ring * 0.6]}>
          <torusGeometry args={[0.8 + ring * spread, 0.014, 6, 60]} />
          <meshBasicMaterial
            color={ring === 0 ? palette.accent : palette.teal}
            transparent
            opacity={0.6 - ring * 0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * A node's interior. It grows out of the node when the node is selected and
 * collapses back to nothing when it is not — and while collapsed the renderer
 * skips it entirely.
 */
export function NodeDetail({ node, ...parts }: DetailProps) {
  const group = useRef<Group>(null);

  useFrame((_state, delta) => {
    const rig = group.current;
    if (!rig) return;

    const open = getSnapshot().active === node.id;
    const next = damp(
      rig.scale.x,
      open ? 1 : 0.001,
      parts.reducedMotion ? 22 : 7,
      Math.min(delta, 0.05),
    );

    rig.scale.setScalar(next);
    rig.visible = next > 0.02;
  });

  const inner = () => {
    switch (node.detail) {
      case 'timeline':
        return <Timeline {...parts} />;
      case 'layers':
        return <Layers {...parts} />;
      case 'network':
        return <Network {...parts} />;
      case 'modules':
        return <Modules {...parts} />;
      case 'beacon':
        return <Rings {...parts} spread={0.34} />;
      case 'identity':
      default:
        return <Rings {...parts} spread={0.22} />;
    }
  };

  return (
    <group
      ref={group}
      position={[node.position[0], node.position[1], node.position[2] + 0.06]}
      scale={0.001}
      visible={false}
    >
      {inner()}
    </group>
  );
}
