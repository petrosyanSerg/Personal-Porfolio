'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Shape, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { sceneTime, usePointer, wobble } from '../core/motion';
import { detail } from '../core/quality';

function rayShape(): Shape {
  const s = new Shape();
  s.moveTo(-0.07, 0);
  s.lineTo(-0.14, 2.1);
  s.lineTo(-0.07, 2.1);
  s.lineTo(-0.07, 2.42);
  s.lineTo(0.07, 2.42);
  s.lineTo(0.07, 2.1);
  s.lineTo(0.14, 2.1);
  s.lineTo(0.07, 0);
  s.lineTo(-0.07, 0);
  return s;
}

function Sunburst({ quality, reducedMotion, palette }: SceneProps) {
  const composition = useRef<Group>(null);
  const fan = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.04);

  const ray = useMemo(() => rayShape(), []);
  const extrude = useMemo(
    () => ({
      depth: 0.06,
      bevelEnabled: quality !== 'low',
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 1,
      curveSegments: 1,
    }),
    [quality],
  );

  const rays = quality === 'low' ? 13 : 21;
  const steps = [0, 1, 2, 3, 4];

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (fan.current) {
      fan.current.rotation.z = t * 0.02 + wobble(t * 0.15, 2) * 0.006;
    }

    if (composition.current) {
      composition.current.position.z +=
        (pointer.current.y * 0.6 - composition.current.position.z) * 0.04;
      composition.current.rotation.x +=
        (pointer.current.y * 0.1 - composition.current.rotation.x) * 0.04;
      composition.current.rotation.y +=
        (pointer.current.x * 0.1 - composition.current.rotation.y) * 0.04;
    }
  });

  return (
    <>
      <ambientLight intensity={0.42} color={palette.surfaceHigh} />
      <pointLight
        position={[0, 6, 6]}
        intensity={110}
        distance={26}
        decay={2}
        color={palette.text}
      />
      <pointLight
        position={[-6, -3, 4]}
        intensity={26}
        distance={20}
        decay={2}
        color={palette.teal}
      />

      <group ref={composition}>
        <group ref={fan} position={[0, 0.3, -0.4]}>
          {Array.from({ length: rays }, (_, i) => {
            const a = (i / (rays - 1)) * Math.PI - Math.PI / 2;
            const alternate = i % 2 === 0;

            return (
              <mesh key={i} rotation={[0, 0, a]} scale={alternate ? 1 : 0.82}>
                <extrudeGeometry args={[ray, extrude]} />
                <meshStandardMaterial
                  color={alternate ? palette.accent : palette.accentText}
                  metalness={0.94}
                  roughness={0.22}
                />
              </mesh>
            );
          })}
        </group>

        {steps.map((step) => {
          const scale = 0.82 ** step;
          return (
            <mesh key={step} position={[0, -2.1 + step * 0.34, 0]}>
              <boxGeometry args={[4.6 * scale, 0.3, 0.9 * scale]} />
              <meshStandardMaterial
                color={palette.text}
                metalness={0.5}
                roughness={0.4}
              />
            </mesh>
          );
        })}

        {[-2.6, 2.6].map((x) => (
          <group key={x} position={[x, -0.6, 0.2]}>
            <mesh>
              <cylinderGeometry args={[0.26, 0.26, 3, detail(quality, 16, 8)]} />
              <meshStandardMaterial
                color={palette.text}
                metalness={0.4}
                roughness={0.5}
              />
            </mesh>
            <mesh position={[0, 1.62, 0]}>
              <sphereGeometry
                args={[0.3, detail(quality, 20, 8), detail(quality, 14, 6)]}
              />
              <meshStandardMaterial
                color={palette.accent}
                metalness={1}
                roughness={0.16}
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

export default function ArtDecoScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.2, 8.2], fov: 44 }} fog={[10, 24]}>
      <Sunburst {...props} />
    </HeroCanvas>
  );
}
