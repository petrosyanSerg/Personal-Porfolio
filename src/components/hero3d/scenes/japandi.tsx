'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RingGeometry, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer } from '../core/motion';
import { count, detail } from '../core/quality';

const STONES = [
  { x: -1.5, z: -0.4, scale: 0.82, tilt: 0.3 },
  { x: -0.75, z: 0.5, scale: 0.44, tilt: -0.5 },
  { x: -1.1, z: 1.15, scale: 0.3, tilt: 0.9 },
  { x: 1.35, z: -0.9, scale: 0.58, tilt: -0.2 },
  { x: 1.9, z: 1.3, scale: 0.36, tilt: 0.6 },
] as const;

function Garden({ quality, reducedMotion, palette }: SceneProps) {
  const garden = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.025);

  const rings = useMemo(() => {
    const perStone = quality === 'low' ? 2 : 4;
    const segments = detail(quality, 64, 22);
    const out: { geometry: RingGeometry; x: number; z: number }[] = [];

    STONES.forEach((stone, s) => {
      for (let r = 0; r < perStone; r += 1) {
        const inner = stone.scale + 0.22 + r * 0.3;
        out.push({
          geometry: new RingGeometry(inner, inner + 0.035, segments),
          x: stone.x,
          z: stone.z,
        });
      }
      void s;
    });

    return out;
  }, [quality]);

  useFrame((state) => {
    if (!garden.current) return;
    void sceneTime(state.clock.elapsedTime, reducedMotion);

    garden.current.rotation.y +=
      (pointer.current.x * 0.08 - garden.current.rotation.y) * 0.02;
    garden.current.rotation.x +=
      (pointer.current.y * 0.03 - garden.current.rotation.x) * 0.02;
  });

  return (
    <>
      <ambientLight intensity={1.1} color={palette.surfaceHigh} />
      <directionalLight position={[4, 9, 3]} intensity={1.15} color={palette.text} />

      <group ref={garden} rotation={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]}>
          <planeGeometry args={[26, 26]} />
          <meshStandardMaterial color={palette.surface} roughness={1} />
        </mesh>

        {Array.from({ length: count(quality, 22) }, (_, i) => (
          <mesh
            key={`line-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1.288, -5 + i * 0.46]}
          >
            <planeGeometry args={[16, 0.03]} />
            <meshBasicMaterial color={palette.border} transparent opacity={0.5} />
          </mesh>
        ))}

        {rings.map((ring, i) => (
          <mesh
            key={`ring-${i}`}
            geometry={ring.geometry}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[ring.x, -1.282, ring.z]}
          >
            <meshBasicMaterial color={palette.accent} transparent opacity={0.34} />
          </mesh>
        ))}

        {STONES.map((stone, i) => (
          <mesh
            key={`stone-${i}`}
            position={[stone.x, -1.3 + stone.scale * 0.42, stone.z]}
            rotation={[stone.tilt * 0.4, rand(i) * Math.PI, stone.tilt]}
            scale={[stone.scale, stone.scale * 0.62, stone.scale * 0.88]}
          >
            <icosahedronGeometry args={[1, quality === 'high' ? 1 : 0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? palette.textMuted : palette.accent}
              roughness={0.94}
              flatShading
            />
          </mesh>
        ))}

        <mesh position={[3.4 + srand(3) * 0.1, -0.2, -1.6]}>
          <boxGeometry args={[0.16, 2.2, 0.16]} />
          <meshStandardMaterial color={palette.accent} roughness={0.85} />
        </mesh>
      </group>
    </>
  );
}

export default function JapandiScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 1.5, 6.4], fov: 42 }} fog={[9, 24]}>
      <Garden {...props} />
    </HeroCanvas>
  );
}
