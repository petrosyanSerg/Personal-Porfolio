'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { sceneTime, usePointer } from '../core/motion';
import { detail } from '../core/quality';

type Placement = {
  readonly position: [number, number, number];
  readonly rotation: [number, number, number];
  readonly scale: number;
};

const ARRANGEMENTS: readonly (readonly Placement[])[] = [
  [
    { position: [-2.2, 0.6, 0], rotation: [0, 0.4, 0], scale: 1 },
    { position: [0.9, -0.9, 0.6], rotation: [0, 0, 0], scale: 0.8 },
    { position: [2.4, 0.9, -0.4], rotation: [0, 0, 0.3], scale: 0.9 },
    { position: [0, 0, -1.6], rotation: [0, 0, 0], scale: 2.6 },
  ],
  [
    { position: [0, 1.5, 0.4], rotation: [0.4, 0.8, 0], scale: 0.7 },
    { position: [-2.4, -0.6, 0], rotation: [0, 0, 0], scale: 1.05 },
    { position: [1.8, -1.1, 0.8], rotation: [1.2, 0, 0], scale: 0.75 },
    { position: [1.2, 0.8, -1.8], rotation: [0, 0.3, 0.9], scale: 2.2 },
  ],
  [
    { position: [2.5, 1.2, 0.2], rotation: [0.8, 0.2, 0.5], scale: 0.85 },
    { position: [0, 0, 1], rotation: [0, 0, 0], scale: 1.25 },
    { position: [-2.2, -1, -0.2], rotation: [0, 0, 1.57], scale: 0.8 },
    { position: [-1, 1, -2], rotation: [0, -0.4, 0], scale: 2.4 },
  ],
  [
    { position: [-1.4, -1.2, 0.6], rotation: [0.2, 0.6, 0.2], scale: 0.9 },
    { position: [2.2, 1, 0], rotation: [0, 0, 0], scale: 0.65 },
    { position: [0.2, 0.4, 0.2], rotation: [0.4, 0, 0.2], scale: 1.1 },
    { position: [0, -0.6, -2.2], rotation: [0, 0.2, 2.36], scale: 2.8 },
  ],
];

const HOLD = 5;

function Composition({ quality, reducedMotion, palette }: SceneProps) {
  const solids = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.04);

  const segments = detail(quality, 32, 10);
  const hues = useMemo(
    () => [palette.accent, palette.teal, palette.text, palette.textMuted],
    [palette],
  );

  useFrame((state) => {
    if (!solids.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    const cycle = t / HOLD;
    const index = Math.floor(cycle) % ARRANGEMENTS.length;
    const next = (index + 1) % ARRANGEMENTS.length;
    const travel = MathUtils.smoothstep((cycle % 1) - 0.7, 0, 0.3);

    const from = ARRANGEMENTS[index]!;
    const to = ARRANGEMENTS[next]!;

    solids.current.children.forEach((child, i) => {
      const a = from[i];
      const b = to[i];
      if (!a || !b) return;

      child.position.set(
        MathUtils.lerp(a.position[0], b.position[0], travel),
        MathUtils.lerp(a.position[1], b.position[1], travel),
        MathUtils.lerp(a.position[2], b.position[2], travel),
      );
      child.rotation.set(
        MathUtils.lerp(a.rotation[0], b.rotation[0], travel),
        MathUtils.lerp(a.rotation[1], b.rotation[1], travel),
        MathUtils.lerp(a.rotation[2], b.rotation[2], travel),
      );
      child.scale.setScalar(MathUtils.lerp(a.scale, b.scale, travel));
    });

    solids.current.rotation.y +=
      (pointer.current.x * 0.16 - solids.current.rotation.y) * 0.04;
    solids.current.rotation.x +=
      (pointer.current.y * -0.1 - solids.current.rotation.x) * 0.04;
  });

  return (
    <>
      <ambientLight intensity={1.5} color={palette.text} />
      <directionalLight position={[1, 4, 8]} intensity={0.65} color={palette.text} />

      <group ref={solids}>
        <mesh>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color={hues[0]} roughness={0.9} metalness={0} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.95, segments, segments]} />
          <meshStandardMaterial color={hues[1]} roughness={0.9} metalness={0} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 1.8, segments]} />
          <meshStandardMaterial color={hues[2]} roughness={0.9} metalness={0} />
        </mesh>
        <mesh>
          <planeGeometry args={[1.8, 1.8]} />
          <meshStandardMaterial color={hues[3]} roughness={0.95} metalness={0} side={2} />
        </mesh>
      </group>
    </>
  );
}

export default function BauhausScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 9], fov: 44 }}>
      <Composition {...props} />
    </HeroCanvas>
  );
}
