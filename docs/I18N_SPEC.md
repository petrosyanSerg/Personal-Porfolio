# I18N_SPEC.md

Three locales, all first-class: **English (`en`, default)**, **Russian (`ru`)**, **Armenian (`hy`)**.

> ⚠️ **Strategic caveat, carried from the audit.** LinkedIn declares English at *elementary* proficiency (`PROFILE.md` §5.4). English is still the correct default — it is where reach and recruiter traffic live — but if that rating is accurate, **Armenian and Russian are where he actually converts**. That is why this spec treats all three as equal-quality builds rather than treating `ru` and `hy` as translations of an English original. If the English rating turns out to be stale, nothing here changes.

---

## 1. Library and routing

**next-intl**, App Router integration. Chosen over `next-i18next` (Pages-only) and hand-rolled routing because it resolves messages **on the server** — translated strings never enter the client bundle, which matters when three locales are in play.

```
localePrefix: 'always'
defaultLocale: 'en'
locales: ['en', 'ru', 'hy']
```

```
/            → 308 redirect → /en
/en          /en/projects  /en/projects/mk-kredit  /en/resume
/ru          /ru/projects  /ru/projects/mk-kredit  /ru/resume
/hy          /hy/projects  /hy/projects/mk-kredit  /hy/resume
```

**Why `always`.** A bare `/` serving English and `/ru` serving Russian gives one URL two identities, muddles canonicals, and makes `x-default` ambiguous. Prefixing every locale means one URL, one language, one canonical — and hreflang that a crawler cannot misread. The 308 from `/` costs one redirect on first visit and is worth it.

**Slugs stay identical across locales** (`/hy/projects/mk-kredit`, not `/hy/projects/մկ-կրեդիտ`). Localised slugs would fragment link equity and complicate the language switcher for no SEO gain on a site this size.

**No automatic locale redirect from `Accept-Language`.** It hijacks shared links and breaks crawling. Instead, if the header suggests a locale other than the one being viewed, a dismissible inline banner offers the switch once, remembered in `localStorage`.

---

## 2. File layout

```
src/
├── config/i18n.ts          locales, default, labels, native names, dir
├── i18n/
│   ├── routing.ts          defineRouting()
│   ├── request.ts          getRequestConfig() — loads content/{locale}.json
│   └── navigation.ts       typed Link, useRouter, usePathname, redirect
├── middleware.ts           next-intl middleware
└── content/
    ├── en.json             canonical shape
    ├── ru.json
    └── hy.json
```

```ts
// config/i18n.ts
export const locales = ['en', 'ru', 'hy'] as const;
export const defaultLocale = 'en' satisfies Locale;

export const localeMeta = {
  en: { label: 'English',  native: 'English',  htmlLang: 'en', dir: 'ltr', ogLocale: 'en_US' },
  ru: { label: 'Russian',  native: 'Русский',  htmlLang: 'ru', dir: 'ltr', ogLocale: 'ru_RU' },
  hy: { label: 'Armenian', native: 'Հայերեն',  htmlLang: 'hy', dir: 'ltr', ogLocale: 'hy_AM' },
} as const;
```

Each locale is named **in its own script** in the switcher. A Russian speaker looks for "Русский", not "Russian".

---

## 3. What is translated, and what is not

| Translated | Never translated |
|---|---|
| Navigation, hero, all section copy | Company names — ActualSolutions, SoftConstruct, SmartCode, EdEl Photostudio |
| Role titles, experience bullets | Product names — MK Kredit, SpringBME |
| Project titles, overviews, problems, challenges, results | Technology names — React, TypeScript, Vite, TanStack Query, Docker |
| Skill "what I use it for" descriptions | Architecture terms — Feature-Sliced Design, PWA, JWT |
| Contact copy, form labels, validation messages | His own name |
| All metadata — titles, descriptions, OG | URLs and slugs |
| `alt` text and accessibility strings | Certification credential IDs |
| Dates and durations (formatted, not stored) | Metric digits (formatted per locale, not translated) |

**The rule:** proper nouns and technology names stay in Latin script in every locale. Transliterating "TanStack Query" into Armenian helps nobody and destroys keyword value. Surrounding prose is fully translated.

---

## 4. Translation quality

**No placeholder translations. No machine output shipped unreviewed.** This is a hard requirement — and given the audience, a self-evident one: a Russian-speaking recruiter reading obviously machine-translated Russian on a site whose entire claim is engineering rigour draws exactly the wrong conclusion.

Practical standard for `ru` and `hy`:

1. **Translate meaning, not sentences.** English marketing rhythm does not survive a literal pass into Russian. "Enterprise frontends that hold their shape" becomes an idiomatic equivalent, not a calque.
2. **Keep technical register.** Armenian and Russian developer communities use the English term for most technology concepts. Write the way engineers in Yerevan actually speak — mixed register is correct here, not a compromise.
3. **Sergey reviews `ru` and `hy` personally before launch.** He is native/fluent in both; he is the reviewer. This is the one part of the build he must do himself.
4. Validation gate #2 in `DATA_MODEL.md` §8 fails the build if a `ru` or `hy` value is byte-identical to its English source — which catches forgotten stubs automatically.

