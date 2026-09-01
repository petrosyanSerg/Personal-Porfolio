'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Shape, type Group } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { rand, sceneTime, usePointer, useScrollProgress } from '../core/motion';
import { count, detail } from '../core/quality';

function archShape(width: number, height: number, thickness: number): Shape {
  const outer = new Shape();
  const w = width / 2;
  const offset = w * 0.55;
  const radius = w + offset;

  outer.moveTo(-w - thickness, 0);
  outer.lineTo(-w - thickness, height);
  outer.absarc(offset, height, radius + thickness, Math.PI, Math.PI - 0.95, true);
  outer.absarc(-offset, height, radius + thickness, 0.95, 0, true);
  outer.lineTo(w + thickness, 0);
  outer.lineTo(w, 0);
  outer.lineTo(w, height);
  outer.absarc(-offset, height, radius, 0, 0.95, false);
  outer.absarc(offset, height, radius, Math.PI - 0.95, Math.PI, false);
  outer.lineTo(-w, 0);
  outer.closePath();

  return outer;
}

function Nave({ quality, reducedMotion, palette }: SceneProps) {
  const nave = useRef<Group>(null);
  const pointer = usePointer(reducedMotion, 0.03);
  const scroll = useScrollProgress(true);

  const arch = useMemo(() => archShape(2.2, 3.4, 0.3), []);
  const extrude = useMemo(
    () => ({ depth: 0.5, bevelEnabled: false, curveSegments: detail(quality, 16, 5) }),
    [quality],
  );

  const bays = count(quality, 8);

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);
    const camera = state.camera;

    const advance = scroll.value * 14;
    camera.position.z += (12 - advance - camera.position.z) * 0.035;
    camera.position.y +=
      (-1 + advance * 0.06 + pointer.current.y * 0.8 - camera.position.y) * 0.04;
    camera.position.x += (pointer.current.x * 1.1 - camera.position.x) * 0.04;
    camera.lookAt(pointer.current.x * 0.6, 1.4 + pointer.current.y * 1.6, -20);

    if (nave.current) {
      nave.current.children.forEach((child, i) => {
        if (child.name !== 'glass') return;
        const material = (child as unknown as { material: { opacity: number } }).material;
        material.opacity = 0.28 + Math.sin(t * 0.3 + i * 1.7) * 0.12;
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} color={palette.accent} />
      <pointLight
        position={[0, 4, -26]}
        intensity={420}
        distance={60}
        decay={2}
        color={palette.text}
      />
      <pointLight
        position={[0, 1, 6]}
        intensity={26}
        distance={16}
        decay={2}
        color={palette.teal}
      />

      <group ref={nave}>
        {Array.from({ length: bays }, (_, i) => {
          const z = -i * 5;

          return (
            <group key={i} position={[0, 0, z]}>
              {[-3.6, 3.6].map((x) => (
                <group key={x} position={[x, -3, 0]}>
                  <mesh position={[0, 0, 0]}>
                    <extrudeGeometry args={[arch, extrude]} />
                    <meshStandardMaterial
                      color={palette.surface}
                      roughness={0.94}
                      flatShading
                    />
                  </mesh>

                  {[-0.34, 0, 0.34].map((offset, s) => (
                    <mesh
                      key={s}
                      position={[offset * 2.6 - (offset === 0 ? 0 : 0), -1.4, 0.34]}
                    >
                      <cylinderGeometry
                        args={[
                          0.12 - Math.abs(offset) * 0.1,
                          0.12,
                          3,
                          detail(quality, 10, 5),
                        ]}
                      />
                      <meshStandardMaterial color={palette.surfaceHigh} roughness={0.9} />
                    </mesh>
                  ))}

                  <mesh name="glass" position={[0, 2.6, 0.28]}>
                    <planeGeometry args={[3.4, 4.6]} />
                    <meshBasicMaterial
                      color={
                        i % 3 === 0
                          ? palette.accent
                          : i % 3 === 1
                            ? palette.teal
                            : palette.accentText
                      }
                      transparent
                      opacity={0.3}
                      blending={AdditiveBlending}
                      depthWrite={false}
                    />
                  </mesh>
                </group>
              ))}

              {[-1, 1].map((side) => (
                <mesh
                  key={side}
                  position={[0, 4.4, -2.5]}
                  rotation={[Math.PI / 2, 0, (side * Math.PI) / 4]}
                >
                  <torusGeometry
                    args={[
                      4.4,
                      0.1,
                      detail(quality, 8, 4),
                      detail(quality, 24, 10),
                      Math.PI,
                    ]}
                  />
                  <meshStandardMaterial color={palette.surfaceHigh} roughness={0.9} />
                </mesh>
              ))}
            </group>
          );
        })}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.05, -18]}>
          <planeGeometry args={[16, 70]} />
          <meshStandardMaterial color={palette.surface} roughness={0.86} />
        </mesh>

        {Array.from({ length: count(quality, 40) }, (_, i) => (
          <mesh
            key={`mote-${i}`}
            position={[
              (rand(i * 2.3) - 0.5) * 9,
              rand(i * 4.1) * 7 - 2,
              -rand(i * 6.7) * 34,
            ]}
          >
            <sphereGeometry args={[0.02, 4, 4]} />
            <meshBasicMaterial color={palette.text} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function GothicScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, -1, 12], fov: 58 }} fog={[14, 44]}>
      <Nave {...props} />
    </HeroCanvas>
  );
}
