'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Vector3,
  type Group,
  type PointLight,
} from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

function Sculpture({ quality, reducedMotion, palette }: SceneProps) {
  const group = useRef<Group>(null);
  const key = useRef<PointLight>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const frame = useMemo(() => {
    const points: Vector3[] = [];
    const turns = 88;

    for (let i = 0; i <= turns; i += 1) {
      const a = (i / turns) * Math.PI * 2;
      const r = 3.15 + Math.sin(a * 3) * 0.32 + Math.sin(a * 5) * 0.14;
      points.push(
        new Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.72, Math.sin(a * 4) * 0.4),
      );
    }

    return new CatmullRomCurve3(points, true);
  }, []);

  const embers = useMemo(() => {
    const total = count(quality, 220);
    const positions = new Float32Array(total * 3);

    for (let i = 0; i < total; i += 1) {
      const a = rand(i * 1.7) * Math.PI * 2;
      const r = 1.4 + rand(i * 4.1) * 4.4;
      positions[i * 3] = Math.cos(a) * r * 1.15 + 1.2;
      positions[i * 3 + 1] = Math.sin(a) * r * 0.85;
      positions[i * 3 + 2] = (rand(i * 8.9) - 0.5) * 3.4;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    return geometry;
  }, [quality]);

  useFrame((state, delta) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (group.current) {
      if (!reducedMotion) group.current.rotation.y += delta * 0.14;
      group.current.rotation.z = 0.18 + wobble(t * 0.24, 2) * 0.05;
      group.current.rotation.x = -0.12 + pointer.current.y * 0.12;
    }

    if (key.current) {
      key.current.position.set(
        4.6 + pointer.current.x * 4.2,
        3.4 + pointer.current.y * 2.6,
        4.2,
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.16} color={palette.accent} />
      <pointLight ref={key} intensity={90} distance={26} decay={2} color={palette.text} />
      <pointLight
        position={[-6, -2, -7]}
        intensity={26}
        distance={22}
        decay={2}
        color={palette.accentText}
      />

      <group ref={group}>
        <mesh>
          <torusKnotGeometry
            args={[1.5, 0.36, detail(quality, 190, 64), detail(quality, 20, 8), 2, 3]}
          />
          <meshStandardMaterial
            color={palette.accent}
            metalness={0.95}
            roughness={0.22}
            flatShading={quality === 'low'}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0.4, 0]} scale={0.72}>
          <torusKnotGeometry
            args={[1.5, 0.24, detail(quality, 160, 56), detail(quality, 16, 8), 3, 4]}
          />
          <meshStandardMaterial
            color={palette.accentText}
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>

        <mesh rotation={[0.9, 0, Math.PI / 3]} scale={0.46}>
          <torusKnotGeometry
            args={[1.5, 0.3, detail(quality, 130, 48), detail(quality, 14, 6), 1, 2]}
          />
          <meshStandardMaterial color={palette.text} metalness={0.8} roughness={0.42} />
        </mesh>

        <mesh>
          <tubeGeometry
            args={[frame, detail(quality, 260, 90), 0.075, detail(quality, 12, 5), true]}
          />
          <meshStandardMaterial color={palette.accent} metalness={1} roughness={0.18} />
        </mesh>
      </group>

      <points geometry={embers}>
        <pointsMaterial
          size={0.07}
          sizeAttenuation
          color={palette.accent}
          transparent
          opacity={0.5}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </>
  );
}

export default function BaroqueScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0.4, 0.2, 9], fov: 44 }} fog={[10, 26]}>
      <Sculpture {...props} />
    </HeroCanvas>
  );
}
