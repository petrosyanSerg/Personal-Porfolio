'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  Matrix4,
  Vector3,
  type Group,
  type InstancedMesh,
  type Mesh,
} from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer } from '../core/motion';
import { count, detail } from '../core/quality';

const EXTENT = 4.2;

function Lattice({ quality, reducedMotion, palette }: SceneProps) {
  const nodes = useRef<InstancedMesh>(null);
  const plane = useRef<Mesh>(null);
  const rig = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.06);

  const points = useMemo(() => {
    const total = count(quality, 260);

    return Array.from({ length: total }, (_, i) => {
      const side = Math.ceil(Math.cbrt(total));
      const x = i % side;
      const y = Math.floor(i / side) % side;
      const z = Math.floor(i / (side * side));

      return new Vector3(
        ((x / (side - 1)) * 2 - 1) * EXTENT + srand(i * 1.7) * 0.28,
        ((y / (side - 1)) * 2 - 1) * EXTENT * 0.55 + srand(i * 3.1) * 0.28,
        ((z / (side - 1)) * 2 - 1) * EXTENT * 0.5 + srand(i * 5.3) * 0.28,
      );
    });
  }, [quality]);

  const edges = useMemo(() => {
    const positions: number[] = [];
    const limit = quality === 'low' ? 1.6 : 1.9;

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i]!;
        const b = points[j]!;
        if (a.distanceTo(b) < limit) {
          positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(positions), 3),
    );
    return geometry;
  }, [points, quality]);

  const scratch = useMemo(
    () => ({ matrix: new Matrix4(), position: new Vector3(), scale: new Vector3() }),
    [],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);
    const mesh = nodes.current;

    const scanY = (((t * 0.5) % 2) - 1) * EXTENT * 0.62;
    if (plane.current) plane.current.position.y = scanY;

    if (mesh) {
      points.forEach((point, i) => {
        const behind = scanY - point.y;
        const lit = behind >= 0 && behind < 2.4 ? 1 - behind / 2.4 : 0;
        const crossing = Math.abs(behind) < 0.14 ? 1 : 0;

        scratch.position.copy(point);
        scratch.scale.setScalar(0.028 + lit * 0.05 + crossing * 0.06);
        scratch.matrix.compose(scratch.position, mesh.quaternion, scratch.scale);
        mesh.setMatrixAt(i, scratch.matrix);
      });

      mesh.instanceMatrix.needsUpdate = true;
    }

    if (rig.current) {
      rig.current.rotation.y = t * 0.06 + pointer.current.x * 0.4;
      rig.current.rotation.x = pointer.current.y * -0.2;
    }

    void rand;
  });

  return (
    <>
      <ambientLight intensity={1.4} color={palette.accent} />

      <group ref={rig}>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={palette.accent} transparent opacity={0.16} />
        </lineSegments>

        <instancedMesh ref={nodes} args={[undefined, undefined, points.length]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={palette.accent} />
        </instancedMesh>

        <group ref={plane}>
          <gridHelper
            args={[EXTENT * 2.2, detail(quality, 18, 8), palette.teal, palette.accent]}
          />
        </group>

        {[-1, 1].map((sx) =>
          [-1, 1].map((sy) =>
            [-1, 1].map((sz) => (
              <group
                key={`${sx}${sy}${sz}`}
                position={[sx * EXTENT * 1.1, sy * EXTENT * 0.62, sz * EXTENT * 0.58]}
              >
                <mesh position={[-sx * 0.3, 0, 0]}>
                  <boxGeometry args={[0.6, 0.02, 0.02]} />
                  <meshBasicMaterial color={palette.teal} />
                </mesh>
                <mesh position={[0, -sy * 0.3, 0]}>
                  <boxGeometry args={[0.02, 0.6, 0.02]} />
                  <meshBasicMaterial color={palette.teal} />
                </mesh>
                <mesh position={[0, 0, -sz * 0.3]}>
                  <boxGeometry args={[0.02, 0.02, 0.6]} />
                  <meshBasicMaterial color={palette.teal} />
                </mesh>
              </group>
            )),
          ),
        )}
      </group>
    </>
  );
}

export default function CybercoreScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.4, 11], fov: 44 }} fog={[12, 30]}>
      <Lattice {...props} />
    </HeroCanvas>
  );
}
