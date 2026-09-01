import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { languages } from '@/data/education';
import { personal } from '@/data/personal';
import { socialLinks } from '@/data/socials';

import { ContactFormMount } from './ContactFormMount';
import styles from './Contact.module.scss';

export async function Contact() {
  const t = await getTranslations('contact');
  const tLang = await getTranslations('languages');
  const tSocial = await getTranslations('socials');
  const common = await getTranslations('common');

  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <Container>
        <SectionHeader
          id="contact-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <div className={styles.grid}>
          <ContactFormMount email={personal.email} />

          <aside className={styles.aside}>
            <h3 className={styles.asideTitle}>{t('directLabel')}</h3>
            <ul className={styles.links}>
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    className={styles.link}
                    href={link.url}
                    target={link.id === 'email' ? undefined : '_blank'}
                    rel={link.id === 'email' ? undefined : 'noopener noreferrer'}
                  >
                    <span className={styles.linkLabel}>
                      {tSocial(link.labelKey.replace('socials.', '') as 'linkedin')}
                    </span>
                    <span className={styles.linkHandle}>{link.handle}</span>
                    {link.id !== 'email' ? (
                      <span className="visually-hidden"> ({common('externalLink')})</span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className={styles.asideTitle}>{tLang('title')}</h3>
            <ul className={styles.languages}>
              {languages.map((language) => (
                <li key={language.code} className={styles.language}>
                  <span className={styles.languageName}>
                    {tLang(language.nameKey.replace('languages.', '') as 'hy')}
                  </span>
                  <span className={styles.languageLevel}>
                    {tLang(`levels.${language.level}` as 'levels.native')}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </section>
  );
}
