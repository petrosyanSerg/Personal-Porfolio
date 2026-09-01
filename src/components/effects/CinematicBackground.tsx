import styles from './CinematicBackground.module.scss';

export function CinematicBackground() {
  return (
    <div className={styles.stage} data-bleed aria-hidden="true">
      <div className={styles.strata} />
      <div className={styles.fog} />
      <div className={styles.motes} />
      <div className={styles.grain} />
      <div className={styles.vignette} />
    </div>
  );
}
