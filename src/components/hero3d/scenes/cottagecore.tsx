'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import {
  rand,
  srand,
  sceneTime,
  usePointer,
  useScrollProgress,
  wobble,
} from '../core/motion';
import { count, detail } from '../core/quality';

function Cottage({ palette, quality }: Pick<SceneProps, 'palette' | 'quality'>) {
  return (
    <group position={[0.4, -1.28, -1.4]}>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[1.5, 0.84, 1.1]} />
        <meshStandardMaterial color={palette.surface} roughness={0.94} />
      </mesh>
      <mesh position={[0, 1.12, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.16, 0.72, 4]} />
        <meshStandardMaterial color={palette.accent} roughness={0.86} flatShading />
      </mesh>
      <mesh position={[0.42, 1.32, 0.2]}>
        <boxGeometry args={[0.2, 0.62, 0.2]} />
        <meshStandardMaterial color={palette.textMuted} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.42, 0.56]}>
        <planeGeometry args={[0.3, 0.34]} />
        <meshBasicMaterial color={palette.accentText} />
      </mesh>
      <mesh position={[0, 0.42, -0.56]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.3, 0.34]} />
        <meshBasicMaterial color={palette.accentText} />
      </mesh>
      <group position={[-1.5, 0, 0.3]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.06, 0.09, 0.6, detail(quality, 8, 5)]} />
          <meshStandardMaterial color={palette.textMuted} roughness={1} />
        </mesh>
        <mesh position={[0, 0.92, 0]}>
          <sphereGeometry args={[0.5, detail(quality, 14, 6), detail(quality, 10, 5)]} />
          <meshStandardMaterial color={palette.teal} roughness={0.95} flatShading />
        </mesh>
      </group>
    </group>
  );
}

function Valley({ quality, reducedMotion, palette }: SceneProps) {
  const world = useRef<Group>(null);
  const clouds = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.03);
  const scroll = useScrollProgress(true);

  const orchard = useMemo(
    () =>
      Array.from({ length: count(quality, 18) }, (_, i) => ({
        x: srand(i * 3.1) * 11,
        z: -3 - rand(i * 5.3) * 9,
        scale: 0.5 + rand(i * 7.9) * 0.5,
      })),
    [quality],
  );

  const sky = useMemo(
    () =>
      Array.from({ length: count(quality, 9) }, (_, i) => ({
        x: srand(i * 2.3) * 16,
        y: 3.4 + rand(i * 4.7) * 2.2,
        z: -14 - rand(i * 6.1) * 8,
        scale: 1 + rand(i * 8.7) * 1.6,
      })),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);
    const camera = state.camera;

    const walk = scroll.value * 4.2;
    camera.position.z += (7.6 - walk - camera.position.z) * 0.04;
    camera.position.y += (1.5 - walk * 0.18 - camera.position.y) * 0.04;
    camera.position.x += (pointer.current.x * 1.6 - camera.position.x) * 0.04;
    camera.lookAt(pointer.current.x * 2, -0.6 + pointer.current.y * 0.8, -4);

    if (clouds.current && !reducedMotion) {
      clouds.current.position.x = wobble(t * 0.04, 2) * 2.4;
    }

    if (world.current) {
      world.current.children.forEach((child, i) => {
        if (child.name !== 'tree') return;
        child.rotation.z = wobble(t * 0.5, i) * 0.02;
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.75} color={palette.surfaceHigh} />
      <directionalLight
        position={[-6, 5, 6]}
        intensity={1.35}
        color={palette.accentText}
      />
      <directionalLight position={[4, 8, -4]} intensity={0.3} color={palette.teal} />

      <group ref={world}>
        {[
          { z: 0, w: 60, color: palette.teal, y: -1.3, opacity: 1 },
          { z: -9, w: 70, color: palette.accent, y: -1.05, opacity: 0.75 },
          { z: -18, w: 90, color: palette.textMuted, y: -0.7, opacity: 0.5 },
        ].map((band, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, band.y, band.z]}>
            <planeGeometry args={[band.w, 22]} />
            <meshStandardMaterial
              color={band.color}
              roughness={1}
              transparent
              opacity={band.opacity}
            />
          </mesh>
        ))}

        <Cottage palette={palette} quality={quality} />

        {orchard.map((tree, i) => (
          <group key={i} name="tree" position={[tree.x, -1.3, tree.z]} scale={tree.scale}>
            <mesh position={[0, 0.26, 0]}>
              <cylinderGeometry args={[0.05, 0.08, 0.52, detail(quality, 7, 4)]} />
              <meshStandardMaterial color={palette.textMuted} roughness={1} />
            </mesh>
            <mesh position={[0, 0.78, 0]}>
              <sphereGeometry
                args={[0.42, detail(quality, 12, 6), detail(quality, 9, 4)]}
              />
              <meshStandardMaterial color={palette.teal} roughness={0.96} flatShading />
            </mesh>
          </group>
        ))}

        <group ref={clouds}>
          {sky.map((cloud, i) => (
            <group key={i} position={[cloud.x, cloud.y, cloud.z]} scale={cloud.scale}>
              {[0, 1, 2].map((lobe) => (
                <mesh
                  key={lobe}
                  position={[(lobe - 1) * 0.7, rand(i * 3 + lobe) * 0.2, 0]}
                >
                  <sphereGeometry
                    args={[
                      0.5 + rand(i + lobe) * 0.2,
                      detail(quality, 12, 5),
                      detail(quality, 8, 4),
                    ]}
                  />
                  <meshBasicMaterial color={palette.text} transparent opacity={0.72} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      </group>
    </>
  );
}

export default function CottagecoreScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 1.5, 7.6], fov: 44 }} fog={[14, 40]}>
      <Valley {...props} />
    </HeroCanvas>
  );
}
