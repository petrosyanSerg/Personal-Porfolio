import { getTranslations } from 'next-intl/server';

import { Reveal } from '@/components/animations/Reveal';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { commercialProjects, featuredProjects, publicProjects } from '@/data/projects';

import styles from './Projects.module.scss';

export async function Projects() {
  const t = await getTranslations('projects');

  const otherCommercial = commercialProjects.filter((p) => !p.featured);

  return (
    <section id="projects" className={styles.section} aria-labelledby="projects-title">
      <Container>
        <SectionHeader
          id="projects-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <div className={styles.featured}>
          {featuredProjects.map((project, index) => (
            <Reveal key={project.slug} index={index}>
              <ProjectCard project={project} featured />
            </Reveal>
          ))}
        </div>

        {otherCommercial.length > 0 ? (
          <div className={styles.grid}>
            {otherCommercial.map((project, index) => (
              <Reveal key={project.slug} index={index}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : null}

        <p className={styles.divider}>
          <span>{t('publicDivider')}</span>
        </p>

        <div className={styles.grid}>
          {publicProjects.map((project, index) => (
            <Reveal key={project.slug} index={index}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
