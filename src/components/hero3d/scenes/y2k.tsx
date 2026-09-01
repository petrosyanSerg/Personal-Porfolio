'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, DoubleSide, type Group, type Mesh } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

function Chrome({ quality, reducedMotion, palette }: SceneProps) {
  const blobs = useRef<Group>(null);
  const panels = useRef<Group>(null);
  const shell = useRef<Mesh>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const windows = useMemo(
    () =>
      Array.from({ length: count(quality, 7) }, (_, i) => ({
        position: [
          srand(i * 2.7) * 5.4,
          srand(i * 4.1) * 2.8,
          -1.5 - rand(i * 6.3) * 3,
        ] as [number, number, number],
        size: [1.5 + rand(i * 8.1) * 1.3, 1 + rand(i * 3.3) * 0.9] as [number, number],
        lane: i * 1.9,
      })),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (blobs.current) {
      blobs.current.children.forEach((child, i) => {
        child.rotation.y = t * (0.16 + i * 0.05);
        child.rotation.x = t * 0.09;
        child.position.y = srand(i * 3.7) * 1.6 + wobble(t * 0.3, i * 2.1) * 0.24;
      });

      blobs.current.rotation.y +=
        (pointer.current.x * 0.4 - blobs.current.rotation.y) * 0.05;
    }

    if (panels.current) {
      panels.current.children.forEach((child, i) => {
        const depth = 0.1 + i * 0.05;
        child.position.x = windows[i]!.position[0] + pointer.current.x * depth * 3;
        child.position.y = windows[i]!.position[1] + pointer.current.y * depth * 1.6;
        child.rotation.y = pointer.current.x * 0.2;
      });
    }

    if (shell.current) shell.current.rotation.y = -pointer.current.x * 0.5 + t * 0.01;
  });

  return (
    <>
      <ambientLight intensity={0.7} color={palette.text} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} color={palette.text} />
      <pointLight
        position={[-5, -2, 4]}
        intensity={40}
        distance={22}
        decay={2}
        color={palette.accent}
      />

      <mesh ref={shell}>
        <sphereGeometry args={[38, 24, 16]} />
        <meshBasicMaterial
          color={palette.accentText}
          side={BackSide}
          transparent
          opacity={0.35}
        />
      </mesh>

      <group ref={blobs}>
        {[
          { r: 1.25, x: -1.4, detail: 3 },
          { r: 0.85, x: 1.5, detail: 2 },
          { r: 0.55, x: 2.9, detail: 1 },
        ].map((blob, i) => (
          <mesh key={i} position={[blob.x, 0, 0]}>
            <icosahedronGeometry
              args={[blob.r, quality === 'low' ? blob.detail : blob.detail + 1]}
            />
            <meshStandardMaterial
              color={palette.text}
              metalness={1}
              roughness={0.06 + i * 0.04}
              envMapIntensity={1.4}
            />
          </mesh>
        ))}
      </group>

      <group ref={panels}>
        {windows.map((pane, i) => (
          <group key={i} position={pane.position}>
            <mesh>
              <planeGeometry args={pane.size} />
              <meshStandardMaterial
                color={i % 2 === 0 ? palette.accent : palette.teal}
                transparent
                opacity={0.22}
                roughness={0.1}
                metalness={0.2}
                side={DoubleSide}
              />
            </mesh>
            <mesh position={[0, pane.size[1] / 2 - 0.12, 0.01]}>
              <planeGeometry args={[pane.size[0] - 0.1, 0.16]} />
              <meshBasicMaterial color={palette.text} transparent opacity={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]}>
        <circleGeometry args={[14, detail(quality, 48, 16)]} />
        <meshStandardMaterial
          color={palette.surfaceHigh}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
    </>
  );
}

export default function Y2KScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.4, 7.2], fov: 46 }}>
      <Chrome {...props} />
    </HeroCanvas>
  );
}
