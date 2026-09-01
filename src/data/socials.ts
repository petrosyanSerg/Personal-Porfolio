import type { NavItem, SocialLink } from '@/types/profile';

import { personal } from './personal';

export const socialLinks: SocialLink[] = [
  {
    id: 'linkedin',
    url: 'https://www.linkedin.com/in/petrosyanserg',
    labelKey: 'socials.linkedin',
    handle: 'petrosyanserg',
    primary: true,
  },
  {
    id: 'github',
    url: 'https://github.com/petrosyanSerg',
    labelKey: 'socials.github',
    handle: 'petrosyanSerg',
    primary: true,
  },
  {
    id: 'telegram',
    url: 'https://t.me/sergoDeveloper',
    labelKey: 'socials.telegram',
    handle: 'sergoDeveloper',
    primary: true,
  },
  {
    id: 'email',
    url: `mailto:${personal.email}`,
    labelKey: 'socials.email',
    handle: personal.email,
    primary: false,
  },
];

export const sameAs: string[] = socialLinks
  .filter((link) => link.id !== 'email')
  .map((link) => link.url);

export const navigation: NavItem[] = [
  { id: 'about', href: '/#about', labelKey: 'nav.about' },
  { id: 'experience', href: '/#experience', labelKey: 'nav.experience' },
  { id: 'architecture', href: '/#architecture', labelKey: 'nav.architecture' },
  { id: 'ai', href: '/#ai-native', labelKey: 'nav.ai' },
  { id: 'stack', href: '/#stack', labelKey: 'nav.stack' },
  { id: 'projects', href: '/projects', labelKey: 'nav.projects' },
  { id: 'contact', href: '/#contact', labelKey: 'nav.contact' },
];
