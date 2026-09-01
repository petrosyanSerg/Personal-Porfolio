'use client';

import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2 } from 'three';

export function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function srand(seed: number): number {
  return rand(seed) * 2 - 1;
}

export function wobble(t: number, lane: number): number {
  const a = Math.sin(t * 0.7 + lane * 1.3);
  const b = Math.sin(t * 0.31 + lane * 2.7);
  return a * 0.6 + b * 0.4;
}

export type PointerState = {
  readonly current: Vector2;
  readonly target: Vector2;
};

export function usePointer(reducedMotion: boolean, ease = 0.06): PointerState {
  const state = useMemo<PointerState>(
    () => ({ current: new Vector2(0, 0), target: new Vector2(0, 0) }),
    [],
  );

  useFrame(({ pointer }) => {
    if (reducedMotion) {
      state.target.set(0, 0);
      state.current.set(0, 0);
      return;
    }

    state.target.copy(pointer);
    state.current.lerp(state.target, ease);
  }, -2);

  return state;
}

export function useScrollProgress(enabled: boolean): { readonly value: number } {
  const gl = useThree((state) => state.gl);
  const progress = useMemo(() => ({ value: 0 }), []);

  useFrame(() => {
    if (!enabled) return;

    const rect = gl.domElement.getBoundingClientRect();
    if (rect.height === 0) return;

    const travelled = -rect.top / rect.height;
    progress.value = Math.min(1, Math.max(0, travelled));
  }, -2);

  return progress;
}

export const STILL_TIME = 4.2;

export function sceneTime(elapsed: number, reducedMotion: boolean): number {
  return reducedMotion ? STILL_TIME : elapsed;
}
