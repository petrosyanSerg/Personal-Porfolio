'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  type Group,
  type Points,
} from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer } from '../core/motion';
import { count, detail } from '../core/quality';

function Study({ quality, reducedMotion, palette }: SceneProps) {
  const motes = useRef<Points>(null);
  const shaft = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.04);

  const dust = useMemo(() => {
    const total = count(quality, 400);
    const positions = new Float32Array(total * 3);

    for (let i = 0; i < total; i += 1) {
      positions[i * 3] = srand(i * 2.1) * 5;
      positions[i * 3 + 1] = srand(i * 4.3) * 4;
      positions[i * 3 + 2] = srand(i * 6.7) * 1.6 + 0.8;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    return geometry;
  }, [quality]);

  const shelves = useMemo(
    () =>
      Array.from({ length: count(quality, 4) }, (_, s) =>
        Array.from({ length: count(quality, 20) }, (_, b) => ({
          x: -5.5 + b * 0.55 + srand(s * 40 + b) * 0.04,
          y: -2.4 + s * 1.45,
          height: 0.72 + rand(s * 19 + b) * 0.34,
          width: 0.15 + rand(s * 29 + b) * 0.2,
        })),
      ),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (motes.current) {
      motes.current.rotation.y = t * 0.012;
      motes.current.position.y = Math.sin(t * 0.14) * 0.1;
    }

    if (shaft.current) {
      shaft.current.position.x +=
        (pointer.current.x * 3 - shaft.current.position.x) * 0.04;
      shaft.current.rotation.z = 0.34 + pointer.current.y * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={1.15} color={palette.surfaceHigh} />
      <directionalLight position={[-6, 7, 5]} intensity={1.5} color={palette.text} />
      <directionalLight position={[4, 2, 6]} intensity={0.4} color={palette.accentText} />

      <group ref={shaft} position={[0, 0.5, 1.2]} rotation={[0, 0, 0.34]}>
        {[0, 0.5].map((offset, i) => (
          <mesh key={offset} position={[offset, 0, i * 0.6]} rotation={[0, i * 0.2, 0]}>
            <planeGeometry args={[2.6, 12]} />
            <meshBasicMaterial
              color={palette.accentText}
              transparent
              opacity={0.12}
              blending={AdditiveBlending}
              depthWrite={false}
              side={DoubleSide}
            />
          </mesh>
        ))}
      </group>

      <points ref={motes} geometry={dust}>
        <pointsMaterial
          size={0.035}
          sizeAttenuation
          color={palette.accent}
          transparent
          opacity={0.6}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {shelves.map((shelf, s) => (
        <group key={s}>
          <mesh position={[0, -2.4 + s * 1.45 - 0.06, -3.2]}>
            <boxGeometry args={[13, 0.08, 0.7]} />
            <meshStandardMaterial color={palette.accent} roughness={0.84} />
          </mesh>
          {shelf.map((book, b) => (
            <mesh key={b} position={[book.x, book.y + book.height / 2 - 0.02, -3.2]}>
              <boxGeometry args={[book.width, book.height, 0.5]} />
              <meshStandardMaterial
                color={
                  b % 5 === 0
                    ? palette.accent
                    : b % 3 === 0
                      ? palette.teal
                      : palette.surfaceHigh
                }
                roughness={0.9}
              />
            </mesh>
          ))}
        </group>
      ))}

      <group position={[0, -1.9, 0.6]}>
        <mesh>
          <boxGeometry args={[5.4, 0.14, 2.2]} />
          <meshStandardMaterial color={palette.accent} roughness={0.72} />
        </mesh>

        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[-1.5, 0.14 + i * 0.16, 0.1]}
            rotation={[0, srand(i) * 0.1, 0]}
          >
            <boxGeometry args={[1.5, 0.15, 1.05]} />
            <meshStandardMaterial
              color={i === 1 ? palette.teal : palette.surfaceHigh}
              roughness={0.88}
            />
          </mesh>
        ))}

        <group position={[1.3, 0.2, 0.1]} rotation={[-0.1, 0.2, 0]}>
          {[1, -1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.62, 0, 0]}
              rotation={[side * 0.12, 0, 0]}
            >
              <boxGeometry args={[1.2, 0.04, 1]} />
              <meshStandardMaterial color={palette.text} roughness={0.95} />
            </mesh>
          ))}
        </group>

        {[
          [-2.4, -1],
          [2.4, -1],
          [-2.4, 1],
          [2.4, 1],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x!, -0.5, z! * 0.85]}>
            <cylinderGeometry args={[0.06, 0.08, 1, detail(quality, 10, 5)]} />
            <meshStandardMaterial color={palette.accent} roughness={0.8} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function LightAcademiaScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.3, 7.8], fov: 46 }} fog={[12, 30]}>
      <Study {...props} />
    </HeroCanvas>
  );
}
