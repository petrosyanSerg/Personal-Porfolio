'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  type Group,
  type Points,
} from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, useScrollProgress } from '../core/motion';
import { count, detail } from '../core/quality';

function Desert({ quality, reducedMotion, palette }: SceneProps) {
  const land = useRef<Group>(null);
  const dust = useRef<Points>(null);
  const pointer = usePointer(reducedMotion, 0.035);
  const scroll = useScrollProgress(true);

  const mesas = useMemo(
    () =>
      Array.from({ length: count(quality, 11) }, (_, i) => ({
        x: srand(i * 2.7) * 26,
        z: -8 - rand(i * 4.9) * 26,
        radius: 1.6 + rand(i * 6.1) * 3,
        height: 1.8 + rand(i * 8.3) * 3.4,
        sides: 5 + Math.floor(rand(i * 3.3) * 4),
        rotation: rand(i * 5.5) * Math.PI,
      })),
    [quality],
  );

  const scrub = useMemo(
    () =>
      Array.from({ length: count(quality, 24) }, (_, i) => ({
        x: srand(i * 3.1) * 20,
        z: -2 - rand(i * 5.7) * 16,
        scale: 0.2 + rand(i * 7.9) * 0.4,
      })),
    [quality],
  );

  const devil = useMemo(() => {
    const total = count(quality, 220);
    const positions = new Float32Array(total * 3);

    for (let i = 0; i < total; i += 1) {
      const up = i / total;
      const a = up * Math.PI * 14 + rand(i) * 0.6;
      const r = 0.25 + up * up * 1.5;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = up * 5.5;
      positions[i * 3 + 2] = Math.sin(a) * r;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    return geometry;
  }, [quality]);

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (dust.current) {
      dust.current.rotation.y = t * 1.3;
      dust.current.position.x = 6 + Math.sin(t * 0.13) * 4;
      dust.current.position.z = -12 + Math.cos(t * 0.09) * 4;
    }

    if (land.current) {
      land.current.position.z = scroll.value * 8;
      land.current.rotation.y +=
        (pointer.current.x * 0.08 - land.current.rotation.y) * 0.02;
    }

    state.camera.position.y +=
      (1.2 + pointer.current.y * 0.8 - state.camera.position.y) * 0.03;
  });

  return (
    <>
      <ambientLight intensity={1.05} color={palette.surfaceHigh} />
      <directionalLight position={[1, 14, 2]} intensity={1.7} color={palette.text} />
      <directionalLight position={[0, -4, 3]} intensity={0.3} color={palette.accent} />

      <group ref={land}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, -10]}>
          <planeGeometry args={[120, 90]} />
          <meshStandardMaterial color={palette.surfaceHigh} roughness={1} />
        </mesh>

        {mesas.map((mesa, i) => (
          <group
            key={i}
            position={[mesa.x, -1.6, mesa.z]}
            rotation={[0, mesa.rotation, 0]}
          >
            <mesh position={[0, mesa.height / 2, 0]}>
              <cylinderGeometry
                args={[mesa.radius * 0.86, mesa.radius, mesa.height, mesa.sides]}
              />
              <meshStandardMaterial color={palette.accent} roughness={1} flatShading />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry
                args={[mesa.radius, mesa.radius * 1.35, 0.4, mesa.sides]}
              />
              <meshStandardMaterial color={palette.textMuted} roughness={1} flatShading />
            </mesh>
            <mesh position={[0, mesa.height + 0.06, 0]}>
              <cylinderGeometry
                args={[mesa.radius * 0.9, mesa.radius * 0.86, 0.16, mesa.sides]}
              />
              <meshStandardMaterial color={palette.teal} roughness={1} flatShading />
            </mesh>
          </group>
        ))}

        {scrub.map((bush, i) => (
          <mesh key={`scrub-${i}`} position={[bush.x, -1.5, bush.z]} scale={bush.scale}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={palette.teal} roughness={1} flatShading />
          </mesh>
        ))}

        {[-4.5, 5.5].map((x, i) => (
          <group key={x} position={[x, -1.6, -3 - i * 2]}>
            <mesh position={[0, 1.5, 0]}>
              <capsuleGeometry args={[0.26, 2.4, 4, detail(quality, 12, 6)]} />
              <meshStandardMaterial color={palette.teal} roughness={0.95} />
            </mesh>
            <mesh position={[0.44, 1.9, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <capsuleGeometry args={[0.16, 0.6, 4, detail(quality, 10, 5)]} />
              <meshStandardMaterial color={palette.teal} roughness={0.95} />
            </mesh>
            <mesh position={[0.74, 2.4, 0]}>
              <capsuleGeometry args={[0.16, 0.8, 4, detail(quality, 10, 5)]} />
              <meshStandardMaterial color={palette.teal} roughness={0.95} />
            </mesh>
          </group>
        ))}

        <points ref={dust} geometry={devil} position={[6, -1.6, -12]}>
          <pointsMaterial
            size={0.09}
            sizeAttenuation
            color={palette.textMuted}
            transparent
            opacity={0.42}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </>
  );
}

export default function WildWestScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 1.2, 8], fov: 54 }} fog={[24, 62]}>
      <Desert {...props} />
    </HeroCanvas>
  );
}
