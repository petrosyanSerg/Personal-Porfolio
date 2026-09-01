'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Shape, type Group, type Mesh } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { sceneTime, usePointer } from '../core/motion';
import { detail } from '../core/quality';

function gearShape(teeth: number, radius: number): Shape {
  const shape = new Shape();
  const toothAngle = (Math.PI * 2) / teeth;
  const depth = radius * 0.16;

  for (let i = 0; i < teeth; i += 1) {
    const a = i * toothAngle;
    const points: [number, number][] = [
      [a, radius - depth],
      [a + toothAngle * 0.18, radius + depth],
      [a + toothAngle * 0.42, radius + depth],
      [a + toothAngle * 0.6, radius - depth],
    ];

    points.forEach(([angle, r], p) => {
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0 && p === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }

  shape.closePath();

  const bore = new Shape();
  bore.absarc(0, 0, radius * 0.18, 0, Math.PI * 2, false);
  shape.holes.push(bore);

  for (let i = 0; i < 3; i += 1) {
    const a = (i / 3) * Math.PI * 2;
    const hole = new Shape();
    hole.absarc(
      Math.cos(a) * radius * 0.55,
      Math.sin(a) * radius * 0.55,
      radius * 0.16,
      0,
      Math.PI * 2,
      false,
    );
    shape.holes.push(hole);
  }

  return shape;
}

const TRAIN = [
  { teeth: 22, radius: 1.5, angle: 0 },
  { teeth: 13, radius: 0.9, angle: -0.5 },
  { teeth: 17, radius: 1.15, angle: 0.35 },
  { teeth: 9, radius: 0.62, angle: -0.9 },
] as const;

function Engine({ quality, reducedMotion, palette }: SceneProps) {
  const gears = useRef<(Mesh | null)[]>([]);
  const machine = useRef<Group>(null);
  const beam = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.04);

  const shapes = useMemo(
    () => TRAIN.map((gear) => gearShape(gear.teeth, gear.radius)),
    [],
  );

  const extrude = useMemo(
    () => ({
      depth: 0.22,
      bevelEnabled: quality !== 'low',
      bevelThickness: 0.02,
      bevelSize: 0.016,
      bevelSegments: 1,
      curveSegments: detail(quality, 8, 3),
    }),
    [quality],
  );

  const placement = useMemo(() => {
    const out: { x: number; y: number }[] = [{ x: -1.6, y: -0.2 }];

    for (let i = 1; i < TRAIN.length; i += 1) {
      const previous = out[i - 1]!;
      const gap = TRAIN[i - 1]!.radius + TRAIN[i]!.radius;
      const angle = TRAIN[i]!.angle;
      out.push({
        x: previous.x + Math.cos(angle) * gap,
        y: previous.y + Math.sin(angle) * gap,
      });
    }

    return out;
  }, []);

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    const driver = t * 0.5;
    let angle = driver;

    gears.current.forEach((gear, i) => {
      if (!gear) return;

      if (i > 0) {
        const ratio = TRAIN[i - 1]!.teeth / TRAIN[i]!.teeth;
        angle = -angle * ratio;
      }

      gear.rotation.z = angle;
    });

    if (beam.current) {
      beam.current.rotation.z = Math.sin(driver) * 0.22;
      beam.current.position.y = 2.2 + Math.cos(driver) * 0.14;
    }

    if (machine.current) {
      machine.current.rotation.y +=
        (pointer.current.x * 0.24 - machine.current.rotation.y) * 0.04;
      machine.current.rotation.x +=
        (pointer.current.y * -0.16 - machine.current.rotation.x) * 0.04;
    }
  });

  return (
    <>
      <ambientLight intensity={0.34} color={palette.accent} />
      <pointLight
        position={[-3, -3, 3]}
        intensity={40}
        distance={18}
        decay={2}
        color={palette.teal}
      />
      <pointLight
        position={[3, 5, 6]}
        intensity={90}
        distance={26}
        decay={2}
        color={palette.text}
      />

      <group ref={machine}>
        {shapes.map((shape, i) => (
          <mesh
            key={i}
            ref={(mesh) => {
              gears.current[i] = mesh;
            }}
            position={[placement[i]!.x, placement[i]!.y, i * 0.26 - 0.3]}
          >
            <extrudeGeometry args={[shape, extrude]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? palette.accent : palette.accentText}
              metalness={0.92}
              roughness={0.32}
            />
          </mesh>
        ))}

        {[-1.2, 0.9].map((y, i) => (
          <group key={y} position={[0, y, -1.4]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.11, 0.11, 9, detail(quality, 12, 6)]} />
              <meshStandardMaterial
                color={palette.accent}
                metalness={0.85}
                roughness={0.42}
              />
            </mesh>
            {[-2.6, 0.4, 3.2].map((x) => (
              <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.16, 0.16, 0.24, detail(quality, 12, 6)]} />
                <meshStandardMaterial
                  color={palette.text}
                  metalness={0.7}
                  roughness={0.5}
                />
              </mesh>
            ))}
            {void i}
          </group>
        ))}

        <group position={[3.4, -1.5, 0.4]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.62, 0.62, 0.16, detail(quality, 26, 10)]} />
            <meshStandardMaterial
              color={palette.accent}
              metalness={0.9}
              roughness={0.28}
            />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <circleGeometry args={[0.5, detail(quality, 26, 10)]} />
            <meshStandardMaterial color={palette.text} roughness={0.7} />
          </mesh>
        </group>

        <group ref={beam} position={[0, 2.2, 0.6]}>
          <mesh>
            <boxGeometry args={[3.6, 0.16, 0.2]} />
            <meshStandardMaterial
              color={palette.accentText}
              metalness={0.8}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[-1.8, 0, 0]}>
            <sphereGeometry
              args={[0.14, detail(quality, 14, 6), detail(quality, 10, 5)]}
            />
            <meshStandardMaterial color={palette.text} metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      </group>
    </>
  );
}

export default function SteampunkScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0.6, 0.2, 8.4], fov: 46 }} fog={[11, 26]}>
      <Engine {...props} />
    </HeroCanvas>
  );
}
