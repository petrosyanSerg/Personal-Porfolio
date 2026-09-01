'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, MathUtils, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

type Item = {
  readonly kind: 'photo' | 'note' | 'ticket' | 'stamp';
  readonly position: [number, number, number];
  readonly size: [number, number];
  readonly tilt: number;
  readonly adhesion: number;
  readonly hue: 'surface' | 'accent' | 'teal' | 'surfaceHigh';
};

const KINDS = ['photo', 'note', 'ticket', 'stamp'] as const;
const HUES = ['surface', 'accent', 'teal', 'surfaceHigh'] as const;

function Page({ quality, reducedMotion, palette }: SceneProps) {
  const page = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.07);

  const items = useMemo<Item[]>(() => {
    const total = count(quality, 15);

    return Array.from({ length: total }, (_, i) => {
      const kind = KINDS[i % KINDS.length]!;

      return {
        kind,
        position: [srand(i * 2.1) * 4.4, srand(i * 4.3) * 2.8, 0.02 + i * 0.012],
        size:
          kind === 'ticket'
            ? [1.5 + rand(i * 6.7) * 0.5, 0.55]
            : [1 + rand(i * 6.7) * 0.9, 0.85 + rand(i * 8.1) * 0.7],
        tilt: srand(i * 9.3) * 0.28,
        adhesion:
          kind === 'photo' ? 0.9 : kind === 'stamp' ? 1 : kind === 'note' ? 0.55 : 0.15,
        hue: HUES[i % HUES.length]!,
      };
    });
  }, [quality]);

  useFrame((state) => {
    if (!page.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    page.current.children.forEach((child, i) => {
      const item = items[i];
      if (!item) return;

      const cursorX = pointer.current.x * 4.6;
      const cursorY = pointer.current.y * 3;
      const dx = item.position[0] - cursorX;
      const dy = item.position[1] - cursorY;
      const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 2.2);

      const lift = near * (1 - item.adhesion) * 0.9;

      child.position.z = item.position[2] + lift;
      child.rotation.x = MathUtils.lerp(child.rotation.x, -lift * 0.7, 0.12);
      child.rotation.y = MathUtils.lerp(child.rotation.y, dx * lift * 0.3, 0.12);
      child.rotation.z = item.tilt + wobble(t * 0.2, i) * 0.01;
    });
  });

  return (
    <>
      <ambientLight intensity={1} color={palette.surfaceHigh} />
      <directionalLight position={[-3, 5, 7]} intensity={1.15} color={palette.text} />

      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color={palette.bg} roughness={1} />
      </mesh>

      <group ref={page}>
        {items.map((item, i) => (
          <group key={i} position={item.position} rotation={[0, 0, item.tilt]}>
            <mesh>
              <planeGeometry args={item.size} />
              <meshStandardMaterial
                color={palette[item.hue]}
                roughness={item.kind === 'photo' ? 0.28 : 0.95}
                side={DoubleSide}
              />
            </mesh>

            {item.kind === 'photo'
              ? [
                  [-1, -1],
                  [1, -1],
                  [1, 1],
                  [-1, 1],
                ].map(([sx, sy], c) => (
                  <mesh
                    key={c}
                    position={[(sx! * item.size[0]) / 2, (sy! * item.size[1]) / 2, 0.01]}
                    rotation={[0, 0, (c * Math.PI) / 2]}
                  >
                    <circleGeometry args={[0.12, 3]} />
                    <meshBasicMaterial color={palette.textMuted} />
                  </mesh>
                ))
              : null}

            {item.kind === 'note' ? (
              <mesh position={[0, item.size[1] / 2, 0.02]} rotation={[0, 0, 0.1]}>
                <planeGeometry args={[0.5, 0.22]} />
                <meshStandardMaterial
                  color={palette.text}
                  transparent
                  opacity={0.45}
                  roughness={0.5}
                />
              </mesh>
            ) : null}

            {item.kind === 'note'
              ? Array.from({ length: 4 }, (_, l) => (
                  <mesh key={l} position={[0, item.size[1] / 2 - 0.3 - l * 0.18, 0.01]}>
                    <planeGeometry args={[item.size[0] * 0.72, 0.015]} />
                    <meshBasicMaterial color={palette.accent} transparent opacity={0.5} />
                  </mesh>
                ))
              : null}

            {item.kind === 'ticket'
              ? Array.from({ length: count(quality, 9) }, (_, p) => (
                  <mesh
                    key={p}
                    position={[
                      -item.size[0] / 2 + 0.2,
                      item.size[1] / 2 - (p / 8) * item.size[1],
                      0.01,
                    ]}
                  >
                    <circleGeometry args={[0.03, detail(quality, 8, 4)]} />
                    <meshBasicMaterial color={palette.bg} />
                  </mesh>
                ))
              : null}
          </group>
        ))}
      </group>
    </>
  );
}

export default function ScrapbookScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 7.6], fov: 44 }}>
      <Page {...props} />
    </HeroCanvas>
  );
}
