import styles from './DesignAtmosphere.module.scss';

export function DesignAtmosphere() {
  return (
    <div className={styles.decor} data-design-decor data-bleed aria-hidden="true">
      <div className={styles.decorMarble} />
      <div className={styles.decorConcrete} />
      <div className={styles.decorPaper} />
      <div className={styles.decorTile} />
      <div className={styles.decorGrid} />
      <div className={styles.decorStripe} />
      <div className={styles.decorBotanical} />
      <div className={styles.decorStars} />

      <div className={styles.decorAurora}>
        <span className={styles.decorRibbon} />
        <span className={styles.decorRibbon} />
        <span className={styles.decorRibbon} />
      </div>

      <div className={styles.decorSunbeam} />
      <div className={styles.decorGloss} />
      <div className={styles.decorScanline} />
      <div className={styles.decorSweep} />
      <div className={styles.decorHalftone} />
      <div className={styles.decorGrain} />
      <div className={styles.decorVignette} />
    </div>
  );
}
