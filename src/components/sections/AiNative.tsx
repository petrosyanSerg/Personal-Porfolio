import { getTranslations } from 'next-intl/server';

import { Reveal } from '@/components/animations/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AiNativeVisual } from '@/components/visuals/AiNativeVisual';

import styles from './AiNative.module.scss';

const STAGES = ['context', 'spec', 'scaffold', 'validate', 'merge'] as const;

export async function AiNative() {
  const t = await getTranslations('aiNative');

  return (
    <section id="ai-native" className={styles.section} aria-labelledby="ai-native-title">
      <Container>
        <SectionHeader
          id="ai-native-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <AiNativeVisual />

        <ol className={styles.pipeline}>
          {STAGES.map((stage, index) => (
            <Reveal as="li" key={stage} index={index} className={styles.stage}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.index}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className={styles.name}>{t(`stages.${stage}.name`)}</h3>
                </div>
                <p className={styles.body}>{t(`stages.${stage}.body`)}</p>
              </div>

              {index < STAGES.length - 1 ? (
                <span className={styles.connector} aria-hidden="true" />
              ) : null}
            </Reveal>
          ))}
        </ol>

        <p className={styles.closing}>{t('closing')}</p>
      </Container>
    </section>
  );
}
