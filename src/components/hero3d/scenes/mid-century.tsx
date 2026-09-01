'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { LatheGeometry, Vector2, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

function Interior({ quality, reducedMotion, palette }: SceneProps) {
  const clock = useRef<Group>(null);
  const room = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.04);

  const rays = count(quality, 24);

  const table = useMemo(
    () =>
      new LatheGeometry(
        [
          new Vector2(0.02, 0),
          new Vector2(1.4, 0.02),
          new Vector2(1.5, 0.08),
          new Vector2(1.44, 0.12),
          new Vector2(0.02, 0.13),
        ].map((p) => p),
        detail(quality, 40, 14),
      ),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (clock.current) {
      clock.current.rotation.z = wobble(t * 0.08, 2) * 0.02;
    }

    if (room.current) {
      room.current.rotation.y +=
        (pointer.current.x * 0.16 - room.current.rotation.y) * 0.04;
      room.current.position.y +=
        (pointer.current.y * 0.3 - room.current.position.y) * 0.04;
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} color={palette.surfaceHigh} />
      <directionalLight position={[-5, 4, 6]} intensity={1.15} color={palette.text} />
      <pointLight
        position={[4, 1.4, 2]}
        intensity={30}
        distance={16}
        decay={2}
        color={palette.accent}
      />

      <group ref={room}>
        <mesh position={[0, 0.6, -3.4]}>
          <planeGeometry args={[30, 16]} />
          <meshStandardMaterial color={palette.surface} roughness={0.95} />
        </mesh>

        <group ref={clock} position={[0.4, 1.5, -3.2]}>
          {Array.from({ length: rays }, (_, i) => {
            const a = (i / rays) * Math.PI * 2;
            const length = i % 2 === 0 ? 1.55 : 1.15;

            return (
              <group key={i} rotation={[0, 0, a]}>
                <mesh position={[length / 2 + 0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry
                    args={[0.012, 0.038, length, detail(quality, 8, 4)]}
                  />
                  <meshStandardMaterial color={palette.text} roughness={0.6} />
                </mesh>
                <mesh position={[length + 0.26, 0, 0]}>
                  <sphereGeometry
                    args={[0.075, detail(quality, 14, 6), detail(quality, 10, 5)]}
                  />
                  <meshStandardMaterial
                    color={i % 4 === 0 ? palette.accent : palette.teal}
                    roughness={0.44}
                  />
                </mesh>
              </group>
            );
          })}
          <mesh>
            <cylinderGeometry args={[0.26, 0.26, 0.1, detail(quality, 24, 10)]} />
            <meshStandardMaterial
              color={palette.accent}
              roughness={0.4}
              metalness={0.3}
            />
          </mesh>
        </group>

        <group position={[-1.6, -1.9, -0.6]}>
          <mesh geometry={table} scale={[1.3, 1, 0.85]}>
            <meshStandardMaterial color={palette.accent} roughness={0.66} />
          </mesh>
          {Array.from({ length: 3 }, (_, i) => {
            const a = (i / 3) * Math.PI * 2 + 0.5;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.7, -0.55, Math.sin(a) * 0.5]}
                rotation={[Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2]}
              >
                <cylinderGeometry args={[0.02, 0.028, 1.1, detail(quality, 8, 4)]} />
                <meshStandardMaterial
                  color={palette.textMuted}
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>
            );
          })}
        </group>

        <group position={[2.4, -1.4, -0.9]}>
          <mesh position={[0, 0.9, 0]}>
            <coneGeometry args={[0.62, 0.72, detail(quality, 26, 10), 1, true]} />
            <meshStandardMaterial color={palette.text} roughness={0.7} side={2} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 1.5, detail(quality, 8, 4)]} />
            <meshStandardMaterial
              color={palette.textMuted}
              metalness={0.7}
              roughness={0.36}
            />
          </mesh>
          {Array.from({ length: 3 }, (_, i) => {
            const a = (i / 3) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.3, -1, Math.sin(a) * 0.3]}
                rotation={[Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4]}
              >
                <cylinderGeometry args={[0.014, 0.02, 0.72, detail(quality, 8, 4)]} />
                <meshStandardMaterial
                  color={palette.textMuted}
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>
            );
          })}
        </group>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
          <planeGeometry args={[30, 20]} />
          <meshStandardMaterial color={palette.surfaceHigh} roughness={0.98} />
        </mesh>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2.48, 0.6]}
          scale={[1.6, 1, 1]}
        >
          <circleGeometry args={[2.4, detail(quality, 40, 14)]} />
          <meshStandardMaterial color={palette.teal} roughness={1} />
        </mesh>

        {[
          [-3.4, 1.2, 0.5],
          [3.6, 0.4, 0.34],
        ].map(([x, y, r], i) => (
          <mesh key={i} position={[x!, y!, -3.3]}>
            <circleGeometry args={[r!, detail(quality, 26, 10)]} />
            <meshStandardMaterial
              color={i === 0 ? palette.accent : palette.teal}
              roughness={0.8}
            />
          </mesh>
        ))}

        {void rand}
      </group>
    </>
  );
}

export default function MidCenturyScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.2, 7.2], fov: 46 }} fog={[10, 26]}>
      <Interior {...props} />
    </HeroCanvas>
  );
}
