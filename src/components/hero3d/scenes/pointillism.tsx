'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  SphereGeometry,
  Vector3,
  type Points,
} from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer } from '../core/motion';
import { count } from '../core/quality';

function Cloud({ quality, reducedMotion, palette }: SceneProps) {
  const cloud = useRef<Points>(null);
  const pointer = usePointer(reducedMotion, 0.1);

  const { geometry, rest } = useMemo(() => {
    const total = count(quality, 9000);
    const source = new SphereGeometry(1, 96, 96);
    const sourcePositions = source.attributes.position!.array as Float32Array;
    const available = sourcePositions.length / 3;

    const positions = new Float32Array(total * 3);
    const colors = new Float32Array(total * 3);

    const hues = [palette.accent, palette.teal, palette.accentText].map(
      (hex) => new Color(hex),
    );
    const scratch = new Vector3();

    for (let i = 0; i < total; i += 1) {
      const source3 = (Math.floor(rand(i * 1.7) * available) % available) * 3;
      scratch.set(
        sourcePositions[source3]!,
        sourcePositions[source3 + 1]!,
        sourcePositions[source3 + 2]!,
      );

      const lobe =
        1.5 +
        Math.sin(scratch.y * 2.4) * 0.42 +
        Math.sin(scratch.x * 3.1 + scratch.z * 2) * 0.26;
      scratch.multiplyScalar(lobe);
      scratch.addScaledVector(scratch.clone().normalize(), (rand(i * 3.3) - 0.5) * 0.16);

      positions[i * 3] = scratch.x;
      positions[i * 3 + 1] = scratch.y;
      positions[i * 3 + 2] = scratch.z;

      const hue = hues[Math.floor(rand(i * 5.9) * 3)]!;
      colors[i * 3] = hue.r;
      colors[i * 3 + 1] = hue.g;
      colors[i * 3 + 2] = hue.b;
    }

    source.dispose();

    const target = new BufferGeometry();
    target.setAttribute('position', new BufferAttribute(positions, 3));
    target.setAttribute('color', new BufferAttribute(colors, 3));

    return { geometry: target, rest: Float32Array.from(positions) };
  }, [quality, palette]);

  const scratch = useMemo(() => ({ point: new Vector3(), cursor: new Vector3() }), []);

  useFrame((state) => {
    if (!cloud.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion);
    const attribute = geometry.attributes.position as BufferAttribute;
    const array = attribute.array as Float32Array;

    scratch.cursor.set(pointer.current.x * 3.4, pointer.current.y * 2.6, 2);

    for (let i = 0; i < array.length; i += 3) {
      scratch.point.set(rest[i]!, rest[i + 1]!, rest[i + 2]!);

      const breath = 1 + Math.sin(t * 0.5 + scratch.point.y * 0.8) * 0.02;
      scratch.point.multiplyScalar(breath);

      const dx = scratch.point.x - scratch.cursor.x;
      const dy = scratch.point.y - scratch.cursor.y;
      const distanceSquared = dx * dx + dy * dy + 0.4;
      const push = Math.min(1.4, 2.2 / distanceSquared);

      array[i] = scratch.point.x + dx * push * 0.32;
      array[i + 1] = scratch.point.y + dy * push * 0.32;
      array[i + 2] = scratch.point.z + push * 0.2;
    }

    attribute.needsUpdate = true;
    cloud.current.rotation.y = t * 0.06;
  });

  return (
    <>
      <points ref={cloud} geometry={geometry}>
        <pointsMaterial
          size={0.035}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>
    </>
  );
}

export default function PointillismScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0, 6.4], fov: 46 }}>
      <Cloud {...props} />
    </HeroCanvas>
  );
}
