import { localeMeta, type Locale } from '@/config/i18n';
import { site } from '@/config/site';
import { personal, fullName } from '@/data/personal';
import { sameAs } from '@/data/socials';

const PERSON_ID = `${site.url}/#person`;
const WEBSITE_ID = `${site.url}/#website`;

const knowsAbout = [
  'React',
  'TypeScript',
  'Frontend Architecture',
  'Feature-Sliced Design',
  'Enterprise Software',
  'AI-Native Development',
  'Agentic Development',
  'Fintech',
];

export function personSchema(description: string) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: fullName,
    givenName: personal.firstName,
    familyName: personal.lastName,
    jobTitle: 'Software Engineer',
    description,
    url: site.url,
    email: `mailto:${personal.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: personal.location.city,
      addressCountry: personal.location.countryCode,
    },
    worksFor: {
      '@type': 'Organization',
      name: 'ActualSolutions',
      url: 'https://www.actualsolutions.am',
    },
    alumniOf: [
      {
        '@type': 'EducationalOrganization',
        name: 'Yerevan State College of Informatics',
      },
    ],
    knowsLanguage: [
      { '@type': 'Language', name: 'Armenian', alternateName: 'hy' },
      { '@type': 'Language', name: 'Russian', alternateName: 'ru' },
      { '@type': 'Language', name: 'English', alternateName: 'en' },
    ],
    knowsAbout,
    sameAs,
  };
}

export function webSiteSchema(locale: Locale) {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: site.name,
    url: site.url,
    inLanguage: localeMeta[locale].htmlLang,
    publisher: { '@id': PERSON_ID },
  };
}

export function profilePageSchema(locale: Locale, path = '') {
  return {
    '@type': 'ProfilePage',
    '@id': `${site.url}/${locale}${path}#page`,
    url: `${site.url}/${locale}${path}`,
    inLanguage: localeMeta[locale].htmlLang,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': PERSON_ID },
  };
}

export function breadcrumbSchema(
  locale: Locale,
  items: Array<{ name: string; path: string }>,
) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${site.url}/${locale}${item.path}`,
    })),
  };
}

export function creativeWorkSchema(input: {
  locale: Locale;
  slug: string;
  name: string;
  description: string;
  year: string;
  technologies: string[];
}) {
  return {
    '@type': 'CreativeWork',
    '@id': `${site.url}/${input.locale}/projects/${input.slug}#work`,
    name: input.name,
    description: input.description,
    url: `${site.url}/${input.locale}/projects/${input.slug}`,
    inLanguage: localeMeta[input.locale].htmlLang,
    dateCreated: input.year.slice(0, 4),
    author: { '@id': PERSON_ID },
    keywords: input.technologies.join(', '),
  };
}

export function graph(...nodes: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}
