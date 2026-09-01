'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  PlaneGeometry,
  type Group,
  type Mesh,
  type Points,
} from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer, useScrollProgress } from '../core/motion';
import { count, detail } from '../core/quality';

const RIBBONS = [
  { width: 11, height: 7.5, x: -2.6, z: -3, hue: 'teal', speed: 0.42, fold: 0.9 },
  { width: 9, height: 6.4, x: 1.9, z: -1, hue: 'accent', speed: 0.31, fold: 1.35 },
  { width: 13, height: 5.6, x: 0.4, z: -5.5, hue: 'accentText', speed: 0.23, fold: 0.62 },
] as const;

type RibbonProps = SceneProps & {
  config: (typeof RIBBONS)[number];
  index: number;
  drift: { value: number };
};

function Ribbon({ config, index, quality, reducedMotion, palette, drift }: RibbonProps) {
  const mesh = useRef<Mesh>(null);

  const geometry = useMemo(() => {
    const segments = detail(quality, 40, 14);
    return new PlaneGeometry(
      config.width,
      config.height,
      segments,
      Math.round(segments * 0.6),
    );
  }, [config.width, config.height, quality]);

  const rest = useMemo(
    () => Float32Array.from(geometry.attributes.position!.array),
    [geometry],
  );

  useFrame((state) => {
    if (!mesh.current) return;

    const t = sceneTime(state.clock.elapsedTime, reducedMotion) * config.speed;
    const attribute = geometry.attributes.position as BufferAttribute;
    const array = attribute.array as Float32Array;

    for (let i = 0; i < array.length; i += 3) {
      const x = rest[i]!;
      const y = rest[i + 1]!;
      const up = (y + config.height / 2) / config.height;
      const wave =
        Math.sin(x * config.fold + t + index) * 0.9 +
        Math.sin(x * config.fold * 0.37 - t * 1.6) * 0.45;

      array[i + 2] = wave * up * up * 1.5 + drift.value * up * 2.2;
      array[i] = x + Math.sin(y * 0.4 + t) * 0.18 * up;
    }

    attribute.needsUpdate = true;
  });

  return (
    <mesh ref={mesh} geometry={geometry} position={[config.x, 1.4, config.z]}>
      <meshBasicMaterial
        color={palette[config.hue]}
        transparent
        opacity={0.3 - index * 0.06}
        side={DoubleSide}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Field({ quality, reducedMotion, palette }: SceneProps) {
  const stars = useRef<Points>(null);
  const sky = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.04);
  const scroll = useScrollProgress(true);
  const drift = useMemo(() => ({ value: 0 }), []);

  const points = useMemo(() => {
    const total = count(quality, 520);
    const positions = new Float32Array(total * 3);
    const sizes = new Float32Array(total);

    for (let i = 0; i < total; i += 1) {
      positions[i * 3] = (rand(i * 2.3) - 0.5) * 34;
      positions[i * 3 + 1] = (rand(i * 5.1) - 0.35) * 18;
      positions[i * 3 + 2] = -4 - rand(i * 7.7) * 22;
      sizes[i] = 0.02 + rand(i * 11.3) * 0.05;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));
    return geometry;
  }, [quality]);

  useFrame(() => {
    drift.value += (pointer.current.x * 0.8 - drift.value) * 0.03;

    if (sky.current) {
      sky.current.rotation.z = pointer.current.x * 0.06;
      sky.current.position.y = -scroll.value * 2.4;
    }

    if (stars.current) {
      stars.current.rotation.y = pointer.current.x * 0.03;
    }
  });

  return (
    <group ref={sky}>
      <points ref={stars} geometry={points}>
        <pointsMaterial
          size={0.05}
          sizeAttenuation
          color={palette.text}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </points>

      {RIBBONS.map((config, index) => (
        <Ribbon
          key={config.hue}
          config={config}
          index={index}
          quality={quality}
          reducedMotion={reducedMotion}
          palette={palette}
          drift={drift}
        />
      ))}
    </group>
  );
}

export default function AuroraScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 0.6, 9], fov: 52 }}>
      <Field {...props} />
    </HeroCanvas>
  );
}
