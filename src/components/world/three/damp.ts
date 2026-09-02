import type { Vector3 } from 'three';

/**
 * Frame-rate independent exponential smoothing. Every camera move, scale change
 * and colour shift in the world goes through this, which is why nothing in the
 * experience snaps or overshoots on a fast machine.
 */
export function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number,
): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function dampVector(
  current: Vector3,
  target: Vector3,
  lambda: number,
  dt: number,
): void {
  const k = 1 - Math.exp(-lambda * dt);
  current.x += (target.x - current.x) * k;
  current.y += (target.y - current.y) * k;
  current.z += (target.z - current.z) * k;
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}
