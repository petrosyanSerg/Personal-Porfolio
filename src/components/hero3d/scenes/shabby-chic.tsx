'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, LatheGeometry, Vector2, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

const PROFILES: readonly (readonly [number, number][])[] = [
  [
    [0.02, -0.9],
    [0.34, -0.86],
    [0.46, -0.5],
    [0.4, -0.05],
    [0.24, 0.42],
    [0.3, 0.62],
    [0.26, 0.68],
    [0.2, 0.66],
  ],
  [
    [0.02, -0.9],
    [0.42, -0.88],
    [0.36, -0.76],
    [0.12, -0.6],
    [0.2, -0.3],
    [0.1, 0.1],
    [0.13, 0.44],
    [0.26, 0.56],
    [0.22, 0.64],
    [0.1, 0.6],
  ],
  [
    [0.02, -0.7],
    [0.26, -0.68],
    [0.2, -0.5],
    [0.34, -0.2],
    [0.3, 0.16],
    [0.16, 0.36],
    [0.2, 0.5],
    [0.08, 0.62],
  ],
];

function Objects({ quality, reducedMotion, palette }: SceneProps) {
  const scene = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.04);

  const lathes = useMemo(
    () =>
      PROFILES.map(
        (profile) =>
          new LatheGeometry(
            profile.map(([x, y]) => new Vector2(x, y)),
            detail(quality, 40, 12),
          ),
      ),
    [quality],
  );

  const petals = count(quality, 16);

  useFrame((state) => {
    if (!scene.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    scene.current.children.forEach((child, i) => {
      child.position.y +=
        (wobble(t * 0.14, i * 1.7) * 0.16 - child.position.y * 0.02) * 0.1;
      child.rotation.y = t * (0.05 + (i % 3) * 0.03);
      child.rotation.z = wobble(t * 0.11, i * 2.3) * 0.07;
    });

    scene.current.rotation.y +=
      (pointer.current.x * 0.18 - scene.current.rotation.y) * 0.03;
    scene.current.rotation.x +=
      (pointer.current.y * -0.1 - scene.current.rotation.x) * 0.03;
  });

  return (
    <>
      <ambientLight intensity={1.25} color={palette.surfaceHigh} />
      <directionalLight position={[3, 6, 7]} intensity={1} color={palette.text} />
      <directionalLight position={[-5, -2, 4]} intensity={0.45} color={palette.accent} />

      <group ref={scene}>
        <group position={[0, 0.2, -2.4]}>
          {[
            [0, 1.5, 4.6, 0.16],
            [0, -1.5, 4.6, 0.16],
            [-2.3, 0, 0.16, 3.16],
            [2.3, 0, 0.16, 3.16],
          ].map(([x, y, w, h], i) => (
            <mesh key={i} position={[x!, y!, 0]}>
              <boxGeometry args={[w!, h!, 0.18]} />
              <meshStandardMaterial color={palette.accent} roughness={0.72} />
            </mesh>
          ))}
        </group>

        {lathes.map((geometry, i) => (
          <mesh
            key={`lathe-${i}`}
            geometry={geometry}
            position={[(i - 1) * 1.85, srand(i * 3) * 0.4, i === 1 ? 0.4 : -0.3]}
            scale={i === 1 ? 1.5 : 1.15}
          >
            <meshStandardMaterial
              color={i === 1 ? palette.text : palette.surfaceHigh}
              roughness={0.5}
              metalness={0.04}
              side={DoubleSide}
            />
          </mesh>
        ))}

        {Array.from({ length: petals }, (_, i) => (
          <mesh
            key={`petal-${i}`}
            position={[srand(i * 2.7) * 5, srand(i * 4.9) * 2.8, 0.6 + rand(i * 6.1) * 2]}
            rotation={[rand(i) * 3, rand(i * 2) * 3, rand(i * 3) * 3]}
            scale={0.1 + rand(i * 8.3) * 0.09}
          >
            <circleGeometry args={[1, detail(quality, 12, 5), 0, Math.PI * 1.3]} />
            <meshStandardMaterial
              color={palette.accent}
              roughness={0.6}
              side={DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function ShabbyChicScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.2, 7.4], fov: 44 }} fog={[9, 22]}>
      <Objects {...props} />
    </HeroCanvas>
  );
}
