'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useFinePointer } from '@/hooks/useFinePointer';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

import styles from './Magnetic.module.scss';

type MagneticProps = {
  children: React.ReactNode;
  strength?: number;
  className?: string;
};

export function Magnetic({ children, strength = 6, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const finePointer = useFinePointer();
  const reducedMotion = usePrefersReducedMotion();
  const active = finePointer && !reducedMotion;

  const reset = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--magnet-x', '0px');
    node.style.setProperty('--magnet-y', '0px');
  }, []);

  useEffect(() => {
    if (!active) reset();
  }, [active, reset]);

  const onPointerMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!active || event.pointerType !== 'mouse') return;

    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    node.style.setProperty('--magnet-x', `${(dx * strength).toFixed(2)}px`);
    node.style.setProperty('--magnet-y', `${(dy * strength * 0.6).toFixed(2)}px`);
  };

  return (
    <span
      ref={ref}
      className={cn(styles.magnet, className)}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {children}
    </span>
  );
}
