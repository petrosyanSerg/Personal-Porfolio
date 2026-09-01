import { getLocale, getTranslations } from 'next-intl/server';

import { CountUp } from '@/components/animations/CountUp';
import { Container } from '@/components/ui/Container';
import type { Locale } from '@/config/i18n';
import { displayedMetrics } from '@/data/metrics';
import { formatMetric } from '@/lib/format';

import styles from './ProofBar.module.scss';

export async function ProofBar() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('metrics');

  return (
    <section className={styles.proof} aria-label={t('caption')}>
      <Container>
        <ul className={styles.list}>
          {displayedMetrics.map((metric) => (
            <li key={metric.id} className={styles.item}>
              <span className={styles.value}>
                <CountUp
                  value={metric.value}
                  formatted={formatMetric(
                    metric.value,
                    locale,
                    metric.prefix,
                    metric.suffix,
                  )}
                  locale={locale}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                />
              </span>
              <span className={styles.label}>
                {t(metric.labelKey.replace('metrics.', '') as 'modules')}
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.caption}>{t('caption')}</p>
      </Container>
    </section>
  );
}
