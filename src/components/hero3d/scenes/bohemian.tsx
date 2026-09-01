'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

const STRANDS = 11;
const LINKS = 9;

function Hanging({ quality, reducedMotion, palette }: SceneProps) {
  const piece = useRef<Group>(null);
  const strands = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.07);

  const web = useMemo(() => {
    const points: number[] = [];
    const nodes = quality === 'low' ? 9 : 13;
    const radius = 1.85;

    for (let ring = 0; ring < 3; ring += 1) {
      const r = radius * (1 - ring * 0.26);
      const shrink = radius * (1 - (ring + 1) * 0.26);

      for (let i = 0; i < nodes; i += 1) {
        const a = (i / nodes) * Math.PI * 2 + ring * 0.24;
        const b = ((i + 1) / nodes) * Math.PI * 2 + (ring + 1) * 0.24;
        points.push(
          Math.cos(a) * r,
          Math.sin(a) * r,
          0,
          Math.cos(b) * shrink,
          Math.sin(b) * shrink,
          0,
        );
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3));
    return geometry;
  }, [quality]);

  const strandCount = count(quality, STRANDS);

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (piece.current) {
      piece.current.rotation.z = wobble(t * 0.24, 1) * 0.06 + pointer.current.x * 0.12;
      piece.current.rotation.y = wobble(t * 0.17, 4) * 0.14 + pointer.current.x * 0.3;
      piece.current.rotation.x = pointer.current.y * -0.1;
    }

    if (!strands.current) return;

    strands.current.children.forEach((strand, s) => {
      strand.children.forEach((link, l) => {
        const lag = l * 0.16;
        const sway = wobble((t - lag) * 0.5, s * 1.7);
        const influence = (l + 1) / LINKS;

        link.position.x =
          sway * 0.24 * influence + pointer.current.x * 0.5 * influence * influence;
        link.position.z = wobble((t - lag) * 0.37, s * 2.9) * 0.16 * influence;
      });
    });
  });

  return (
    <>
      <ambientLight intensity={0.55} color={palette.surfaceHigh} />
      <pointLight
        position={[-4, -1, 5]}
        intensity={48}
        distance={20}
        decay={2}
        color={palette.accent}
      />
      <pointLight
        position={[5, 3, 2]}
        intensity={20}
        distance={18}
        decay={2}
        color={palette.teal}
      />

      <group ref={piece} position={[0, 1.6, 0]}>
        <mesh position={[0, 2.6, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 5, 6]} />
          <meshBasicMaterial color={palette.textMuted} />
        </mesh>

        {[1.85, 1.42, 0.62].map((r, i) => (
          <mesh key={r} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, i * -0.06]}>
            <torusGeometry
              args={[r, 0.038, detail(quality, 10, 5), detail(quality, 90, 30)]}
            />
            <meshStandardMaterial
              color={i === 1 ? palette.teal : palette.accent}
              metalness={0.7}
              roughness={0.36}
            />
          </mesh>
        ))}

        <lineSegments geometry={web}>
          <lineBasicMaterial color={palette.text} transparent opacity={0.42} />
        </lineSegments>

        <group ref={strands} position={[0, -1.85, 0]}>
          {Array.from({ length: strandCount }, (_, s) => {
            const a = (s / (strandCount - 1) - 0.5) * 2.4;
            const x = Math.sin(a) * 1.8;
            const drop = Math.cos(a) * 0.35;

            return (
              <group key={s} position={[x, -drop, 0]}>
                {Array.from({ length: LINKS }, (_, l) => (
                  <mesh key={l} position={[0, -l * 0.26 - 0.2, 0]}>
                    {l % 3 === 0 ? (
                      <sphereGeometry
                        args={[0.055, detail(quality, 12, 5), detail(quality, 8, 4)]}
                      />
                    ) : (
                      <cylinderGeometry args={[0.014, 0.014, 0.2, 5]} />
                    )}
                    <meshStandardMaterial
                      color={rand(s * 5 + l) > 0.6 ? palette.teal : palette.accent}
                      metalness={0.5}
                      roughness={0.44}
                    />
                  </mesh>
                ))}
              </group>
            );
          })}
        </group>
      </group>
    </>
  );
}

export default function BohemianScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, -0.3, 8.2], fov: 46 }} fog={[10, 24]}>
      <Hanging {...props} />
    </HeroCanvas>
  );
}
