'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, MathUtils, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer } from '../core/motion';
import { count } from '../core/quality';

type Block = {
  readonly home: [number, number, number];
  readonly size: [number, number, number];
  readonly hue: 'accent' | 'teal' | 'text' | 'surfaceHigh';
  readonly axis: 0 | 1 | 2;
  readonly phase: number;
};

const HUES = ['accent', 'teal', 'text', 'surfaceHigh'] as const;

function Construction({ quality, reducedMotion, palette }: SceneProps) {
  const stack = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.12);

  const blocks = useMemo<Block[]>(() => {
    const total = count(quality, 14);

    return Array.from({ length: total }, (_, i) => ({
      home: [srand(i * 2.3) * 4.4, srand(i * 4.1) * 2.6, srand(i * 6.7) * 1.6 - 0.4],
      size: [
        0.7 + rand(i * 3.7) * 1.7,
        0.6 + rand(i * 5.3) * 1.4,
        0.5 + rand(i * 7.9) * 0.8,
      ],
      hue: HUES[i % HUES.length]!,
      axis: (i % 3) as 0 | 1 | 2,
      phase: rand(i * 9.1) * Math.PI * 2,
    }));
  }, [quality]);

  useFrame((state) => {
    if (!stack.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    stack.current.children.forEach((child, i) => {
      const block = blocks[i];
      if (!block) return;

      const wave = Math.sin(t * 0.7 + block.phase);
      const throwLength = 0.9;
      const stepped = Math.round(wave * 4) / 4;

      child.position.set(block.home[0], block.home[1], block.home[2]);
      if (block.axis === 0) child.position.x += stepped * throwLength;
      if (block.axis === 1) child.position.y += stepped * throwLength;
      if (block.axis === 2) child.position.z += stepped * throwLength;

      const target = Math.round(pointer.current.x * 2 * 4) / 4;
      child.rotation.y = MathUtils.lerp(child.rotation.y, target * 0.4, 0.2);
    });

    stack.current.position.x = MathUtils.lerp(
      stack.current.position.x,
      Math.round(pointer.current.x * 8) / 8,
      0.22,
    );
    stack.current.position.y = MathUtils.lerp(
      stack.current.position.y,
      Math.round(pointer.current.y * 6) / 8,
      0.22,
    );
  });

  return (
    <>
      <ambientLight intensity={1.6} color={palette.text} />

      <group ref={stack}>
        {blocks.map((block, i) => (
          <group key={i} position={block.home}>
            <mesh>
              <boxGeometry args={block.size} />
              <meshBasicMaterial color={palette[block.hue]} />
            </mesh>
            <mesh>
              <boxGeometry
                args={[block.size[0] + 0.11, block.size[1] + 0.11, block.size[2] + 0.11]}
              />
              <meshBasicMaterial color={palette.bg} side={BackSide} />
            </mesh>
            <mesh position={[0.18, -0.18, -block.size[2] / 2 - 0.02]}>
              <planeGeometry args={[block.size[0], block.size[1]]} />
              <meshBasicMaterial color={palette.bg} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

export default function NeoBrutalismScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 9.2], fov: 46 }}>
      <Construction {...props} />
    </HeroCanvas>
  );
}
