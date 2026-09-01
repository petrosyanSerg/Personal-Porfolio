import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Atmosphere } from '@/components/effects/Atmosphere';
import { CinematicBackground } from '@/components/effects/CinematicBackground';
import { ScrollProgress } from '@/components/effects/ScrollProgress';
import { DesignAtmosphere } from '@/design-system/components/DesignAtmosphere';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { localeMeta, locales, type Locale } from '@/config/i18n';
import { site } from '@/config/site';
import { routing } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo';
import { designInitScript } from '@/design-system';
import { themeInitScript } from '@/lib/theme';

import '@/styles/main.scss';

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0B0F' },
    { media: '(prefers-color-scheme: light)', color: '#FBFBFD' },
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: Omit<LayoutProps, 'children'>): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'meta.home' });

  return {
    metadataBase: new URL(site.url),
    title: {
      default: t('title'),
      template: `%s · ${site.name}`,
    },
    description: t('description'),
    applicationName: site.name,
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    publisher: site.name,
    alternates: buildAlternates(locale as Locale),
    formatDetection: { email: false, telephone: false, address: false },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const meta = localeMeta[locale as Locale];
  const t = await getTranslations({ locale, namespace: 'a11y' });

  return (
    <html lang={meta.htmlLang} dir={meta.dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: designInitScript }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <a href="#content" className="skip-link">
            {t('skipLink')}
          </a>

          <CinematicBackground />
          <DesignAtmosphere />
          <ScrollProgress />
          <Atmosphere />

          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
