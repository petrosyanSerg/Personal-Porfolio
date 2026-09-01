import type { Metadata } from 'next';

import { locales, localeMeta, otherLocales, type Locale } from '@/config/i18n';
import { site } from '@/config/site';

export function buildAlternates(locale: Locale, path = ''): Metadata['alternates'] {
  const normalized = path && !path.startsWith('/') ? `/${path}` : path;

  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, `${site.url}/${l}${normalized}`]),
  );
  languages['x-default'] = `${site.url}/en${normalized}`;

  return {
    canonical: `${site.url}/${locale}${normalized}`,
    languages,
  };
}

type PageMetaInput = {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  ogImage?: string;
  ogType?: 'website' | 'profile' | 'article';
};

export function buildPageMetadata({
  locale,
  path = '',
  title,
  description,
  ogImage,
  ogType = 'website',
}: PageMetaInput): Metadata {
  const url = `${site.url}/${locale}${path && !path.startsWith('/') ? `/${path}` : path}`;
  const image = ogImage ?? `${url}/opengraph-image`;

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      type: ogType,
      siteName: site.name,
      title,
      description,
      url,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: otherLocales(locale).map((l) => localeMeta[l].ogLocale),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
