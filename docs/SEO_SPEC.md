# SEO_SPEC.md

Production technical SEO for a trilingual personal site. Target: `https://petrosyanserg.vercel.app` (placeholder — a single constant in `config/site.ts`, swapped when a custom domain lands).

---

## 1. What this site is actually optimising for

A portfolio does not win generic head terms, and chasing them wastes effort. Three realistic goals, in order:

1. **Brand search** — "Sergey Petrosyan", "petrosyanSerg", "Սերգեյ Պետրոսյան". A recruiter who has his CV searches his name. This site must own that SERP, above and beside LinkedIn and GitHub.
2. **Long-tail role search** — "React TypeScript developer Yerevan", "frontend engineer Armenia", "фронтенд разработчик Ереван". Low volume, extremely high intent.
3. **Machine readability** — LLM-driven candidate search and AI recruiter tooling now read pages directly. Clean semantics and correct JSON-LD are how a profile gets summarised accurately rather than guessed at.

Goal 1 is the one that matters, and it is winnable.

---

## 2. Metadata

```ts
// config/site.ts
export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://petrosyanserg.vercel.app',
  name: 'Sergey Petrosyan',
  twitter: undefined,        // no X account — omit rather than invent
} as const;
```

Root layout:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Sergey Petrosyan — Software Engineer',
    template: '%s · Sergey Petrosyan',
  },
  authors: [{ name: 'Sergey Petrosyan', url: site.url }],
  creator: 'Sergey Petrosyan',
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  formatDetection: { email: false, telephone: false },
};
```

`metadataBase` is set once — without it every relative OG image URL silently resolves wrong in production.

### Per-route

| Route | Title (en) | Description (en) |
|---|---|---|
| `/en` | Sergey Petrosyan — Software Engineer, Enterprise Frontend Architecture | Software engineer in Yerevan building enterprise frontends for regulated financial software. React 19, TypeScript, Feature-Sliced Design, AI-native development. |
| `/en/projects` | Projects | Enterprise fintech frontend architecture, AI-native engineering workflows, and public React and TypeScript builds. |
| `/en/projects/mk-kredit` | MK Kredit — Enterprise leasing & credit platform | How a greenfield React 19 and TypeScript frontend grew into ~50 business modules covering a full leasing lifecycle, on Feature-Sliced Design. |
| `/en/projects/ai-native-workflow` | AI-Native Development Workflow | Agentic development with Claude Code, spec-driven implementation and human-in-the-loop validation on a regulated fintech codebase. |
| `/en/resume` | Resume | Experience, technical skills and education. Available as PDF. |

Every title and description is authored per locale in `content/{locale}.json` — **never machine-translated at build time**.

**Rules:** titles ≤60 characters before the template suffix; descriptions 140–160 characters, written to be read by a human rather than stuffed; every page has a unique pair; no keyword lists.

---

## 3. Canonical and hreflang

```ts
alternates: {
  canonical: `${site.url}/${locale}${path}`,
  languages: {
    en: `${site.url}/en${path}`,
    ru: `${site.url}/ru${path}`,
    hy: `${site.url}/hy${path}`,
    'x-default': `${site.url}/en${path}`,
  },
}
```

- Self-referencing canonical on every page, absolute, no trailing slash, no query strings.
- **hreflang is reciprocal and self-inclusive** — each locale lists all three plus `x-default`. Non-reciprocal hreflang is discarded by Google, and it is the most common reason multilingual sites fail to rank in secondary languages.
- `x-default` → `en`.

---

## 4. Structured data (JSON-LD)

Generated from typed data in `lib/jsonld.ts` and injected via a single `<script type="application/ld+json">`. **Never hand-written**, so it can never drift from the site's own content.

### `Person` — root, every page

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://petrosyanserg.vercel.app/#person",
  "name": "Sergey Petrosyan",
  "givenName": "Sergey",
  "familyName": "Petrosyan",
  "jobTitle": "Software Engineer",
  "description": "Software engineer building enterprise frontends for regulated financial software.",
  "url": "https://petrosyanserg.vercel.app",
  "email": "mailto:petrosyanserg33@gmail.com",
  "address": { "@type": "PostalAddress", "addressLocality": "Yerevan", "addressCountry": "AM" },
  "worksFor": { "@type": "Organization", "name": "ActualSolutions", "url": "https://www.actualsolutions.am" },
  "alumniOf": [{ "@type": "EducationalOrganization", "name": "Yerevan State College of Informatics" }],
  "knowsLanguage": [
    { "@type": "Language", "name": "Armenian", "alternateName": "hy" },
    { "@type": "Language", "name": "Russian",  "alternateName": "ru" },
    { "@type": "Language", "name": "English",  "alternateName": "en" }
  ],
  "knowsAbout": [
    "React", "TypeScript", "Frontend Architecture", "Feature-Sliced Design",
    "Enterprise Software", "AI-Native Development", "Agentic Development", "Fintech"
  ],
  "sameAs": [
    "https://www.linkedin.com/in/petrosyanserg",
    "https://github.com/petrosyanSerg"
  ]
}
```

