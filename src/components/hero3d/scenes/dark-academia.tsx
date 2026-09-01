'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Group, type PointLight } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

type Book = {
  readonly position: [number, number, number];
  readonly scale: number;
  readonly lane: number;
  readonly hue: 'accent' | 'teal' | 'textMuted';
};

function Library({ quality, reducedMotion, palette }: SceneProps) {
  const floating = useRef<Group>(null);
  const flames = useRef<(PointLight | null)[]>([]);
  const room = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const books = useMemo<Book[]>(
    () =>
      Array.from({ length: count(quality, 9) }, (_, i) => ({
        position: [
          srand(i * 2.7) * 5,
          srand(i * 4.3) * 2.4 + 0.4,
          -0.5 - rand(i * 6.1) * 3,
        ],
        scale: 0.6 + rand(i * 8.3) * 0.5,
        lane: i * 1.9,
        hue: (['accent', 'teal', 'textMuted'] as const)[i % 3]!,
      })),
    [quality],
  );

  const shelves = useMemo(
    () =>
      Array.from({ length: count(quality, 4) }, (_, s) =>
        Array.from({ length: count(quality, 18) }, (_, b) => ({
          x: -5 + b * 0.58 + srand(s * 30 + b) * 0.05,
          y: -2.6 + s * 1.5,
          height: 0.75 + rand(s * 17 + b) * 0.35,
          width: 0.16 + rand(s * 23 + b) * 0.22,
          lean: rand(s * 11 + b) > 0.85 ? 0.24 : 0,
        })),
      ),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    flames.current.forEach((flame, i) => {
      if (!flame) return;
      flame.intensity =
        16 * (1 + Math.sin(t * 6.1 + i * 3) * 0.16 + Math.sin(t * 1.7 + i) * 0.1);
    });

    if (floating.current) {
      floating.current.children.forEach((child, i) => {
        const book = books[i];
        if (!book) return;

        child.position.y = book.position[1] + wobble(t * 0.16, book.lane) * 0.14;

        const dx = book.position[0] - pointer.current.x * 5;
        const dy = book.position[1] - pointer.current.y * 3;
        const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 3);

        child.rotation.y =
          wobble(t * 0.1, book.lane + 4) * 0.2 - near * Math.atan2(dx, 4);
        child.rotation.z = wobble(t * 0.12, book.lane) * 0.06;

        child.children.forEach((cover, c) => {
          if (cover.name !== 'cover') return;
          const side = c === 0 ? 1 : -1;
          cover.rotation.y = side * (0.5 + near * 0.7);
        });
      });
    }

    if (room.current) {
      room.current.position.x +=
        (pointer.current.x * -0.5 - room.current.position.x) * 0.03;
      room.current.position.y +=
        (pointer.current.y * 0.3 - room.current.position.y) * 0.03;
    }
  });

  return (
    <>
      <ambientLight intensity={0.13} color={palette.accent} />

      {[
        [-3.4, 0.4, 2.6],
        [3.1, -0.9, 1.8],
      ].map((position, i) => (
        <group key={i} position={position as [number, number, number]}>
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.13, 0.9, detail(quality, 12, 6)]} />
            <meshStandardMaterial color={palette.text} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry
              args={[0.07, detail(quality, 12, 6), detail(quality, 8, 4)]}
            />
            <meshBasicMaterial color={palette.accentText} />
          </mesh>
          <pointLight
            ref={(light) => {
              flames.current[i] = light;
            }}
            position={[0, 0.1, 0]}
            intensity={16}
            distance={12}
            decay={2}
            color={palette.accentText}
          />
        </group>
      ))}

      <group ref={room}>
        {shelves.map((shelf, s) => (
          <group key={s}>
            <mesh position={[0, -2.6 + s * 1.5 - 0.06, -3.4]}>
              <boxGeometry args={[12, 0.08, 0.7]} />
              <meshStandardMaterial color={palette.accent} roughness={0.86} />
            </mesh>
            {shelf.map((book, b) => (
              <mesh
                key={b}
                position={[book.x, book.y + book.height / 2 - 0.02, -3.4]}
                rotation={[0, 0, book.lean]}
              >
                <boxGeometry args={[book.width, book.height, 0.5]} />
                <meshStandardMaterial
                  color={
                    b % 4 === 0
                      ? palette.accent
                      : b % 3 === 0
                        ? palette.teal
                        : palette.surfaceHigh
                  }
                  roughness={0.9}
                />
              </mesh>
            ))}
          </group>
        ))}

        <group ref={floating}>
          {books.map((book, i) => (
            <group key={i} position={book.position} scale={book.scale}>
              <mesh>
                <boxGeometry args={[0.1, 0.9, 0.62]} />
                <meshStandardMaterial color={palette[book.hue]} roughness={0.85} />
              </mesh>
              {[1, -1].map((side, c) => (
                <group key={side} name="cover" rotation={[0, side * 0.5, 0]}>
                  <mesh position={[side * 0.34, 0, 0]}>
                    <boxGeometry args={[0.68, 0.88, 0.03]} />
                    <meshStandardMaterial color={palette[book.hue]} roughness={0.82} />
                  </mesh>
                  {Array.from({ length: quality === 'low' ? 2 : 4 }, (_, p) => (
                    <mesh
                      key={p}
                      position={[side * (0.3 - p * 0.02), 0, 0.02 + p * 0.012]}
                      rotation={[0, 0, srand(i * 7 + p) * 0.04]}
                    >
                      <planeGeometry args={[0.6, 0.82]} />
                      <meshStandardMaterial
                        color={palette.text}
                        roughness={0.95}
                        side={DoubleSide}
                      />
                    </mesh>
                  ))}
                  {void c}
                </group>
              ))}
            </group>
          ))}
        </group>

        {Array.from({ length: count(quality, 12) }, (_, i) => (
          <mesh
            key={`page-${i}`}
            position={[srand(i * 3.1) * 7, srand(i * 5.3) * 3.4, 0.5 + rand(i * 7.7) * 2]}
            rotation={[rand(i) * 3, rand(i * 2) * 3, rand(i * 3) * 3]}
            scale={0.3 + rand(i * 9.1) * 0.2}
          >
            <planeGeometry args={[1, 1.3]} />
            <meshStandardMaterial
              color={palette.text}
              roughness={0.96}
              side={DoubleSide}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function DarkAcademiaScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.2, 7.6], fov: 46 }} fog={[8, 20]}>
      <Library {...props} />
    </HeroCanvas>
  );
}
