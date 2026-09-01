import type { MetadataRoute } from 'next';

import { locales } from '@/config/i18n';
import { site } from '@/config/site';
import { caseStudyProjects } from '@/data/projects';

type RouteDef = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: RouteDef[] = [
    { path: '', priority: 1.0, changeFrequency: 'monthly' },
    { path: '/projects', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/resume', priority: 0.8, changeFrequency: 'monthly' },
    ...caseStudyProjects.map((project) => ({
      path: `/projects/${project.slug}`,
      priority: project.featured ? 0.9 : 0.6,
      changeFrequency: (project.featured
        ? 'monthly'
        : 'yearly') as RouteDef['changeFrequency'],
    })),
  ];

  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${site.url}/${locale}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${site.url}/${l}${route.path}`]),
        ),
      },
    })),
  );
}
