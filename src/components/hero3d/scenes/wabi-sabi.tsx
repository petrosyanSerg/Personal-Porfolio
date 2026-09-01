'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CatmullRomCurve3,
  LatheGeometry,
  Vector2,
  Vector3,
  type BufferAttribute,
  type Group,
} from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, wobble } from '../core/motion';
import { detail } from '../core/quality';

function Vessel({ quality, reducedMotion, palette }: SceneProps) {
  const pot = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.03);

  const geometry = useMemo(() => {
    const profile = [
      new Vector2(0.02, -1.2),
      new Vector2(0.42, -1.18),
      new Vector2(0.5, -1.05),
      new Vector2(0.44, -0.9),
      new Vector2(0.78, -0.4),
      new Vector2(0.95, 0.15),
      new Vector2(0.9, 0.6),
      new Vector2(0.82, 0.86),
      new Vector2(0.86, 0.92),
    ];

    const lathe = new LatheGeometry(profile, detail(quality, 56, 20));
    const position = lathe.attributes.position as BufferAttribute;
    const array = position.array as Float32Array;

    for (let i = 0; i < array.length; i += 3) {
      const x = array[i]!;
      const y = array[i + 1]!;
      const z = array[i + 2]!;
      const angle = Math.atan2(z, x);
      const radius = Math.hypot(x, z);

      const warp =
        1 +
        Math.sin(angle * 3 + y * 1.4) * 0.045 +
        Math.sin(angle * 5 - y * 0.8) * 0.025 +
        srand(i) * 0.008;

      array[i] = x * warp;
      array[i + 2] = z * warp;
      if (y > 0.8) array[i + 1] = y + Math.sin(angle * 2 + 1) * 0.05;
      void radius;
    }

    position.needsUpdate = true;
    lathe.computeVertexNormals();
    return lathe;
  }, [quality]);

  const seam = useMemo(() => {
    const points: Vector3[] = [];

    for (let i = 0; i <= 14; i += 1) {
      const t = i / 14;
      const y = 0.9 - t * 1.9;
      const angle = 0.6 + t * 1.8 + Math.sin(t * 5) * 0.35;
      const radius =
        (0.5 + Math.sin((y + 1.2) * 1.2) * 0.45) *
          (1 + Math.sin(angle * 3 + y * 1.4) * 0.045) +
        0.012;

      points.push(new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
    }

    return new CatmullRomCurve3(points);
  }, []);

  useFrame((state) => {
    if (!pot.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    pot.current.rotation.y = t * 0.035 + pointer.current.x * 0.7;
    pot.current.rotation.z = wobble(t * 0.08, 1) * 0.012;
    pot.current.rotation.x = pointer.current.y * -0.12;
  });

  return (
    <>
      <ambientLight intensity={0.85} color={palette.surfaceHigh} />
      <directionalLight position={[-4, 5, 5]} intensity={1.2} color={palette.text} />
      <pointLight
        position={[3, -2, 3]}
        intensity={18}
        distance={14}
        decay={2}
        color={palette.accent}
      />

      <group ref={pot} position={[0, 0.1, 0]} scale={1.9}>
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color={palette.textMuted}
            roughness={0.92}
            metalness={0.02}
            side={2}
          />
        </mesh>

        <mesh>
          <tubeGeometry
            args={[seam, detail(quality, 60, 22), 0.018, detail(quality, 8, 4), false]}
          />
          <meshStandardMaterial color={palette.accent} metalness={1} roughness={0.2} />
        </mesh>
      </group>

      {[
        [-2.4, -1.5, 0.7, 0.5],
        [2.1, -1.7, -0.4, 0.3],
      ].map(([x, y, z, s], i) => (
        <mesh
          key={i}
          position={[x!, y!, z!]}
          rotation={[rand(i) * 3, rand(i * 3) * 3, rand(i * 5) * 3]}
          scale={[s!, s! * 0.7, s! * 0.9]}
        >
          <icosahedronGeometry args={[1, quality === 'high' ? 1 : 0]} />
          <meshStandardMaterial color={palette.text} roughness={0.96} flatShading />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.05, 0]}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={palette.surface} roughness={1} />
      </mesh>
    </>
  );
}

export default function WabiSabiScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.3, 7], fov: 42 }} fog={[9, 22]}>
      <Vessel {...props} />
    </HeroCanvas>
  );
}
