'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

import styles from './Reveal.module.scss';

type RevealProps = {
  children: React.ReactNode;
  index?: number;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'section';
};

export function Reveal({ children, index = 0, className, as = 'div' }: RevealProps) {
  const Tag = as as 'div';

  const [node, setNode] = useState<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return (
    <Tag
      ref={setNode}
      className={cn(styles.reveal, className)}
      data-revealed={revealed || undefined}
      style={{ '--reveal-delay': `${index * 60}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
