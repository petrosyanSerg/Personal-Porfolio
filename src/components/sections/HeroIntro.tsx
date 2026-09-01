'use client';

import { useEffect, useSyncExternalStore } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

import styles from './HeroIntro.module.scss';

const SEEN_KEY = 'sp-hero-intro';

let decision: boolean | null = null;

function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): boolean {
  if (decision === null) {
    try {
      decision = sessionStorage.getItem(SEEN_KEY) !== '1';
    } catch {
      decision = true;
    }
  }
  return decision;
}

function getServerSnapshot(): boolean {
  return false;
}

type IntroProps = {
  init: string;
  online: string;
};

export function HeroIntro({ init, online }: IntroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const first = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const play = first && !reducedMotion;

  useEffect(() => {
    if (!play) return;
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Nothing to do: the sequence simply plays again next load.
    }
  }, [play]);

  if (!play) return null;

  return (
    <div className={styles.intro} aria-hidden="true">
      <div className={styles.scrim} />
      <p className={styles.boot}>
        <span className={styles.line} data-line="1">
          {init}
        </span>
        <span className={styles.line} data-line="2">
          {online}
        </span>
      </p>
    </div>
  );
}
