'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Shape,
  type Group,
} from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, useScrollProgress } from '../core/motion';
import { count, detail } from '../core/quality';

function bubble(seed: number): Shape {
  const s = new Shape();
  const w = 0.5 + rand(seed) * 0.35;
  const h = 0.8 + rand(seed * 3) * 0.4;

  s.moveTo(-w, -h);
  s.bezierCurveTo(-w * 1.7, -h * 0.2, -w * 1.5, h * 0.9, -w * 0.3, h);
  s.bezierCurveTo(w * 0.9, h * 1.15, w * 1.7, h * 0.4, w * 1.2, -h * 0.3);
  s.bezierCurveTo(w * 0.9, -h * 1.1, -w * 0.2, -h * 1.2, -w, -h);

  return s;
}

function Wall({ quality, reducedMotion, palette }: SceneProps) {
  const track = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.05);
  const scroll = useScrollProgress(true);

  const letters = useMemo(
    () => Array.from({ length: 5 }, (_, i) => bubble(i * 2.7 + 1)),
    [],
  );

  const extrude = useMemo(
    () => ({ depth: 0.06, bevelEnabled: false, curveSegments: detail(quality, 14, 5) }),
    [quality],
  );

  const spray = useMemo(() => {
    const total = count(quality, 700);
    const positions = new Float32Array(total * 3);

    for (let i = 0; i < total; i += 1) {
      const letter = Math.floor(rand(i * 1.3) * 5);
      const spread = 0.3 + rand(i * 3.7) ** 3 * 2.4;
      const a = rand(i * 5.1) * Math.PI * 2;

      positions[i * 3] = (letter - 2) * 1.5 + Math.cos(a) * spread;
      positions[i * 3 + 1] = Math.sin(a) * spread * 0.8 + srand(i * 7.3) * 0.3;
      positions[i * 3 + 2] = 0.12 + rand(i * 9.1) * 0.2;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    return geometry;
  }, [quality]);

  useFrame((state) => {
    void sceneTime(state.clock.elapsedTime, reducedMotion);

    if (track.current) {
      const along = scroll.value * 8 - 2 + pointer.current.x * 2.4;
      track.current.position.x += (-along - track.current.position.x) * 0.05;
      track.current.position.y +=
        (pointer.current.y * 0.4 - track.current.position.y) * 0.05;
    }

    state.camera.rotation.y +=
      (pointer.current.x * 0.08 - state.camera.rotation.y) * 0.04;
  });

  return (
    <>
      <ambientLight intensity={0.5} color={palette.surfaceHigh} />
      <directionalLight position={[-4, 7, 6]} intensity={1.3} color={palette.text} />
      <pointLight
        position={[3, 2, 4]}
        intensity={30}
        distance={18}
        decay={2}
        color={palette.accent}
      />

      <group ref={track}>
        <mesh position={[0, 0, -0.4]}>
          <boxGeometry args={[44, 12, 0.8]} />
          <meshStandardMaterial color={palette.surface} roughness={1} flatShading />
        </mesh>
        {Array.from({ length: count(quality, 14) }, (_, i) => (
          <mesh key={`course-${i}`} position={[0, i * 0.9 - 5.4, 0.01]}>
            <planeGeometry args={[44, 0.03]} />
            <meshBasicMaterial color={palette.bg} transparent opacity={0.4} />
          </mesh>
        ))}

        {letters.map((shape, i) => (
          <group
            key={i}
            position={[(i - 2) * 1.5, srand(i * 3) * 0.24, 0.1]}
            rotation={[0, 0, srand(i * 5) * 0.16]}
          >
            <mesh scale={1.16} position={[0, 0, -0.03]}>
              <extrudeGeometry args={[shape, extrude]} />
              <meshBasicMaterial color={palette.bg} />
            </mesh>
            <mesh>
              <extrudeGeometry args={[shape, extrude]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? palette.accent : palette.teal}
                roughness={0.62}
              />
            </mesh>
          </group>
        ))}

        <points geometry={spray} position={[0, 0, 0]}>
          <pointsMaterial
            size={0.035}
            sizeAttenuation
            color={palette.accent}
            transparent
            opacity={0.3}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {[-11, 12].map((x, i) => (
          <mesh
            key={x}
            position={[x, srand(i) * 1.4, 0.06]}
            rotation={[0, 0, srand(i * 7) * 0.3]}
          >
            <extrudeGeometry args={[letters[i % letters.length]!, extrude]} />
            <meshStandardMaterial color={palette.textMuted} roughness={0.8} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function GraffitiScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 7.4], fov: 50 }} fog={[12, 34]}>
      <Wall {...props} />
    </HeroCanvas>
  );
}
