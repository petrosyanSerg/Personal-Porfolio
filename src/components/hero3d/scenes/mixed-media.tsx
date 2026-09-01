'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

type Fragment = {
  readonly kind: 'paper' | 'photo' | 'news' | 'board' | 'tape' | 'wire';
  readonly position: [number, number, number];
  readonly size: [number, number];
  readonly rotation: number;
  readonly hue: 'accent' | 'teal' | 'text' | 'surfaceHigh' | 'textMuted';
};

const KINDS = ['paper', 'photo', 'news', 'board', 'tape', 'wire'] as const;
const HUES = ['accent', 'teal', 'text', 'surfaceHigh', 'textMuted'] as const;

function Combine({ quality, reducedMotion, palette }: SceneProps) {
  const board = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const fragments = useMemo<Fragment[]>(() => {
    const total = count(quality, 24);

    return Array.from({ length: total }, (_, i) => {
      const kind = KINDS[i % KINDS.length]!;

      return {
        kind,
        position: [srand(i * 2.3) * 5, srand(i * 4.7) * 3.2, -2.6 + (i / total) * 4.4],
        size:
          kind === 'tape'
            ? [0.3 + rand(i * 6.1) * 0.2, 1.6 + rand(i * 8.3) * 1.4]
            : [0.9 + rand(i * 6.1) * 1.8, 0.7 + rand(i * 8.3) * 1.5],
        rotation: srand(i * 9.7) * 0.5,
        hue: HUES[i % HUES.length]!,
      };
    });
  }, [quality]);

  useFrame((state) => {
    if (!board.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    board.current.children.forEach((child, i) => {
      const fragment = fragments[i];
      if (!fragment) return;

      const depth = (fragment.position[2] + 2.6) / 4.4;
      child.position.x = fragment.position[0] + pointer.current.x * depth * 1.4;
      child.position.y =
        fragment.position[1] +
        pointer.current.y * depth * 0.9 +
        wobble(t * 0.12, i) * 0.06;
      child.rotation.z = fragment.rotation + wobble(t * 0.09, i * 1.7) * 0.02;
    });
  });

  return (
    <>
      <ambientLight intensity={0.95} color={palette.surfaceHigh} />
      <directionalLight position={[-5, 4, 7]} intensity={1.2} color={palette.text} />
      <directionalLight position={[6, -3, 4]} intensity={0.35} color={palette.accent} />

      <group ref={board}>
        {fragments.map((fragment, i) => (
          <group
            key={i}
            position={fragment.position}
            rotation={[0, 0, fragment.rotation]}
          >
            {fragment.kind === 'wire' ? (
              <mesh rotation={[0, 0, rand(i) * 3]}>
                <torusGeometry
                  args={[
                    fragment.size[0] * 0.5,
                    0.018,
                    6,
                    detail(quality, 24, 10),
                    Math.PI * 1.4,
                  ]}
                />
                <meshStandardMaterial
                  color={palette.textMuted}
                  metalness={0.8}
                  roughness={0.4}
                />
              </mesh>
            ) : (
              <mesh>
                <planeGeometry args={fragment.size} />
                <meshStandardMaterial
                  color={palette[fragment.hue]}
                  side={DoubleSide}
                  roughness={
                    fragment.kind === 'photo' ? 0.12 : fragment.kind === 'news' ? 1 : 0.7
                  }
                  metalness={fragment.kind === 'photo' ? 0.25 : 0}
                  transparent={fragment.kind === 'tape'}
                  opacity={fragment.kind === 'tape' ? 0.5 : 1}
                />
              </mesh>
            )}

            {fragment.kind === 'news'
              ? Array.from({ length: 5 }, (_, l) => (
                  <mesh
                    key={l}
                    position={[0, fragment.size[1] / 2 - 0.2 - l * 0.16, 0.01]}
                  >
                    <planeGeometry args={[fragment.size[0] * 0.8, 0.02]} />
                    <meshBasicMaterial color={palette.bg} transparent opacity={0.5} />
                  </mesh>
                ))
              : null}

            {fragment.kind === 'photo' ? (
              <mesh position={[0, 0, -0.01]}>
                <planeGeometry
                  args={[fragment.size[0] + 0.16, fragment.size[1] + 0.16]}
                />
                <meshBasicMaterial color={palette.text} />
              </mesh>
            ) : null}
          </group>
        ))}
      </group>
    </>
  );
}

export default function MixedMediaScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 8.2], fov: 46 }}>
      <Combine {...props} />
    </HeroCanvas>
  );
}
