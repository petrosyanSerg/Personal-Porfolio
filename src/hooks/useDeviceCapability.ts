'use client';

import { useSyncExternalStore } from 'react';

export type Capability = 'high' | 'medium' | 'low' | 'none';

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function detect(): Capability {
  const nav = navigator as NavigatorWithHints;

  if (nav.connection?.saveData) return 'none';

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return 'none';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return 'none';
  }

  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const small = window.matchMedia('(max-width: 768px)').matches;

  if (small || coarsePointer) {
    return cores >= 6 && memory >= 4 ? 'low' : 'none';
  }

  if (cores >= 8 && memory >= 8) return 'high';
  if (cores >= 4 && memory >= 4) return 'medium';
  return 'low';
}

let cached: Capability | null = null;

function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): Capability {
  cached ??= detect();
  return cached;
}

function getServerSnapshot(): Capability {
  return 'none';
}

export function useDeviceCapability(): Capability {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
