import type { MetadataRoute } from 'next';

import { defaultLocale } from '@/config/i18n';
import { site } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Software Engineer`,
    short_name: site.shortName,
    description:
      'Software engineer building enterprise frontends for regulated financial software.',
    start_url: `/${defaultLocale}`,
    scope: '/',
    display: 'standalone',
    theme_color: site.themeColor,
    background_color: site.backgroundColor,
    lang: defaultLocale,
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
