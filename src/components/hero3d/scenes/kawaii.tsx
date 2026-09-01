'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, type Group, type Mesh } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, srand, sceneTime, usePointer, wobble } from '../core/motion';
import { count, detail } from '../core/quality';

function World({ quality, reducedMotion, palette }: SceneProps) {
  const character = useRef<Group>(null);
  const face = useRef<Group>(null);
  const props = useRef<Group>(null);
  const shadow = useRef<Mesh>(null);
  const pointer = usePointer(reducedMotion, 0.09);

  const segments = detail(quality, 32, 12);

  const friends = useMemo(
    () =>
      Array.from({ length: count(quality, 9) }, (_, i) => ({
        position: [
          srand(i * 2.7) * 5.2,
          srand(i * 4.3) * 2.6,
          -1 - rand(i * 6.1) * 3,
        ] as [number, number, number],
        scale: 0.18 + rand(i * 8.9) * 0.26,
        lane: i * 2.1,
        hue: i % 2 === 0 ? ('accent' as const) : ('teal' as const),
      })),
    [quality],
  );

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    if (character.current) {
      const targetX = pointer.current.x * 3;
      const targetY = pointer.current.y * 1.4;

      const previousX = character.current.position.x;
      character.current.position.x = MathUtils.lerp(previousX, targetX, 0.07);
      character.current.position.y =
        MathUtils.lerp(character.current.position.y, targetY, 0.05) +
        Math.abs(Math.sin(t * 2.2)) * 0.14;

      const speed = Math.abs(character.current.position.x - previousX);
      const squash = 1 + Math.min(0.16, speed * 3);
      character.current.scale.set(squash, 1 / squash, 1);
      character.current.rotation.z = MathUtils.lerp(
        character.current.rotation.z,
        (targetX - character.current.position.x) * -0.12,
        0.08,
      );
    }

    if (face.current) {
      face.current.rotation.y = MathUtils.lerp(
        face.current.rotation.y,
        pointer.current.x * 0.3,
        0.12,
      );
      face.current.rotation.x = MathUtils.lerp(
        face.current.rotation.x,
        -pointer.current.y * 0.2,
        0.12,
      );
    }

    if (shadow.current && character.current) {
      shadow.current.position.x = character.current.position.x;
      const height = character.current.position.y + 1.6;
      shadow.current.scale.setScalar(Math.max(0.3, 1.4 - height * 0.2));
    }

    if (props.current) {
      props.current.children.forEach((child, i) => {
        const friend = friends[i];
        if (!friend) return;
        child.position.y = friend.position[1] + wobble(t * 0.5, friend.lane) * 0.2;
        child.rotation.z = wobble(t * 0.4, friend.lane + 3) * 0.3;
      });
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} color={palette.text} />
      <directionalLight position={[2, 5, 6]} intensity={0.85} color={palette.text} />
      <pointLight
        position={[-4, -2, 4]}
        intensity={26}
        distance={18}
        decay={2}
        color={palette.accent}
      />

      <group ref={character} position={[0, 0, 0]}>
        <mesh position={[0, -0.5, 0]} scale={[1, 0.86, 1]}>
          <sphereGeometry args={[0.62, segments, segments]} />
          <meshStandardMaterial color={palette.accent} roughness={0.5} />
        </mesh>

        <group ref={face} position={[0, 0.34, 0]}>
          <mesh>
            <sphereGeometry args={[0.78, segments, segments]} />
            <meshStandardMaterial color={palette.text} roughness={0.42} />
          </mesh>

          {[-0.22, 0.22].map((x) => (
            <mesh key={x} position={[x, -0.08, 0.72]}>
              <sphereGeometry args={[0.075, segments, segments]} />
              <meshBasicMaterial color={palette.bg} />
            </mesh>
          ))}
          {[-0.44, 0.44].map((x) => (
            <mesh key={x} position={[x, -0.24, 0.58]}>
              <circleGeometry args={[0.13, segments]} />
              <meshBasicMaterial color={palette.accent} transparent opacity={0.6} />
            </mesh>
          ))}
          <mesh position={[0, -0.28, 0.74]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.08, 0.018, 6, detail(quality, 16, 6), Math.PI]} />
            <meshBasicMaterial color={palette.bg} />
          </mesh>
        </group>
      </group>

      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.58, 0]}>
        <circleGeometry args={[0.7, segments]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.22} />
      </mesh>

      <group ref={props}>
        {friends.map((friend, i) => (
          <mesh key={i} position={friend.position} scale={friend.scale}>
            {i % 3 === 0 ? (
              <sphereGeometry args={[1, segments, segments]} />
            ) : i % 3 === 1 ? (
              <torusGeometry args={[0.8, 0.32, 8, detail(quality, 20, 8)]} />
            ) : (
              <capsuleGeometry args={[0.6, 0.7, 4, segments]} />
            )}
            <meshStandardMaterial color={palette[friend.hue]} roughness={0.46} />
          </mesh>
        ))}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
        <circleGeometry args={[9, segments]} />
        <meshStandardMaterial color={palette.surface} roughness={0.95} />
      </mesh>
    </>
  );
}

export default function KawaiiScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.2, 6], fov: 44 }}>
      <World {...props} />
    </HeroCanvas>
  );
}
