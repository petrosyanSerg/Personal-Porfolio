'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

function Panes({ quality, reducedMotion, palette }: SceneProps) {
  const panes = useRef<Group>(null);
  const lobes = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const layout = useMemo(
    () =>
      [
        { x: -3.1, y: 1.3, w: 2.5, h: 1.6, z: 0.6 },
        { x: -0.2, y: 1.9, w: 3, h: 1.2, z: -0.4 },
        { x: 2.9, y: 1.2, w: 2.2, h: 2.1, z: 0.2 },
        { x: -2.8, y: -1.3, w: 2.9, h: 1.9, z: -0.8 },
        { x: 0.6, y: -1.5, w: 2.3, h: 1.5, z: 0.9 },
        { x: 3.3, y: -1.6, w: 1.9, h: 1.3, z: -0.2 },
      ].slice(0, count(quality, 6)),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (panes.current) {
      panes.current.children.forEach((child, i) => {
        const pane = layout[i];
        if (!pane) return;

        const depth = (pane.z + 1) / 2;
        child.position.x = pane.x + pointer.current.x * depth * 0.6;
        child.position.y =
          pane.y + pointer.current.y * depth * 0.4 + wobble(t * 0.12, i) * 0.05;
        child.rotation.y = pointer.current.x * 0.14 + wobble(t * 0.09, i + 3) * 0.02;
        child.rotation.x = pointer.current.y * -0.1;
      });
    }

    if (lobes.current) {
      lobes.current.children.forEach((child, i) => {
        child.position.x = srand(i * 3.1) * 4 + wobble(t * 0.06, i * 2.3) * 1.4;
        child.position.y = srand(i * 5.7) * 2.4 + wobble(t * 0.05, i * 1.7) * 0.9;
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} color={palette.surfaceHigh} />
      <directionalLight position={[2, 4, 8]} intensity={1.3} color={palette.text} />
      <pointLight
        position={[-5, 3, 2]}
        intensity={40}
        distance={22}
        decay={2}
        color={palette.accent}
      />
      <pointLight
        position={[5, -3, 1]}
        intensity={34}
        distance={22}
        decay={2}
        color={palette.teal}
      />

      <group ref={lobes} position={[0, 0, -6]}>
        {[palette.accent, palette.teal, palette.accentText].map((color, i) => (
          <mesh key={i} scale={2.4 + rand(i) * 1.6}>
            <sphereGeometry args={[1, detail(quality, 26, 10), detail(quality, 18, 8)]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>

      <group ref={panes}>
        {layout.map((pane, i) => (
          <group key={i} position={[pane.x, pane.y, pane.z]}>
            <mesh>
              <planeGeometry args={[pane.w, pane.h]} />
              <meshStandardMaterial
                color={palette.text}
                transparent
                opacity={0.14}
                roughness={0.06}
                metalness={0.16}
                side={DoubleSide}
              />
            </mesh>

            <mesh position={[0, pane.h / 2 - 0.01, 0.001]}>
              <planeGeometry args={[pane.w, 0.02]} />
              <meshBasicMaterial color={palette.text} transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, -pane.h / 2 + 0.01, 0.001]}>
              <planeGeometry args={[pane.w, 0.02]} />
              <meshBasicMaterial color={palette.text} transparent opacity={0.18} />
            </mesh>

            <mesh position={[-pane.w * 0.18, 0, 0.002]} rotation={[0, 0, 0.6]}>
              <planeGeometry args={[pane.w * 0.28, pane.h * 1.6]} />
              <meshBasicMaterial color={palette.text} transparent opacity={0.07} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

export default function GlassmorphismScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 8.6], fov: 46 }}>
      <Panes {...props} />
    </HeroCanvas>
  );
}
