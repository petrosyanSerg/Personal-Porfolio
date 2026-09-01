import { getLocale, getTranslations } from 'next-intl/server';

import { Reveal } from '@/components/animations/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Tag } from '@/components/ui/Tag';
import type { Locale } from '@/config/i18n';
import { experience } from '@/data/experience';
import { getSkill } from '@/data/skills';
import { formatMonthYear, monthsBetween, toDuration } from '@/lib/format';

import styles from './Experience.module.scss';

export async function Experience() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('experience');

  return (
    <section
      id="experience"
      className={styles.section}
      aria-labelledby="experience-title"
    >
      <Container>
        <SectionHeader id="experience-title" eyebrow={t('eyebrow')} title={t('title')} />

        <ol className={styles.timeline}>
          {experience.map((entry, index) => {
            const months = monthsBetween(entry.start, entry.end);
            const { years, months: restMonths } = toDuration(months);

            const duration = [
              years > 0 ? t('duration.years', { count: years }) : null,
              restMonths > 0 ? t('duration.months', { count: restMonths }) : null,
            ]
              .filter(Boolean)
              .join(' ');

            const highlights = entry.highlightKeys.map((key) =>
              t(key.replace('experience.', '') as 'actualsolutions.highlights.0'),
            );

            return (
              <Reveal as="li" key={entry.id} index={index} className={styles.item}>
                <div
                  className={styles.node}
                  data-featured={entry.featured || undefined}
                  aria-hidden="true"
                />

                <div className={styles.body}>
                  <div className={styles.head}>
                    <h3 className={styles.role}>
                      {t(`${entry.id}.role` as 'actualsolutions.role')}
                      <span className={styles.dash}> — </span>
                      {entry.companyUrl ? (
                        <a
                          className={styles.company}
                          href={entry.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {entry.company}
                        </a>
                      ) : (
                        <span className={styles.company}>{entry.company}</span>
                      )}
                    </h3>

                    <p className={styles.dates}>
                      <time dateTime={entry.start}>
                        {formatMonthYear(entry.start, locale)}
                      </time>
                      {' – '}
                      {entry.end ? (
                        <time dateTime={entry.end}>
                          {formatMonthYear(entry.end, locale)}
                        </time>
                      ) : (
                        t('present')
                      )}
                      <span className={styles.duration}> · {duration}</span>
                    </p>
                  </div>

                  <p className={styles.meta}>
                    {entry.location} · {t(`types.${entry.type}` as 'types.full-time')} ·{' '}
                    {t(`modes.${entry.mode}` as 'modes.hybrid')}
                    {entry.product?.publicDescription ? (
                      <>
                        {' · '}
                        {entry.product.url ? (
                          <a
                            href={entry.product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.product}
                          >
                            {entry.product.name}
                          </a>
                        ) : (
                          <span className={styles.product}>{entry.product.name}</span>
                        )}
                      </>
                    ) : null}
                  </p>

                  <ul className={styles.highlights}>
                    {highlights.map((highlight, i) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>

                  <ul className={styles.stack} aria-label="Technologies">
                    {entry.technologies.map((id) => {
                      const skill = getSkill(id);
                      return skill ? (
                        <li key={id}>
                          <Tag>{skill.name}</Tag>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
