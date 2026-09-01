'use client';

import { DesignCursor } from '@/design-system/components/DesignCursor';
import { usePointerAmbience } from '@/hooks/usePointerAmbience';
import { useFinePointer } from '@/hooks/useFinePointer';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

import styles from './Atmosphere.module.scss';

export function Atmosphere() {
  const finePointer = useFinePointer();
  const reducedMotion = usePrefersReducedMotion();
  const active = finePointer && !reducedMotion;

  usePointerAmbience(active);

  if (!active) return null;

  return (
    <>
      <div className={styles.light} aria-hidden="true" />

      <DesignCursor />
    </>
  );
}
