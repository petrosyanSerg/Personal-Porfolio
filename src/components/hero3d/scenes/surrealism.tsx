'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, type Group, type Mesh } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import {
  rand,
  srand,
  sceneTime,
  usePointer,
  useScrollProgress,
  wobble,
} from '../core/motion';
import { count, detail } from '../core/quality';

function Impossible({ quality, reducedMotion, palette }: SceneProps) {
  const stage = useRef<Group>(null);
  const iris = useRef<Group>(null);
  const stones = useRef<Group>(null);
  const portal = useRef<Mesh>(null);
  const pointer = usePointer(reducedMotion, 0.04);
  const scroll = useScrollProgress(true);

  const floating = useMemo(
    () =>
      Array.from({ length: count(quality, 7) }, (_, i) => ({
        position: [
          srand(i * 2.9) * 6.4,
          srand(i * 4.7) * 2.6 + 0.4,
          -2 - rand(i * 6.3) * 4,
        ] as [number, number, number],
        scale: 0.3 + rand(i * 8.1) * 0.7,
        lane: i * 1.6,
      })),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (iris.current) {
      iris.current.position.x = pointer.current.x * 0.34;
      iris.current.position.y = pointer.current.y * 0.24 + 2.9;
    }

    if (stones.current) {
      stones.current.children.forEach((child, i) => {
        const stone = floating[i];
        if (!stone) return;
        child.position.y = stone.position[1] + wobble(t * 0.1, stone.lane) * 0.08;
        child.rotation.y = t * 0.02 * (i % 2 === 0 ? 1 : -1);
      });
    }

    if (portal.current) {
      portal.current.rotation.z = t * 0.01;
    }

    if (stage.current) {
      stage.current.rotation.y +=
        (pointer.current.x * 0.1 - stage.current.rotation.y) * 0.03;
      stage.current.position.y = scroll.value * 1.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} color={palette.surfaceHigh} />
      <directionalLight position={[5, 7, 6]} intensity={1.2} color={palette.text} />

      <group ref={stage}>
        <group position={[2.9, 2.9, -6]}>
          <mesh scale={[1.7, 1, 1]}>
            <sphereGeometry
              args={[1.1, detail(quality, 36, 14), detail(quality, 26, 10)]}
            />
            <meshStandardMaterial color={palette.text} roughness={0.18} />
          </mesh>
          <group ref={iris} position={[0, 2.9, 0]}>
            <mesh position={[0, -2.9, 0.72]}>
              <sphereGeometry
                args={[0.42, detail(quality, 24, 10), detail(quality, 18, 8)]}
              />
              <meshStandardMaterial color={palette.accent} roughness={0.24} />
            </mesh>
            <mesh position={[0, -2.9, 1.02]}>
              <sphereGeometry
                args={[0.2, detail(quality, 20, 8), detail(quality, 14, 6)]}
              />
              <meshStandardMaterial color={palette.bg} roughness={0.1} />
            </mesh>
          </group>
        </group>

        <group position={[-1.6, -0.6, 0]}>
          {[
            [-0.95, 0, 0.22, 4.2],
            [0.95, 0, 0.22, 4.2],
            [0, 2.1, 2.12, 0.22],
          ].map(([x, y, w, h], i) => (
            <mesh key={i} position={[x!, y!, 0]}>
              <boxGeometry args={[w!, h!, 0.24]} />
              <meshStandardMaterial color={palette.textMuted} roughness={0.8} />
            </mesh>
          ))}

          <mesh ref={portal} position={[0, 0, -0.1]}>
            <planeGeometry args={[1.7, 4]} />
            <meshBasicMaterial color={palette.accent} side={BackSide} />
          </mesh>
          <mesh position={[0, 0, -0.09]}>
            <planeGeometry args={[1.7, 4]} />
            <meshBasicMaterial color={palette.accent} transparent opacity={0.85} />
          </mesh>
          {[0.6, -0.9].map((y, i) => (
            <mesh key={y} position={[srand(i) * 0.4, y, -0.08]}>
              <circleGeometry args={[0.3 + rand(i) * 0.2, detail(quality, 16, 7)]} />
              <meshBasicMaterial color={palette.text} transparent opacity={0.8} />
            </mesh>
          ))}
        </group>

        <group ref={stones}>
          {floating.map((stone, i) => (
            <mesh key={i} position={stone.position} scale={stone.scale}>
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color={palette.textMuted}
                roughness={0.94}
                flatShading
              />
            </mesh>
          ))}
        </group>
      </group>
    </>
  );
}

export default function SurrealismScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.4, 8.6], fov: 46 }} fog={[12, 30]}>
      <Impossible {...props} />
    </HeroCanvas>
  );
}
