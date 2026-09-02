'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import { getSnapshot, settleCamera, subscribe } from '../core/exploration-store';
import { getWorldNode } from '../core/graph';
import { placeInWorld, type WorldLayout } from '../core/layout';
import type { WorldNode } from '../core/types';

import { clamp, dampVector } from './damp';

type Pose = { readonly position: Vector3; readonly target: Vector3 };

const HOME_DISTANCE = 13.8;
const FOCUS_DISTANCE = 7.8;
const PARALLAX = 0.5;
const ARRIVAL = 0.05;

const HOME: Pose = {
  position: new Vector3(0, 0.3, HOME_DISTANCE),
  target: new Vector3(0, 0, 0),
};

/**
 * A focus pose puts the node just off centre, on the side the panel does not
 * occupy: left of the panel on a desktop, above the sheet on a phone.
 */
function focusPose(node: WorldNode, layout: WorldLayout): Pose {
  const [x, y, z] = placeInWorld(node.position, layout);
  const distance = FOCUS_DISTANCE * layout.scale;

  return {
    position: new Vector3(
      x + (layout.wide ? distance * 0.32 : 0),
      y + (layout.wide ? distance * 0.14 : distance * 0.42),
      z + distance,
    ),
    target: new Vector3(x, y + (layout.wide ? 0 : distance * 0.16), z),
  };
}

/**
 * The single owner of the camera. It interpolates between exactly two kinds of
 * pose — home, and one focused node — so the visitor can never fly out of the
 * world, invert the horizon or reach a pose the composition was not designed
 * for. It also owns the render call, which means a background scene that moves
 * the camera for its own composition cannot fight it.
 */
type RigProps = {
  readonly layout: WorldLayout;
  readonly reducedMotion: boolean;
};

export function CameraRig({ layout, reducedMotion }: RigProps) {
  const invalidate = useThree((state) => state.invalidate);

  const rig = useMemo(
    () => ({
      position: HOME.position.clone(),
      target: HOME.target.clone(),
      desiredPosition: new Vector3(),
      desiredTarget: new Vector3(),
      reach: new Vector3(),
    }),
    [],
  );

  const arrived = useRef(false);

  // In reduced-motion mode the canvas renders on demand, so a state change has
  // to ask for the frames that carry the camera to its new pose.
  useEffect(() => subscribe(() => invalidate()), [invalidate]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const { phase, active } = getSnapshot();

    const pose = active ? focusPose(getWorldNode(active), layout) : HOME;
    rig.desiredPosition.copy(pose.position);
    rig.desiredTarget.copy(pose.target);

    if (!reducedMotion) {
      const t = state.clock.elapsedTime;
      const idle = phase === 'idle' || phase === 'exploring' ? 1 : 0.25;

      // Pointer parallax and idle drift are additive and hard-clamped: the
      // camera breathes, it never wanders.
      rig.desiredPosition.x += clamp(state.pointer.x * PARALLAX, -PARALLAX, PARALLAX);
      rig.desiredPosition.y += clamp(
        state.pointer.y * PARALLAX * 0.6,
        -PARALLAX,
        PARALLAX,
      );
      rig.desiredPosition.x += Math.sin(t * 0.17) * 0.2 * idle;
      rig.desiredPosition.y += Math.cos(t * 0.13) * 0.12 * idle;
    }

    const lambda = reducedMotion ? 26 : phase === 'focused' ? 3.4 : 2.6;
    dampVector(rig.position, rig.desiredPosition, lambda, dt);
    dampVector(rig.target, rig.desiredTarget, lambda, dt);

    rig.position.z = Math.max(rig.position.z, 1.5);

    state.camera.position.copy(rig.position);
    state.camera.lookAt(rig.target);
    state.camera.updateMatrixWorld();

    const settled =
      rig.reach.copy(rig.desiredPosition).sub(rig.position).length() < ARRIVAL;

    if (settled && !arrived.current && phase === 'returning') settleCamera();
    arrived.current = settled;

    // Taking the render call means this rig, not a background scene, has the
    // last word on the camera for the frame.
    state.gl.render(state.scene, state.camera);

    if (!settled) invalidate();
  }, 1);

  return null;
}
