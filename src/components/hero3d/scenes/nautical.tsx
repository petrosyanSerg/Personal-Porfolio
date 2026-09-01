'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CatmullRomCurve3,
  PlaneGeometry,
  Vector3,
  type BufferAttribute,
  type Group,
  type Mesh,
} from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { sceneTime, usePointer, useScrollProgress } from '../core/motion';
import { count, detail } from '../core/quality';

function waveHeight(x: number, z: number, t: number): number {
  return (
    Math.sin(x * 0.28 + t * 0.9) * 0.34 +
    Math.sin(z * 0.21 - t * 0.7) * 0.26 +
    Math.sin((x + z) * 0.13 + t * 1.3) * 0.16
  );
}

function Sea({ quality, reducedMotion, palette }: SceneProps) {
  const surface = useRef<Mesh>(null);
  const buoy = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.03);
  const scroll = useScrollProgress(true);

  const geometry = useMemo(() => {
    const segments = detail(quality, 60, 22);
    const plane = new PlaneGeometry(80, 80, segments, segments);
    plane.rotateX(-Math.PI / 2);
    return plane;
  }, [quality]);

  const rest = useMemo(
    () => Float32Array.from(geometry.attributes.position!.array),
    [geometry],
  );

  const rigging = useMemo(() => {
    return [-1, 1].map(
      (side) =>
        new CatmullRomCurve3(
          Array.from({ length: 6 }, (_, i) => {
            const t = i / 5;
            return new Vector3(
              side * t * 1.9,
              4.2 - t * 3.6 - Math.sin(t * Math.PI) * 0.24,
              -0.2 + t * 0.3,
            );
          }),
        ),
    );
  }, []);

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (surface.current) {
      const attribute = geometry.attributes.position as BufferAttribute;
      const array = attribute.array as Float32Array;

      for (let i = 0; i < array.length; i += 3) {
        array[i + 1] = waveHeight(rest[i]!, rest[i + 2]!, t);
      }

      attribute.needsUpdate = true;
      attribute.needsUpdate = true;
      geometry.computeVertexNormals();
    }

    if (buoy.current) {
      const x = 4.6;
      const z = -3.4;
      buoy.current.position.y = -0.6 + waveHeight(x, z, t);
      buoy.current.rotation.z =
        (waveHeight(x + 0.6, z, t) - waveHeight(x - 0.6, z, t)) * -0.8;
      buoy.current.rotation.x =
        (waveHeight(x, z + 0.6, t) - waveHeight(x, z - 0.6, t)) * 0.8;
    }

    const camera = state.camera;
    const heave = waveHeight(0, 0, t);
    camera.rotation.z = Math.sin(t * 0.5) * 0.05 + pointer.current.x * 0.04;
    camera.rotation.x =
      Math.sin(t * 0.5 - Math.PI / 2) * 0.026 + pointer.current.y * 0.05;
    camera.position.y = 1.6 + heave * 0.6 - scroll.value * 0.8;
  });

  return (
    <>
      <ambientLight intensity={0.7} color={palette.surfaceHigh} />
      <directionalLight position={[2, 10, 4]} intensity={1.1} color={palette.text} />
      <pointLight
        position={[10, 3, -14]}
        intensity={120}
        distance={40}
        decay={2}
        color={palette.teal}
      />

      <mesh ref={surface} geometry={geometry} position={[0, -1.2, -10]}>
        <meshStandardMaterial
          color={palette.accent}
          roughness={0.24}
          metalness={0.35}
          flatShading={quality === 'low'}
        />
      </mesh>

      <group position={[0, -1, 2.4]}>
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.09, 0.13, 6, detail(quality, 12, 6)]} />
          <meshStandardMaterial color={palette.text} roughness={0.7} />
        </mesh>
        {rigging.map((curve, i) => (
          <mesh key={i}>
            <tubeGeometry args={[curve, detail(quality, 24, 10), 0.015, 4, false]} />
            <meshStandardMaterial color={palette.textMuted} roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 0.2, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 2.4, detail(quality, 10, 5)]} />
          <meshStandardMaterial color={palette.text} roughness={0.72} />
        </mesh>
      </group>

      <group ref={buoy} position={[4.6, -0.6, -3.4]}>
        <mesh>
          <coneGeometry args={[0.34, 0.9, detail(quality, 14, 6)]} />
          <meshStandardMaterial color={palette.teal} roughness={0.6} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <sphereGeometry args={[0.1, detail(quality, 12, 6), detail(quality, 8, 4)]} />
          <meshBasicMaterial color={palette.teal} />
        </mesh>
      </group>

      <group position={[10, -1.2, -22]}>
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[0.6, 1, 6, detail(quality, 16, 8)]} />
          <meshStandardMaterial color={palette.text} roughness={0.86} />
        </mesh>
        <mesh position={[0, 6.4, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.8, detail(quality, 14, 7)]} />
          <meshBasicMaterial color={palette.teal} />
        </mesh>
      </group>

      {Array.from({ length: count(quality, 6) }, (_, i) => (
        <mesh
          key={`gull-${i}`}
          position={[-8 + i * 3.2, 3.6 + (i % 3) * 0.8, -16 - (i % 4) * 3]}
          rotation={[0, 0, (i % 2 === 0 ? 1 : -1) * 0.3]}
        >
          <torusGeometry args={[0.3, 0.012, 4, detail(quality, 12, 6), Math.PI * 0.7]} />
          <meshBasicMaterial color={palette.text} />
        </mesh>
      ))}
    </>
  );
}

export default function NauticalScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 1.6, 6.4], fov: 52 }} fog={[18, 48]}>
      <Sea {...props} />
    </HeroCanvas>
  );
}
