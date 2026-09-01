'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  type Group,
  type Mesh,
} from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, useScrollProgress } from '../core/motion';
import { count, detail } from '../core/quality';

function Sky({ quality, reducedMotion, palette }: SceneProps) {
  const planet = useRef<Mesh>(null);
  const rings = useRef<Group>(null);
  const world = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.03);
  const scroll = useScrollProgress(true);

  const stars = useMemo(() => {
    const total = count(quality, 420);
    const positions = new Float32Array(total * 3);

    for (let i = 0; i < total; i += 1) {
      positions[i * 3] = srand(i * 2.1) * 40;
      positions[i * 3 + 1] = rand(i * 4.7) * 20 - 1;
      positions[i * 3 + 2] = -18 - rand(i * 6.3) * 20;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    return geometry;
  }, [quality]);

  const cacti = useMemo(
    () =>
      Array.from({ length: count(quality, 7) }, (_, i) => ({
        x: srand(i * 3.3) * 13,
        z: -3 - rand(i * 5.9) * 7,
        height: 1.4 + rand(i * 7.1) * 1.6,
        arms: rand(i * 9.7) > 0.4 ? 2 : 1,
      })),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (planet.current) planet.current.rotation.y = t * 0.018;
    if (rings.current) rings.current.rotation.z = t * 0.006;

    if (world.current) {
      world.current.rotation.y +=
        (pointer.current.x * 0.07 - world.current.rotation.y) * 0.02;
      world.current.position.y = -scroll.value * 1.6;
    }
  });

  return (
    <>
      <ambientLight intensity={0.22} color={palette.teal} />
      <pointLight
        position={[2.6, 4.4, -9]}
        intensity={220}
        distance={44}
        decay={2}
        color={palette.text}
      />
      <directionalLight position={[-6, 1, 4]} intensity={0.32} color={palette.accent} />

      <group ref={world}>
        <points geometry={stars}>
          <pointsMaterial
            size={0.09}
            sizeAttenuation
            color={palette.text}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </points>

        <group position={[2.6, 4.4, -9]}>
          <mesh ref={planet}>
            <sphereGeometry
              args={[3.1, detail(quality, 48, 16), detail(quality, 32, 12)]}
            />
            <meshStandardMaterial
              color={palette.accent}
              roughness={0.96}
              flatShading={quality === 'low'}
            />
          </mesh>

          <group ref={rings} rotation={[1.32, 0, 0.28]}>
            {[4.4, 5.1, 5.8].map((r, i) => (
              <mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[r, r + 0.34 - i * 0.08, detail(quality, 90, 32)]} />
                <meshBasicMaterial
                  color={i === 1 ? palette.accentText : palette.teal}
                  transparent
                  opacity={0.34 - i * 0.06}
                  blending={AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
        </group>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]}>
          <planeGeometry args={[70, 50]} />
          <meshStandardMaterial color={palette.surface} roughness={1} />
        </mesh>

        {[-9, -4.5, 6, 11].map((x, i) => (
          <mesh key={x} position={[x, -1.2, -14]} rotation={[0, rand(i) * 1.2, 0]}>
            <cylinderGeometry
              args={[2.2 + rand(i * 3), 2.8 + rand(i * 5), 2.4 + rand(i * 7) * 1.4, 5]}
            />
            <meshBasicMaterial color={palette.bg} />
          </mesh>
        ))}

        {cacti.map((cactus, i) => (
          <group key={i} position={[cactus.x, -2.4, cactus.z]}>
            <mesh position={[0, cactus.height / 2, 0]}>
              <capsuleGeometry args={[0.2, cactus.height, 3, detail(quality, 10, 5)]} />
              <meshBasicMaterial color={palette.bg} />
            </mesh>
            {Array.from({ length: cactus.arms }, (_, a) => {
              const side = a === 0 ? 1 : -1;
              return (
                <group key={a}>
                  <mesh
                    position={[side * 0.34, cactus.height * 0.62, 0]}
                    rotation={[0, 0, (side * Math.PI) / 2]}
                  >
                    <capsuleGeometry args={[0.13, 0.5, 3, detail(quality, 8, 4)]} />
                    <meshBasicMaterial color={palette.bg} />
                  </mesh>
                  <mesh position={[side * 0.6, cactus.height * 0.86, 0]}>
                    <capsuleGeometry args={[0.13, 0.62, 3, detail(quality, 8, 4)]} />
                    <meshBasicMaterial color={palette.bg} />
                  </mesh>
                </group>
              );
            })}
          </group>
        ))}
      </group>
    </>
  );
}

export default function MysticalWesternScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.6, 9], fov: 52 }} fog={[16, 44]}>
      <Sky {...props} />
    </HeroCanvas>
  );
}
