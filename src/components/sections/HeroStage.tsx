'use client';

import { useEffect, useState } from 'react';

import { useDesignCapability } from '@/design-system';
import { ExplorationWorld } from '@/components/world/ExplorationWorld';
import { useExploration } from '@/components/world/core/useExploration';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

import styles from './HeroStage.module.scss';

export type HeroModule = {
  id: string;
  label: string;
  technologies: string[];
};

type StageProps = {
  modules: HeroModule[];
  countLabel: string;
  completeLabel: string;
};

const DWELL = 2600;

export function HeroStage({ modules, countLabel, completeLabel }: StageProps) {
  const hasReadout = useDesignCapability('system-readout');
  const { phase } = useExploration();
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [cycled, setCycled] = useState(false);

  useEffect(() => {
    if (!hasReadout || modules.length === 0) return;

    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      setIndex((previous) => {
        const next = (previous + 1) % modules.length;
        if (next === 0) setCycled(true);
        return next;
      });
    }, DWELL);

    return () => window.clearInterval(timer);
  }, [hasReadout, modules.length, reducedMotion]);

  const shown = modules[index];

  return (
    <>
      <ExplorationWorld />

      {!hasReadout || !shown || phase === 'focused' ? null : (
        <div className={styles.readout} data-hero-readout aria-hidden="true">
          <p className={styles.counter} data-complete={cycled || undefined}>
            <span className={styles.count}>
              {String(index + 1).padStart(2, '0')}
              <span className={styles.slash}>/</span>
              {String(modules.length).padStart(2, '0')}
            </span>
            <span className={styles.countLabel}>
              {cycled ? completeLabel : countLabel}
            </span>
          </p>

          <div className={styles.panel} data-open>
            <p className={styles.panelTitle}>{shown.label}</p>
            <ul className={styles.panelList}>
              {shown.technologies.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
