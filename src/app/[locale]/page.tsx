import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { About } from '@/components/sections/About';
import { AiNative } from '@/components/sections/AiNative';
import { Architecture } from '@/components/sections/Architecture';
import { Contact } from '@/components/sections/Contact';
import { Experience } from '@/components/sections/Experience';
import { Hero } from '@/components/sections/Hero';
import { Journey } from '@/components/sections/Journey';
import { Projects } from '@/components/sections/Projects';
import { ProofBar } from '@/components/sections/ProofBar';
import { TechStack } from '@/components/sections/TechStack';
import type { Locale } from '@/config/i18n';
import { graph, personSchema, profilePageSchema, webSiteSchema } from '@/lib/jsonld';
import { buildPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.home' });

  return buildPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    ogType: 'profile',
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'meta.home' });

  const jsonLd = graph(
    personSchema(t('description')),
    webSiteSchema(locale),
    profilePageSchema(locale),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="content">
        <Hero />
        <ProofBar />
        <About />
        <Experience />
        <Architecture />
        <AiNative />
        <TechStack />
        <Projects />
        <Journey />
        <Contact />
      </main>
    </>
  );
}
