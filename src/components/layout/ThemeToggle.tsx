'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';

import {
  getServerSnapshot,
  getSnapshot,
  nextTheme,
  setTheme,
  subscribe,
  type Theme,
} from '@/lib/theme-store';

import styles from './ThemeToggle.module.scss';

const marks: Record<Theme, React.ReactNode> = {
  dark: <path d="M13.2 9.6A5.4 5.4 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z" />,
  light: (
    <>
      <circle cx="8" cy="8" r="3.1" />
      <path d="M8 .9v1.8M8 13.3v1.8M2.9 2.9l1.3 1.3M11.8 11.8l1.3 1.3M.9 8h1.8M13.3 8h1.8M2.9 13.1l1.3-1.3M11.8 4.2l1.3-1.3" />
    </>
  ),
  cinematic: (
    <>
      <circle cx="8" cy="8" r="6.2" />
      <path d="M8 1.8 4.6 7.7M14.2 8H7.4M11.4 13.4 8 7.5" />
    </>
  ),
};

const labelKeys = {
  dark: 'themeToggleToDark',
  light: 'themeToggleToLight',
  cinematic: 'themeToggleToCinematic',
} as const;

export function ThemeToggle() {
  const t = useTranslations('a11y');
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const upcoming = nextTheme(theme);
  const label = t(labelKeys[upcoming]);

  return (
    <button
      type="button"
      className={styles.toggle}
      data-theme-state={theme}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setTheme(upcoming, {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }}
      aria-label={label}
      title={label}
      suppressHydrationWarning
    >
      <svg
        className={styles.mark}
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {marks[upcoming]}
      </svg>
    </button>
  );
}
