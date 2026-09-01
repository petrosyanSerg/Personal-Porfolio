import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProjectCard } from '@/components/projects/ProjectCard';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { Locale } from '@/config/i18n';
import { commercialProjects, publicProjects } from '@/data/projects';
import { breadcrumbSchema, graph, personSchema, webSiteSchema } from '@/lib/jsonld';
import { buildPageMetadata } from '@/lib/seo';

import styles from './projects.module.scss';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.projects' });

  return buildPageMetadata({
    locale,
    path: '/projects',
    title: t('title'),
    description: t('description'),
  });
}

export default async function ProjectsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'projects' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const jsonLd = graph(
    personSchema(t('lead')),
    webSiteSchema(locale),
    breadcrumbSchema(locale, [
      { name: tNav('home'), path: '' },
      { name: tNav('projects'), path: '/projects' },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="content" className={styles.page}>
        <Container>
          <SectionHeader
            id="projects-index-title"
            eyebrow={t('eyebrow')}
            title={t('title')}
            lead={t('lead')}
          />

          <div className={styles.grid}>
            {commercialProjects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                featured={project.featured}
              />
            ))}
          </div>

          <p className={styles.divider}>
            <span>{t('publicDivider')}</span>
          </p>

          <div className={styles.grid}>
            {publicProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </Container>
      </main>
    </>
  );
}
