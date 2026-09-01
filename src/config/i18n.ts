export const locales = ['en', 'ru', 'hy'] as const;

export const plannedLocales = ['en', 'ru', 'hy'] as const;

export type Locale = (typeof locales)[number];

export type PlannedLocale = (typeof plannedLocales)[number];

export const defaultLocale: Locale = 'en';

type LocaleMeta = {
  readonly label: string;
  readonly native: string;
  readonly htmlLang: string;
  readonly dir: 'ltr' | 'rtl';
  readonly ogLocale: string;
};

export const localeMeta: Readonly<Record<PlannedLocale, LocaleMeta>> = {
  en: {
    label: 'English',
    native: 'English',
    htmlLang: 'en',
    dir: 'ltr',
    ogLocale: 'en_US',
  },
  ru: {
    label: 'Russian',
    native: 'Русский',
    htmlLang: 'ru',
    dir: 'ltr',
    ogLocale: 'ru_RU',
  },
  hy: {
    label: 'Armenian',
    native: 'Հայերեն',
    htmlLang: 'hy',
    dir: 'ltr',
    ogLocale: 'hy_AM',
  },
} as const;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function otherLocales(current: Locale): Locale[] {
  return locales.filter((locale) => locale !== current);
}
