'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer } from '../core/motion';
import { count, detail } from '../core/quality';

type Piece = {
  readonly shape: 'box' | 'sphere' | 'cone' | 'torus' | 'cylinder';
  readonly home: Vector3;
  readonly scale: number;
  readonly spin: Vector3;
  readonly hue: 'accent' | 'teal' | 'text' | 'accentText';
};

const SHAPES = ['box', 'sphere', 'cone', 'torus', 'cylinder'] as const;
const HUES = ['accent', 'teal', 'text', 'accentText'] as const;

function Playground({ quality, reducedMotion, palette }: SceneProps) {
  const field = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.16);

  const pieces = useMemo<Piece[]>(() => {
    const total = count(quality, 17);

    return Array.from({ length: total }, (_, i) => ({
      shape: SHAPES[i % SHAPES.length]!,
      home: new Vector3(
        srand(i * 2.1) * 6.4,
        srand(i * 4.3) * 3.4,
        srand(i * 6.7) * 2.6 - 1,
      ),
      scale: 0.3 + rand(i * 8.9) * 0.42,
      spin: new Vector3(rand(i * 1.3) - 0.5, rand(i * 3.7) - 0.5, rand(i * 5.9) - 0.5),
      hue: HUES[i % HUES.length]!,
    }));
  }, [quality]);

  const velocity = useMemo(() => pieces.map(() => new Vector3()), [pieces]);
  const scratch = useMemo(() => ({ push: new Vector3(), cursor: new Vector3() }), []);

  useFrame((state, delta) => {
    if (!field.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);
    const step = Math.min(delta, 1 / 30);

    scratch.cursor.set(pointer.current.x * 6.6, pointer.current.y * 3.6, 0);

    field.current.children.forEach((child, i) => {
      const piece = pieces[i];
      const v = velocity[i];
      if (!piece || !v) return;

      if (!reducedMotion) {
        scratch.push.copy(child.position).sub(scratch.cursor);
        const distance = Math.max(0.6, scratch.push.length());
        const force = Math.min(9, 7 / (distance * distance));
        v.addScaledVector(scratch.push.normalize(), force * step);

        scratch.push.copy(piece.home).sub(child.position);
        v.addScaledVector(scratch.push, 4.2 * step);
        v.multiplyScalar(0.9);

        child.position.addScaledVector(v, step);

        child.rotation.x += piece.spin.x * step * 0.7;
        child.rotation.y += piece.spin.y * step * 0.7;
        child.rotation.z += piece.spin.z * step * 0.7;
      } else {
        child.position.copy(piece.home);
        child.rotation.set(piece.spin.x * t * 0.1, piece.spin.y * t * 0.1, 0);
      }
    });
  });

  const segments = detail(quality, 26, 8);

  return (
    <>
      <ambientLight intensity={1.35} color={palette.text} />
      <directionalLight position={[2, 6, 8]} intensity={0.9} color={palette.text} />

      <group ref={field}>
        {pieces.map((piece, i) => (
          <mesh key={i} position={piece.home} scale={piece.scale}>
            {piece.shape === 'box' ? <boxGeometry args={[1.4, 1.4, 1.4]} /> : null}
            {piece.shape === 'sphere' ? (
              <sphereGeometry args={[0.9, segments, segments]} />
            ) : null}
            {piece.shape === 'cone' ? (
              <coneGeometry args={[0.85, 1.7, segments]} />
            ) : null}
            {piece.shape === 'torus' ? (
              <torusGeometry args={[0.75, 0.28, Math.max(6, segments / 2), segments]} />
            ) : null}
            {piece.shape === 'cylinder' ? (
              <cylinderGeometry args={[0.7, 0.7, 1.3, segments]} />
            ) : null}
            <meshBasicMaterial color={palette[piece.hue]} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function MemphisScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 9.4], fov: 48 }}>
      <Playground {...props} />
    </HeroCanvas>
  );
}
