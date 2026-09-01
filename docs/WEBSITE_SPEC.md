# WEBSITE_SPEC.md

The technical and structural specification. Content lives in `CONTENT_SPEC.md`, visuals in `DESIGN_SYSTEM.md`, data shapes in `DATA_MODEL.md`.

---

## 1. Objective

A recruiter, CTO or engineering manager must understand within 10–20 seconds:

1. He is a software engineer who owns **enterprise frontend architecture**
2. In **regulated financial software** (leasing and credit)
3. Using **React 19 and TypeScript**
4. Working **AI-native**, as practice rather than buzzword
5. At real scale — `~50 modules`, `190+ endpoints`, `36 API services`
6. And the site itself is evidence he can build this

The site is not a template with his name in it. It is a demonstration.

---

## 2. Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 16**, App Router | RSC, streaming, first-class metadata and i18n routing |
| Language | **TypeScript**, `strict: true` | Non-negotiable — it's the positioning |
| Styling | **SCSS Modules + CSS custom properties** | Explicitly required; no Tailwind |
| i18n | **next-intl** | The best-supported App Router i18n; server-side, no client bundle for strings |
| UI motion | **`IntersectionObserver` + CSS transitions** | *Revised at build time.* Framer Motion was specified and then removed: ~37 KB gzipped bought one fade-and-rise and one media query, both of which are a few lines of CSS. See §9. |
| Scroll motion | **CSS `position: sticky` + `IntersectionObserver`** | *Revised at build time.* GSAP ScrollTrigger was specified for the pinned architecture section; sticky positioning produced the same sequence for 0 KB and degrades to a readable list without JS. |
| 3D | **three.js + @react-three/fiber** | Required; R3F keeps the scene declarative and disposable. `@react-three/drei` was specified but nothing in the scene used it, so it is not a dependency. |
| Post-processing | **None** | Bloom was specified for capable devices. The core is line work, and bloom's whole effect is to soften edges — it blurred exactly the thing that makes the diagram read as a drawing, and cost a second render target for it. |
| Pointer motion | **One rAF loop writing CSS custom properties** | *Added in the interaction pass.* Flashlight, cursor, card spotlights and magnetic buttons all read `--pointer-*`, `--cursor-*`, `--spot-*`, `--magnet-*`. No component re-renders on movement, and the loop parks when the cursor settles. Zero dependencies. |
| Theme transition | **View Transitions API, progressively** | The palette lives in custom properties, so a theme change is one attribute write. Where the browser has `startViewTransition`, the new theme wipes in from the control that was pressed; where it does not, the same write happens with a colour crossfade. The persistence is outside the transition. |
| Forms | **react-hook-form + zod** | Mirrors his production stack — the site should use what he claims |
| Email | **Resend** via a route handler | Chosen in Phase 0 |
| Testing | **Vitest + Testing Library**, **Playwright** | |
| Lint/format | ESLint (flat config) + Prettier + `stylelint` | |
| Hosting | **Vercel** | |

**Deliberately excluded:** Tailwind (prohibited), any CSS-in-JS runtime (defeats RSC), a CMS (content is typed data, and that is the point), analytics on launch (add later with consent).

> **Bundle discipline.** This clause said that if the animation budget were exceeded, GSAP would be dropped for CSS scroll-driven animation. It was exceeded, and both libraries were dropped rather than one. The initial bundle came in at **289 KB against a 160 KB budget**; removing Framer Motion (~37 KB) and lazy-mounting the contact form (~95 KB) brought it to **157 KB**. The escape hatch in this spec was the right one — it is recorded here as exercised, not as available.

---

## 3. Routes

```
/                          → redirect to /en
/[locale]                  Home
/[locale]/projects         Project index
/[locale]/projects/[slug]  Case study
/[locale]/resume           Resume page + PDF download
/[locale]/not-found        404
```

`locale ∈ { en, ru, hy }`, `en` default, prefix always present (`localePrefix: 'always'`) — cleanest hreflang and no ambiguous root.

Generated: `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/opengraph-image` per route, `/icon`, `/apple-icon`.

**Rendering:** every page is statically generated (`generateStaticParams` over locales × slugs). Only `/api/contact` is dynamic. No page depends on a request-time fetch.

---

## 4. Home sections

