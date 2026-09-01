'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, Shape, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer } from '../core/motion';
import { count, detail } from '../core/quality';

function burstShape(points: number, inner: number, outer: number): Shape {
  const shape = new Shape();

  for (let i = 0; i < points * 2; i += 1) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outer * (0.82 + rand(i * 3.1) * 0.36) : inner;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }

  shape.closePath();
  return shape;
}

function balloonShape(): Shape {
  const s = new Shape();
  s.moveTo(-1.1, 0.2);
  s.bezierCurveTo(-1.1, 0.9, -0.6, 1.1, 0, 1.1);
  s.bezierCurveTo(0.6, 1.1, 1.1, 0.9, 1.1, 0.2);
  s.bezierCurveTo(1.1, -0.4, 0.6, -0.6, 0.1, -0.6);
  s.lineTo(-0.1, -1.15);
  s.lineTo(-0.42, -0.6);
  s.bezierCurveTo(-0.8, -0.6, -1.1, -0.3, -1.1, 0.2);
  return s;
}

type InkedProps = {
  shape: Shape;
  palette: SceneProps['palette'];
  quality: SceneProps['quality'];
  color: 'accent' | 'teal' | 'text' | 'surfaceHigh';
  position: [number, number, number];
  scale?: number;
  rotation?: number;
};

function Inked({
  shape,
  palette,
  quality,
  color,
  position,
  scale = 1,
  rotation = 0,
}: InkedProps) {
  const extrude = useMemo(
    () => ({ depth: 0.12, bevelEnabled: false, curveSegments: detail(quality, 12, 4) }),
    [quality],
  );

  return (
    <group position={position} scale={scale} rotation={[0, 0, rotation]}>
      <mesh>
        <extrudeGeometry args={[shape, extrude]} />
        <meshBasicMaterial color={palette[color]} />
      </mesh>
      <mesh scale={1.055} position={[0, 0, -0.02]}>
        <extrudeGeometry args={[shape, extrude]} />
        <meshBasicMaterial color={palette.bg} side={BackSide} />
      </mesh>
    </group>
  );
}

function Panel({ quality, reducedMotion, palette }: SceneProps) {
  const panel = useRef<Group>(null);
  const burst = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.09);

  const shapes = useMemo(
    () => ({
      big: burstShape(14, 0.9, 2.6),
      small: burstShape(9, 0.4, 1.1),
      balloon: balloonShape(),
    }),
    [],
  );

  const rays = useMemo(
    () =>
      Array.from({ length: count(quality, 22) }, (_, i) => ({
        angle: (i / count(quality, 22)) * Math.PI * 2,
        length: 3 + rand(i * 5.3) * 3.4,
        width: 0.06 + rand(i * 7.1) * 0.1,
      })),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (burst.current) {
      const beat = (t % 2.4) / 2.4;
      const pop = beat < 0.18 ? 1 + Math.sin((beat / 0.18) * Math.PI) * 0.14 : 1;
      burst.current.scale.setScalar(pop);
      burst.current.rotation.z = Math.floor(t * 4) * 0.02;
    }

    if (panel.current) {
      panel.current.rotation.y +=
        (pointer.current.x * 0.3 - panel.current.rotation.y) * 0.14;
      panel.current.rotation.x +=
        (pointer.current.y * -0.2 - panel.current.rotation.x) * 0.14;
    }
  });

  return (
    <>
      <group ref={panel}>
        <group position={[0.6, 0.3, -2]}>
          {rays.map((ray, i) => (
            <mesh
              key={i}
              rotation={[0, 0, ray.angle]}
              position={[Math.cos(ray.angle) * 2.4, Math.sin(ray.angle) * 2.4, 0]}
            >
              <planeGeometry args={[ray.length, ray.width]} />
              <meshBasicMaterial color={palette.text} transparent opacity={0.5} />
            </mesh>
          ))}
        </group>

        <group ref={burst} position={[0.6, 0.3, 0]}>
          <Inked
            shape={shapes.big}
            palette={palette}
            quality={quality}
            color="accent"
            position={[0, 0, 0]}
          />
          <Inked
            shape={shapes.small}
            palette={palette}
            quality={quality}
            color="surfaceHigh"
            position={[0, 0, 0.2]}
            scale={0.9}
            rotation={0.3}
          />
        </group>

        <Inked
          shape={shapes.balloon}
          palette={palette}
          quality={quality}
          color="text"
          position={[-2.8, 1.5, 0.5]}
          scale={1.15}
          rotation={-0.12}
        />

        {[
          [3.4, -1.8, 0.3],
          [-3.2, -1.4, -0.6],
        ].map((position, i) => (
          <Inked
            key={i}
            shape={shapes.small}
            palette={palette}
            quality={quality}
            color={i === 0 ? 'teal' : 'accent'}
            position={position as [number, number, number]}
            scale={0.7 + srand(i) * 0.1}
            rotation={i * 0.6}
          />
        ))}
      </group>
    </>
  );
}

export default function PopArtScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 8.4], fov: 46 }}>
      <Panel {...props} />
    </HeroCanvas>
  );
}
