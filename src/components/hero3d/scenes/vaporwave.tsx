'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

type BustProps = {
  palette: SceneProps['palette'];
  quality: SceneProps['quality'];
  color: 'text' | 'accent' | 'teal';
  opacity: number;
};

function Bust({ palette, quality, color, opacity }: BustProps) {
  const segments = detail(quality, 28, 10);
  const material = (
    <meshStandardMaterial
      color={palette[color]}
      roughness={0.72}
      transparent={opacity < 1}
      opacity={opacity}
      flatShading={quality === 'low'}
    />
  );

  return (
    <group>
      <mesh position={[0, 1.5, 0]} scale={[0.78, 1, 0.86]}>
        <sphereGeometry args={[0.68, segments, segments]} />
        {material}
      </mesh>
      <mesh position={[0, 1.42, 0.62]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.12, 0.34, 4]} />
        {material}
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 0.5, segments]} />
        {material}
      </mesh>
      <mesh position={[0, 0.35, 0]} scale={[1.5, 0.6, 1]}>
        <sphereGeometry args={[0.6, segments, segments]} />
        {material}
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[1.3, 1, 1.3]} />
        {material}
      </mesh>
      <mesh position={[0, -1.06, 0]}>
        <boxGeometry args={[1.6, 0.16, 1.6]} />
        {material}
      </mesh>
    </group>
  );
}

function Space({ quality, reducedMotion, palette }: SceneProps) {
  const stage = useRef<Group>(null);
  const cyan = useRef<Group>(null);
  const magenta = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const columns = useMemo(
    () =>
      Array.from({ length: count(quality, 6) }, (_, i) => ({
        x: (i % 2 === 0 ? -1 : 1) * (3.4 + Math.floor(i / 2) * 1.6),
        z: -2 - Math.floor(i / 2) * 4,
        height: 5 + rand(i * 3.7) * 1.4,
      })),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (stage.current) {
      stage.current.rotation.y = t * 0.08 + pointer.current.x * 0.3;
    }

    const jump = Math.sin(t * 0.37) > 0.94 ? 0.08 : 0;
    const drift = wobble(t * 0.4, 2) * 0.02 + jump;

    if (cyan.current) cyan.current.position.set(-0.035 - drift, 0.01, -0.02);
    if (magenta.current) magenta.current.position.set(0.035 + drift, -0.01, 0.02);
  });

  return (
    <>
      <ambientLight intensity={0.85} color={palette.teal} />
      <directionalLight position={[3, 5, 6]} intensity={0.9} color={palette.text} />
      <pointLight
        position={[-5, 2, 3]}
        intensity={40}
        distance={22}
        decay={2}
        color={palette.accent}
      />

      <group ref={stage} position={[0, -0.4, 0]}>
        <group ref={cyan}>
          <Bust palette={palette} quality={quality} color="accent" opacity={0.55} />
        </group>
        <group ref={magenta}>
          <Bust palette={palette} quality={quality} color="teal" opacity={0.55} />
        </group>
        <Bust palette={palette} quality={quality} color="text" opacity={1} />
      </group>

      {columns.map((column, i) => (
        <mesh key={i} position={[column.x, column.height / 2 - 2.4, column.z]}>
          <cylinderGeometry args={[0.3, 0.34, column.height, detail(quality, 14, 6)]} />
          <meshStandardMaterial
            color={palette.surfaceHigh}
            roughness={0.8}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, -6]}>
        <planeGeometry
          args={[60, 60, detail(quality, 30, 12), detail(quality, 30, 12)]}
        />
        <meshBasicMaterial
          color={palette.accent}
          wireframe
          transparent
          opacity={0.3}
          side={DoubleSide}
        />
      </mesh>

      {[-6.5, 7].map((x, i) => (
        <mesh key={x} position={[x, 1.4, -9]} rotation={[0, 0, srand(i) * 0.2]}>
          <torusGeometry args={[1.6, 0.05, 6, detail(quality, 24, 10), Math.PI]} />
          <meshBasicMaterial color={palette.teal} transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

export default function VaporwaveScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.6, 6.6], fov: 46 }} fog={[10, 30]}>
      <Space {...props} />
    </HeroCanvas>
  );
}
