'use client';

import { useDesignSystem } from '../core/useDesignSystem';

import styles from './DesignCursor.module.scss';

export function DesignCursor() {
  const design = useDesignSystem();

  return (
    <div className={styles.cursor} data-cursor-kind={design.cursor} aria-hidden="true">
      <span className={styles.ring} />
      <span className={styles.dot} />
      <span className={styles.flourish} />
    </div>
  );
}
