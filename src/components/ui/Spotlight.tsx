'use client';

import { useRef } from 'react';

import { cn } from '@/lib/cn';

import styles from './Spotlight.module.scss';

type SpotlightProps = {
  children: React.ReactNode;
  className?: string;
};

export function Spotlight({ children, className }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;

    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    node.style.setProperty(
      '--spot-x',
      `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`,
    );
    node.style.setProperty(
      '--spot-y',
      `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`,
    );
  };

  return (
    <div
      ref={ref}
      className={cn(styles.spotlight, className)}
      onPointerMove={onPointerMove}
    >
      {children}
    </div>
  );
}
