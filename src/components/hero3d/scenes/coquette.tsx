'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

const RIBBONS = 5;
const POINTS = 12;

function Ribbons({ quality, reducedMotion, palette }: SceneProps) {
  const hanging = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const state = useMemo(
    () =>
      Array.from({ length: count(quality, RIBBONS) }, (_, i) => ({
        origin: new Vector3(srand(i * 2.3) * 3.6, 3.4, srand(i * 4.1) * 1.6 - 0.4),
        points: Array.from({ length: POINTS }, () => new Vector3()),
        lane: i * 1.9,
        length: 4.4 + rand(i * 6.7) * 1.8,
        hue: i % 2 === 0 ? ('accent' as const) : ('teal' as const),
      })),
    [quality],
  );

  const curves = useMemo(
    () => state.map((ribbon) => new CatmullRomCurve3(ribbon.points)),
    [state],
  );

  useFrame((frame) => {
    const t = sceneTime(frame.clock.elapsedTime, reducedMotion);

    state.forEach((ribbon, r) => {
      ribbon.points.forEach((point, p) => {
        const along = p / (POINTS - 1);
        const phase = t * 1.1 - along * 2.6;
        const swing = along * along;

        point.set(
          ribbon.origin.x +
            Math.sin(phase + ribbon.lane) * 0.5 * swing +
            pointer.current.x * swing * 1.2,
          ribbon.origin.y - along * ribbon.length,
          ribbon.origin.z +
            Math.cos(phase * 0.8 + ribbon.lane) * 0.4 * swing +
            pointer.current.y * swing * 0.6,
        );
      });

      curves[r]!.points = ribbon.points;
    });

    if (hanging.current) {
      hanging.current.children.forEach((child, i) => {
        if (child.name !== 'pearls') return;
        child.position.y = wobble(t * 0.3, i) * 0.1;
      });
    }
  });

  return (
    <>
      <ambientLight intensity={1.1} color={palette.surfaceHigh} />
      <directionalLight position={[2, 5, 7]} intensity={1.1} color={palette.text} />
      <pointLight
        position={[-4, 1, 4]}
        intensity={26}
        distance={18}
        decay={2}
        color={palette.accent}
      />

      <group ref={hanging}>
        {curves.map((curve, i) => (
          <mesh key={`ribbon-${i}`}>
            <tubeGeometry args={[curve, detail(quality, 48, 18), 0.11, 3, false]} />
            <meshStandardMaterial
              color={palette[state[i]!.hue]}
              roughness={0.24}
              metalness={0.1}
              side={2}
            />
          </mesh>
        ))}

        <group name="pearls">
          {Array.from({ length: count(quality, 26) }, (_, i) => {
            const a = (i / count(quality, 26)) * Math.PI;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(a) * 3.2,
                  Math.sin(a) * 1.4 - 1.6,
                  -1.2 + Math.sin(a * 2) * 0.4,
                ]}
              >
                <sphereGeometry
                  args={[0.11, detail(quality, 18, 8), detail(quality, 14, 6)]}
                />
                <meshStandardMaterial
                  color={palette.text}
                  roughness={0.12}
                  metalness={0.3}
                />
              </mesh>
            );
          })}
        </group>

        <group position={[0, 3.5, 0]}>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              rotation={[0, 0, (side * Math.PI) / 3]}
              position={[side * 0.42, 0, 0]}
            >
              <torusGeometry args={[0.42, 0.09, 4, detail(quality, 22, 10)]} />
              <meshStandardMaterial color={palette.accent} roughness={0.24} side={2} />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry
              args={[0.14, detail(quality, 16, 7), detail(quality, 12, 6)]}
            />
            <meshStandardMaterial color={palette.accentText} roughness={0.3} />
          </mesh>
        </group>
      </group>
    </>
  );
}

export default function CoquetteScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.4, 8], fov: 46 }} fog={[10, 24]}>
      <Ribbons {...props} />
    </HeroCanvas>
  );
}
