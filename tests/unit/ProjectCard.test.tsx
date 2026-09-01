import { render, screen, within } from '@testing-library/react';
import { createTranslator } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import en from '@/content/en.json';
import { projects } from '@/data/projects';
import { getSkill } from '@/data/skills';

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) =>
    createTranslator({ locale: 'en', messages: en, namespace: namespace as 'projects' }),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const { ProjectCard } = await import('@/components/projects/ProjectCard');

const byId = (slug: string) => projects.find((p) => p.slug === slug)!;

describe('ProjectCard', () => {
  it.each(projects.map((p) => [p.slug]))(
    '%s renders its required fields',
    async (slug) => {
      const project = byId(slug);
      const { container } = render(await ProjectCard({ project }));
      const card = container.firstElementChild!;

      expect(
        within(card as HTMLElement).getByRole('heading', { level: 3 }),
      ).toHaveTextContent(/\S/);
      expect(card).toHaveTextContent(String(project.year));
      expect(card.textContent).not.toMatch(/projects\./);
    },
  );

  it('links a case study only when the project has one and is not blocked', async () => {
    const withStudy = projects.find((p) => p.hasCaseStudy && !p.blockedBy)!;
    render(await ProjectCard({ project: withStudy }));

    expect(screen.getByRole('link', { name: en.projects.viewCaseStudy })).toHaveAttribute(
      'href',
      `/projects/${withStudy.slug}`,
    );
  });

  it('never links a blocked project, whose route does not exist', async () => {
    const blocked = projects.filter((p) => p.blockedBy);
    expect(blocked.length).toBeGreaterThan(0);

    for (const project of blocked) {
      const { container, unmount } = render(await ProjectCard({ project }));

      expect(
        within(container).queryByRole('link', { name: en.projects.viewCaseStudy }),
      ).toBeNull();
      expect(container.querySelector(`a[href="/projects/${project.slug}"]`)).toBeNull();

      unmount();
    }
  });

  it('renders only technologies that exist in the skills registry', async () => {
    const project = projects.find((p) => p.technologies.length > 0)!;
    render(await ProjectCard({ project }));

    const stack = screen.getByRole('list', { name: en.projects.sections.technologies });
    const names = within(stack)
      .getAllByRole('listitem')
      .map((li) => li.textContent);

    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(project.technologies.map((id) => getSkill(id)?.name)).toContain(name);
    }
  });

  it('announces external links as external', async () => {
    const external = projects.find((p) => p.links?.github ?? p.links?.live)!;
    render(await ProjectCard({ project: external }));

    const link = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('target') === '_blank')!;

    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveTextContent(en.common.externalLink);
  });
});
