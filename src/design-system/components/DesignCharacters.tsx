'use client';

import { useDesignCapability } from '../core/useDesignSystem';

import styles from './DesignCharacters.module.scss';

export function DesignCharacters() {
  const wanted = useDesignCapability('characters');

  if (!wanted) return null;

  return (
    <div className={styles.layer} aria-hidden="true">
      <span className={styles.figure} data-figure="a">
        <span className={styles.eye}>
          <span className={styles.pupil} />
        </span>
        <span className={styles.eye}>
          <span className={styles.pupil} />
        </span>
      </span>

      <span className={styles.figure} data-figure="b">
        <span className={styles.eye}>
          <span className={styles.pupil} />
        </span>
        <span className={styles.eye}>
          <span className={styles.pupil} />
        </span>
      </span>
    </div>
  );
}
