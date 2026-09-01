import type { DeveloperProfile } from '@/types/profile';

import { certifications, education, languages } from './education';
import { experience } from './experience';
import { metrics } from './metrics';
import { personal } from './personal';
import { projects } from './projects';
import { skillGroups } from './skills';
import { socialLinks } from './socials';

export const profile: DeveloperProfile = {
  personal,
  metrics,
  experience,
  education,
  certifications,
  skills: skillGroups,
  projects,
  achievements: [],
  languages,
  socialLinks,
};

export * from './personal';
export * from './metrics';
export * from './experience';
export * from './skills';
export * from './projects';
export * from './education';
export * from './socials';
