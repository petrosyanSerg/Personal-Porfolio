import { fullName } from '@/data/personal';

import { portraitFor, portraitSizes } from '../core/portraits';
import type { DesignSystem } from '../core/types';

import styles from './DesignPreview.module.scss';

type PreviewProps = {
  design: DesignSystem;
  applyLabel: string;
  portraitAlt: string;
};

export function DesignPreview({ design, applyLabel, portraitAlt }: PreviewProps) {
  const portrait = portraitFor(design.id);

  return (
    <div className={styles.preview} data-design={design.id}>
      <div className={styles.ground} />

      {portrait ? (
        // eslint-disable-next-line @next/next/no-img-element -- see above
        <img
          className={styles.plate}
          src={portrait.plate}
          alt={portraitAlt}
          width={portraitSizes.plate.width}
          height={portraitSizes.plate.height}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ) : null}

      <div className={styles.body}>
        <p className={styles.eyebrow}>
          {String(design.index).padStart(2, '0')} — {design.name}
        </p>

        <p className={styles.specimen} aria-hidden="true">
          {design.specimen}
        </p>

        <p className={styles.name}>{fullName}</p>

        <div className={styles.row}>
          <span className={styles.button}>{applyLabel}</span>
          <span className={styles.tag}>React</span>
        </div>

        <div className={styles.card}>
          <span className={styles.rule} />
        </div>
      </div>
    </div>
  );
}
