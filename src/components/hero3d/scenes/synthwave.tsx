'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, PlaneGeometry, type BufferAttribute, type Mesh } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer, useScrollProgress } from '../core/motion';
import { detail } from '../core/quality';

const DEPTH = 60;
const WIDTH = 46;

function Grid({ quality, reducedMotion, palette }: SceneProps) {
  const floor = useRef<Mesh>(null);
  const sun = useRef<Mesh>(null);
  const pointer = usePointer(reducedMotion, 0.04);
  const scroll = useScrollProgress(true);

  const geometry = useMemo(() => {
    const cols = detail(quality, 48, 20);
    const rows = detail(quality, 60, 24);
    const plane = new PlaneGeometry(WIDTH, DEPTH, cols, rows);
    plane.rotateX(-Math.PI / 2);
    return plane;
  }, [quality]);

  const rest = useMemo(
    () => Float32Array.from(geometry.attributes.position!.array),
    [geometry],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);
    const attribute = geometry.attributes.position as BufferAttribute;
    const array = attribute.array as Float32Array;
    const travel = (t * 6 + scroll.value * 20) % (DEPTH / 12);

    for (let i = 0; i < array.length; i += 3) {
      const x = rest[i]!;
      const z0 = rest[i + 2]!;

      const z = ((z0 + travel + DEPTH / 2) % DEPTH) - DEPTH / 2;
      array[i + 2] = z;

      const far = Math.max(0, (-z - 8) / (DEPTH / 2 - 8));
      const ridge =
        (Math.sin(x * 0.4 + rand(Math.floor(x)) * 3) * 1.4 +
          Math.sin(x * 0.13 + 2) * 2.6 +
          Math.sin(z * 0.21) * 0.8) *
        far *
        far;

      array[i + 1] = Math.max(0, ridge);
    }

    attribute.needsUpdate = true;

    if (sun.current) {
      sun.current.position.x = pointer.current.x * 1.2;
    }

    state.camera.rotation.z +=
      (pointer.current.x * -0.05 - state.camera.rotation.z) * 0.04;
    state.camera.position.y +=
      (1.1 + pointer.current.y * 0.5 - state.camera.position.y) * 0.04;
  });

  return (
    <>
      <ambientLight intensity={0.4} color={palette.accent} />
      <pointLight
        position={[0, -3, -14]}
        intensity={200}
        distance={50}
        decay={2}
        color={palette.accent}
      />
      <pointLight
        position={[6, -2, 4]}
        intensity={40}
        distance={26}
        decay={2}
        color={palette.teal}
      />

      <group ref={sun} position={[0, 2.6, -26]}>
        <mesh>
          <circleGeometry args={[6, detail(quality, 48, 20)]} />
          <meshBasicMaterial color={palette.accent} transparent opacity={0.85} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[0, -1.1 - i * 0.62, 0.02]}>
            <planeGeometry args={[13, 0.16 + i * 0.07]} />
            <meshBasicMaterial color={palette.bg} transparent opacity={0.92} />
          </mesh>
        ))}
      </group>

      <mesh ref={floor} geometry={geometry} position={[0, -1.4, -14]}>
        <meshBasicMaterial
          color={palette.accent}
          wireframe
          transparent
          opacity={0.62}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.42, -18]}>
        <planeGeometry args={[9, 26]} />
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={0.14}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

export default function SynthwaveScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 1.1, 6], fov: 62 }} fog={[22, 52]}>
      <Grid {...props} />
    </HeroCanvas>
  );
}
