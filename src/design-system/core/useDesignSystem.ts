'use client';

import { useSyncExternalStore } from 'react';

import { getDesignSystem } from './registry';
import { getServerSnapshot, getSnapshot, subscribe } from './design-store';
import type { DesignCapability, DesignSystem, DesignSystemId } from './types';

export function useDesignSystemId(): DesignSystemId {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useDesignSystem(): DesignSystem {
  return getDesignSystem(useDesignSystemId());
}

export function useDesignCapability(capability: DesignCapability): boolean {
  const design = useDesignSystem();
  return design.capabilities.includes(capability);
}
