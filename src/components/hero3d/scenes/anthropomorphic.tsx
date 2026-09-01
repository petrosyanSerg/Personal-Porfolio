'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, type Group, type Mesh } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { sceneTime, usePointer, wobble } from '../core/motion';
import { detail } from '../core/quality';

function Character({ quality, reducedMotion, palette }: SceneProps) {
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const gaze = useRef<Group>(null);
  const lidLeft = useRef<Mesh>(null);
  const lidRight = useRef<Mesh>(null);
  const pointer = usePointer(reducedMotion, 0.12);

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (gaze.current) {
      gaze.current.rotation.y = MathUtils.lerp(
        gaze.current.rotation.y,
        pointer.current.x * 0.5,
        0.18,
      );
      gaze.current.rotation.x = MathUtils.lerp(
        gaze.current.rotation.x,
        -pointer.current.y * 0.34,
        0.18,
      );
    }

    if (head.current) {
      head.current.rotation.y = MathUtils.lerp(
        head.current.rotation.y,
        pointer.current.x * 0.42,
        0.07,
      );
      head.current.rotation.x = MathUtils.lerp(
        head.current.rotation.x,
        -pointer.current.y * 0.24,
        0.07,
      );
      head.current.rotation.z = MathUtils.lerp(
        head.current.rotation.z,
        -pointer.current.x * 0.1,
        0.06,
      );
      head.current.position.y = 0.98 + wobble(t * 0.5, 2) * 0.03;
    }

    if (body.current) {
      body.current.rotation.y = MathUtils.lerp(
        body.current.rotation.y,
        pointer.current.x * 0.22,
        0.03,
      );
      const breath = 1 + Math.sin(t * 1.1) * 0.018;
      body.current.scale.set(1 / breath, breath, 1 / breath);
    }

    const phase = (Math.sin(t * 0.62) + Math.sin(t * 0.29)) * 0.5;
    const closing = phase > 0.93 ? (phase - 0.93) / 0.07 : 0;
    const lid = Math.min(1, closing * 1.6);

    if (lidLeft.current && lidRight.current) {
      lidLeft.current.scale.y = lid;
      lidRight.current.scale.y = lid;
    }
  });

  const segments = detail(quality, 40, 14);

  return (
    <>
      <ambientLight intensity={0.95} color={palette.surfaceHigh} />
      <directionalLight position={[3, 5, 6]} intensity={1.3} color={palette.text} />
      <pointLight
        position={[-4, 1, 3]}
        intensity={22}
        distance={16}
        decay={2}
        color={palette.accent}
      />

      <group ref={body} position={[0, -0.9, 0]}>
        <mesh position={[0, 0.34, 0]} scale={[1, 0.92, 1]}>
          <sphereGeometry args={[0.86, segments, segments]} />
          <meshStandardMaterial color={palette.accent} roughness={0.42} />
        </mesh>

        <group ref={head} position={[0, 0.98, 0]}>
          <mesh scale={[1.04, 1, 1]}>
            <sphereGeometry args={[0.66, segments, segments]} />
            <meshStandardMaterial color={palette.text} roughness={0.36} />
          </mesh>

          <group ref={gaze}>
            {[-0.24, 0.24].map((x, i) => (
              <group key={x} position={[x, 0.08, 0.56]}>
                <mesh>
                  <sphereGeometry args={[0.14, segments, segments]} />
                  <meshStandardMaterial color={palette.surface} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0, 0.09]}>
                  <sphereGeometry args={[0.075, segments, segments]} />
                  <meshStandardMaterial color={palette.bg} roughness={0.1} />
                </mesh>
                <mesh
                  ref={i === 0 ? lidLeft : lidRight}
                  position={[0, 0.07, 0.11]}
                  scale={[1, 0, 1]}
                >
                  <boxGeometry args={[0.3, 0.2, 0.06]} />
                  <meshStandardMaterial color={palette.text} roughness={0.4} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.72, 0]}>
        <circleGeometry args={[3.4, detail(quality, 48, 16)]} />
        <meshStandardMaterial color={palette.surface} roughness={0.9} />
      </mesh>
    </>
  );
}

export default function AnthropomorphicScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.5, 5.4], fov: 42 }}>
      <Character {...props} />
    </HeroCanvas>
  );
}