| # | Section | Purpose | Notes |
|---|---|---|---|
| 1 | **Hero** | Nameplate → headline → sub → spec line → CTAs, over a full-bleed system diagram | Server-rendered text; the diagram lazy-mounts behind it and is masked out from under the type. Text is never inside the canvas. |
| 2 | **Proof bar** | `~50 modules` · `190+ endpoints` · `36 services` · `4 yrs` | Mono, count-up on reveal |
| 3 | **About** | The story: regulated fintech, architecture, AI-native | Prose + portrait placeholder |
| 4 | **Experience** | Interactive timeline, 4 roles | Rail + nodes; expandable detail |
| 5 | **Architecture** ⭐ | **Scroll-pinned FSD explainer** — layers reveal in sequence as you scroll | The signature section. Sticky positioning + `IntersectionObserver`; no animation library. |
| 6 | **AI-Native Engineering** ⭐ | The differentiator: context → spec → generation → validation → merge | Animated inline-SVG pipeline diagram |
| 7 | **Tech Stack** | 6 groups, each item with depth + "what I use it for" | Filterable by group. No naked logo wall. |
| 8 | **Projects** | Featured case studies + public builds, honestly separated | Cards → case-study pages |
| 9 | **Journey** | Design → engineer → architect | Short; sells the trajectory |
| 10 | **Contact** | Form + direct channels | RHF + Zod, Resend |
| 11 | **Footer** | Links, locales, theme, build info | |

Sections 5 and 6 carry the positioning. If time is short, they are the last things cut.

---