> `sameAs` is the highest-leverage line in this document. It is how a search engine connects this domain to the LinkedIn and GitHub profiles that already rank for his name, and it is what makes goal 1 achievable. **`sameAs` must only contain profiles he actually controls** — a wrong entry corrupts entity resolution.
>
> `knowsAbout` deliberately omits anything the audit excluded. No "Full-Stack Development", no Node.js. Structured data is a machine-readable claim, and it should not claim more than the prose does.

### Per route

| Route | Types |
|---|---|
| All | `Person`, `WebSite` (with `inLanguage`) |
| `/[locale]` | `ProfilePage` → `mainEntity: Person` |
| `/[locale]/projects` | `CollectionPage`, `BreadcrumbList` |
| `/[locale]/projects/[slug]` | `CreativeWork` (or `SoftwareApplication` where it genuinely is one), `BreadcrumbList` |
| `/[locale]/resume` | `ProfilePage`, `BreadcrumbList` |

**Deliberately not used:** `JobPosting` (he is not hiring), `Organization` for himself (he is a person), `Review`/`AggregateRating` (fabricating these is a manual-action risk and a lie).

`WebSite` includes `inLanguage` per locale and links to `Person` via `@id`, so the three locale trees resolve to one entity rather than three.

**Validation gate:** every route × locale is checked against the Rich Results Test before launch; JSON-LD generation is unit-tested against the typed profile.

---

## 5. Sitemap and robots

```ts
// app/sitemap.ts — generated from routing + data, never hand-maintained
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.flatMap(route =>
    locales.map(locale => ({
      url: `${site.url}/${locale}${route.path}`,
      lastModified: route.lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: Object.fromEntries(
        locales.map(l => [l, `${site.url}/${l}${route.path}`])
      )},
    }))
  );
}
```

Every locale of every route is listed, each with `xhtml:link` alternates — hreflang declared in *both* the head and the sitemap, which is what Google recommends and what makes the signal robust.

| Route | Priority | Change frequency |
|---|---|---|
| Home | 1.0 | monthly |
| Case studies (featured) | 0.9 | monthly |
| Projects index | 0.8 | monthly |
| Resume | 0.8 | monthly |
| Public builds | 0.6 | yearly |

```
# robots.txt
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://petrosyanserg.vercel.app/sitemap.xml
```

No AI-crawler blocks. Goal 3 in §1 is the whole reason — being readable by LLM-driven recruiter tooling is an advantage here, not a threat.

---

## 6. OpenGraph and social

Generated at build with `next/og` (`ImageResponse`) — **not** static PNGs, so they never drift from the content.

- **Size:** 1200×630, `og:image:alt` set, per locale
- **Home:** name, positioning line, the three metrics in mono, subtle accent gradient on the dark ground
- **Case study:** project title, company, technology row
- **Design:** brand tokens; text large enough to read as a thumbnail in a chat client — the real viewing size
- **Fonts:** Inter + JetBrains Mono loaded as buffers in the OG route

