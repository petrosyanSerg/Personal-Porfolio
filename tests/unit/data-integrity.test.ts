import { describe, expect, it } from 'vitest';

import en from '@/content/en.json';
import hy from '@/content/hy.json';
import ru from '@/content/ru.json';
import { locales } from '@/config/i18n';
import { certifications, education, languages } from '@/data/education';
import { experience } from '@/data/experience';
import { metrics } from '@/data/metrics';
import { projects } from '@/data/projects';
import { allSkills, skillById } from '@/data/skills';
import { sameAs, socialLinks } from '@/data/socials';

type Json = Record<string, unknown>;

function resolve(source: Json, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc == null) return undefined;
    if (Array.isArray(acc)) return acc[Number(part)];
    return (acc as Json)[part];
  }, source);
}

function collectStrings(value: unknown, path: string[] = []): Array<[string, string]> {
  if (typeof value === 'string') return [[path.join('.'), value]];
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => collectStrings(item, [...path, String(i)]));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => collectStrings(v, [...path, k]));
  }
  return [];
}

const localeFiles: Record<string, Json> = {
  en: en as Json,
  ru: ru as Json,
  hy: hy as Json,
};

describe('content keys resolve in every enabled locale', () => {
  const keys = [
    ...experience.flatMap((e) => [e.roleKey, ...e.highlightKeys]),
    ...allSkills.map((s) => s.usageKey),
    ...projects.flatMap((p) => [
      p.roleKey,
      p.content.titleKey,
      p.content.shortDescriptionKey,
      ...(p.content.challengeKeys ?? []),
      ...(p.content.resultKeys ?? []),
    ]),
    ...metrics.map((m) => m.labelKey),
    ...education.map((e) => e.fieldKey),
    ...certifications.map((c) => c.nameKey),
    ...languages.map((l) => l.nameKey),
    ...socialLinks.map((s) => s.labelKey),
  ];

  for (const locale of locales) {
    it(`${locale}: every referenced key exists`, () => {
      const missing = keys.filter(
        (key) => typeof resolve(localeFiles[locale]!, key) !== 'string',
      );
      expect(missing).toEqual([]);
    });
  }
});

describe('locale files have identical shape', () => {
  it.each([
    ['ru', ru],
    ['hy', hy],
  ])('%s has exactly the same keys as en', (_name, file) => {
    const enKeys = collectStrings(en)
      .map(([k]) => k)
      .sort();
    const keys = collectStrings(file)
      .map(([k]) => k)
      .sort();

    expect(keys).toEqual(enKeys);
  });

  it.each([
    ['ru', ru],
    ['hy', hy],
  ])('no %s value is byte-identical to its English source', (_name, file) => {
    const exempt = new Set([
      'about.photoPlaceholder',
      'contact.form.email',
      'contact.form.emailPlaceholder',
      'education.ysci.field',
      'footer.copyright',
      'footer.role',
      'nav.ai',
      'aiNative.eyebrow',
      'aiNative.stages.spec.name',
      'aiNative.stages.scaffold.name',
      'aiNative.stages.merge.name',
      'skills.groups.frontend',
      'skills.groups.ai-engineering',
      'skills.groups.design',
      'skills.depth.core',
      'skills.depth.strong',
      'skills.depth.working',
      'skills.depth.familiar',
    ]);
    const exemptPrefix = new RegExp(
      [
        'socials\\.',
        'certifications\\.',
        'projects\\.[a-z-]+\\.(title|role)$',
        'experience\\.[a-z]+\\.role$',
      ].join('|'),
    );

    const enMap = new Map(collectStrings(en));
    const untranslated = collectStrings(file)
      .filter(
        ([key, value]) =>
          enMap.get(key) === value && !exempt.has(key) && !exemptPrefix.test(key),
      )
      .map(([key]) => key);

    expect(untranslated).toEqual([]);
  });
});

describe('skills', () => {
  it('every skill has at least one evidence source', () => {
    const unevidenced = allSkills.filter((s) => s.evidence.length === 0).map((s) => s.id);
    expect(unevidenced).toEqual([]);
  });

  it('skill ids are unique', () => {
    expect(skillById.size).toBe(allSkills.length);
  });
});

describe('technologies referenced elsewhere exist in skills.ts', () => {
  it('experience technologies resolve', () => {
    const orphans = experience
      .flatMap((e) => e.technologies)
      .filter((id) => !skillById.has(id));
    expect([...new Set(orphans)]).toEqual([]);
  });

  it('project technologies resolve', () => {
    const orphans = projects
      .flatMap((p) => p.technologies)
      .filter((id) => !skillById.has(id));
    expect([...new Set(orphans)]).toEqual([]);
  });
});

describe('metrics', () => {
  it('no unverified metric is displayed', () => {
    const leaked = metrics.filter((m) => m.evidence === 'unverified' && m.display);
    expect(leaked).toEqual([]);
  });
});

describe('experience timeline', () => {
  it('no entry ends before it starts', () => {
    const invalid = experience.filter((e) => e.end !== null && e.end < e.start);
    expect(invalid).toEqual([]);
  });

  it('exactly one entry is current', () => {
    expect(experience.filter((e) => e.end === null)).toHaveLength(1);
  });
});

describe('projects', () => {
  it('slugs are unique and kebab-case', () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.filter((s) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s))).toEqual([]);
  });

  it('a blocked project never claims a case study', () => {
    const contradictory = projects.filter((p) => p.blockedBy && p.hasCaseStudy);
    expect(contradictory).toEqual([]);
  });
});

describe('sameAs feeds JSON-LD with controlled profiles only', () => {
  it('contains no mailto entries', () => {
    expect(sameAs.some((url) => url.startsWith('mailto:'))).toBe(false);
  });

  it('every entry is an absolute https URL', () => {
    expect(sameAs.every((url) => url.startsWith('https://'))).toBe(true);
  });
});
