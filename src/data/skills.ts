import type { Skill, SkillGroup } from '@/types/profile';

const frontend: Skill[] = [
  {
    id: 'react',
    name: 'React 19',
    depth: 'core',
    usageKey: 'skills.usage.react',
    evidence: ['ActualSolutions', 'SoftConstruct', 'SmartCode', 'GitHub'],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    depth: 'core',
    usageKey: 'skills.usage.typescript',
    evidence: ['ActualSolutions', 'GitHub'],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    depth: 'core',
    usageKey: 'skills.usage.javascript',
    evidence: ['ActualSolutions', 'SoftConstruct', 'SmartCode', 'GitHub'],
  },
  {
    id: 'scss',
    name: 'SCSS',
    depth: 'core',
    usageKey: 'skills.usage.scss',
    evidence: ['ActualSolutions', 'SoftConstruct', 'GitHub'],
  },
  {
    id: 'html',
    name: 'HTML5',
    depth: 'strong',
    usageKey: 'skills.usage.html',
    evidence: ['SmartCode', 'GitHub'],
  },
  {
    id: 'css',
    name: 'CSS',
    depth: 'core',
    usageKey: 'skills.usage.css',
    evidence: ['SmartCode', 'GitHub'],
  },
  {
    id: 'react-hook-form',
    name: 'React Hook Form',
    depth: 'strong',
    usageKey: 'skills.usage.react-hook-form',
    evidence: ['ActualSolutions', 'SoftConstruct'],
  },
  {
    id: 'zod',
    name: 'Zod',
    depth: 'strong',
    usageKey: 'skills.usage.zod',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'ant-design',
    name: 'Ant Design',
    depth: 'strong',
    usageKey: 'skills.usage.ant-design',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'material-ui',
    name: 'Material UI',
    depth: 'working',
    usageKey: 'skills.usage.material-ui',
    evidence: ['LinkedIn'],
  },
  {
    id: 'i18next',
    name: 'i18next',
    depth: 'strong',
    usageKey: 'skills.usage.i18next',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'nuqs',
    name: 'nuqs',
    depth: 'working',
    usageKey: 'skills.usage.nuqs',
    evidence: ['LinkedIn'],
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    depth: 'working',
    usageKey: 'skills.usage.nextjs',
    evidence: ['GitHub'],
    personalOnly: true,
  },
];

const stateData: Skill[] = [
  {
    id: 'tanstack-query',
    name: 'TanStack Query',
    depth: 'core',
    usageKey: 'skills.usage.tanstack-query',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'redux-toolkit',
    name: 'Redux Toolkit',
    depth: 'strong',
    usageKey: 'skills.usage.redux-toolkit',
    evidence: ['ActualSolutions', 'SoftConstruct'],
  },
  {
    id: 'axios',
    name: 'Axios',
    depth: 'strong',
    usageKey: 'skills.usage.axios',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'rest',
    name: 'REST / OpenAPI',
    depth: 'strong',
    usageKey: 'skills.usage.rest',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'jwt',
    name: 'JWT auth',
    depth: 'strong',
    usageKey: 'skills.usage.jwt',
    evidence: ['ActualSolutions'],
  },
];

const architecture: Skill[] = [
  {
    id: 'feature-sliced-design',
    name: 'Feature-Sliced Design',
    depth: 'core',
    usageKey: 'skills.usage.feature-sliced-design',
    evidence: ['ActualSolutions', 'GitHub'],
  },
  {
    id: 'frontend-architecture',
    name: 'Frontend architecture',
    depth: 'core',
    usageKey: 'skills.usage.frontend-architecture',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'design-systems',
    name: 'Design systems',
    depth: 'strong',
    usageKey: 'skills.usage.design-systems',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'authorization',
    name: 'Type-safe authorization',
    depth: 'strong',
    usageKey: 'skills.usage.authorization',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'error-handling',
    name: 'Error-handling architecture',
    depth: 'strong',
    usageKey: 'skills.usage.error-handling',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'i18n',
    name: 'Internationalization',
    depth: 'strong',
    usageKey: 'skills.usage.i18n',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'pwa',
    name: 'PWA',
    depth: 'working',
    usageKey: 'skills.usage.pwa',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'responsive',
    name: 'Responsive / mobile-first',
    depth: 'strong',
    usageKey: 'skills.usage.responsive',
    evidence: ['ActualSolutions', 'SoftConstruct'],
  },
];

