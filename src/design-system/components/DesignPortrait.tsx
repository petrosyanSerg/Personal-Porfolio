'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

import { portraitFor, portraitSizes } from '../core/portraits';
import { useDesignSystem } from '../core/useDesignSystem';

import styles from './DesignPortrait.module.scss';

type PortraitProps = {
  className?: string | undefined;
  fallbackClassName?: string | undefined;
  fallbackLabel: string;
};

export function DesignPortrait({
  className,
  fallbackClassName,
  fallbackLabel,
}: PortraitProps) {
  const t = useTranslations('design');
  const design = useDesignSystem();
  const portrait = portraitFor(design.id);

  if (!portrait) {
    return (
      <div className={fallbackClassName} role="img" aria-label={fallbackLabel}>
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- see above
    <img
      className={cn(styles.portrait, className)}
      src={portrait.about}
      alt={t('portraitAlt', { name: design.name })}
      width={portraitSizes.about.width}
      height={portraitSizes.about.height}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}
