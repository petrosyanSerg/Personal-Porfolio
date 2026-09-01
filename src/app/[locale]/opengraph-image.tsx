import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

import { locales, type Locale } from '@/config/i18n';
import { displayedMetrics } from '@/data/metrics';
import { fullName } from '@/data/personal';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Sergey Petrosyan — Software Engineer';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metrics' });
  const hero = await getTranslations({ locale, namespace: 'hero' });

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: '#0A0B0F',
        backgroundImage:
          'radial-gradient(120% 90% at 50% 0%, rgba(91,124,255,0.28) 0%, rgba(10,11,15,0) 62%)',
        color: '#EAECF2',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 4,
            color: '#93A9FF',
            textTransform: 'uppercase',
          }}
        >
          {fullName} · Yerevan, Armenia
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 62,
            lineHeight: 1.08,
            fontWeight: 700,
            letterSpacing: -1.6,
            maxWidth: 940,
          }}
        >
          {hero('headline')}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 56 }}>
        {displayedMetrics.map((metric) => (
          <div
            key={metric.id}
            style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <div
              style={{ display: 'flex', fontSize: 46, fontWeight: 600, color: '#FFFFFF' }}
            >
              {`${metric.prefix ?? ''}${metric.value}${metric.suffix ?? ''}`}
            </div>
            <div style={{ display: 'flex', fontSize: 21, color: '#848CA0' }}>
              {t(metric.labelKey.replace('metrics.', '') as 'modules')}
            </div>
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
