'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, DoubleSide, Shape, Vector3, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer, wobble } from '../core/motion';
import { detail } from '../core/quality';

function whiplash(seed: number): CatmullRomCurve3 {
  const points: Vector3[] = [];
  const steps = 9;

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    points.push(
      new Vector3(
        (t * t * t * 2.6 - t * 1.1) * (2.4 + rand(seed) * 1.4) - 1 + rand(seed * 3) * 2,
        t * 6 - 3 + Math.sin(t * Math.PI * 1.4 + seed) * 0.9,
        Math.sin(t * 2.4 + seed * 2) * 0.5 - rand(seed * 5),
      ),
    );
  }

  return new CatmullRomCurve3(points);
}

function paneShape(seed: number): Shape {
  const s = new Shape();
  const r = 0.5 + rand(seed) * 0.4;

  s.moveTo(0, r);
  s.bezierCurveTo(r * 1.3, r * 0.8, r * 1.1, -r * 0.5, 0, -r);
  s.bezierCurveTo(-r * 0.7, -r * 1.3, -r * 1.4, r * 0.2, 0, r);

  return s;
}

function Window({ quality, reducedMotion, palette }: SceneProps) {
  const panel = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.035);

  const cames = useMemo(() => [1, 2.3, 3.7, 5.1, 6.9].map((seed) => whiplash(seed)), []);
  const panes = useMemo(
    () =>
      Array.from({ length: quality === 'low' ? 5 : 9 }, (_, i) => ({
        shape: paneShape(i * 1.7 + 1),
        position: [
          (rand(i * 2.1) - 0.5) * 5.6,
          (rand(i * 4.3) - 0.5) * 5.2,
          -0.35 - rand(i * 6.5) * 0.6,
        ] as [number, number, number],
        hue:
          i % 3 === 0 ? palette.accent : i % 3 === 1 ? palette.teal : palette.accentText,
        scale: 0.8 + rand(i * 8.7) * 0.7,
      })),
    [quality, palette],
  );

  useFrame((state) => {
    if (!panel.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    panel.current.rotation.y +=
      (pointer.current.x * 0.28 - panel.current.rotation.y) * 0.03;
    panel.current.rotation.x +=
      (pointer.current.y * -0.16 - panel.current.rotation.x) * 0.03;
    panel.current.rotation.z = wobble(t * 0.12, 3) * 0.015;
  });

  return (
    <>
      <ambientLight intensity={0.7} color={palette.surfaceHigh} />
      <directionalLight position={[3, 4, 7]} intensity={1.1} color={palette.text} />
      <pointLight
        position={[0, 0, -5]}
        intensity={70}
        distance={18}
        decay={2}
        color={palette.text}
      />

      <group ref={panel}>
        {panes.map((pane, i) => (
          <mesh key={`pane-${i}`} position={pane.position} scale={pane.scale}>
            <shapeGeometry args={[pane.shape, detail(quality, 18, 6)]} />
            <meshStandardMaterial
              color={pane.hue}
              transparent
              opacity={0.42}
              roughness={0.14}
              side={DoubleSide}
            />
          </mesh>
        ))}

        {cames.map((curve, i) => (
          <mesh key={`came-${i}`}>
            <tubeGeometry
              args={[curve, detail(quality, 70, 22), 0.055, detail(quality, 9, 4), false]}
            />
            <meshStandardMaterial
              color={palette.accent}
              metalness={0.86}
              roughness={0.34}
            />
          </mesh>
        ))}

        {[0.22, 0.55, 0.85].map((t, i) => {
          const point = cames[i % cames.length]!.getPointAt(t);
          return (
            <mesh
              key={`bud-${i}`}
              position={[point.x, point.y, point.z]}
              scale={0.16 + i * 0.04}
            >
              <sphereGeometry
                args={[1, detail(quality, 18, 7), detail(quality, 12, 6)]}
              />
              <meshStandardMaterial
                color={palette.teal}
                metalness={0.4}
                roughness={0.4}
              />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

export default function ArtNouveauScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 8.8], fov: 46 }}>
      <Window {...props} />
    </HeroCanvas>
  );
}
