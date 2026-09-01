import { getTranslations } from 'next-intl/server';

import { Spotlight } from '@/components/ui/Spotlight';
import { Tag } from '@/components/ui/Tag';
import { Link } from '@/i18n/navigation';
import { getSkill } from '@/data/skills';
import type { Project } from '@/types/profile';

import styles from './ProjectCard.module.scss';

type ProjectCardProps = {
  project: Project;
  featured?: boolean;
};

export async function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const t = await getTranslations('projects');
  const common = await getTranslations('common');

  const key = (suffix: string) => `${project.slug}.${suffix}` as 'mk-kredit.title';
  const linksToCaseStudy = project.hasCaseStudy && !project.blockedBy;

  return (
    <Spotlight className={styles.shell}>
      <article
        className={styles.card}
        data-featured={featured || undefined}
        data-cursor-label={linksToCaseStudy ? t('viewCaseStudy') : undefined}
      >
        <header className={styles.head}>
          <div className={styles.meta}>
            {project.company ? (
              <span className={styles.company}>{project.company}</span>
            ) : null}
            <span className={styles.year}>{project.year}</span>
          </div>

          <h3 className={styles.title}>
            {linksToCaseStudy ? (
              <Link href={`/projects/${project.slug}`} className={styles.titleLink}>
                {t(key('title'))}
                <span className={styles.arrow} aria-hidden="true">
                  ↗
                </span>
              </Link>
            ) : (
              t(key('title'))
            )}
          </h3>

          <p className={styles.role}>{t(key('role'))}</p>
        </header>

        <p className={styles.description}>{t(key('shortDescription'))}</p>

        <ul className={styles.stack} aria-label={t('sections.technologies')}>
          {project.technologies.slice(0, 8).map((id) => {
            const skill = getSkill(id);
            return skill ? (
              <li key={id}>
                <Tag>{skill.name}</Tag>
              </li>
            ) : null;
          })}
        </ul>

        <footer className={styles.footer}>
          {linksToCaseStudy ? (
            <Link href={`/projects/${project.slug}`} className={styles.action}>
              {t('viewCaseStudy')}
            </Link>
          ) : null}

          {project.links?.github ? (
            <a
              className={styles.action}
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('viewCode')}
              <span className="visually-hidden"> ({common('externalLink')})</span>
            </a>
          ) : null}

          {project.links?.live ? (
            <a
              className={styles.action}
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('viewLive')}
              <span className="visually-hidden"> ({common('externalLink')})</span>
            </a>
          ) : null}

          {project.links?.noteKey ? (
            <span className={styles.note}>{t(key('accessNote'))}</span>
          ) : null}
        </footer>
      </article>
    </Spotlight>
  );
}
