'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Matrix4, Vector3, type InstancedMesh } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer } from '../core/motion';
import { detail } from '../core/quality';

const GLYPHS = [
  ['01110', '10001', '10000', '01110', '00001', '10001', '01110'], // S
  ['11110', '10001', '10001', '11110', '10000', '10000', '10000'], // P
] as const;

const MODULE = 0.34;
const GAP = 0.02;

function Alphabet({ quality, reducedMotion, palette }: SceneProps) {
  const modules = useRef<InstancedMesh>(null);
  const pointer = usePointer(reducedMotion, 0.08);

  const cells = useMemo(() => {
    const out: { home: Vector3; scatter: Vector3 }[] = [];
    let index = 0;

    GLYPHS.forEach((glyph, g) => {
      glyph.forEach((row, r) => {
        row.split('').forEach((cell, c) => {
          if (cell !== '1') return;

          out.push({
            home: new Vector3(
              (c - 2) * (MODULE + GAP) + (g - 0.5) * 2.6,
              (3 - r) * (MODULE + GAP),
              0,
            ),
            scatter: new Vector3(
              (rand(index * 2.1) - 0.5) * 11,
              (rand(index * 4.3) - 0.5) * 6,
              (rand(index * 6.7) - 0.5) * 5,
            ),
          });

          index += 1;
        });
      });
    });

    return out;
  }, []);

  const scratch = useMemo(
    () => ({
      matrix: new Matrix4(),
      position: new Vector3(),
      scale: new Vector3(),
    }),
    [],
  );

  useFrame((state) => {
    const mesh = modules.current;
    if (!mesh) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);
    const reach = Math.min(1, Math.hypot(pointer.current.x, pointer.current.y));

    cells.forEach((cell, i) => {
      const threshold = rand(i * 3.3) * 0.7;
      const away = Math.max(0, Math.min(1, (reach - threshold) / 0.3));
      const stepped = Math.round(away * 4) / 4;

      scratch.position.lerpVectors(cell.home, cell.scatter, stepped);
      scratch.position.y += Math.round(Math.sin(t * 2 + i) * 2) * 0.004;

      scratch.scale.setScalar(MODULE * (1 - stepped * 0.3));
      scratch.matrix.compose(scratch.position, mesh.quaternion, scratch.scale);
      mesh.setMatrixAt(i, scratch.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={1.2} color={palette.text} />
      <directionalLight position={[0, 2, 8]} intensity={0.6} color={palette.text} />

      <instancedMesh ref={modules} args={[undefined, undefined, cells.length]}>
        <boxGeometry args={[1, 1, 0.4]} />
        <meshStandardMaterial color={palette.accent} roughness={0.7} metalness={0.05} />
      </instancedMesh>

      <gridHelper
        args={[16, detail(quality, 44, 16), palette.border, palette.border]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0.5, -1.4]}
      />
    </>
  );
}

export default function ModularTypographyScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 1, 7.4], fov: 44 }}>
      <Alphabet {...props} />
    </HeroCanvas>
  );
}
