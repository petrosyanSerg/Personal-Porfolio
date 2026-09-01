'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, DoubleSide, Shape, Vector3, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer, useScrollProgress, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

function leafShape(): Shape {
  const shape = new Shape();
  shape.moveTo(0, 0);

  shape.bezierCurveTo(0.42, 0.18, 0.3, 0.52, 0.5, 0.66);
  shape.bezierCurveTo(0.26, 0.7, 0.34, 1.02, 0.42, 1.2);
  shape.bezierCurveTo(0.2, 1.24, 0.16, 1.5, 0, 1.85);
  shape.bezierCurveTo(-0.16, 1.5, -0.2, 1.24, -0.42, 1.2);
  shape.bezierCurveTo(-0.34, 1.02, -0.26, 0.7, -0.5, 0.66);
  shape.bezierCurveTo(-0.3, 0.52, -0.42, 0.18, 0, 0);

  return shape;
}

type Stem = {
  readonly curve: CatmullRomCurve3;
  readonly leaves: { t: number; scale: number; roll: number }[];
  readonly delay: number;
};

function Vine({ quality, reducedMotion, palette }: SceneProps) {
  const plant = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.03);
  const scroll = useScrollProgress(true);

  const shape = useMemo(() => leafShape(), []);

  const stems = useMemo<Stem[]>(() => {
    const total = count(quality, 7);

    return Array.from({ length: total }, (_, i) => {
      const lean = (i / Math.max(1, total - 1) - 0.5) * 2;
      const points: Vector3[] = [];

      for (let s = 0; s <= 8; s += 1) {
        const t = s / 8;
        points.push(
          new Vector3(
            lean * 3.4 * t * t + Math.sin(t * 3 + i) * 0.28,
            -2.4 + t * 5.4 - t * t * 1.2,
            Math.sin(t * 2.2 + i * 1.7) * 0.9 - i * 0.15,
          ),
        );
      }

      return {
        curve: new CatmullRomCurve3(points),
        leaves: Array.from({ length: 4 }, (_, l) => ({
          t: 0.24 + l * 0.2,
          scale: 0.72 - l * 0.1 + rand(i * 3 + l) * 0.18,
          roll: rand(i * 7 + l) * Math.PI * 2,
        })),
        delay: i * 0.22,
      };
    });
  }, [quality]);

  useFrame((state) => {
    if (!plant.current) return;

    const elapsed = sceneTime(state.clock.elapsedTime, reducedMotion);

    plant.current.children.forEach((stemGroup, i) => {
      const stem = stems[i];
      if (!stem) return;

      const grown = Math.min(1, Math.max(0, (elapsed - stem.delay) / 2));
      const eased = 1 - (1 - grown) ** 3;

      stemGroup.scale.setScalar(eased);
      stemGroup.rotation.z =
        wobble(elapsed * 0.24, i) * 0.05 * eased + pointer.current.x * 0.12;
      stemGroup.rotation.x = pointer.current.y * -0.08;
    });

    plant.current.position.y = scroll.value * 1.8;
  });

  return (
    <>
      <ambientLight intensity={0.85} color={palette.surfaceHigh} />
      <directionalLight position={[4, 8, 6]} intensity={1.2} color={palette.text} />
      <directionalLight position={[-6, 1, -4]} intensity={0.35} color={palette.teal} />

      <group ref={plant} position={[0, -0.6, 0]}>
        {stems.map((stem, i) => (
          <group key={i}>
            <mesh>
              <tubeGeometry
                args={[
                  stem.curve,
                  detail(quality, 40, 14),
                  0.045,
                  detail(quality, 7, 4),
                  false,
                ]}
              />
              <meshStandardMaterial color={palette.teal} roughness={0.7} />
            </mesh>

            {stem.leaves.map((leaf, l) => {
              const point = stem.curve.getPointAt(leaf.t);
              const tangent = stem.curve.getTangentAt(leaf.t);

              return (
                <mesh
                  key={l}
                  position={[point.x, point.y, point.z]}
                  rotation={[
                    Math.atan2(tangent.z, tangent.y) * 0.5,
                    leaf.roll,
                    Math.atan2(-tangent.x, tangent.y),
                  ]}
                  scale={leaf.scale}
                >
                  <shapeGeometry args={[shape, detail(quality, 14, 5)]} />
                  <meshStandardMaterial
                    color={l % 2 === 0 ? palette.teal : palette.accent}
                    roughness={0.62}
                    side={DoubleSide}
                  />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>
    </>
  );
}

export default function AcanthusScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.8, 9], fov: 46 }} fog={[11, 26]}>
      <Vine {...props} />
    </HeroCanvas>
  );
}
