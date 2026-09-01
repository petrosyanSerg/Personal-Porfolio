import type en from './src/content/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof en;
    Locale: 'en' | 'ru' | 'hy';
  }
}

export {};
