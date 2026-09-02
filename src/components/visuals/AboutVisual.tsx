'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { portraitFor, portraitSizes, useDesignSystem } from '@/design-system';

import styles from './AboutVisual.module.scss';

/*
 * The About column visual.
 *
 * This used to be the design system's tile blown up to 400x500 and rendered at
 * roughly 460 CSS px. The tiles are cut from a 1024px collage, so each one only
 * holds about 146x123 of real detail — a ~3x upscale on a 1x screen and ~6x on a
 * retina one, which is why it read as soft. The bitmap is now mounted at the
 * size it was actually cut for (the 140x112 plate) as a specimen chip, and the
 * weight of the column is carried by drawn artwork that is resolution-free.
 *
 * Five of the fifty systems have no usable tile (see portraitGaps). Those used
 * to fall through to a dashed placeholder box; now the plate simply renders
 * without a chip.
 */

type AboutVisualProps = {
  className?: string | undefined;
};

const W = 480;
const H = 600;

export function AboutVisual({ className }: AboutVisualProps) {
  const t = useTranslations('design');
  const design = useDesignSystem();
  const portrait = portraitFor(design.id);

  return (
    <div className={cn(styles.plate, className)}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="about-wash" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.16" />
            <stop offset="60%" stopColor="var(--color-accent)" stopOpacity="0.02" />
            <stop offset="100%" stopColor="var(--color-teal)" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#about-wash)" />

        <g className={styles.grid}>
          {Array.from({ length: 12 }, (_, i) => (
            <path key={`v${i}`} d={`M${i * 40 + 20} 0V${H}`} />
          ))}
          {Array.from({ length: 15 }, (_, i) => (
            <path key={`h${i}`} d={`M0 ${i * 40 + 20}H${W}`} />
          ))}
        </g>

        {/* a system read top to bottom: surface, composition, domain, platform */}
        <g transform="translate(0 74)">
          {[0, 1, 2, 3, 4].map((i) => {
            const inset = 56 + i * 18;
            const y = i * 62;
            return (
              <rect
                key={i}
                x={inset}
                y={y}
                width={W - inset * 2}
                height="42"
                rx="7"
                className={i === 0 ? styles.blockAccent : styles.block}
              />
            );
          })}

          <path className={styles.accent} d="M240 42v206" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} className={styles.accent} d={`M235 ${i * 62 + 52}l5 6 5-6`} />
          ))}
        </g>

        {/* the boundary the system is held inside */}
        <path className={styles.frame} d="M28 44h424v512H28Z" />
        <g className={styles.corner}>
          <path d="M28 76V44h32M452 76V44h-32M28 524v32h32M452 524v32h-32" />
        </g>

        <g transform="translate(56 452)">
          <path className={styles.line} d="M0 0h368" />
          {Array.from({ length: 24 }, (_, i) => (
            <path
              key={i}
              className={styles.tick}
              d={`M${i * 16} 0v${i % 4 === 0 ? 9 : 5}`}
            />
          ))}
          <circle cx="112" cy="0" r="4.5" className={styles.dotSignal} />
          <circle cx="256" cy="0" r="4.5" className={styles.dotSignal} />
        </g>
      </svg>

      {portrait ? (
        /* A static public asset at a known intrinsic size; next/image adds a
           request and a wrapper for no benefit at 140px. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.specimen}
          src={portrait.plate}
          alt={t('portraitAlt', { name: design.name })}
          width={portraitSizes.plate.width}
          height={portraitSizes.plate.height}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ) : null}
    </div>
  );
}
