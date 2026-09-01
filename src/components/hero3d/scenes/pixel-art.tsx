'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Matrix4, Vector3, type InstancedMesh } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer } from '../core/motion';
import { count } from '../core/quality';

const GRID = 14;
const CELL = 0.44;
const STEP = 1 / 8;

function Terrain({ quality, reducedMotion, palette }: SceneProps) {
  const blocks = useRef<InstancedMesh>(null);
  const pointer = usePointer(reducedMotion, 0.2);

  const cells = useMemo(() => {
    const side = Math.max(6, Math.round(Math.sqrt(count(quality, GRID * GRID))));
    const out: { x: number; z: number; height: number; tint: number }[] = [];

    for (let x = 0; x < side; x += 1) {
      for (let z = 0; z < side; z += 1) {
        const height =
          1.6 +
          Math.sin(x * 0.55) * 1.1 +
          Math.cos(z * 0.42) * 0.9 +
          rand(x * 31 + z * 7) * 0.7;

        out.push({
          x: (x - (side - 1) / 2) * CELL,
          z: (z - (side - 1) / 2) * CELL,
          height: Math.max(0.3, Math.round(height / 0.28) * 0.28),
          tint: rand(x * 13 + z * 29),
        });
      }
    }

    return out;
  }, [quality]);

  const scratch = useMemo(
    () => ({
      matrix: new Matrix4(),
      position: new Vector3(),
      scale: new Vector3(),
      colorA: new Color(),
      colorB: new Color(),
      mixed: new Color(),
    }),
    [],
  );

  useFrame((state) => {
    const mesh = blocks.current;
    if (!mesh) return;

    const raw = sceneTime(state.clock.elapsedTime, reducedMotion);
    const t = Math.floor(raw / STEP) * STEP;

    const { matrix, position, scale, colorA, colorB, mixed } = scratch;
    colorA.set(palette.accent);
    colorB.set(palette.teal);

    cells.forEach((cell, i) => {
      const wave = Math.sin(t * 2 + cell.x * 1.1 + cell.z * 0.7);
      const lift = Math.round(wave * 3) * 0.14;
      const height = cell.height + lift;

      position.set(cell.x, height / 2 - 1.5, cell.z);
      scale.set(CELL * 0.92, height, CELL * 0.92);
      matrix.compose(position, mesh.quaternion, scale);
      mesh.setMatrixAt(i, matrix);

      mixed.copy(cell.tint + lift > 0.55 ? colorA : colorB);
      mesh.setColorAt(i, mixed);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    const angle = Math.round(pointer.current.x * 8) / 8;
    state.camera.position.x = Math.sin(angle * 0.6) * 8;
    state.camera.position.z = Math.cos(angle * 0.6) * 8;
    state.camera.position.y = 4.2 + Math.round(pointer.current.y * 4) / 4;
    state.camera.lookAt(0, -0.4, 0);
  });

  return (
    <>
      <ambientLight intensity={0.7} color={palette.surfaceHigh} />
      <directionalLight position={[6, 10, 4]} intensity={1.6} color={palette.text} />

      <instancedMesh ref={blocks} args={[undefined, undefined, cells.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial flatShading roughness={1} metalness={0} vertexColors />
      </instancedMesh>
    </>
  );
}

export default function PixelArtScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 4.2, 8], fov: 38 }} fog={[10, 20]}>
      <Terrain {...props} />
    </HeroCanvas>
  );
}