const aiEngineering: Skill[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    depth: 'core',
    usageKey: 'skills.usage.claude-code',
    evidence: ['ActualSolutions', 'LinkedIn'],
  },
  {
    id: 'agentic-development',
    name: 'Agentic development',
    depth: 'core',
    usageKey: 'skills.usage.agentic-development',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'context-engineering',
    name: 'Context engineering',
    depth: 'strong',
    usageKey: 'skills.usage.context-engineering',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'spec-driven',
    name: 'Spec-driven development',
    depth: 'strong',
    usageKey: 'skills.usage.spec-driven',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'scaffolding',
    name: 'Project-aware scaffolding',
    depth: 'strong',
    usageKey: 'skills.usage.scaffolding',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'human-in-the-loop',
    name: 'Human-in-the-loop review',
    depth: 'strong',
    usageKey: 'skills.usage.human-in-the-loop',
    evidence: ['ActualSolutions'],
  },
];

const toolingInfra: Skill[] = [
  {
    id: 'vite',
    name: 'Vite',
    depth: 'core',
    usageKey: 'skills.usage.vite',
    evidence: ['ActualSolutions', 'GitHub'],
  },
  {
    id: 'git',
    name: 'Git / GitFlow',
    depth: 'strong',
    usageKey: 'skills.usage.git',
    evidence: ['SoftConstruct', 'GitHub'],
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    depth: 'working',
    usageKey: 'skills.usage.github-actions',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'docker',
    name: 'Docker',
    depth: 'working',
    usageKey: 'skills.usage.docker',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'azure',
    name: 'Azure',
    depth: 'familiar',
    usageKey: 'skills.usage.azure',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'eslint',
    name: 'ESLint / Prettier',
    depth: 'strong',
    usageKey: 'skills.usage.eslint',
    evidence: ['ActualSolutions', 'GitHub'],
  },
];

const design: Skill[] = [
  {
    id: 'figma',
    name: 'Figma',
    depth: 'working',
    usageKey: 'skills.usage.figma',
    evidence: ['ActualSolutions'],
  },
  {
    id: 'photoshop',
    name: 'Adobe Photoshop',
    depth: 'strong',
    usageKey: 'skills.usage.photoshop',
    evidence: ['EdEl'],
  },
  {
    id: 'lightroom',
    name: 'Adobe Lightroom',
    depth: 'strong',
    usageKey: 'skills.usage.lightroom',
    evidence: ['EdEl'],
  },
];

export const skillGroups: SkillGroup[] = [
  { id: 'frontend', labelKey: 'skills.groups.frontend', skills: frontend },
  { id: 'state-data', labelKey: 'skills.groups.state-data', skills: stateData },
  { id: 'architecture', labelKey: 'skills.groups.architecture', skills: architecture },
  {
    id: 'ai-engineering',
    labelKey: 'skills.groups.ai-engineering',
    skills: aiEngineering,
  },
  { id: 'tooling-infra', labelKey: 'skills.groups.tooling-infra', skills: toolingInfra },
  { id: 'design', labelKey: 'skills.groups.design', skills: design },
];

export const allSkills: Skill[] = skillGroups.flatMap((group) => group.skills);

export const skillById = new Map(allSkills.map((skill) => [skill.id, skill]));

export function getSkill(id: string): Skill | undefined {
  return skillById.get(id);
}
