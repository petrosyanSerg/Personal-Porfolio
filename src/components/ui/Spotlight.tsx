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
      /* `spotlight-host` is a deliberate global hook: nested artwork reads the
         hover state and the --spot-* variables this element publishes. */
      className={cn(styles.spotlight, 'spotlight-host', className)}
      onPointerMove={onPointerMove}
    >
      {children}
    </div>
  );
}
