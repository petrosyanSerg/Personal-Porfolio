import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { defaultLocale } from '@/config/i18n';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../content/${locale}.json`)).default,
    formats: {
      dateTime: {
        monthYear: { year: 'numeric', month: 'short' },
        year: { year: 'numeric' },
      },
    },
  };
});
