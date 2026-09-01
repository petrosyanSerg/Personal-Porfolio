'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer } from '../core/motion';
import { count, detail } from '../core/quality';

const SHAPES = ['heart', 'star', 'ball', 'bow', 'ring', 'gem'] as const;

type Trinket = {
  readonly shape: (typeof SHAPES)[number];
  readonly radius: number;
  readonly phase: number;
  readonly height: number;
  readonly scale: number;
  readonly speed: number;
  readonly hue: 'accent' | 'teal' | 'accentText' | 'text';
};

function Shelf({ quality, reducedMotion, palette }: SceneProps) {
  const carousel = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.06);

  const trinkets = useMemo<Trinket[]>(() => {
    const total = count(quality, 22);

    return Array.from({ length: total }, (_, i) => ({
      shape: SHAPES[i % SHAPES.length]!,
      radius: 1.9 + rand(i * 2.3) * 3.1,
      phase: (i / total) * Math.PI * 2 + rand(i) * 0.5,
      height: srand(i * 4.7) * 2.6,
      scale: 0.24 + rand(i * 6.1) * 0.46,
      speed: (rand(i * 8.9) - 0.35) * 1.6,
      hue: (['accent', 'teal', 'accentText', 'text'] as const)[i % 4]!,
    }));
  }, [quality]);

  const scratch = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    if (!carousel.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    carousel.current.children.forEach((child, i) => {
      const trinket = trinkets[i];
      if (!trinket) return;

      const a = trinket.phase + t * 0.12;
      scratch.set(
        Math.cos(a) * trinket.radius,
        trinket.height + Math.sin(t * 0.6 + trinket.phase) * 0.28,
        Math.sin(a) * trinket.radius * 0.5,
      );
      child.position.copy(scratch);

      child.rotation.x = t * trinket.speed;
      child.rotation.y = t * trinket.speed * 0.7;
      const pulse = 1 + Math.sin(t * 2.2 + trinket.phase * 3) * 0.09;
      child.scale.setScalar(trinket.scale * pulse);
    });

    carousel.current.rotation.y +=
      (pointer.current.x * 0.5 - carousel.current.rotation.y) * 0.04;
    carousel.current.rotation.x +=
      (pointer.current.y * -0.2 - carousel.current.rotation.x) * 0.04;
  });

  const segments = detail(quality, 24, 8);

  return (
    <>
      <ambientLight intensity={0.8} color={palette.text} />
      <pointLight
        position={[5, 4, 5]}
        intensity={50}
        distance={22}
        decay={2}
        color={palette.accent}
      />
      <pointLight
        position={[-5, -3, 4]}
        intensity={44}
        distance={22}
        decay={2}
        color={palette.teal}
      />
      <pointLight
        position={[0, 5, -4]}
        intensity={38}
        distance={20}
        decay={2}
        color={palette.accentText}
      />

      <group ref={carousel}>
        {trinkets.map((trinket, i) => (
          <mesh key={i}>
            {trinket.shape === 'heart' ? (
              <sphereGeometry args={[1, segments, segments]} />
            ) : null}
            {trinket.shape === 'star' ? <dodecahedronGeometry args={[1, 0]} /> : null}
            {trinket.shape === 'ball' ? (
              <sphereGeometry args={[1, segments, segments]} />
            ) : null}
            {trinket.shape === 'bow' ? (
              <torusKnotGeometry args={[0.7, 0.3, 48, 8, 2, 3]} />
            ) : null}
            {trinket.shape === 'ring' ? (
              <torusGeometry args={[0.8, 0.24, Math.max(6, segments / 2), segments]} />
            ) : null}
            {trinket.shape === 'gem' ? <octahedronGeometry args={[1, 0]} /> : null}
            <meshStandardMaterial
              color={palette[trinket.hue]}
              metalness={trinket.shape === 'gem' || trinket.shape === 'ring' ? 0.95 : 0.1}
              roughness={trinket.shape === 'ball' ? 0.08 : 0.55}
              flatShading={trinket.shape === 'star' || trinket.shape === 'gem'}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function KitschScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.4, 8.6], fov: 50 }}>
      <Shelf {...props} />
    </HeroCanvas>
  );
}
