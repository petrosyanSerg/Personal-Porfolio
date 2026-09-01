import { getTranslations } from 'next-intl/server';

import { Reveal } from '@/components/animations/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { personal } from '@/data/personal';
import { DesignPortrait } from '@/design-system';

import styles from './About.module.scss';

export async function About() {
  const t = await getTranslations('about');
  const paragraphs = t.raw('body') as string[];

  return (
    <section id="about" className={styles.about} aria-labelledby="about-title">
      <Container>
        <SectionHeader id="about-title" eyebrow={t('eyebrow')} title={t('title')} />

        <div className={styles.grid}>
          <div className={styles.prose}>
            {paragraphs.map((paragraph, index) => (
              <Reveal key={index} index={index}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className={styles.portraitWrap} index={1}>
            {personal.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={personal.photo}
                alt=""
                className={styles.portrait}
                width={520}
                height={650}
              />
            ) : (
              <DesignPortrait
                className={styles.portrait}
                fallbackClassName={styles.placeholder}
                fallbackLabel={t('photoPlaceholder')}
              />
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
