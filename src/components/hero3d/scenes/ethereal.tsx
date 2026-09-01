'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

type Floater = {
  readonly kind: 'sphere' | 'petal';
  readonly position: [number, number, number];
  readonly scale: number;
  readonly lane: number;
  readonly spin: number;
};

function Drift({ quality, reducedMotion, palette }: SceneProps) {
  const field = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.02);

  const floaters = useMemo<Floater[]>(() => {
    const total = count(quality, 34);

    return Array.from({ length: total }, (_, i) => ({
      kind: i % 3 === 0 ? 'petal' : 'sphere',
      position: [srand(i * 1.9) * 9, srand(i * 3.3) * 4.6, -1 - rand(i * 5.5) * 9],
      scale: 0.16 + rand(i * 7.1) * 0.46,
      lane: i * 1.37,
      spin: 0.4 + rand(i * 9.7) * 0.8,
    }));
  }, [quality]);

  useFrame((state) => {
    if (!field.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    field.current.children.forEach((child, i) => {
      const floater = floaters[i];
      if (!floater) return;

      child.position.y = floater.position[1] + wobble(t * 0.09, floater.lane) * 0.85;
      child.position.x = floater.position[0] + wobble(t * 0.05, floater.lane + 9) * 0.5;

      child.rotation.y = t * 0.06 * floater.spin;
      child.rotation.x = t * 0.04 * floater.spin;
    });

    field.current.rotation.y +=
      (pointer.current.x * -0.16 - field.current.rotation.y) * 0.012;
    field.current.rotation.x +=
      (pointer.current.y * 0.1 - field.current.rotation.x) * 0.012;
  });

  return (
    <>
      <ambientLight intensity={1.4} color={palette.surfaceHigh} />
      <directionalLight position={[3, 6, 5]} intensity={0.9} color={palette.text} />
      <directionalLight position={[-5, -2, 3]} intensity={0.5} color={palette.accent} />

      <group ref={field}>
        {floaters.map((floater, i) =>
          floater.kind === 'sphere' ? (
            <mesh key={i} position={floater.position} scale={floater.scale}>
              <sphereGeometry
                args={[1, detail(quality, 28, 10), detail(quality, 20, 8)]}
              />
              <meshStandardMaterial
                color={i % 2 === 0 ? palette.accent : palette.text}
                roughness={0.08}
                metalness={0.1}
                transparent
                opacity={0.42}
              />
            </mesh>
          ) : (
            <mesh
              key={i}
              position={floater.position}
              scale={[floater.scale * 1.6, floater.scale, 1]}
            >
              <circleGeometry args={[1, detail(quality, 16, 6), 0, Math.PI]} />
              <meshStandardMaterial
                color={palette.accentText}
                roughness={0.3}
                transparent
                opacity={0.3}
                side={DoubleSide}
              />
            </mesh>
          ),
        )}
      </group>
    </>
  );
}

export default function EtherealScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 8], fov: 50 }} fog={[6, 22]}>
      <Drift {...props} />
    </HeroCanvas>
  );
}
