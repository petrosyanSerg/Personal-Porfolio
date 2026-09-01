# DATA_MODEL.md

Typed source of truth for all site content. The rule from `WEBSITE_SPEC.md` §5 holds throughout: **no personal information inside a component.**

**The split:** `data/*.ts` holds locale-independent structure — dates, slugs, technologies, URLs, numbers. `content/{locale}.json` holds translatable prose, keyed by the same ids. They join at render.

---

## 1. Core types

```ts
// types/profile.ts

export type Locale = 'en' | 'ru' | 'hy';

/** A claim's evidentiary status. Mirrors PROFILE.md. Guards public copy. */
export type EvidenceLevel = 'fact' | 'inference' | 'unverified';

export type DeveloperProfile = {
  personal: Personal;
  positioning: Positioning;
  metrics: Metric[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: Certification[];
  skills: SkillGroup[];
  projects: Project[];
  achievements: Achievement[];
  languages: LanguageProficiency[];
  socialLinks: SocialLink[];
};

export type Personal = {
  firstName: string;
  lastName: string;
  location: { city: string; country: string; countryCode: string; timezone: string };
  email: string;
  photo: string | null;          // null → renders the YOUR_PHOTO_HERE placeholder
  availability: {
    open: boolean;
    modes: Array<'onsite' | 'hybrid' | 'remote'>;
  };
};

export type Positioning = {
  /** Content keys, not literal strings — resolved per locale. */
  titleKey: string;
  taglineKey: string;
  heroHeadlineKey: string;
  heroSubKey: string;
  shortBioKey: string;
  longBioKey: string;
};
```

## 2. Metrics — the evidence

```ts
export type Metric = {
  id: string;
  value: number;
  /** Rendered around the value: '~' → "~50", '+' → "190+" */
  prefix?: string;
  suffix?: string;
  labelKey: string;
  source: 'ActualSolutions' | 'SoftConstruct' | 'GitHub' | 'career';
  evidence: EvidenceLevel;
  /** false keeps it in the model but off the site — used for the 106K LOC figure */
  display: boolean;
};
```

```ts
// data/metrics.ts
export const metrics: Metric[] = [
  { id: 'modules',   value: 50,  prefix: '~', labelKey: 'metrics.modules',   source: 'ActualSolutions', evidence: 'fact', display: true },
  { id: 'endpoints', value: 190, suffix: '+', labelKey: 'metrics.endpoints', source: 'ActualSolutions', evidence: 'fact', display: true },
  { id: 'services',  value: 36,               labelKey: 'metrics.services',  source: 'ActualSolutions', evidence: 'fact', display: true },
  { id: 'years',     value: 4,                labelKey: 'metrics.years',     source: 'career',          evidence: 'fact', display: true },
  // Real, but excluded from public copy — see ACHIEVEMENTS.md. Kept so the decision is visible, not forgotten.
  { id: 'loc',       value: 106_000,          labelKey: 'metrics.loc',       source: 'ActualSolutions', evidence: 'unverified', display: false },
];
```

> `display: false` is the mechanism that keeps the audit's exclusions enforced **in code**. A future edit that wants the LOC figure back has to consciously flip a flag that sits next to `evidence: 'unverified'`.

## 3. Experience

```ts
export type EmploymentType = 'full-time' | 'internship' | 'contract';
export type WorkMode = 'onsite' | 'hybrid' | 'remote';

export type ExperienceEntry = {
  id: string;
  company: string;
  companyUrl?: string;
  /** Content key → role title, per locale */
  roleKey: string;
  type: EmploymentType;
  mode: WorkMode;
  location: string;
  start: string;              // 'YYYY-MM' — duration is computed, never hardcoded
  end: string | null;         // null = present
  product?: { name: string; url?: string; publicDescription: boolean };
  /** Content keys for bullets */
  highlightKeys: string[];
  technologies: string[];     // must exist in data/skills.ts
  featured: boolean;          // drives visual weight in the timeline
  evidence: EvidenceLevel;
};
```

Durations are derived at render from `start`/`end`. Nothing on the site can drift out of date, and "7 mos" is never wrong the month after it ships.

## 4. Skills

```ts
export type SkillDepth = 'core' | 'strong' | 'working' | 'familiar';

export type SkillGroupId =
  | 'frontend' | 'state-data' | 'architecture'
  | 'ai-engineering' | 'tooling-infra' | 'design';

export type Skill = {
  id: string;
  name: string;                 // proper noun — not translated
  depth: SkillDepth;
  usageKey: string;             // "what I use it for", per locale
  evidence: Array<'ActualSolutions' | 'SoftConstruct' | 'SmartCode' | 'GitHub' | 'EdEl'>;
  /** true for Next.js — surfaced in the UI as "personal projects" */
  personalOnly?: boolean;
};

export type SkillGroup = {
  id: SkillGroupId;
  labelKey: string;
  skills: Skill[];
};
```

Two invariants, asserted in unit tests:

1. **Every skill has at least one evidence source.** A skill with `evidence: []` fails the build's test gate — this is the mechanism that keeps "Full-Stack Development" off the site.
2. **Every technology named in `ExperienceEntry.technologies` or `Project.technologies` exists in `skills.ts`.** No orphan tech names.

