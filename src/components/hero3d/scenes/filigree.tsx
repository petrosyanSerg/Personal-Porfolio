'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { sceneTime, usePointer, wobble } from '../core/motion';
import { detail } from '../core/quality';

function scrollCurve(sign: number): CatmullRomCurve3 {
  const points: Vector3[] = [];
  const steps = 70;

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const phase = t < 0.5 ? t * 2 : (1 - t) * 2;
    const a = phase * Math.PI * 2.4 * sign;
    const r = 0.28 + phase * 1.15;
    const lead = (t - 0.5) * 2.6;

    points.push(
      new Vector3(
        Math.cos(a) * r + lead,
        Math.sin(a) * r * 0.9,
        Math.sin(t * Math.PI * 2) * 0.22,
      ),
    );
  }

  return new CatmullRomCurve3(points);
}

function Rosette({ quality, reducedMotion, palette }: SceneProps) {
  const rosette = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.035);

  const curves = useMemo(() => [scrollCurve(1), scrollCurve(-1)], []);
  const arms = quality === 'low' ? 6 : 8;

  useFrame((state) => {
    if (!rosette.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    rosette.current.rotation.y =
      t * 0.07 + wobble(t * 0.3, 1) * 0.09 + pointer.current.x * 0.5;
    rosette.current.rotation.x = wobble(t * 0.21, 4) * 0.05 - pointer.current.y * 0.28;
  });

  return (
    <>
      <ambientLight intensity={0.3} color={palette.surfaceHigh} />
      <pointLight
        position={[5, 4, 6]}
        intensity={70}
        distance={24}
        decay={2}
        color={palette.text}
      />
      <pointLight
        position={[-6, -3, 4]}
        intensity={40}
        distance={22}
        decay={2}
        color={palette.accent}
      />

      <group ref={rosette}>
        {Array.from({ length: arms }, (_, i) => {
          const angle = (i / arms) * Math.PI * 2;
          const curve = curves[i % 2]!;

          return (
            <group key={i} rotation={[0, 0, angle]}>
              <mesh position={[1.5, 0, 0]}>
                <tubeGeometry
                  args={[
                    curve,
                    detail(quality, 96, 34),
                    0.035,
                    detail(quality, 8, 4),
                    false,
                  ]}
                />
                <meshStandardMaterial
                  color={palette.accent}
                  metalness={1}
                  roughness={0.24}
                />
              </mesh>
            </group>
          );
        })}

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[1.42, 0.035, detail(quality, 10, 5), detail(quality, 120, 40)]}
          />
          <meshStandardMaterial color={palette.accent} metalness={1} roughness={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[3.35, 0.035, detail(quality, 10, 5), detail(quality, 140, 48)]}
          />
          <meshStandardMaterial
            color={palette.accentText}
            metalness={1}
            roughness={0.2}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[0.2, detail(quality, 28, 10), detail(quality, 20, 8)]} />
          <meshStandardMaterial color={palette.accent} metalness={1} roughness={0.14} />
        </mesh>
      </group>
    </>
  );
}

export default function FiligreeScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 8.6], fov: 44 }} fog={[9, 24]}>
      <Rosette {...props} />
    </HeroCanvas>
  );
}
