'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer, useScrollProgress } from '../core/motion';
import { count, detail } from '../core/quality';

function Structure({ quality, reducedMotion, palette }: SceneProps) {
  const mass = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.03);
  const scroll = useScrollProgress(true);

  const levels = useMemo(
    () =>
      Array.from({ length: count(quality, 6) }, (_, i) => ({
        y: i * 2.3 - 3,
        rotation: (i % 2) * (Math.PI / 2),
        width: 5.4 - i * 0.35,
        depth: 2.6 - i * 0.12,
        offset: (rand(i * 7) - 0.5) * 0.9,
      })),
    [quality],
  );

  useFrame((state) => {
    if (!mass.current) return;
    void sceneTime(state.clock.elapsedTime, reducedMotion);

    mass.current.rotation.y +=
      (pointer.current.x * 0.22 - mass.current.rotation.y) * 0.025;
    mass.current.position.y += (-2 - scroll.value * 3.4 - mass.current.position.y) * 0.04;

    state.camera.position.x += (pointer.current.x * 1.4 - state.camera.position.x) * 0.03;
    state.camera.lookAt(0, 2.6 + pointer.current.y * 1.4, 0);
  });

  return (
    <>
      <ambientLight intensity={0.5} color={palette.surfaceHigh} />
      <directionalLight position={[9, 14, 5]} intensity={2.1} color={palette.text} />

      <group ref={mass} position={[0, -2, 0]}>
        {levels.map((level, i) => (
          <group key={i} position={[0, level.y, 0]} rotation={[0, level.rotation, 0]}>
            <mesh position={[level.offset, 0, 0]}>
              <boxGeometry args={[level.width, 1.5, level.depth]} />
              <meshStandardMaterial
                color={palette.surface}
                roughness={1}
                metalness={0}
                flatShading
              />
            </mesh>

            {[-1, 1].map((side) => (
              <mesh
                key={side}
                position={[level.offset + side * level.width * 0.3, -1.15, 0]}
              >
                <boxGeometry args={[0.5, 0.8, level.depth * 0.6]} />
                <meshStandardMaterial
                  color={palette.surfaceHigh}
                  roughness={1}
                  flatShading
                />
              </mesh>
            ))}

            <mesh position={[level.offset, 0.1, level.depth / 2 - 0.18]}>
              <boxGeometry args={[level.width - 0.8, 0.55, 0.2]} />
              <meshStandardMaterial color={palette.bg} roughness={1} />
            </mesh>
          </group>
        ))}

        <mesh position={[-3.1, 3.4, -0.8]}>
          <boxGeometry args={[1.5, 15, 1.5]} />
          <meshStandardMaterial color={palette.surfaceHigh} roughness={1} flatShading />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.5, 0]}>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color={palette.surface} roughness={1} />
        </mesh>
      </group>

      <gridHelper
        args={[60, detail(quality, 30, 12), palette.border, palette.border]}
        position={[0, -6.49, 0]}
      />
    </>
  );
}

export default function BrutalismScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, -1.4, 9.5], fov: 58 }} fog={[18, 46]}>
      <Structure {...props} />
    </HeroCanvas>
  );
}
