import { getTranslations } from 'next-intl/server';

import { Reveal } from '@/components/animations/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';

import styles from './Journey.module.scss';

const YEARS = ['2019', '2022', '2023', '2025', '2026'] as const;

export async function Journey() {
  const t = await getTranslations('journey');

  return (
    <section id="journey" className={styles.section} aria-labelledby="journey-title">
      <Container>
        <SectionHeader id="journey-title" eyebrow={t('eyebrow')} title={t('title')} />

        <ol className={styles.list}>
          {YEARS.map((year, index) => (
            <Reveal as="li" key={year} index={index} className={styles.item}>
              <time className={styles.year} dateTime={year}>
                {year}
              </time>
              <p className={styles.body}>{t(`entries.${year}`)}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
