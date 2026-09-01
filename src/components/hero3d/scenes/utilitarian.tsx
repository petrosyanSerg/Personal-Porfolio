'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, type Group, type Mesh } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { sceneTime, usePointer } from '../core/motion';
import { count, detail } from '../core/quality';

function Bench({ quality, reducedMotion, palette }: SceneProps) {
  const turntable = useRef<Group>(null);
  const indicator = useRef<Mesh>(null);
  const lamp = useRef<Mesh>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const bounds = useMemo(() => ({ width: 2.4, height: 1.4, depth: 2.4 }), []);

  const ticks = useMemo(() => {
    const positions: number[] = [];
    const total = count(quality, 41);

    for (let i = 0; i < total; i += 1) {
      const x = (i / (total - 1) - 0.5) * 8;
      const height = i % 5 === 0 ? 0.28 : 0.14;
      positions.push(x, -2.5, 0, x, -2.5 + height, 0);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(positions), 3),
    );
    return geometry;
  }, [quality]);

  const dimensions = useMemo(() => {
    const { width, height } = bounds;
    const positions: number[] = [
      -width / 2,
      -1.9,
      0,
      width / 2,
      -1.9,
      0,
      -width / 2,
      -1.75,
      0,
      -width / 2,
      -2.05,
      0,
      width / 2,
      -1.75,
      0,
      width / 2,
      -2.05,
      0,
      width / 2 + 0.7,
      -height / 2,
      0,
      width / 2 + 0.7,
      height / 2,
      0,
      width / 2 + 0.55,
      -height / 2,
      0,
      width / 2 + 0.85,
      -height / 2,
      0,
      width / 2 + 0.55,
      height / 2,
      0,
      width / 2 + 0.85,
      height / 2,
      0,
      -width / 2,
      -height / 2,
      0,
      -width / 2,
      -1.85,
      0,
      width / 2,
      -height / 2,
      0,
      width / 2,
      -1.85,
      0,
      width / 2,
      height / 2,
      0,
      width / 2 + 0.9,
      height / 2,
      0,
    ];

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(positions), 3),
    );
    return geometry;
  }, [bounds]);

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    const angle = t * 0.52 + pointer.current.x * 1.4;
    if (turntable.current) turntable.current.rotation.y = angle;

    if (indicator.current) {
      const normalised = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      indicator.current.position.x = (normalised / (Math.PI * 2) - 0.5) * 8;
    }

    if (lamp.current) {
      const settling = Math.abs(Math.sin(angle * 3)) > 0.9;
      const material = lamp.current.material as unknown as {
        color: { set: (c: string) => void };
      };
      material.color.set(settling ? palette.accent : palette.teal);
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} color={palette.surfaceHigh} />
      <directionalLight position={[2, 9, 4]} intensity={1.4} color={palette.text} />
      <directionalLight position={[-6, 2, 5]} intensity={0.4} color={palette.text} />

      <group ref={turntable} position={[0, 0.2, 0]}>
        <mesh>
          <cylinderGeometry
            args={[
              bounds.width / 2,
              bounds.width / 2,
              bounds.height,
              detail(quality, 40, 14),
            ]}
          />
          <meshStandardMaterial
            color={palette.textMuted}
            metalness={0.72}
            roughness={0.36}
          />
        </mesh>
        <mesh position={[0, bounds.height / 2, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.3, detail(quality, 28, 12)]} />
          <meshStandardMaterial color={palette.accent} metalness={0.6} roughness={0.44} />
        </mesh>
        {Array.from({ length: 4 }, (_, i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(a) * 0.86,
                bounds.height / 2 - 0.02,
                Math.sin(a) * 0.86,
              ]}
            >
              <cylinderGeometry args={[0.13, 0.13, 0.2, detail(quality, 14, 6)]} />
              <meshStandardMaterial color={palette.bg} roughness={0.9} />
            </mesh>
          );
        })}
      </group>

      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[2.1, 2.1, 0.14, detail(quality, 48, 16)]} />
        <meshStandardMaterial color={palette.surface} metalness={0.3} roughness={0.7} />
      </mesh>

      <lineSegments geometry={dimensions}>
        <lineBasicMaterial color={palette.accent} transparent opacity={0.75} />
      </lineSegments>

      <lineSegments geometry={ticks}>
        <lineBasicMaterial color={palette.textMuted} transparent opacity={0.6} />
      </lineSegments>

      <mesh position={[0, -2.56, 0]}>
        <boxGeometry args={[8.2, 0.03, 0.03]} />
        <meshBasicMaterial color={palette.textMuted} />
      </mesh>
      <mesh ref={indicator} position={[0, -2.42, 0]}>
        <coneGeometry args={[0.1, 0.22, 3]} />
        <meshBasicMaterial color={palette.accent} />
      </mesh>

      <mesh ref={lamp} position={[-3.6, 2.2, 0]}>
        <sphereGeometry args={[0.12, detail(quality, 14, 6), detail(quality, 10, 5)]} />
        <meshBasicMaterial color={palette.teal} />
      </mesh>

      <gridHelper
        args={[16, detail(quality, 32, 12), palette.border, palette.border]}
        position={[0, -2.7, 0]}
      />
    </>
  );
}

export default function UtilitarianScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.6, 8.4], fov: 40 }}>
      <Bench {...props} />
    </HeroCanvas>
  );
}