```ts
openGraph: {
  type: 'profile', siteName: 'Sergey Petrosyan',
  locale: ogLocale, alternateLocale: otherOgLocales,
  images: [{ url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt }],
},
twitter: { card: 'summary_large_image', title, description, images: [...] },
```

No `twitter:creator` — he has no X account, and inventing one breaks the card.

---

## 7. Icons and manifest

Generated via `app/icon.tsx` and `app/apple-icon.tsx` — a monogram in brand tokens. Plus `manifest.webmanifest`: name, short name, `theme_color: #0A0B0F`, `background_color: #0A0B0F`, `display: standalone`, 192/512 icons, maskable variant, `lang` per default locale.

(He built PWA capability into MK Kredit; the site should not be less careful than his production work.)

---

## 8. On-page

**Heading hierarchy** — exactly one `<h1>` per page (the hero headline on home; the project title on a case study). No level skipped. Headings describe content, never style.

**Semantics** — `<header>`, `<nav aria-label>`, `<main>`, `<section aria-labelledby>`, `<article>` for case studies, `<footer>`. `<time datetime>` for every date. `<address>` for location.

**Internal linking** — hero → featured case studies; every case study → two related projects and back to the index; the experience timeline → the case study for each role's product; the footer → every locale of the current page. Descriptive anchor text always: "MK Kredit case study", never "read more", never "click here".

**Images** — `next/image`, AVIF/WebP, explicit dimensions (CLS), `priority` only on the hero, descriptive translated `alt`. Decorative images get `alt=""`; the 3D canvas is `aria-hidden` with a text alternative.

**URLs** — lowercase, kebab-case, no dates, no IDs, stable. A case-study slug is permanent once shipped.

---

## 9. Keywords — used honestly

Placed in headings, prose and metadata **only where they describe reality**. No `<meta name="keywords">` (ignored since 2009). No keyword blocks, no hidden text, no repetition padding.

| Locale | Primary | Secondary |
|---|---|---|
| en | software engineer Yerevan · React TypeScript developer Armenia · frontend architecture · enterprise frontend engineer | Feature-Sliced Design · AI-native development · fintech frontend · Next.js developer Armenia |
| ru | фронтенд разработчик Ереван · React TypeScript разработчик · архитектура фронтенда | Feature-Sliced Design · разработка с ИИ · финтех фронтенд |
| hy | ծրագրավորող Երևան · React TypeScript ծրագրավորող · frontend ճարտարապետություն | AI ծրագրավորում · fintech frontend |

**"Feature-Sliced Design" and "AI-native development" are the differentiating terms.** They are low-competition, high-intent, and — critically — *true*. Ranking for them brings exactly the people who should be reading this.

---

## 10. Performance as SEO

Core Web Vitals are a ranking input, and the targets in `WEBSITE_SPEC.md` §9 are the SEO plan as much as the performance plan: LCP <2.0s (server-rendered hero text, never the 3D canvas), CLS <0.05 (explicit dimensions, `next/font` swap, no injected banners), INP <200ms (minimal client JS, no blocking third parties).

---

## 11. Launch checklist

- [ ] `NEXT_PUBLIC_SITE_URL` set to the real production domain
- [ ] `metadataBase` resolving; no relative OG URLs in the built HTML
- [ ] Unique title + description on every route × locale
- [ ] Self-referencing canonical everywhere
- [ ] hreflang reciprocal, self-inclusive, with `x-default`
- [ ] JSON-LD validates in the Rich Results Test on every route
- [ ] `sameAs` contains only verified, controlled profiles
- [ ] `sitemap.xml` lists 3 locales × all routes with alternates
- [ ] `robots.txt` reachable, references the sitemap
- [ ] OG images render for every route × locale, text legible at thumbnail size
- [ ] Icons, apple-icon and manifest present
- [ ] One `<h1>` per page; no skipped heading levels
- [ ] Every image has translated alt and explicit dimensions
- [ ] Lighthouse SEO ≥95 on every route
- [ ] Submitted to Google Search Console; all three locales indexed
- [ ] Verify the site outranks nothing false — no page claims anything the audit excluded
