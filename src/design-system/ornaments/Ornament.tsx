'use client';

import { cn } from '@/lib/cn';

import { useDesignSystemId } from '../core/useDesignSystem';

import { ornamentGeometry, ornamentVocabulary, type OrnamentRole } from './vocabulary';
import styles from './Ornament.module.scss';

type OrnamentProps = {
  role: OrnamentRole;
  corner?: 'tl' | 'tr' | 'bl' | 'br';
  className?: string;
};

export function Ornament({ role, corner = 'tl', className }: OrnamentProps) {
  const id = useDesignSystemId();
  const vocabulary = ornamentVocabulary[id];

  if (vocabulary === 'none') return null;

  const geometry = ornamentGeometry[vocabulary][role];
  const [width, height] = geometry.box;

  return (
    <svg
      className={cn(styles.ornament, styles[role], className)}
      data-corner={role === 'corner' ? corner : undefined}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={role === 'divider' ? 'none' : 'xMidYMid meet'}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {geometry.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
