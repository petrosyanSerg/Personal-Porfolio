'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Group, type SpotLight } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { sceneTime, usePointer, wobble } from '../core/motion';
import { detail } from '../core/quality';

function Subject({ quality, reducedMotion, palette }: SceneProps) {
  const key = useRef<SpotLight>(null);
  const subject = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.07);

  const segments = detail(quality, 40, 12);

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (key.current) {
      key.current.position.set(
        pointer.current.x * 6,
        2.6 + pointer.current.y * 2.4,
        5.2 + Math.abs(pointer.current.x) * 1.4,
      );
      key.current.intensity = 190 + Math.sin(t * 2.7) * 14 + Math.sin(t * 0.9) * 8;
    }

    if (subject.current) {
      subject.current.rotation.y = wobble(t * 0.07, 1) * 0.14;
      subject.current.rotation.x = wobble(t * 0.05, 6) * 0.04;
    }
  });

  return (
    <>
      <ambientLight intensity={0.04} color={palette.accent} />

      <spotLight
        ref={key}
        position={[2, 3, 5]}
        angle={0.42}
        penumbra={0.42}
        intensity={190}
        distance={22}
        decay={2}
        color={palette.accentText}
        castShadow={quality === 'high'}
        shadow-mapSize={[1024, 1024]}
      />

      <group ref={subject} position={[0, -0.3, 0]}>
        <mesh castShadow receiveShadow>
          <torusKnotGeometry
            args={[1.15, 0.42, detail(quality, 200, 60), detail(quality, 26, 8), 2, 5]}
          />
          <meshStandardMaterial color={palette.text} roughness={0.62} metalness={0.08} />
        </mesh>

        <mesh position={[1.6, -0.4, -1.4]} rotation={[0.2, -0.6, 0.3]} receiveShadow>
          <cylinderGeometry args={[0.9, 1.4, 3.4, segments, 1, true]} />
          <meshStandardMaterial color={palette.teal} roughness={0.92} side={2} />
        </mesh>

        <mesh position={[0, -2.1, 0]} receiveShadow>
          <cylinderGeometry args={[1.5, 1.7, 0.5, segments]} />
          <meshStandardMaterial color={palette.surfaceHigh} roughness={0.86} />
        </mesh>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.7, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={palette.surface} roughness={1} />
      </mesh>
    </>
  );
}

export default function TenebrismScene(props: SceneProps) {
  return (
    <HeroCanvas
      {...props}
      camera={{ position: [0, 0.3, 7.2], fov: 42 }}
      fog={[8, 20]}
      shadows
    >
      <Subject {...props} />
    </HeroCanvas>
  );
}
