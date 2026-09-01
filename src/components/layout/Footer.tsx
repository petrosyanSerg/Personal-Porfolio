import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/ui/Container';
import { site } from '@/config/site';
import { fullName } from '@/data/personal';
import { navigation, socialLinks } from '@/data/socials';
import { Link } from '@/i18n/navigation';

import styles from './Footer.module.scss';

export async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tSocial = await getTranslations('socials');
  const common = await getTranslations('common');
  const a11y = await getTranslations('a11y');

  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.identity}>
            <p className={styles.name}>{fullName}</p>
            <p className={styles.role}>{t('role')}</p>
            <a className={styles.resume} href={site.resumePdf} download>
              {common('downloadResume')}
            </a>
          </div>

          <nav className={styles.nav} aria-label={a11y('footerNav')}>
            <ul className={styles.navList}>
              {navigation.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className={styles.navLink}>
                    {tNav(item.labelKey.replace('nav.', '') as 'about')}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className={styles.socials}>
            {socialLinks.map((link) => (
              <li key={link.id}>
                <a
                  className={styles.social}
                  href={link.url}
                  target={link.id === 'email' ? undefined : '_blank'}
                  rel={link.id === 'email' ? undefined : 'noopener noreferrer'}
                >
                  {tSocial(link.labelKey.replace('socials.', '') as 'linkedin')}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.bottom}>
          <p>{t('copyright', { year })}</p>
          <p className={styles.built}>{t('builtWith')}</p>
        </div>
      </Container>
    </footer>
  );
}
