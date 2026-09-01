'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PlaneGeometry, type BufferAttribute, type Group, type Mesh } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer } from '../core/motion';
import { count, detail } from '../core/quality';

function Aquarium({ quality, reducedMotion, palette }: SceneProps) {
  const bubbles = useRef<Group>(null);
  const surface = useRef<Mesh>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const swarm = useMemo(
    () =>
      Array.from({ length: count(quality, 42) }, (_, i) => {
        const radius = 0.09 + rand(i * 3.1) ** 2 * 0.5;
        return {
          radius,
          x: srand(i * 2.3) * 7,
          z: srand(i * 5.7) * 3 - 0.5,
          offset: rand(i * 7.9) * 8,
          speed: 0.22 + radius * radius * 4.2,
          lane: i * 1.7,
        };
      }),
    [quality],
  );

  const water = useMemo(() => {
    const segments = detail(quality, 34, 12);
    const plane = new PlaneGeometry(30, 22, segments, segments);
    plane.rotateX(-Math.PI / 2);
    return plane;
  }, [quality]);

  const rest = useMemo(
    () => Float32Array.from(water.attributes.position!.array),
    [water],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (bubbles.current) {
      bubbles.current.children.forEach((child, i) => {
        const bubble = swarm[i];
        if (!bubble) return;

        const climb = ((t + bubble.offset) * bubble.speed) % 9;
        child.position.set(
          bubble.x + Math.sin(t * 0.6 + bubble.lane) * 0.22,
          -4.5 + climb,
          bubble.z,
        );
        child.rotation.z = Math.sin(t * 1.4 + bubble.lane) * 0.2;
        const squash = 1 + bubble.speed * 0.06;
        child.scale.set(squash, 1 / squash, squash);
      });
    }

    if (surface.current) {
      const attribute = water.attributes.position as BufferAttribute;
      const array = attribute.array as Float32Array;

      for (let i = 0; i < array.length; i += 3) {
        const x = rest[i]!;
        const z = rest[i + 2]!;
        array[i + 1] =
          Math.sin(x * 0.42 + t * 0.8) * 0.16 + Math.sin(z * 0.31 - t * 0.6) * 0.12;
      }

      attribute.needsUpdate = true;
      surface.current.position.x = pointer.current.x * 0.6;
    }

    state.camera.position.x += (pointer.current.x * 1.2 - state.camera.position.x) * 0.03;
    state.camera.position.y +=
      (0.4 + pointer.current.y * 0.8 - state.camera.position.y) * 0.03;
    state.camera.lookAt(0, 0.6, 0);
  });

  return (
    <>
      <ambientLight intensity={1.15} color={palette.accentText} />
      <directionalLight position={[1, 10, 3]} intensity={1.5} color={palette.text} />
      <pointLight
        position={[-5, 2, 4]}
        intensity={30}
        distance={20}
        decay={2}
        color={palette.teal}
      />

      <mesh ref={surface} geometry={water} position={[0, 5.4, 0]}>
        <meshStandardMaterial
          color={palette.accent}
          transparent
          opacity={0.34}
          roughness={0.08}
          metalness={0.2}
          side={2}
        />
      </mesh>

      <group ref={bubbles}>
        {swarm.map((bubble, i) => (
          <mesh key={i} scale={bubble.radius}>
            <sphereGeometry args={[1, detail(quality, 26, 10), detail(quality, 18, 8)]} />
            <meshStandardMaterial
              color={palette.text}
              transparent
              opacity={0.26}
              roughness={0.02}
              metalness={0.1}
              envMapIntensity={2}
            />
          </mesh>
        ))}
      </group>

      {Array.from({ length: count(quality, 9) }, (_, i) => (
        <mesh
          key={`frond-${i}`}
          position={[srand(i * 4.1) * 8, -4.4, -1.5 - rand(i * 6.3) * 2]}
          rotation={[0, 0, srand(i * 8.7) * 0.3]}
        >
          <capsuleGeometry
            args={[0.07, 1.4 + rand(i) * 1.6, 3, detail(quality, 10, 5)]}
          />
          <meshStandardMaterial
            color={palette.teal}
            roughness={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </>
  );
}

export default function FrutigerAeroScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.4, 8.4], fov: 48 }} fog={[12, 30]}>
      <Aquarium {...props} />
    </HeroCanvas>
  );
}
