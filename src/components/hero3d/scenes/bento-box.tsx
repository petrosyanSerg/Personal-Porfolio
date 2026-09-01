'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer } from '../core/motion';
import { count } from '../core/quality';

type Cell = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

const PACKINGS: readonly (readonly Cell[])[] = [
  [
    { x: 0, y: 0, w: 4, h: 2 },
    { x: 4, y: 0, w: 2, h: 4 },
    { x: 0, y: 2, w: 2, h: 2 },
    { x: 2, y: 2, w: 2, h: 1 },
    { x: 2, y: 3, w: 1, h: 1 },
    { x: 3, y: 3, w: 1, h: 1 },
  ],
  [
    { x: 0, y: 0, w: 2, h: 4 },
    { x: 2, y: 0, w: 4, h: 2 },
    { x: 2, y: 2, w: 2, h: 2 },
    { x: 4, y: 2, w: 2, h: 1 },
    { x: 4, y: 3, w: 1, h: 1 },
    { x: 5, y: 3, w: 1, h: 1 },
  ],
  [
    { x: 0, y: 0, w: 3, h: 2 },
    { x: 3, y: 0, w: 3, h: 2 },
    { x: 0, y: 2, w: 2, h: 2 },
    { x: 2, y: 2, w: 2, h: 2 },
    { x: 4, y: 2, w: 2, h: 2 },
    { x: 0, y: 0, w: 0, h: 0 },
  ],
];

const UNIT = 1.15;
const GAP = 0.09;
const HOLD = 6;

function Grid({ quality, reducedMotion, palette }: SceneProps) {
  const board = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const cellCount = Math.min(6, count(quality, 6));
  const hues = useMemo(
    () => [palette.accent, palette.teal, palette.accentText, palette.textMuted],
    [palette],
  );

  useFrame((state) => {
    if (!board.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    const cycle = t / HOLD;
    const index = Math.floor(cycle) % PACKINGS.length;
    const next = (index + 1) % PACKINGS.length;
    const deal = MathUtils.smoothstep((cycle % 1) - 0.8, 0, 0.2);

    board.current.children.forEach((child, i) => {
      const from = PACKINGS[index]![i];
      const to = PACKINGS[next]![i];
      if (!from || !to) return;

      const w = MathUtils.lerp(from.w, to.w, deal);
      const h = MathUtils.lerp(from.h, to.h, deal);
      const x = MathUtils.lerp(from.x, to.x, deal);
      const y = MathUtils.lerp(from.y, to.y, deal);

      child.position.x = (x + w / 2 - 3) * UNIT;
      child.position.y = (y + h / 2 - 2) * UNIT;
      child.position.z = Math.sin(deal * Math.PI) * 0.9 + rand(i) * 0.12;

      child.scale.set(
        Math.max(0.02, w * UNIT - GAP * 2),
        Math.max(0.02, h * UNIT - GAP * 2),
        0.16,
      );
    });

    board.current.rotation.y +=
      (pointer.current.x * 0.28 - board.current.rotation.y) * 0.05;
    board.current.rotation.x +=
      (pointer.current.y * -0.2 - board.current.rotation.x) * 0.05;
  });

  return (
    <>
      <ambientLight intensity={0.9} color={palette.surfaceHigh} />
      <directionalLight position={[3, 5, 8]} intensity={1.1} color={palette.text} />
      <pointLight
        position={[-6, -3, 5]}
        intensity={30}
        distance={22}
        decay={2}
        color={palette.accent}
      />

      <group ref={board}>
        {Array.from({ length: cellCount }, (_, i) => (
          <mesh key={i}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={i === 0 ? hues[0] : palette.surface}
              roughness={0.55}
              metalness={0.1}
              emissive={hues[i % hues.length]}
              emissiveIntensity={i === 0 ? 0.18 : 0.04}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function BentoBoxScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 10.5], fov: 40 }}>
      <Grid {...props} />
    </HeroCanvas>
  );
}