---

## 5. Metadata per locale

Every page produces localised `title`, `description`, OpenGraph and JSON-LD. Full spec in `SEO_SPEC.md`.

```tsx
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.home' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        'en': `${SITE_URL}/en`,
        'ru': `${SITE_URL}/ru`,
        'hy': `${SITE_URL}/hy`,
        'x-default': `${SITE_URL}/en`,
      },
    },
    openGraph: {
      locale: localeMeta[locale].ogLocale,
      alternateLocale: otherLocales.map(l => localeMeta[l].ogLocale),
    },
  };
}
```

**hreflang is reciprocal and complete** — every locale of a page lists every other locale *and itself*, plus `x-default` → `en`. Non-reciprocal hreflang is silently ignored by Google, which is the most common way multilingual SEO fails.

---

## 6. Typography and layout under translation

This is where multilingual sites usually break, and it is a design problem, not a translation one.

| Issue | Handling |
|---|---|
| **Armenian glyph coverage** | Inter has none. `Noto Sans Armenian` is in the font stack and subset-loaded for `hy` (`DESIGN_SYSTEM.md` §2). |
| **Armenian runs ~12% wider; Russian ~10–15% wider than English** | No fixed-width containers around text. Buttons and nav items size to content with `min-width`, never fixed `width`. |
| **Display headlines** | The hero H1 is the highest risk — it is the largest type on the site. Each locale's headline is written to a **character budget**, not translated to arbitrary length. Verified at 320px in all three. |
| **Armenian ascenders/descenders** | Taller than Latin. `--lh-tight: 0.98` clips Armenian display type — the `hy` locale bumps display line-height to `1.06` via a `[lang="hy"]` rule. |
| **Cyrillic in mono** | JetBrains Mono covers Cyrillic. Armenian in mono has no good option — but mono is only used for technology names and digits, which stay Latin. Not an issue by construction. |
| **Number formatting** | `Intl.NumberFormat(locale)` — `190+` renders correctly everywhere; large numbers get locale-appropriate separators. |
| **Date formatting** | `Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short' })`. Never hand-formatted. |
| **Durations** | Computed from `start`/`end` and formatted via `next-intl` plurals — Russian has three plural forms (`one`/`few`/`many`), which ICU handles and naive string concatenation does not. |

**Verification:** a Playwright visual check renders the hero and each section at 320px, 768px and 1440px in all three locales, asserting no horizontal overflow and no clipped text. Layout that only works in English is a bug, not a nuance.

---

## 7. Language switcher

- Header, beside the theme toggle; a glass dropdown (`DESIGN_SYSTEM.md` §7)
- Each locale in its own script; current marked `aria-current="true"`
- **Switching preserves the current path and hash** — `/en/projects/mk-kredit` → `/hy/projects/mk-kredit`, not back to the home page. Losing the reader's position on switch is the single most common i18n UX failure.
- Real `<a href>` elements, so crawlers follow them and middle-click works
- Choice persisted in a `NEXT_LOCALE` cookie; the cookie **never** triggers an automatic redirect (see §1)

---

## 8. Definition of done

- [x] Three locale files, identical shape, zero missing keys (compile-enforced) — 303 keys each
- [x] No value in `ru`/`hy` identical to its English source — asserted by test
- [x] `ru` and `hy` reviewed by Sergey — `hy.json` was **written** by him, not reviewed after the fact
- [x] `<html lang>` correct per locale — asserted by test
- [x] Reciprocal hreflang + `x-default` on every route — asserted by test
- [x] Localised metadata, OG and JSON-LD on every route
- [x] Sitemap lists all locales of all routes with `xhtml:link` alternates
- [x] No layout overflow at 320px in any locale — asserted at 320 / 375 / 390 / 768 / 1024 / 1440
- [x] Armenian renders in Noto Sans Armenian, not a fallback serif
- [x] Switcher preserves path; no automatic redirect — asserted by test
- [x] Dates, numbers and plurals formatted through `Intl` / ICU

---

## 9. As built

Armenian shipped last, after the other two, and the sequence is worth recording because it is the argument this spec was making.

The Armenian file in the repo is **Sergey's own**, written over a draft. §6 of this spec said mixed register is correct — Armenian prose around Latin technical vocabulary — and the file he wrote confirms it in his own voice: `enterprise frontend-ներ`, `React-ում composition և reuse pattern-ների`. A spec can predict that convention; only a native speaker can apply it.

The stub-detection gate then did the job it exists for. It flagged `projects.react-patterns.shortDescription`, one sentence out of 303 left in English — invisible to a reader skimming a wall of Armenian, and exactly the kind of thing that ships. The exemption list in `tests/unit/data-integrity.test.ts` is deliberately explicit (individual keys plus four narrow prefix patterns for socials, certifications, and project and role titles) rather than a broad "ignore anything with Latin characters" rule, because the broad rule would have let that sentence through.

Verified end to end: `/hy`, `/hy/projects`, `/hy/projects/mk-kredit`, `/hy/projects/ai-native-workflow`, `/hy/resume` and `/hy/opengraph-image` all build and render, with **zero axe violations on desktop and mobile**.
