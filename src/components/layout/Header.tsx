'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { DesignLab } from '@/design-system/components/DesignLab';
import { Link } from '@/i18n/navigation';
import { useActiveSection } from '@/hooks/useActiveSection';
import { navigation } from '@/data/socials';
import { fullName } from '@/data/personal';

import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeToggle } from './ThemeToggle';
import styles from './Header.module.scss';

const SECTION_IDS = navigation
  .filter((item) => item.href.startsWith('/#'))
  .map((item) => item.href.slice(2));

export function Header() {
  const t = useTranslations('nav');
  const a11y = useTranslations('a11y');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className={styles.header} data-scrolled={scrolled || undefined}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <span className={styles.brandName}>{fullName}</span>
        </Link>

        <nav className={styles.nav} aria-label={a11y('mainNav')}>
          <ul className={styles.navList}>
            {navigation.map((item) => {
              const current = item.href === `/#${active}`;

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={styles.navLink}
                    aria-current={current ? 'location' : undefined}
                    data-current={current || undefined}
                  >
                    {t(item.labelKey.replace('nav.', '') as 'about')}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.actions}>
          <div className={styles.desktopSwitcher}>
            <LocaleSwitcher />
          </div>
          <DesignLab />
          <ThemeToggle />
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="visually-hidden">{a11y('mainNav')}</span>
            <span aria-hidden="true">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={styles.mobileNav}
        data-open={open || undefined}
        hidden={!open}
      >
        <ul className={styles.mobileList}>
          {navigation.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={styles.mobileLink}
                onClick={() => setOpen(false)}
              >
                {t(item.labelKey.replace('nav.', '') as 'about')}
              </Link>
            </li>
          ))}
          <li className={styles.mobileSwitcher}>
            <LocaleSwitcher />
          </li>
        </ul>
      </div>
    </header>
  );
}
