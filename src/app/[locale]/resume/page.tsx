import type { Metadata } from 'next';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';

import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Tag } from '@/components/ui/Tag';
import type { Locale } from '@/config/i18n';
import { site } from '@/config/site';
import {
  certifications,
  education,
  languages,
  primaryCertifications,
  secondaryCertifications,
} from '@/data/education';
import { experience } from '@/data/experience';
import { getSkill, skillGroups } from '@/data/skills';
import { formatMonthYear } from '@/lib/format';
import { breadcrumbSchema, graph, personSchema, profilePageSchema } from '@/lib/jsonld';
import { buildPageMetadata } from '@/lib/seo';

import styles from './resume.module.scss';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.resume' });

  return buildPageMetadata({
    locale,
    path: '/resume',
    title: t('title'),
    description: t('description'),
    ogType: 'profile',
  });
}

export default async function ResumePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const activeLocale = (await getLocale()) as Locale;

  const t = await getTranslations({ locale, namespace: 'meta.resume' });
  const tExp = await getTranslations({ locale, namespace: 'experience' });
  const tEdu = await getTranslations({ locale, namespace: 'education' });
  const tCert = await getTranslations({ locale, namespace: 'certifications' });
  const tLang = await getTranslations({ locale, namespace: 'languages' });
  const tSkills = await getTranslations({ locale, namespace: 'skills' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const common = await getTranslations({ locale, namespace: 'common' });

  const jsonLd = graph(
    personSchema(t('description')),
    profilePageSchema(locale, '/resume'),
    breadcrumbSchema(locale, [
      { name: tNav('home'), path: '' },
      { name: tNav('resume'), path: '/resume' },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="content" className={styles.page}>
        <Container width="md">
          <SectionHeader
            id="resume-title"
            eyebrow={tNav('resume')}
            title={t('title')}
            lead={t('description')}
          />

          <a className={styles.download} href={site.resumePdf} download>
            {common('downloadResume')}
          </a>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{tNav('experience')}</h2>
            <ol className={styles.entries}>
              {experience.map((entry) => (
                <li key={entry.id} className={styles.entry}>
                  <div className={styles.entryHead}>
                    <h3 className={styles.entryTitle}>
                      {tExp(`${entry.id}.role` as 'actualsolutions.role')} —{' '}
                      {entry.company}
                    </h3>
                    <p className={styles.entryDates}>
                      <time dateTime={entry.start}>
                        {formatMonthYear(entry.start, activeLocale)}
                      </time>
                      {' – '}
                      {entry.end ? (
                        <time dateTime={entry.end}>
                          {formatMonthYear(entry.end, activeLocale)}
                        </time>
                      ) : (
                        tExp('present')
                      )}
                    </p>
                  </div>
                  <p className={styles.entryMeta}>
                    {entry.location} · {tExp(`types.${entry.type}` as 'types.full-time')}
                  </p>
                  <p className={styles.entryBody}>
                    {tExp(`${entry.id}.summary` as 'actualsolutions.summary')}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{tSkills('eyebrow')}</h2>
            <dl className={styles.skills}>
              {skillGroups.map((group) => (
                <div key={group.id} className={styles.skillRow}>
                  <dt className={styles.skillGroup}>
                    {tSkills(`groups.${group.id}` as 'groups.frontend')}
                  </dt>
                  <dd className={styles.skillList}>
                    {group.skills.map((skill) => (
                      <Tag key={skill.id} depth={skill.depth}>
                        {getSkill(skill.id)?.name}
                      </Tag>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{tEdu('title')}</h2>
            <ul className={styles.entries}>
              {education.map((entry) => (
                <li key={entry.id} className={styles.entry}>
                  <div className={styles.entryHead}>
                    <h3 className={styles.entryTitle}>{entry.institution}</h3>
                    <p className={styles.entryDates}>
                      <time dateTime={entry.start}>
                        {formatMonthYear(entry.start, activeLocale)}
                      </time>
                      {' – '}
                      <time dateTime={entry.end}>
                        {formatMonthYear(entry.end, activeLocale)}
                      </time>
                    </p>
                  </div>
                  <p className={styles.entryMeta}>
                    {tEdu(entry.fieldKey.replace('education.', '') as 'ysci.field')}
                  </p>
                </li>
              ))}
            </ul>

            <ul className={styles.certs}>
              {primaryCertifications.map((cert) => (
                <li key={cert.id} className={styles.cert}>
                  <span className={styles.certName}>
                    {tCert(cert.nameKey.replace('certifications.', '') as 'ysci-se.name')}
                  </span>
                  <span className={styles.certIssuer}>
                    {cert.issuer} · {formatMonthYear(cert.issued, activeLocale)}
                  </span>
                </li>
              ))}
            </ul>

            <p className={styles.secondaryCerts}>
              {tEdu('otherCertifications', {
                list: secondaryCertifications
                  .map((cert) =>
                    tCert(cert.nameKey.replace('certifications.', '') as 'ysci-se.name'),
                  )
                  .join(', '),
              })}{' '}
              — {certifications[2]?.issuer} · 2023
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{tLang('title')}</h2>
            <ul className={styles.languages}>
              {languages.map((language) => (
                <li key={language.code}>
                  <span className={styles.languageName}>
                    {tLang(language.nameKey.replace('languages.', '') as 'hy')}
                  </span>
                  <span className={styles.languageLevel}>
                    {tLang(`levels.${language.level}` as 'levels.native')}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </Container>
      </main>
    </>
  );
}
