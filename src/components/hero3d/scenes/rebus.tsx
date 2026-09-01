'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Shape, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { sceneTime, usePointer } from '../core/motion';
import { detail } from '../core/quality';

function glyphs(): Shape[] {
  const brace = new Shape();
  brace.moveTo(0.2, 0.6);
  brace.bezierCurveTo(-0.1, 0.6, 0.05, 0.1, -0.25, 0.05);
  brace.bezierCurveTo(0.05, 0, -0.1, -0.5, 0.2, -0.5);
  brace.lineTo(0.2, -0.34);
  brace.bezierCurveTo(0.05, -0.34, 0.12, 0.02, -0.08, 0.05);
  brace.bezierCurveTo(0.12, 0.08, 0.05, 0.46, 0.2, 0.46);
  brace.closePath();

  const triangle = new Shape();
  triangle.moveTo(0, 0.62);
  triangle.lineTo(0.56, -0.42);
  triangle.lineTo(-0.56, -0.42);
  triangle.closePath();
  const inner = new Shape();
  inner.moveTo(0, 0.32);
  inner.lineTo(0.3, -0.24);
  inner.lineTo(-0.3, -0.24);
  inner.closePath();
  triangle.holes.push(inner);

  const circle = new Shape();
  circle.absarc(0, 0.05, 0.5, 0, Math.PI * 2, false);
  const bore = new Shape();
  bore.absarc(0, 0.05, 0.3, 0, Math.PI * 2, false);
  circle.holes.push(bore);

  const plus = new Shape();
  plus.moveTo(-0.14, 0.5);
  plus.lineTo(0.14, 0.5);
  plus.lineTo(0.14, 0.19);
  plus.lineTo(0.48, 0.19);
  plus.lineTo(0.48, -0.09);
  plus.lineTo(0.14, -0.09);
  plus.lineTo(0.14, -0.4);
  plus.lineTo(-0.14, -0.4);
  plus.lineTo(-0.14, -0.09);
  plus.lineTo(-0.48, -0.09);
  plus.lineTo(-0.48, 0.19);
  plus.lineTo(-0.14, 0.19);
  plus.closePath();

  const bar = new Shape();
  bar.moveTo(-0.5, 0.24);
  bar.lineTo(0.5, 0.24);
  bar.lineTo(0.5, 0.06);
  bar.lineTo(-0.5, 0.06);
  bar.lineTo(-0.5, -0.06);
  bar.lineTo(0.28, -0.06);
  bar.lineTo(0.28, -0.24);
  bar.lineTo(-0.5, -0.24);
  bar.closePath();

  const arrow = new Shape();
  arrow.moveTo(-0.5, 0.14);
  arrow.lineTo(0.1, 0.14);
  arrow.lineTo(0.1, 0.4);
  arrow.lineTo(0.56, 0.05);
  arrow.lineTo(0.1, -0.3);
  arrow.lineTo(0.1, -0.04);
  arrow.lineTo(-0.5, -0.04);
  arrow.closePath();

  return [brace, triangle, circle, plus, bar, arrow];
}

function Puzzle({ quality, reducedMotion, palette }: SceneProps) {
  const board = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.09);
  const [found, setFound] = useState<ReadonlySet<number>>(() => new Set());

  const shapes = useMemo(() => glyphs(), []);
  const extrude = useMemo(
    () => ({ depth: 0.1, bevelEnabled: false, curveSegments: detail(quality, 14, 5) }),
    [quality],
  );

  const layout = useMemo(
    () =>
      shapes.map((_, i) => ({
        x: ((i % 3) - 1) * 2.5,
        y: (Math.floor(i / 3) - 0.5) * -2.4,
      })),
    [shapes],
  );

  useFrame((state) => {
    if (!board.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);
    const complete = found.size === shapes.length;

    board.current.children.forEach((child, i) => {
      const tile = layout[i];
      if (!tile) return;

      const dx = tile.x - pointer.current.x * 4.2;
      const dy = tile.y - pointer.current.y * 2.6;
      const near = Math.sqrt(dx * dx + dy * dy) < 1.3;

      if (near && !found.has(i) && !reducedMotion) {
        setFound((previous) => {
          if (previous.has(i)) return previous;
          const next = new Set(previous);
          next.add(i);
          return next;
        });
      }

      const target = found.has(i) ? 0 : Math.PI;
      child.rotation.y = MathUtils.lerp(child.rotation.y, target, 0.12);
      child.rotation.z = found.has(i) ? 0 : Math.sin(t * 0.8 + i) * 0.03;
      child.position.z = near ? 0.4 : 0;
      child.position.y = tile.y + (complete ? Math.sin(t * 1.2 + i * 0.4) * 0.08 : 0);
    });
  });

  return (
    <>
      <ambientLight intensity={1.3} color={palette.text} />
      <directionalLight position={[2, 5, 7]} intensity={0.8} color={palette.text} />

      <group ref={board}>
        {shapes.map((shape, i) => (
          <group key={i} position={[layout[i]!.x, layout[i]!.y, 0]}>
            <mesh position={[0, 0, -0.08]}>
              <boxGeometry args={[1.9, 1.9, 0.14]} />
              <meshStandardMaterial
                color={found.has(i) ? palette.surface : palette.surfaceHigh}
                roughness={0.85}
              />
            </mesh>
            <mesh position={[0, 0, -0.09]}>
              <boxGeometry args={[2.02, 2.02, 0.12]} />
              <meshBasicMaterial color={palette.text} />
            </mesh>
            <mesh position={[0, 0, 0.02]} scale={1.15}>
              <extrudeGeometry args={[shape, extrude]} />
              <meshStandardMaterial
                color={found.has(i) ? palette.accent : palette.textMuted}
                roughness={0.6}
              />
            </mesh>
          </group>
        ))}
      </group>

      {found.size === shapes.length ? (
        <mesh position={[0, 0, -0.3]}>
          <planeGeometry args={[7.6, 0.04]} />
          <meshBasicMaterial color={palette.accent} />
        </mesh>
      ) : null}
    </>
  );
}

export default function RebusScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 9.4], fov: 44 }}>
      <Puzzle {...props} />
    </HeroCanvas>
  );
}