## 5. Projects

```ts
export type ProjectCategory =
  | 'enterprise-fintech' | 'engineering-practice'
  | 'architecture-study' | 'public-build';

export type ProjectTier = 'commercial' | 'public';

export type Project = {
  slug: string;
  tier: ProjectTier;
  category: ProjectCategory;
  featured: boolean;
  hasCaseStudy: boolean;

  company?: string;
  roleKey: string;
  year: string;                 // '2026' | '2023–2025'

  technologies: string[];
  links?: { github?: string; live?: string; note?: string };

  /** Content keys — every one resolved in all three locales */
  content: {
    titleKey: string;
    shortDescriptionKey: string;
    overviewKey?: string;
    problemKey?: string;
    contextKey?: string;
    roleDetailKey?: string;
    architectureKey?: string;
    challengeKeys?: string[];
    resultKeys?: string[];
    lessonsKey?: string;
  };

  /** Inline SVG diagram component id, resolved from a registry */
  diagram?: 'fsd-layers' | 'mk-kredit-architecture' | 'ai-workflow-pipeline';

  images?: Array<{ src: string; altKey: string; width: number; height: number }>;
  evidence: EvidenceLevel;
  /** Blocks case-study rendering until the audit item is resolved */
  blockedBy?: string;
};
```

`springbme` ships with `hasCaseStudy: false` and `blockedBy: 'PROFILE.md §2.2 — no public description'`. The card renders; the case-study route returns 404 until the blocker clears. **The blocker is data, not a TODO comment.**

## 6. Remaining types

```ts
export type EducationEntry = {
  id: string; institution: string; institutionUrl?: string;
  fieldKey: string; start: string; end: string; location: string;
};

export type Certification = {
  id: string; nameKey: string; issuer: string; issued: string;
  credentialId?: string; credentialUrl?: string;
  /** false → collapsed into the muted Sololearn line (EDUCATION.md) */
  primary: boolean;
};

export type LanguageProficiency = {
  code: Locale | string;
  nameKey: string;
  level: 'native' | 'full-professional' | 'professional' | 'limited' | 'elementary';
};

export type Achievement = {
  id: string; textKey: string;
  source: ExperienceEntry['id'] | 'career';
  evidence: EvidenceLevel; display: boolean;
};

export type SocialLink = {
  id: 'linkedin' | 'github' | 'telegram' | 'email';
  url: string; labelKey: string; icon: string; primary: boolean;
};

export type NavItem = { id: string; href: string; labelKey: string };
```

## 7. Content files

```jsonc
// content/en.json  (ru.json and hy.json share the exact shape)
{
  "meta":    { "home": { "title": "…", "description": "…" } },
  "nav":     { "about": "About", "experience": "Experience", "…": "…" },
  "hero":    { "headline": "…", "sub": "…", "ctaPrimary": "…", "ctaSecondary": "…" },
  "metrics": { "modules": "business modules", "endpoints": "API endpoints", "…": "…" },
  "experience": {
    "actualsolutions": {
      "role": "Software Engineer",
      "highlights": ["…", "…"]
    }
  },
  "projects": {
    "mk-kredit": { "title": "…", "shortDescription": "…", "overview": "…", "challenges": ["…"] }
  },
  "skills":  { "groups": { "frontend": "Frontend" }, "usage": { "react": "…" } },
  "contact": { "…": "…" },
  "a11y":    { "skipLink": "…", "sceneDescription": "…" }
}
```

**Type safety across locales.** `en.json` is the canonical shape:

```ts
type Messages = typeof import('@/content/en.json');
declare global { interface IntlMessages extends Messages {} }
```

`next-intl` then type-checks every `t('…')` call, and a missing key in `ru` or `hy` is a **compile error**, not a runtime `undefined`. This is what makes the "no placeholder translations" requirement enforceable rather than aspirational.

## 8. Validation gates

Run in unit tests; failure blocks the build.

1. Every content key referenced from `data/` resolves in **all three** locales.
2. No locale file contains an empty string or a value identical to the English source (catches untranslated stubs).
3. Every `Skill.evidence` array is non-empty.
4. Every technology in experience/projects exists in `skills.ts`.
5. Every `Project.slug` is unique, kebab-case, and matches its content key.
6. No `ExperienceEntry.start` is after its `end`; at most one entry has `end: null`.
7. Every metric with `evidence: 'unverified'` has `display: false`.
8. Every image has non-empty `altKey` and explicit dimensions.

## 9. Updating the site later

| Change | Edit |
|---|---|
| New job | one object in `data/experience.ts` + three content blocks |
| New project | one object in `data/projects.ts` + three content blocks |
| New technology | one object in `data/skills.ts` (evidence required) |
| Metric changed | one number in `data/metrics.ts` |
| Publish a blocked case study | delete `blockedBy`, set `hasCaseStudy: true` |
| New locale | one JSON file + one entry in `config/i18n.ts` |

No JSX is touched in any row. That is the requirement, and the type system enforces it.
