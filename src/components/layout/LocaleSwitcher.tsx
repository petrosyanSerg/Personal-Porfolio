'use client';

import { useLocale, useTranslations } from 'next-intl';

import { locales, localeMeta, type Locale } from '@/config/i18n';
import { usePathname } from '@/i18n/navigation';

import styles from './LocaleSwitcher.module.scss';

export function LocaleSwitcher() {
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations('a11y');

  return (
    <nav
      className={styles.switcher}
      aria-label={t('localeSwitcher', { current: localeMeta[active].label })}
    >
      <ul className={styles.list}>
        {locales.map((locale) => (
          <li key={locale}>
            <a
              href={`/${locale}${pathname}`}
              className={styles.option}
              lang={localeMeta[locale].htmlLang}
              aria-current={locale === active ? 'true' : undefined}
              data-active={locale === active || undefined}
            >
              {localeMeta[locale].native}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
