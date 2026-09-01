'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Shape, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { sceneTime, usePointer, wobble } from '../core/motion';
import { detail } from '../core/quality';

function letterS(): Shape {
  const s = new Shape();
  s.moveTo(0.62, 0.86);
  s.bezierCurveTo(0.5, 1.02, 0.24, 1.06, 0.1, 0.94);
  s.bezierCurveTo(-0.06, 0.8, -0.02, 0.58, 0.16, 0.48);
  s.bezierCurveTo(0.34, 0.38, 0.6, 0.34, 0.72, 0.2);
  s.bezierCurveTo(0.86, 0.04, 0.8, -0.22, 0.6, -0.32);
  s.bezierCurveTo(0.4, -0.42, 0.14, -0.36, 0.02, -0.2);
  s.lineTo(0.16, -0.08);
  s.bezierCurveTo(0.24, -0.18, 0.4, -0.22, 0.5, -0.16);
  s.bezierCurveTo(0.62, -0.09, 0.64, 0.04, 0.55, 0.12);
  s.bezierCurveTo(0.42, 0.24, 0.16, 0.28, 0.0, 0.4);
  s.bezierCurveTo(-0.2, 0.56, -0.22, 0.86, -0.02, 1.02);
  s.bezierCurveTo(0.2, 1.2, 0.56, 1.14, 0.72, 0.94);
  s.lineTo(0.62, 0.86);
  return s;
}

function letterP(): Shape {
  const p = new Shape();
  p.moveTo(0, -0.36);
  p.lineTo(0.16, -0.36);
  p.lineTo(0.16, 0.36);
  p.lineTo(0.44, 0.36);
  p.bezierCurveTo(0.78, 0.36, 0.94, 0.56, 0.94, 0.76);
  p.bezierCurveTo(0.94, 0.98, 0.76, 1.14, 0.44, 1.14);
  p.lineTo(0, 1.14);
  p.lineTo(0, -0.36);

  const counter = new Shape();
  counter.moveTo(0.16, 0.52);
  counter.lineTo(0.16, 0.98);
  counter.lineTo(0.42, 0.98);
  counter.bezierCurveTo(0.64, 0.98, 0.76, 0.9, 0.76, 0.75);
  counter.bezierCurveTo(0.76, 0.6, 0.64, 0.52, 0.42, 0.52);
  counter.lineTo(0.16, 0.52);

  p.holes.push(counter);
  return p;
}

function Letters({ quality, reducedMotion, palette }: SceneProps) {
  const stack = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const shapes = useMemo(() => ({ s: letterS(), p: letterP() }), []);

  const extrude = useMemo(
    () => ({
      depth: 0.34,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.024,
      bevelSegments: detail(quality, 4, 1),
      curveSegments: detail(quality, 18, 6),
    }),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (stack.current) {
      stack.current.rotation.y = wobble(t * 0.16, 1) * 0.035 + pointer.current.x * 0.06;
      stack.current.rotation.x = wobble(t * 0.12, 5) * 0.02;
    }

    state.scene.children.forEach((child) => {
      if (child.type === 'DirectionalLight') {
        child.position.set(pointer.current.x * 6, 3 + pointer.current.y * 3, 5);
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.5} color={palette.surfaceHigh} />
      <directionalLight position={[0, 4, 5]} intensity={2.2} color={palette.text} />
      <directionalLight
        position={[-4, 0, -6]}
        intensity={0.9}
        color={palette.accentText}
      />

      <group ref={stack} position={[0, -0.4, 0]} scale={2.05}>
        <mesh position={[-1.05, 0, 0]}>
          <extrudeGeometry args={[shapes.s, extrude]} />
          <meshStandardMaterial color={palette.text} roughness={0.34} metalness={0.06} />
        </mesh>
        <mesh position={[0.24, 0, 0]}>
          <extrudeGeometry args={[shapes.p, extrude]} />
          <meshStandardMaterial color={palette.text} roughness={0.34} metalness={0.06} />
        </mesh>
      </group>
    </>
  );
}

export default function LuxuryTypographyScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.5, 6.2], fov: 40 }}>
      <Letters {...props} />
    </HeroCanvas>
  );
}