## 5. Component architecture

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx            html/body, fonts, theme, providers
│   │   ├── page.tsx              home (composes sections)
│   │   ├── projects/page.tsx
│   │   ├── projects/[slug]/page.tsx
│   │   ├── resume/page.tsx
│   │   ├── opengraph-image.tsx
│   │   └── not-found.tsx
│   ├── api/contact/route.ts
│   ├── sitemap.ts  robots.ts  manifest.ts  icon.tsx
├── components/
│   ├── ui/          Button Card Tag Metric SectionHeader Container Prose Reveal
│   ├── layout/      Header Nav Footer LocaleSwitcher ThemeToggle SkipLink
│   ├── sections/    Hero ProofBar About Experience Architecture AiWorkflow
│   │                TechStack Projects Journey Contact
│   ├── three/       SystemMount SystemScene SystemField SystemFallback
│   │                systemGeometry
│   ├── animations/  Reveal Stagger Parallax MagneticButton CountUp TextReveal
│   ├── projects/    ProjectCard CaseStudyHeader ArchitectureDiagram Challenges
│   └── icons/
├── content/         en.json  ru.json  hy.json        (UI strings)
├── data/            profile.ts experience.ts projects.ts skills.ts
│                    socials.ts navigation.ts metrics.ts
├── lib/             seo.ts jsonld.ts locale.ts format.ts cn.ts env.ts
├── hooks/           useMediaQuery useInView useScrollProgress usePointerFine
├── types/           profile.ts project.ts experience.ts skill.ts i18n.ts
├── config/          site.ts  i18n.ts  routing.ts
└── styles/          (see DESIGN_SYSTEM.md §8)
```

**As built.** Close to the plan, with the differences worth naming:

- `components/effects/` was not in this tree and now holds the environment: `Atmosphere` (the one pointer client), `CinematicBackground` (a **server** component — every layer is CSS driven by `--atmos-*` variables, so it costs no JavaScript and switching themes mounts nothing), and `ScrollProgress`.
- `MagneticButton` shipped as `ui/Magnetic` — a wrapper around any control rather than a button variant, because the same pull is wanted on a link. `Spotlight` joined it for the same reason.
- `usePointerFine` and `useScrollProgress` were anticipated here and exist as `useFinePointer` and the loop inside `ScrollProgress`; `usePointerAmbience` and `useActiveSection` were added.
- `Stagger`, `Parallax` and `TextReveal` were never built. Stagger is an `index` prop on `Reveal`; the hero entrance is four CSS animation delays and needs no component; parallax that earned its keep exists only in the 3D scene.
- `sections/SkillGroups` is the interactive half of the stack section, split out so the rest of that section stays server-rendered.
- The hero is four files, not one: `Hero` (server — all the type, the CTAs and the text alternative), `HeroStage` (client — module selection state and the readout), `HeroIntro` (client — the boot sequence) and `three/SystemMount` (client — the capability gate and the dynamic import).

**Rules**
1. **No personal information inside a component.** Everything renders from `data/` and `content/`. Changing a job title must never require touching JSX.
2. Sections are server components; interactivity is pushed into leaf client components.
3. `three/` is never imported statically anywhere — only via `next/dynamic`.
4. `data/` holds *structure* (dates, slugs, tech, links). `content/` holds *translatable strings*. They join by key. See `I18N_SPEC.md` §3.

---

## 6. Data → UI flow

```
data/*.ts  (typed, locale-independent: dates, slugs, tech, URLs, metrics)
        +
content/{locale}.json  (translatable prose, keyed by the same ids)
        ↓
lib/ resolvers  →  server components  →  rendered HTML
                                     ↓
                        client leaves (motion, 3D, form)
```

A project's `slug`, `technologies` and `year` live in `data/projects.ts` once. Its `title`, `overview` and `challenges` live three times, once per locale, under the same slug key. Adding a locale adds one JSON file and touches nothing else.

---

## 7. The 3D experience

### Concept — the system diagram

**As built, replacing the layered lattice this section originally specified.**

A **core** of six unjoined plates, stacked and drawn in line work, with **six modules** in orbit around it — one per technology group in `data/skills.ts` — each joined to the core by a single connection. Data pulses run along those connections **inward**, because capability flows into the product and not the other way round.

The modules are not decoration and not invented for the visual: they are the same six groups the tech stack section renders, every one of which must carry non-empty evidence to exist at all. Hovering one lights it and its connection; opening one leans the camera in and names its four strongest technologies. **The diagram is his stack, spatially.**

Three things were tried and cut, each for a reason worth keeping:

- **A boundary shell** (wireframe icosahedron). It read as random diagonals across the whole hero — the single most "generic Three.js demo" element in the scene.
- **Corner posts joining the plates.** They closed the silhouette and the core became a wireframe crate. Unjoined plates float, and floating is what makes them read as strata.
- **A strong downward taper.** With perspective it turned the stack into a cone. Six near-equal plates seen from slightly above are unambiguous.

Labels render as HTML in a readout beside the diagram, never as 3D text — legible, translatable, accessible, and free.

### Technical spec

| Aspect | Desktop | Reduced (coarse pointer) |
|---|---|---|
| Core | 6 plates, 24 line segments, 24 joint points | same |
| Modules | 6 `OctahedronGeometry(0.18)` in one `InstancedMesh` | same, non-interactive |
| Connections | one `LineSegments` with per-vertex colour | same |
| Pulses | 12, one `InstancedMesh` | 6 |
| Particles | 150 `Points` | 48 |
| Draw calls | **6** | 6 |
| DPR | `[1, 2]` adaptive | `[1, 1.5]` |
| Post-processing | none | none |
| Rotation | 0.055 rad/s | same |

**Hit testing** is a manual raycast from window pointer coordinates, not R3F's pointer events: the canvas is `pointer-events: none` because it lies underneath the headline and the calls to action, and must never swallow a click meant for them.

> **The bug worth recording.** three.js computes an `InstancedMesh`'s bounding sphere once, lazily, on the first raycast — which happens on the first frame, when every instance matrix is still identity and all six are sitting at the origin. The cached sphere is then a bubble around nothing, and every later hit test fails the broad-phase check before it looks at an instance. Hover never fires, silently, with no error. `boundingSphere` is now set explicitly to cover the ring.

> **Placement is a fraction of the viewport, not a world offset.** The same world offset lands in a different place at every aspect ratio: tuned at 1440 it sat clear of the type, and at 1280 it drifted back under the headline. The group is positioned per frame from `viewport.width`. The camera stays near the middle and does *not* aim at the group — an earlier version moved the camera right and pointed it at the diagram, and the two offsets cancelled exactly.
| Cursor parallax | ≤8px | disabled |
| `frameloop` | `'always'` → `'demand'` when off-screen | same |

**Performance rules — all mandatory**

1. `next/dynamic(..., { ssr: false })`, mounted only when the hero intersects the viewport.
2. **One** `InstancedMesh` for all nodes, **one** `LineSegments` buffer for all connections. No per-node meshes.
3. Geometries and materials created once in a `useMemo`; **disposed in a `useEffect` cleanup** — every geometry, material and texture, plus `renderer.dispose()`.
4. `IntersectionObserver` sets `frameloop="demand"` when the canvas leaves the viewport — zero GPU cost while reading the rest of the page.
5. Capability detection before mount: `navigator.hardwareConcurrency`, `deviceMemory`, `matchMedia('(pointer: fine)')`, WebGL2 support, and a `(max-width: 768px)` check → `'high' | 'medium' | 'low' | 'none'`.
6. `'none'` (no WebGL, or `save-data`) renders a **static SVG** of the same lattice. The section is never empty.
7. `prefers-reduced-motion` → render exactly one frame, then stop the loop. Not removed.
8. No shadow maps, no environment maps, no textures. Emissive materials and one key light.
9. Custom GLSL is limited to a single node shader (soft radial falloff + subtle time-based emissive pulse). Nothing that needs a fragment-heavy full-screen pass.
10. Hard budget: **the 3D chunk must stay under 180KB gzipped** and must never block LCP. LCP is the hero H1 — server-rendered text.

---

## 8. Accessibility

- Semantic landmarks: one `<h1>` per page, ordered headings, `<main>`, `<nav>`, `<footer>`
- Skip link, visible on focus, first in DOM
- Full keyboard path through every interactive element; the timeline and stack filters are arrow-key navigable
- `:focus-visible` never removed (`DESIGN_SYSTEM.md` §7)
- The canvas is `aria-hidden` with a text alternative describing the architecture it depicts
- Contrast gates enforced in the design tokens
- Form: labels bound to inputs, `aria-describedby` for errors, `aria-live="polite"` status region
- Locale switcher uses `aria-current`; `<html lang>` and `dir` set per locale
- Reduced motion honoured everywhere
- **Gate: zero axe-core violations on every route in every locale**, asserted in Playwright

---

## 9. Performance budgets

| Metric | Target | As built |
|---|---|---|
| Lighthouse Performance | ≥ 90 (mobile) | Verify on the deployed URL |
| Accessibility | ≥ 95 | axe-core clean on every route × locale, desktop and mobile |
| Best Practices / SEO | ≥ 95 | Verify on the deployed URL |
| LCP | < 2.0s | Verify on the deployed URL |
| CLS | < 0.05 | Verify on the deployed URL |
| INP | < 200ms | Verify on the deployed URL |
| Initial JS (home, gzip) | < 160KB | **70.4 KB** ✅ |
| 3D chunk (gzip) | < 180KB, lazy | **230.4 KB** ❌ — see below |

**As built.** Measured with `measure-bundle.mjs`, which drives a real browser at a production server and gzips each response body — not the build's per-chunk parsed sizes, which are a different and more flattering number. Run it with `--with-3d` for the second figure.

> **On the 157 KB previously recorded here.** That was the build output's "First Load JS", a parsed size. The transferred, gzipped figure is 70.4 KB across 9 files. Both are real; they measure different things, and this table is about what a visitor's connection actually carries, so the measured number is the one kept. Recording the discrepancy rather than silently swapping the figure is the point of the table.

The initial-JS budget is met with room to spare — including everything the interaction pass added, which cost roughly nothing because the flashlight, cursor, spotlights and magnetism are one rAF loop and a pile of CSS.

The 3D budget is not met, and the honest reading is that **the budget was wrong, not the code**: three.js is ~150 KB gzipped before a single line of scene code, and no configuration of a real WebGL scene fits in 180 KB. The chunk is lazy, desktop-only, mounted behind `next/dynamic` with `ssr: false`, and gated on `useDeviceCapability`, so it never touches the metrics this table exists to protect — LCP, CLS and INP are measured on a page that has not loaded it. The alternatives are to raise the budget to a number three.js can meet (≈240 KB) or to drop the 3D scene; the number is left wrong and annotated rather than quietly rewritten to whatever shipped.

**How they are met:** static generation everywhere; server components by default; self-hosted variable fonts with `unicode-range` subsetting and `display: swap` (see the deviation note below); AVIF/WebP via `next/image` with explicit dimensions; the 3D canvas dynamically imported; the contact form lazy-mounted (react-hook-form + Zod + resolvers is ~95 KB that a visitor who never scrolls to the form should not pay for); no animation library; no runtime CSS-in-JS; no third-party scripts at launch; `content-visibility: auto` on below-fold sections.

> **Fonts.** This spec said `next/font`. The build uses self-hosted `woff2` files with hand-written `@font-face` and explicit `unicode-range` instead, because `next/font/google` fetches from `fonts.googleapis.com` at build time — a network dependency in the build, and a third-party origin. The result is strictly better on both counts this document cares about: the build is hermetic, and an English visitor never downloads the Cyrillic or Armenian subsets.

---

## 10. Security

- `.env.example` committed; `.env*` git-ignored; **no secret ever in a `NEXT_PUBLIC_` variable**
- Env parsed and validated with Zod at startup (`lib/env.ts`) — the build fails loudly rather than deploying half-configured
- Contact route: Zod validation, honeypot field, timing check, in-memory rate limit (5/hour/IP), 2KB body cap
- No `dangerouslySetInnerHTML` except the JSON-LD `<script>`, whose payload is generated from typed data and `JSON.stringify`d
- CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` in `next.config.ts` headers
- No email address in plain text in the HTML source

---

## 11. Testing

**Unit (Vitest)** — SEO metadata builders, JSON-LD generation, locale resolution, contact schema validation, data-integrity assertions (every project slug has content in all three locales; every skill has evidence).

**Component (Testing Library)** — Reveal renders children with reduced motion; LocaleSwitcher marks the active locale; ProjectCard renders required fields; contact form surfaces validation errors.

**E2E (Playwright)** — the hero's six modules exist as real text and its headline is in the fetched HTML before any JavaScript runs; a module can be hovered, opened and counted, and Escape closes it without navigating; home loads and the H1 is correct in all three locales; navigation to a case study and back; language switching preserves the current path; the contact form validates and submits (mocked); reduced-motion emulation renders content without transforms; axe-core is clean on every route × locale; the 3D canvas mounts on desktop and the SVG fallback appears when WebGL is disabled.

**CI gates:** `typecheck` → `lint` → `stylelint` → `format:check` → `test` → `build` → `e2e`. Any failure blocks.

**As built.** `.github/workflows/ci.yml` runs exactly that chain across two jobs — the cheap static checks first, so a type error fails in under a minute rather than after a Playwright install — with the Playwright HTML report uploaded on failure. Locally, `npm run validate` is the static half and `npm run validate:full` is the whole chain.

Current state: **50 unit and component tests** across six files, **85 Playwright tests** (7 skipped: the WebGL-dependent cases, which are skipped rather than faked where the runner has no GPU).

The interaction pass added three e2e groups. **Themes** runs the full axe audit against dark, light *and* cinematic — which immediately earned itself by catching a cinematic button colour at 4.51:1 against white — asserts the toggle cycles and persists across a reload, and asserts the atmosphere variables are `0` outside the cinematic theme, so the "renders nothing in the other themes" claim is a test rather than a comment. **Interaction** asserts that hovering a layer marks exactly the layers below it as permitted imports (the dependency rule, checked), that project cards carry the cursor's label, and that scroll progress advances. Both audits wait out the hero entrance first: auditing an element mid-fade measures a composite colour no reader ever sees. The four component tests named above exist as `tests/unit/{Reveal,LocaleSwitcher,ProjectCard,ContactForm}.test.tsx`; `CountUp.test.tsx` covers the metric count-up added later.

Two of them earn their place beyond the checklist. `Reveal.test.tsx` asserts that **no inline transform or opacity is ever applied in JS** — the reduced-motion opt-out lives in `Reveal.module.scss` precisely so the element is at its final state on first paint, and moving the animation into JS would silently break it. `ProjectCard.test.tsx` asserts that **a blocked project renders no case-study link at all**, in either the heading or the footer, for every project carrying a `blockedBy` — the SpringBME rule from `PROFILE.md` §2.2 enforced at the component level rather than trusted to the router's 404.

---

## 12. Open dependencies

| Blocker | Effect if unresolved |
|---|---|
| SpringBME description | 2.5-year role stays a bare card |
| MK Kredit metric confirmation | Proof bar numbers ship as-is from LinkedIn |
| English proficiency | Locale strategy stands as decided (en default) |
| Portrait photo | About section ships `YOUR_PHOTO_HERE` |

None of these block implementation. All are single-value edits in `data/`.
