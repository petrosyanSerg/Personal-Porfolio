'use client';

import { useEffect, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type CountUpProps = {
  value: number;
  formatted: string;
  locale: string;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
};

export function CountUp({
  value,
  formatted,
  locale,
  prefix = '',
  suffix = '',
  durationMs = 1100,
}: CountUpProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [node, setNode] = useState<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (!node || reducedMotion) return;

    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(value * eased);

          setDisplay(
            `${prefix}${new Intl.NumberFormat(locale).format(current)}${suffix}`,
          );

          frame = progress < 1 ? requestAnimationFrame(tick) : 0;
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [node, reducedMotion, value, durationMs, locale, prefix, suffix]);

  return (
    <span ref={setNode}>
      <span aria-hidden={display !== null || undefined}>{display ?? formatted}</span>
      {display !== null ? <span className="visually-hidden">{formatted}</span> : null}
    </span>
  );
}
