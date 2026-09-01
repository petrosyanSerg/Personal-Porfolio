import type { Capability } from '@/hooks/useDeviceCapability';
import type { SceneProfile } from '@/design-system';

export type SceneQuality = 'high' | 'medium' | 'low';

export function resolveQuality(
  capability: Exclude<Capability, 'none'>,
  profile: SceneProfile,
  reducedMotion: boolean,
): SceneQuality {
  if (reducedMotion) return capability === 'high' ? 'medium' : 'low';

  if (capability === 'low') return 'low';
  if (capability === 'medium') return profile.cost === 'high' ? 'low' : 'medium';
  return profile.cost === 'high' ? 'medium' : 'high';
}

export function count(quality: SceneQuality, high: number): number {
  if (quality === 'high') return high;
  if (quality === 'medium') return Math.round(high * 0.54);
  return Math.round(high * 0.2);
}

export function detail(quality: SceneQuality, high: number, low = 3): number {
  if (quality === 'high') return high;
  if (quality === 'medium') return Math.max(low, Math.round(high * 0.6));
  return Math.max(low, Math.round(high * 0.34));
}
