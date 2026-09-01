import type { Project } from '@/types/profile';

export const projects: Project[] = [
  {
    slug: 'mk-kredit',
    tier: 'commercial',
    category: 'enterprise-fintech',
    featured: true,
    hasCaseStudy: true,
    company: 'ActualSolutions',
    roleKey: 'projects.mk-kredit.role',
    year: '2026',
    technologies: [
      'react',
      'typescript',
      'vite',
      'tanstack-query',
      'redux-toolkit',
      'react-hook-form',
      'zod',
      'ant-design',
      'scss',
      'axios',
      'i18next',
      'docker',
      'github-actions',
      'azure',
      'feature-sliced-design',
    ],
    links: { noteKey: 'projects.mk-kredit.accessNote' },
    diagram: 'mk-kredit-architecture',
    content: {
      titleKey: 'projects.mk-kredit.title',
      shortDescriptionKey: 'projects.mk-kredit.shortDescription',
      overviewKey: 'projects.mk-kredit.overview',
      problemKey: 'projects.mk-kredit.problem',
      contextKey: 'projects.mk-kredit.context',
      roleDetailKey: 'projects.mk-kredit.roleDetail',
      architectureKey: 'projects.mk-kredit.architecture',
      challengeKeys: [
        'projects.mk-kredit.challenges.0',
        'projects.mk-kredit.challenges.1',
        'projects.mk-kredit.challenges.2',
        'projects.mk-kredit.challenges.3',
        'projects.mk-kredit.challenges.4',
        'projects.mk-kredit.challenges.5',
      ],
      resultKeys: [
        'projects.mk-kredit.results.0',
        'projects.mk-kredit.results.1',
        'projects.mk-kredit.results.2',
        'projects.mk-kredit.results.3',
      ],
      lessonsKey: 'projects.mk-kredit.lessons',
    },
    evidence: 'fact',
  },

  {
    slug: 'ai-native-workflow',
    tier: 'commercial',
    category: 'engineering-practice',
    featured: true,
    hasCaseStudy: true,
    company: 'ActualSolutions',
    roleKey: 'projects.ai-native-workflow.role',
    year: '2026',
    technologies: [
      'claude-code',
      'agentic-development',
      'context-engineering',
      'spec-driven',
      'scaffolding',
      'human-in-the-loop',
    ],
    diagram: 'ai-workflow-pipeline',
    content: {
      titleKey: 'projects.ai-native-workflow.title',
      shortDescriptionKey: 'projects.ai-native-workflow.shortDescription',
      overviewKey: 'projects.ai-native-workflow.overview',
      problemKey: 'projects.ai-native-workflow.problem',
      roleDetailKey: 'projects.ai-native-workflow.roleDetail',
      architectureKey: 'projects.ai-native-workflow.architecture',
      challengeKeys: [
        'projects.ai-native-workflow.challenges.0',
        'projects.ai-native-workflow.challenges.1',
        'projects.ai-native-workflow.challenges.2',
      ],
      resultKeys: [
        'projects.ai-native-workflow.results.0',
        'projects.ai-native-workflow.results.1',
      ],
      lessonsKey: 'projects.ai-native-workflow.lessons',
    },
    evidence: 'fact',
  },

  {
    slug: 'springbme',
    tier: 'commercial',
    category: 'enterprise-fintech',
    featured: false,
    hasCaseStudy: false,
    blockedBy: 'PROFILE.md §2.2 — no public product description',
    company: 'SoftConstruct',
    roleKey: 'projects.springbme.role',
    year: '2023–2025',
    technologies: ['react', 'redux-toolkit', 'scss', 'react-hook-form', 'git'],
    content: {
      titleKey: 'projects.springbme.title',
      shortDescriptionKey: 'projects.springbme.shortDescription',
    },
    evidence: 'fact',
  },

  {
    slug: 'fsd-reference',
    tier: 'public',
    category: 'architecture-study',
    featured: false,
    hasCaseStudy: true,
    roleKey: 'projects.fsd-reference.role',
    year: '2025',
    technologies: ['react', 'typescript', 'vite', 'feature-sliced-design'],
    links: { github: 'https://github.com/petrosyanSerg/FSD_Test' },
    diagram: 'fsd-layers',
    content: {
      titleKey: 'projects.fsd-reference.title',
      shortDescriptionKey: 'projects.fsd-reference.shortDescription',
      overviewKey: 'projects.fsd-reference.overview',
      architectureKey: 'projects.fsd-reference.architecture',
      lessonsKey: 'projects.fsd-reference.lessons',
    },
    evidence: 'fact',
  },

  {
    slug: 'vecto-digital',
    tier: 'public',
    category: 'public-build',
    featured: false,
    hasCaseStudy: false,
    roleKey: 'projects.vecto-digital.role',
    year: '2025',
    technologies: ['react', 'typescript', 'vite', 'scss'],
    links: {
      github: 'https://github.com/petrosyanSerg/VectoDigital',
      live: 'https://vectodigitaltest.netlify.app/',
    },
    content: {
      titleKey: 'projects.vecto-digital.title',
      shortDescriptionKey: 'projects.vecto-digital.shortDescription',
    },
    evidence: 'fact',
  },

  {
    slug: 'nextjs-rendering-study',
    tier: 'public',
    category: 'architecture-study',
    featured: false,
    hasCaseStudy: false,
    roleKey: 'projects.nextjs-rendering-study.role',
    year: '2023',
    technologies: ['nextjs', 'typescript', 'react'],
    links: { github: 'https://github.com/petrosyanSerg/Project_NextJS_TypeScript' },
    content: {
      titleKey: 'projects.nextjs-rendering-study.title',
      shortDescriptionKey: 'projects.nextjs-rendering-study.shortDescription',
    },
    evidence: 'fact',
  },

  {
    slug: 'milky-way',
    tier: 'public',
    category: 'public-build',
    featured: false,
    hasCaseStudy: false,
    roleKey: 'projects.milky-way.role',
    year: '2023',
    technologies: ['scss', 'css', 'html'],
    links: { github: 'https://github.com/petrosyanSerg/Milky-Way' },
    content: {
      titleKey: 'projects.milky-way.title',
      shortDescriptionKey: 'projects.milky-way.shortDescription',
    },
    evidence: 'fact',
  },

  {
    slug: 'react-patterns',
    tier: 'public',
    category: 'architecture-study',
    featured: false,
    hasCaseStudy: false,
    roleKey: 'projects.react-patterns.role',
    year: '2025',
    technologies: ['react', 'typescript'],
    links: { github: 'https://github.com/petrosyanSerg/React-patterns' },
    content: {
      titleKey: 'projects.react-patterns.title',
      shortDescriptionKey: 'projects.react-patterns.shortDescription',
    },
    evidence: 'fact',
  },

  {
    slug: 'github-users-search',
    tier: 'public',
    category: 'public-build',
    featured: false,
    hasCaseStudy: false,
    roleKey: 'projects.github-users-search.role',
    year: '2023',
    technologies: ['react', 'typescript', 'rest'],
    links: {
      github: 'https://github.com/petrosyanSerg/GitHub-Users-Search',
      live: 'https://gitsearchhub.netlify.app/',
    },
    content: {
      titleKey: 'projects.github-users-search.title',
      shortDescriptionKey: 'projects.github-users-search.shortDescription',
    },
    evidence: 'fact',
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export const commercialProjects = projects.filter((p) => p.tier === 'commercial');

export const publicProjects = projects.filter((p) => p.tier === 'public');

export const caseStudyProjects = projects.filter(
  (project) => project.hasCaseStudy && !project.blockedBy,
);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
