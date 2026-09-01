'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, type Group, type LineSegments } from 'three';

import { HeroCanvas, type SceneProps } from '../HeroCanvas';
import { sceneTime, usePointer } from '../core/motion';
import { detail } from '../core/quality';

function boxEdges(w: number, h: number, d: number, ox = 0, oy = 0, oz = 0): number[] {
  const x = w / 2;
  const y = h / 2;
  const z = d / 2;

  const corner = (sx: number, sy: number, sz: number) => [
    ox + sx * x,
    oy + sy * y,
    oz + sz * z,
  ];
  const edge = (a: number[], b: number[]) => [...a, ...b];

  const c = {
    a: corner(-1, -1, -1),
    b: corner(1, -1, -1),
    c: corner(1, 1, -1),
    d: corner(-1, 1, -1),
    e: corner(-1, -1, 1),
    f: corner(1, -1, 1),
    g: corner(1, 1, 1),
    h: corner(-1, 1, 1),
  };

  return [
    ...edge(c.a, c.b),
    ...edge(c.b, c.c),
    ...edge(c.c, c.d),
    ...edge(c.d, c.a),
    ...edge(c.e, c.f),
    ...edge(c.f, c.g),
    ...edge(c.g, c.h),
    ...edge(c.h, c.e),
    ...edge(c.a, c.e),
    ...edge(c.b, c.f),
    ...edge(c.c, c.g),
    ...edge(c.d, c.h),
  ];
}

function Assembly({ quality, reducedMotion, palette }: SceneProps) {
  const drawing = useRef<Group>(null);
  const construction = useRef<LineSegments>(null);
  const annotation = useRef<LineSegments>(null);
  const pointer = usePointer(reducedMotion, 0.05);

  const object = useMemo(() => {
    const points = [
      ...boxEdges(3.2, 0.3, 2.2, 0, -1.5, 0),
      ...boxEdges(2.4, 0.3, 1.7, 0, 0, 0),
      ...boxEdges(1.5, 0.3, 1.1, 0, 1.4, 0),
    ];

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3));
    return geometry;
  }, []);

  const marks = useMemo(() => {
    const points: number[] = [
      0, -3.4, 0, 0, 3.2, 0, -4.4, -1.5, 0, 4.4, -1.5, 0, 0, -1.5, -3.2, 0, -1.5, 3.2,
    ];

    const stack = [
      { w: 3.2, d: 2.2, y: -1.35 },
      { w: 2.4, d: 1.7, y: 0.15 },
    ];

    stack.forEach((plate, i) => {
      const next = i === 0 ? { w: 2.4, d: 1.7, y: -0.15 } : { w: 1.5, d: 1.1, y: 1.25 };

      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ] as const) {
        points.push(
          (sx * plate.w) / 2,
          plate.y,
          (sz * plate.d) / 2,
          (sx * next.w) / 2,
          next.y,
          (sz * next.d) / 2,
        );
      }
    });

    for (const y of [-1.5, 0, 1.4]) {
      points.push(1.75, y, 1.2, 2.9, y, 1.2);
      points.push(2.75, y - 0.09, 1.2, 2.9, y, 1.2);
      points.push(2.75, y + 0.09, 1.2, 2.9, y, 1.2);
    }
    points.push(2.82, -1.5, 1.2, 2.82, 1.4, 1.2);

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3));
    return geometry;
  }, []);

  useFrame((state) => {
    const t = sceneTime(state.clock.elapsedTime, reducedMotion);

    const objectVertices = object.attributes.position!.count;
    const markVertices = marks.attributes.position!.count;

    const objectProgress = Math.min(1, t / 1.8);
    const markProgress = Math.min(1, Math.max(0, (t - 1.4) / 1.6));

    construction.current?.geometry.setDrawRange(
      0,
      Math.ceil((objectVertices * objectProgress) / 2) * 2,
    );
    annotation.current?.geometry.setDrawRange(
      0,
      Math.ceil((markVertices * markProgress) / 2) * 2,
    );

    if (drawing.current) {
      drawing.current.rotation.y = 0.62 + pointer.current.x * 0.34;
      drawing.current.rotation.x = 0.28 - pointer.current.y * 0.22;
    }
  });

  return (
    <group ref={drawing}>
      <lineSegments ref={construction} geometry={object}>
        <lineBasicMaterial color={palette.text} transparent opacity={0.85} />
      </lineSegments>

      <lineSegments ref={annotation} geometry={marks}>
        <lineBasicMaterial color={palette.accent} transparent opacity={0.55} />
      </lineSegments>

      <gridHelper
        args={[16, detail(quality, 32, 12), palette.accent, palette.border]}
        position={[0, -3.4, 0]}
      />
    </group>
  );
}

export default function ConceptualSketchScene(props: SceneProps) {
  return (
    <HeroCanvas {...props} camera={{ position: [0, 1.4, 9.5], fov: 40 }}>
      <Assembly {...props} />
    </HeroCanvas>
  );
}
