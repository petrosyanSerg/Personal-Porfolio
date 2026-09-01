'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Matrix4,
  Quaternion,
  Vector3,
  type Group,
  type InstancedMesh,
} from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer, useScrollProgress, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

const COLUMNS = 9;
const DRUMS = 11;
const SPACING = 2.35;
const DRUM_HEIGHT = 0.52;

type ColumnProps = {
  quality: SceneProps['quality'];
  reducedMotion: boolean;
  palette: SceneProps['palette'];
};

function Colonnade({ quality, reducedMotion, palette }: ColumnProps) {
  const drums = useRef<InstancedMesh>(null);
  const dust = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.045);
  const scroll = useScrollProgress(true);

  const layout = useMemo(() => {
    const matrix = new Matrix4();
    const position = new Vector3();
    const scale = new Vector3();
    const rotation = new Quaternion();
    const out: Matrix4[] = [];

    for (let c = 0; c < COLUMNS; c += 1) {
      const rank = c % 2 === 0 ? 1 : -1;
      const x = (c - (COLUMNS - 1) / 2) * SPACING;

      for (let d = 0; d < DRUMS; d += 1) {
        const t = d / (DRUMS - 1);
        const swell = 1 - 0.16 * t - 0.05 * Math.sin(t * Math.PI);
        const drift = (rand(c * 31 + d) - 0.5) * 0.02;

        position.set(x + drift, d * DRUM_HEIGHT - 1.4, rank * 3.1);
        scale.set(swell, 1, swell);
        rotation.setFromAxisAngle(new Vector3(0, 1, 0), rand(c * 7 + d) * 0.4);

        matrix.compose(position, rotation, scale);
        out.push(matrix.clone());
      }
    }

    return out;
  }, []);

  const motes = useMemo(() => {
    const total = count(quality, 260);
    const positions = new Float32Array(total * 3);

    for (let i = 0; i < total; i += 1) {
      positions[i * 3] = (rand(i * 3.1) - 0.5) * 20;
      positions[i * 3 + 1] = rand(i * 5.7) * 7 - 1.5;
      positions[i * 3 + 2] = (rand(i * 9.3) - 0.5) * 5.4;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    return geometry;
  }, [quality]);

  useFrame((state, delta) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);
    const camera = state.camera;

    const swing = pointer.current.x * 0.5;
    const lift = pointer.current.y * 0.9;
    const walk = scroll.value * 5.5;

    camera.position.x += (Math.sin(swing) * 7.5 - camera.position.x) * 0.05;
    camera.position.y += (1.1 + lift - camera.position.y) * 0.05;
    camera.position.z += (Math.cos(swing) * 7.5 - walk - camera.position.z) * 0.05;
    camera.lookAt(0, 1.6 + lift * 0.4, 0);

    if (dust.current && !reducedMotion) {
      dust.current.rotation.y += delta * 0.014;
      dust.current.position.y = wobble(t * 0.2, 3) * 0.12;
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} color={palette.surfaceHigh} />
      <directionalLight position={[6, 9, 4]} intensity={1.5} color={palette.text} />
      <directionalLight position={[-8, 2, -6]} intensity={0.4} color={palette.accent} />

      <instancedMesh
        ref={drums}
        args={[undefined, undefined, layout.length]}
        onUpdate={(mesh: InstancedMesh) => {
          layout.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
          mesh.instanceMatrix.needsUpdate = true;
        }}
      >
        <cylinderGeometry args={[0.42, 0.44, DRUM_HEIGHT, detail(quality, 24, 10), 1]} />
        <meshStandardMaterial
          color={palette.text}
          roughness={0.82}
          metalness={0}
          flatShading={quality === 'low'}
        />
      </instancedMesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.68, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={palette.surface} roughness={0.55} metalness={0.05} />
      </mesh>

      <group ref={dust}>
        <points geometry={motes}>
          <pointsMaterial
            size={0.045}
            sizeAttenuation
            color={palette.accent}
            transparent
            opacity={0.55}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </>
  );
}

export default function NeoclassicalScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 1.1, 7.5], fov: 46 }} fog={[9, 30]}>
      <Colonnade {...props} />
    </HeroCanvas>
  );
}
