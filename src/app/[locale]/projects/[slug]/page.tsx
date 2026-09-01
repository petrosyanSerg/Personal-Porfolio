import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ArchitectureDiagram } from '@/components/projects/ArchitectureDiagram';
import { Container } from '@/components/ui/Container';
import { Tag } from '@/components/ui/Tag';
import { locales, type Locale } from '@/config/i18n';
import { caseStudyProjects, getProject } from '@/data/projects';
import { getSkill } from '@/data/skills';
import { Link } from '@/i18n/navigation';
import {
  breadcrumbSchema,
  creativeWorkSchema,
  graph,
  personSchema,
  webSiteSchema,
} from '@/lib/jsonld';
import { buildPageMetadata } from '@/lib/seo';

import styles from './case-study.module.scss';

type PageProps = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    caseStudyProjects.map((project) => ({ locale, slug: project.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project || !project.hasCaseStudy || project.blockedBy) return {};

  const t = await getTranslations({ locale, namespace: 'projects' });

  return buildPageMetadata({
    locale,
    path: `/projects/${slug}`,
    title: t(project.content.titleKey.replace(/^projects\./, '') as 'mk-kredit.title'),
    description: t(
      project.content.shortDescriptionKey.replace(
        /^projects\./,
        '',
      ) as 'mk-kredit.shortDescription',
    ),
    ogType: 'article',
  });
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = getProject(slug);
  if (!project || !project.hasCaseStudy || project.blockedBy) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'projects' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const common = await getTranslations({ locale, namespace: 'common' });

  const key = (k: string) => k.replace(/^projects\./, '') as 'mk-kredit.title';
  const content = project.content;

  const title = t(key(content.titleKey));
  const description = t(key(content.shortDescriptionKey));

  const jsonLd = graph(
    personSchema(description),
    webSiteSchema(locale),
    creativeWorkSchema({
      locale,
      slug: project.slug,
      name: title,
      description,
      year: project.year,
      technologies: project.technologies
        .map((id) => getSkill(id)?.name)
        .filter((name): name is string => Boolean(name)),
    }),
    breadcrumbSchema(locale, [
      { name: tNav('home'), path: '' },
      { name: tNav('projects'), path: '/projects' },
      { name: title, path: `/projects/${project.slug}` },
    ]),
  );

  const sections: Array<{ label: string; body: string }> = [
    content.overviewKey && {
      label: t('sections.overview'),
      body: t(key(content.overviewKey)),
    },
    content.problemKey && {
      label: t('sections.problem'),
      body: t(key(content.problemKey)),
    },
    content.contextKey && {
      label: t('sections.context'),
      body: t(key(content.contextKey)),
    },
    content.roleDetailKey && {
      label: t('sections.role'),
      body: t(key(content.roleDetailKey)),
    },
    content.architectureKey && {
      label: t('sections.architecture'),
      body: t(key(content.architectureKey)),
    },
  ].filter(Boolean) as Array<{ label: string; body: string }>;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="content" className={styles.page}>
        <Container width="md">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/projects">{t('backToProjects')}</Link>
          </nav>

          <header className={styles.header}>
            <p className={styles.meta}>
              {project.company ? (
                <span className={styles.company}>{project.company}</span>
              ) : null}
              <span>{project.year}</span>
              <span>{t(key(project.roleKey))}</span>
            </p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.lead}>{description}</p>

            <ul className={styles.stack} aria-label={t('sections.technologies')}>
              {project.technologies.map((id) => {
                const skill = getSkill(id);
                return skill ? (
                  <li key={id}>
                    <Tag depth={skill.depth}>{skill.name}</Tag>
                  </li>
                ) : null;
              })}
            </ul>

            <div className={styles.links}>
              {project.links?.github ? (
                <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                  {t('viewCode')}
                  <span className="visually-hidden"> ({common('externalLink')})</span>
                </a>
              ) : null}
              {project.links?.live ? (
                <a href={project.links.live} target="_blank" rel="noopener noreferrer">
                  {t('viewLive')}
                  <span className="visually-hidden"> ({common('externalLink')})</span>
                </a>
              ) : null}
              {project.links?.noteKey ? (
                <span className={styles.note}>{t(key(project.links.noteKey))}</span>
              ) : null}
            </div>
          </header>

          {sections.map((section) => (
            <section key={section.label} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.label}</h2>
              <p className={styles.body}>{section.body}</p>
            </section>
          ))}

          {project.diagram ? (
            <ArchitectureDiagram
              id={project.diagram}
              label={t('sections.architecture')}
            />
          ) : null}

          {content.challengeKeys?.length ? (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('sections.challenges')}</h2>
              <ol className={styles.numbered}>
                {content.challengeKeys.map((challengeKey, index) => (
                  <li key={challengeKey}>
                    <span className={styles.number}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{t(key(challengeKey))}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {content.resultKeys?.length ? (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('sections.results')}</h2>
              <ul className={styles.bullets}>
                {content.resultKeys.map((resultKey) => (
                  <li key={resultKey}>{t(key(resultKey))}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {content.lessonsKey ? (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('sections.lessons')}</h2>
              <p className={styles.lessons}>{t(key(content.lessonsKey))}</p>
            </section>
          ) : null}
        </Container>
      </main>
    </>
  );
}
