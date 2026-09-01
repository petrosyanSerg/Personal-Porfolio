'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Group, type PointLight } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

function Gasolier({ quality, reducedMotion, palette }: SceneProps) {
  const arms = quality === 'low' ? 4 : 6;
  const lights = useRef<(PointLight | null)[]>([]);
  const fixture = useRef<Group>(null);
  const room = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.03);

  const pictures = useMemo(
    () =>
      Array.from({ length: count(quality, 5) }, (_, i) => ({
        x: (i - 2) * 2.15 + rand(i) * 0.2,
        y: 0.5 + rand(i * 3) * 0.9,
        w: 0.9 + rand(i * 5) * 0.5,
        h: 1.1 + rand(i * 7) * 0.6,
      })),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    lights.current.forEach((light, i) => {
      if (!light) return;
      const flicker =
        1 +
        Math.sin(t * 3.1 + i * 2.3) * 0.09 +
        Math.sin(t * 0.71 + i * 5.1) * 0.06 +
        Math.sin(t * 7.3 + i) * 0.03;
      light.intensity = 13 * flicker;
    });

    if (fixture.current) {
      fixture.current.rotation.y = t * 0.05 + wobble(t * 0.2, 3) * 0.05;
      fixture.current.position.y = 2.2 + wobble(t * 0.3, 8) * 0.015;
    }

    if (room.current) {
      room.current.rotation.y +=
        (pointer.current.x * 0.09 - room.current.rotation.y) * 0.03;
      room.current.position.x +=
        (pointer.current.x * -0.4 - room.current.position.x) * 0.03;
      room.current.position.y +=
        (pointer.current.y * 0.22 - room.current.position.y) * 0.03;
    }
  });

  return (
    <>
      <ambientLight intensity={0.14} color={palette.accent} />

      <group ref={room}>
        <mesh position={[0, 0.6, -4]}>
          <planeGeometry args={[26, 12]} />
          <meshStandardMaterial color={palette.surface} roughness={0.95} />
        </mesh>
        <mesh position={[0, -1.1, -3.94]}>
          <boxGeometry args={[26, 0.12, 0.06]} />
          <meshStandardMaterial color={palette.accent} roughness={0.6} metalness={0.3} />
        </mesh>
        {Array.from({ length: count(quality, 11) }, (_, i) => (
          <mesh key={`panel-${i}`} position={[(i - 5) * 2.1, -2.1, -3.92]}>
            <boxGeometry args={[1.75, 1.7, 0.04]} />
            <meshStandardMaterial color={palette.surfaceHigh} roughness={0.88} />
          </mesh>
        ))}

        {pictures.map((picture, i) => (
          <group key={`picture-${i}`} position={[picture.x, picture.y, -3.86]}>
            <mesh>
              <boxGeometry args={[picture.w, picture.h, 0.06]} />
              <meshStandardMaterial
                color={palette.accent}
                roughness={0.42}
                metalness={0.55}
              />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <planeGeometry args={[picture.w - 0.16, picture.h - 0.16]} />
              <meshStandardMaterial color={palette.bg} roughness={1} />
            </mesh>
          </group>
        ))}

        <group ref={fixture} position={[0, 2.2, 0]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 2.8, detail(quality, 8, 5)]} />
            <meshStandardMaterial
              color={palette.accent}
              metalness={0.8}
              roughness={0.36}
            />
          </mesh>
          <mesh>
            <sphereGeometry
              args={[0.24, detail(quality, 18, 8), detail(quality, 14, 6)]}
            />
            <meshStandardMaterial
              color={palette.accent}
              metalness={0.85}
              roughness={0.3}
            />
          </mesh>

          {Array.from({ length: arms }, (_, i) => {
            const a = (i / arms) * Math.PI * 2;
            const x = Math.cos(a) * 0.95;
            const z = Math.sin(a) * 0.95;

            return (
              <group key={i}>
                <mesh
                  position={[x / 2, 0.05, z / 2]}
                  rotation={[0, -a, Math.PI / 2 - 0.25]}
                >
                  <cylinderGeometry args={[0.022, 0.022, 1.02, detail(quality, 7, 4)]} />
                  <meshStandardMaterial
                    color={palette.accent}
                    metalness={0.8}
                    roughness={0.4}
                  />
                </mesh>
                <mesh position={[x, 0.2, z]}>
                  <sphereGeometry
                    args={[0.15, detail(quality, 16, 7), detail(quality, 12, 6)]}
                  />
                  <meshBasicMaterial color={palette.text} transparent opacity={0.85} />
                </mesh>
                <pointLight
                  ref={(light) => {
                    lights.current[i] = light;
                  }}
                  position={[x, 0.2, z]}
                  intensity={13}
                  distance={13}
                  decay={2}
                  color={palette.accentText}
                />
              </group>
            );
          })}
        </group>
      </group>
    </>
  );
}

export default function VictorianScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.4, 6.4], fov: 48 }} fog={[7, 18]}>
      <Gasolier {...props} />
    </HeroCanvas>
  );
}
