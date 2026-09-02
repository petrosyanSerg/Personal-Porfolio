'use client';

import { resolveQuality, type SceneQuality } from '@/components/hero3d/core/quality';
import { useDesignSystem } from '@/design-system';
import { useDeviceCapability, type Capability } from '@/hooks/useDeviceCapability';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export type WorldRuntime = {
  /** Whether the WebGL layer may run at all on this device and theme. */
  readonly live: boolean;
  readonly quality: SceneQuality;
  readonly reducedMotion: boolean;
  readonly capability: Capability;
};

/**
 * One decision, read in two places: the canvas that has to honour it and the
 * overlay that has to work with or without it. The exploration UI is never
 * gated on WebGL — only the scene behind it is.
 */
export function useWorldRuntime(): WorldRuntime {
  const design = useDesignSystem();
  const capability = useDeviceCapability();
  const reducedMotion = usePrefersReducedMotion();

  const small = capability === 'low';
  const live = capability !== 'none' && !(small && design.scene.mobile === 'disabled');

  const quality =
    capability === 'none'
      ? 'low'
      : resolveQuality(capability, design.scene, reducedMotion);

  return { live, quality, reducedMotion, capability };
}
