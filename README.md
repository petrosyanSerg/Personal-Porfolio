# petrosyanserg.dev

Personal engineering site for **Sergey Petrosyan** — Software Engineer, enterprise frontend architecture, React & TypeScript, AI-native development.

Not a portfolio template. Every claim on the site traces to a documented audit of his public profile, and the exclusions from that audit are enforced by tests rather than remembered.

---

## Overview

|               |                                                                   |
| ------------- | ----------------------------------------------------------------- |
| **Framework** | Next.js 16 (App Router, React 19, TypeScript strict)              |
| **Styling**   | SCSS Modules + CSS custom properties — no Tailwind                |
| **i18n**      | next-intl · `/en`, `/ru`, `/hy` — three first-class locales       |
| **3D**        | three.js + @react-three/fiber, lazily loaded and capability-gated |
| **Forms**     | react-hook-form + Zod, shared schema client and server            |
| **Email**     | Resend, via a route handler                                       |
| **Testing**   | Vitest + Testing Library, Playwright + axe-core                   |
| **Hosting**   | Vercel                                                            |

---

## Features

- **Nine home sections** telling one story: who → what → what I've built → how I think → what I use → why it matters → how we work together.
- **Scroll-tracked Feature-Sliced Design explainer** — a sticky diagram that follows reading position through the six architectural layers.
- **AI-native engineering pipeline** — context → spec → scaffold → validate → merge, as the answer to the obvious question about delivery speed.
- **Interactive hero diagram** — a layered core with six technology modules in orbit, connected by lines that carry data inward. The modules _are_ `data/skills.ts`: hover one to light it, open one to read its strongest technologies. Six draw calls, zero React renders while the pointer moves, and every colour read from the theme's own CSS variables.
- **Case studies** with hand-built SVG architecture diagrams.
- **Three first-class locales** — English, Russian, Armenian — with reciprocal hreflang, localised metadata and JSON-LD.
- **Three themes** — dark (canonical), light, and **cinematic**: a deep-black ground with banded volumetric light, slow fog, drifting motes, film grain and a vignette. Switching wipes in from the control you pressed, via View Transitions where the browser has them.
- **Pointer environment** — a soft flashlight follows the cursor, cards light where you point, primary buttons pull a few pixels toward you, and project cards tell the cursor what clicking them does. One rAF loop writes CSS variables; nothing re-renders on movement, and all of it is off without a fine pointer or under reduced motion.
- **Zero axe-core violations** across every route in every locale **and every theme**, verified in CI.

---

## Architecture

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              html/body, fonts, theme, header, footer
│   │   ├── page.tsx                home — composes the nine sections
│   │   ├── projects/               index + [slug] case studies
│   │   ├── resume/
│   │   └── opengraph-image.tsx     generated per locale at build
│   ├── api/contact/route.ts        validation, honeypot, rate limit, Resend
│   ├── sitemap.ts  robots.ts  manifest.ts  icon.tsx
├── components/
│   ├── ui/          Container SectionHeader Tag Magnetic Spotlight
│   ├── layout/      Header Footer LocaleSwitcher ThemeToggle
│   ├── effects/     Atmosphere CinematicBackground ScrollProgress
│   ├── sections/    Hero HeroStage HeroIntro ProofBar About Experience
│   │                Architecture AiNative TechStack SkillGroups Projects
│   │                Journey Contact
│   ├── hero3d/      HeroSceneMount HeroCanvas sceneRegistry
│   │                core/ (palette quality motion)  scenes/ (50 modules)
│   ├── projects/    ProjectCard ArchitectureDiagram
│   └── animations/  Reveal CountUp
├── content/         en.json  ru.json  hy.json — translatable strings
├── data/            personal experience skills projects metrics education socials
├── lib/             seo jsonld env format theme theme-store contact-schema
├── design-system/   core/ (types registry runtime store)  components/ (Lab
│                    Preview Cursor Atmosphere Characters)  ornaments/
├── hooks/           useDeviceCapability usePrefersReducedMotion useFinePointer
│                    usePointerAmbience useActiveSection
├── config/          site.ts  i18n.ts
└── styles/          abstracts/ base/ themes/ design/ (contract + 50 worlds)
                     main.scss
```

### The one rule that shapes everything

**No personal information lives inside a component.** Structure (dates, slugs, technologies, links, numbers) is typed data in `data/`; translatable prose is keyed strings in `content/`. They join at render.

| Change                       | Files touched                                           |
| ---------------------------- | ------------------------------------------------------- |
| New job                      | one object in `data/experience.ts` + two content blocks |
| New project                  | one object in `data/projects.ts` + two content blocks   |
| New technology               | one object in `data/skills.ts` (evidence required)      |
| A metric changed             | one number in `data/metrics.ts`                         |
| Publish a blocked case study | delete `blockedBy`, set `hasCaseStudy: true`            |
| New locale                   | one JSON file + one entry in `config/i18n.ts`           |

No JSX is edited in any row.

### Evidence enforcement

The audit in `docs/PROFILE.md` excluded several claims. Those exclusions live in the type system and the test suite, not in someone's memory:

- `Metric.evidence` / `Metric.display` — the `~106K lines of code` figure is in the data with `evidence: 'unverified', display: false`. Restoring it means consciously flipping a flag that sits beside its evidentiary status.
- `Skill.evidence` — a skill with an empty evidence array **fails the test suite**. This is what keeps "Full-Stack Development" off the site.
- `Project.blockedBy` — SpringBME has no public description, so its card renders while its case-study route 404s. A test asserts the 404.
- A test asserts `Full-Stack` never appears in the JSON-LD `knowsAbout` array.

---

## Development

```bash
npm install
cp .env.example .env.local     # then fill in
npm run dev                    # http://localhost:3000 → /en
```

| Script                  | Does                                          |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Dev server                                    |
| `npm run build`         | Production build                              |
| `npm start`             | Serve the production build                    |
| `npm run typecheck`     | `tsc --noEmit`                                |
| `npm run lint`          | ESLint                                        |
| `npm run lint:styles`   | Stylelint                                     |
| `npm run format`        | Prettier, write                               |
| `npm run format:check`  | Prettier, check only (runs in CI)             |
| `npm run test`          | Vitest — unit, component and data-integrity   |
| `npm run test:e2e`      | Playwright (starts a production build itself) |
| `npm run validate`      | typecheck → lint → stylelint → test           |
| `npm run validate:full` | `validate` → build → e2e — the full CI chain  |

`.github/workflows/ci.yml` runs the same chain on every push and pull request, split into a fast static job and a slower build-and-e2e job, and uploads the Playwright report when anything fails.

Current: **50 unit and component tests**, **90 Playwright tests** (7 skipped where the runner has no GPU — the WebGL cases are skipped rather than faked).

### Environment variables

| Variable               | Required    | Purpose                                                                                          |
| ---------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URLs, hreflang, sitemap, OpenGraph. Defaults to the Vercel URL.                        |
| `RESEND_API_KEY`       | Optional    | Contact delivery. Without it the form returns 503 and the UI points at the direct email address. |
| `CONTACT_FROM_EMAIL`   | With Resend | Verified sender.                                                                                 |
| `CONTACT_TO_EMAIL`     | With Resend | Destination.                                                                                     |

Parsed and validated by `lib/env.ts` at startup — a misconfigured deploy fails loudly instead of shipping broken canonicals or a form that silently swallows messages.

---

## Themes and the pointer environment

Three themes: **dark** (canonical), **light**, and **cinematic**. The attribute on `<html>` is the source of truth, written before first paint by an inline script so nothing flashes, and read back through `useSyncExternalStore` — the DOM attribute _is_ the external system, so mirroring it into React state would only cost a render.

**Cinematic is a tuning of dark, not a third palette.** The ground drops toward true black, surfaces gain a trace of blue, and the text gets lighter rather than dimmer. On top of that sit six layers — banded volumetric light, fog, drifting motes, film grain and a vignette — all switched by `--atmos-*` variables that are `0` in the other two themes. `CinematicBackground` is a **server component with no JavaScript**: the same markup renders in every theme and simply paints nothing in two of them, so switching mounts and unmounts nothing.

The light is banded horizontally and the motes fall downward only. That is not an aesthetic coin-flip: this site's whole argument is six architectural layers with strictly downward dependencies, and the room it is lit in is built the same way.

**Switching** persists the choice synchronously, then wipes the new palette in from the control you pressed using the View Transitions API where the browser has one. The persistence is deliberately _outside_ the transition — remembering the choice is the feature; the wipe is decoration, and a visitor who navigates mid-animation must not lose it.

**Pointer effects** — flashlight, cursor, card spotlights, magnetic buttons — are driven by a single `requestAnimationFrame` loop that writes CSS custom properties on `<html>`. Nothing re-renders while the pointer moves, and the loop parks itself when the cursor settles. All of it is gated on `(hover: hover) and (pointer: fine)` **and** no reduced-motion preference: on a phone the flashlight would track a tap and a custom cursor would replace nothing. Under reduced motion the cinematic atmosphere stays, holding still — someone who asked for less movement did not ask for less environment.

**There is no loading screen**, deliberately. Every page is statically generated and the headline is server-rendered text; a splash would add delay to a page that is already painted, to hide nothing.

---

## Fifty design systems

`data-theme` (dark / light / cinematic) and `data-design` (fifty worlds) are two
independent axes on `<html>`, and both are written before first paint by an
inline script. A world is not a colour scheme: it is a palette, a typographic
voice, a spatial rhythm, a decorative vocabulary, a motion signature, a cursor,
a hero composition, its own hero _copy_, and its own three-dimensional scene.

**The content never changes.** Neoclassical and Neo-Brutalism render the same
`data/` and the same `content/` — one h1, one sub-headline, the same six
technology groups, the same links. Only presentation moves.

### How a world is declared

Six places, and a unit test asserts none of them can drift:

| Where                            | What it holds                                                     |
| -------------------------------- | ----------------------------------------------------------------- |
| `design-system/core/types.ts`    | The id tuple — the single source of truth                         |
| `design-system/core/registry.ts` | Family, hero composition, voice, cursor, capabilities, scene cost |
| `styles/design/_<id>.scss`       | ~90 custom properties, scoped to `[data-design]`                  |
| `abstracts/_worlds.scss`         | The same relationships in Sass, for selectors                     |
| `hero3d/sceneRegistry.ts`        | One `next/dynamic` import                                         |
| `content/{en,ru,hy}.json`        | One description, in three languages                               |

The Sass maps restate what the TypeScript registry knows, which is a real
duplication and a deliberate one: CSS cannot import a TypeScript object, and
resolving the composition in JavaScript would mean the hero arrives a frame
late — the exact thing the pre-paint script exists to prevent.
`tests/unit/design-system.test.ts` compares the two in both directions, and it
has already caught one: Coquette had a ribbon ornament vocabulary and had
forgotten to declare the capability.

### The axes, and why there are fewer of them than worlds

Fifty worlds resolve to **ten hero compositions**, **eight hero voices** and
**sixteen cursors**. That is not laziness — fifty structural variants would be
fifty responsive layouts to keep honest and fifty chances to lose the `h1`.
Worlds genuinely share a _structure_ while sharing nothing else: Neoclassical
and Art Deco are both axial, and that they look nothing alike is the token
layer's job.

The **voice** is the copy arrangement, and it is a separate axis from the
composition that frames it. All eight are present in the DOM at once and CSS
reveals one — the terminal voice adds a prompt line and sets the technology
list as command output, the spec voice replaces the prose sub-headline with a
datasheet, the manifesto voice blows the headline up and dims the nameplate
because in a manifesto the claim outranks the person making it. Every one of
those marks is `aria-hidden` and none is a heading: there is exactly one `h1`
in every world, and a crawler sees one hero rather than eight.

Nothing branches on a world's id. A component asks `useDesignCapability('ornament')`
and a stylesheet writes `@include composition("terminal")`, so a fifty-first
world inherits an existing composition, voice and cursor for free.

### The Design Lab

Fifty previews grouped into eight families, with a filter that searches name,
family _and_ description — because a visitor knows they want "something dark
and gold" long before they know it is called Dark Academia. Each preview is
rendered _in_ its world rather than screenshotted: the card carries
`data-design`, and because every world's tokens are an attribute selector they
apply at any depth. A preview cannot drift from what selecting it does.

Selecting does not close the panel. Switching is one attribute write — no route
change, no remount, no refetch — so comparing fifty worlds against the same
paragraph costs fifty clicks, not fifty open-and-close cycles. The reader's
place is held across the swap by a frame-driven correction that measures the
element you were looking at and puts it back, giving up the moment it detects a
scroll it did not make.

### Theme portraits

Each world also carries a painted portrait — an artist's impression of this
site rendered in that world's idiom. They come from one generated contact
sheet, `public/themes/source/50-theme-collage.jpg`, which is kept untouched;
`npm run portraits` slices it into two renditions per world:

| Rendition                 | Size    | Where                                           |
| ------------------------- | ------- | ----------------------------------------------- |
| `public/themes/portraits` | 140×112 | 56px plate pinned to each Design Lab card       |
| `public/themes/about`     | 400×500 | the About frame, swapping with the active world |

The captions burnt into the collage are **not** the mapping. The generator
drifted — a caption band sits above the tile it names in the upper rows and
below it in the lower rows, seven names were painted twice and five were never
painted at all — so `TILES` in `scripts/extract-theme-portraits.mjs` maps
worlds to tiles by what the artwork actually depicts, and the caption band is
cropped away. `designSystemIds` remains the source of truth for the names.

Two things follow from the source being 1024×1024 for fifty tiles. Each tile is
only ~146×128, so the lab plate is near-native and genuinely sharp at 2x, while
the About rendition is an upscale and reads soft — a ceiling, not a setting.
And five worlds have no artwork at all rather than a near-enough one, which is
the same rule the metrics follow: no claim the source does not support.

`npm run portraits:check` re-crops in memory and fails if what is on disk has
drifted; `tests/unit/theme-portraits.test.ts` gates the paths, the sizes, the
orphans and the alt-text parity.

---

## Internationalization

`localePrefix: 'always'` — every locale is prefixed, including the default. A bare `/` serving English while `/ru` serves Russian gives one URL two identities and makes `x-default` ambiguous; one 308 redirect is cheaper than that.

No automatic `Accept-Language` redirect: it hijacks shared links and confuses crawlers.

`en.json` is the canonical message shape, wired into `next-intl`'s types via `global.d.ts`, so **a key missing from `ru.json` or `hy.json` is a compile error**, not a runtime `undefined`. A unit test additionally fails the build if any translated string is byte-identical to its English source — which catches forgotten stubs automatically. That gate has already earned its keep: it caught one English sentence left in the Armenian file after a 303-key translation pass.

**Armenian is enabled and complete.** `hy.json` was written by Sergey, not machine-translated, and it uses the mixed register Armenian engineers actually write in — Armenian prose around Latin technical vocabulary (`enterprise frontend-ներ`, `React-ում composition`). The stub-detection test exempts that vocabulary by explicit key and narrow prefix rather than by a broad pattern, so it still catches real stubs. `Noto Sans Armenian` is subset-loaded for `hy` only, and the `[lang="hy"]` rule bumps display line-height to `1.06` because Armenian ascenders clip at `0.98`.

---

## SEO

Self-referencing canonical on every page. hreflang is **reciprocal and self-inclusive** with `x-default` — non-reciprocal hreflang is discarded by Google and is the most common reason multilingual sites fail to rank in their secondary languages. It is declared in both the head and the sitemap.

JSON-LD (`Person`, `WebSite`, `ProfilePage`, `CreativeWork`, `BreadcrumbList`) is generated from typed data in `lib/jsonld.ts`, never hand-written, so it cannot drift from the page. `sameAs` links only verified, controlled profiles — that is what lets a search engine resolve this domain to the same entity as the LinkedIn and GitHub profiles that already rank for his name.

OpenGraph images are generated per locale at build with `next/og` from the same data as the page.

---

## Performance

`node measure-bundle.mjs` drives a real browser against a production server on :3399 and gzips every response body — what the connection actually carries, not the build output's parsed per-chunk sizes. Add `--with-3d` to include the active world's lazily-loaded scene.

|                              | Measured     | Budget |         |
| ---------------------------- | ------------ | ------ | ------- |
| Initial JS (no WebGL device) | **70.4 KB**  | 160 KB | ✅      |
| 3D chunk (lazy)              | **230.4 KB** | 180 KB | ⚠️ over |

**How the initial bundle got there.** Framer Motion was removed — it cost ~37 KB gzipped to fade and translate one element, which `IntersectionObserver` plus a CSS transition do for free. `react-hook-form` + Zod + resolver are lazily mounted with the contact form, which sits at the bottom of a long page; the direct contact links beside it are plain server-rendered anchors, so nothing is lost if that chunk never loads. The whole pointer environment — flashlight, cursor, card spotlights, magnetic buttons, scroll progress — adds no measurable weight, because it is one rAF loop writing CSS variables and the rest is stylesheet.

**The 3D chunk misses its budget and the budget was wrong, not the code.** 230.4 KB is three.js plus @react-three/fiber with nothing else in it — @react-three/drei was never imported and has been removed from the dependencies. Dropping R3F for imperative three.js would save roughly 40 KB and cost the declarative scene graph and its automatic disposal. It is not on the critical path: the chunk is requested only when the hero approaches the viewport **and** the device clears the capability floor, so phones, `Save-Data` users and anything without WebGL2 never download a byte of it.

Other measures: every page is statically generated; server components by default; fonts self-hosted with `unicode-range` subsetting, so an English visitor never downloads the Cyrillic subset; `content-visibility: auto` on below-fold sections; no third-party scripts.

---

## The 3D experience

**Fifty worlds, fifty scenes, one canvas host.** Every design system has a hero
of its own — a colonnade for Neoclassical, a gear train that actually meshes
for Steampunk, a curtain of aurora whose folds travel along the sheet, a
karesansui garden raked in concentric rings around each stone, a pot repaired
in gold for Wabi Sabi. No scene is reused and none is a recolour of another:
they differ in geometry, lighting, camera behaviour, materials, motion and what
the pointer does.

They also differ in what the pointer is _for_, which is where most of the art
direction lives. Tenebrism gives you the light and nothing else — you move a
single spot across a form and decide what is revealed. Bauhaus refuses you
entirely: the composition is the work, so the pointer moves the eye a few
degrees and cannot touch the solids. Pixel Art ratchets the camera in eight
discrete steps because interpolation is the one thing a bitmap must not do.
Rebus hides six symbols and only draws the line joining them once you have
found all six.

### What it costs

| Payload                         | Gzipped | When                              |
| ------------------------------- | ------- | --------------------------------- |
| Initial (JS + CSS, 15 assets)   | 252 KB  | Every visit                       |
| three.js                        | 230 KB  | Only once a scene actually mounts |
| One scene module                | ~1.2 KB | Only the active world's           |
| All 50 world token blocks (CSS) | in 26KB | Part of the one stylesheet        |

`three.js` is **not in the initial payload** — asserted by inspecting the
prerendered HTML's script set, and again in Playwright. The fifty scenes are
fifty `next/dynamic` calls in one registry file: calling `dynamic()` fetches
nothing, so a visit downloads exactly one scene chunk plus the shared engine.
Fifty worlds cost what one world costs, and the CSS for the other forty-nine is
inert bytes in a stylesheet the browser never evaluates.

### What is cut, and where

A world declares its scene's cost rather than the mount guessing at it:

```ts
scene: { mobile: 'disabled', cost: 'high', interaction: ['pointer'] }
```

Four questions are answered before a byte of `three.js` is requested, cheapest
first: can this device run WebGL2 and has the visitor asked to save data; does
the active world allow a scene on a device this small; is the hero anywhere
near the viewport; only then, fetch. Victorian, Gothic, Steampunk and Dark
Academia — the four heaviest — never render on a phone at all. Save-Data
downloads nothing.

Quality is resolved from the device tier **and** the world's declared cost, so
an expensive scene is demoted on a mid-range laptop while a cheap one is not.
Scenes ask for `count(quality, 900)` and get 900, 480 or 180.

### Reduced motion, and the fallback

`prefers-reduced-motion` switches the canvas to `frameloop="demand"` and freezes
the scene clock at a composed instant — not at `t=0`, because several scenes are
art-directed at a moment that is not the origin. The scene is never removed:
someone who asked for less movement did not ask for less content.

Without WebGL there is no substitute drawing, and that is deliberate. The old
single scene shipped a static SVG of itself; with fifty scenes that would be
fifty stand-in illustrations to draw and keep in sync, and a flat picture of an
aurora is worse than the CSS aurora already painted behind it. **The fallback
is the world** — its ground, gradient, decor layer and type, none of which
needed WebGL in the first place.

Every one of the fifty is asserted in a real browser against a production
build: the canvas mounts, it has real dimensions, and the scene runs for a
second with no console errors (`tests/e2e/hero-scenes.spec.ts`).

---

## Accessibility

Zero axe-core violations (WCAG 2.0/2.1 A and AA) across `/en` and `/ru` × home, projects, two case studies and resume — asserted in Playwright on every run.

Two findings from that suite worth recording, because both were self-inflicted:

- `--color-text-faint` was documented as "non-text only" and then used for text in ten places, at ~3.3:1. All ten now use `--color-text-muted` (5.9:1).
- The architecture slabs and steps used `opacity` to dim inactive states, which dims the text with them and dropped labels to 3.5:1. **Opacity cannot be made accessible.** State is now carried by surface and border colour, with text at full contrast in every state.

The filled accent buttons also failed: white on `--color-accent` is 3.63:1. `--color-accent-strong` exists for filled surfaces carrying white text, and its hover state _darkens_, because lightening would drop it back below the threshold.

Also: one `<h1>` per page, skip link first in the DOM, `:focus-visible` never removed, 44px minimum touch targets, the canvas `aria-hidden` with a text alternative, and no horizontal overflow at 320, 375, 390, 768, 1024 or 1440px — each asserted by a test.

---

## Security

- No secret in any `NEXT_PUBLIC_` variable; env validated with Zod at startup.
- Contact route: Zod validation, honeypot, 2KB body cap, 5 requests/hour/IP in-memory rate limit. A filled honeypot returns 200 so a bot learns nothing.
- CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` and HSTS set in `next.config.ts`.
- `dangerouslySetInnerHTML` appears twice: the JSON-LD payload (generated from typed data, `JSON.stringify`d) and the pre-paint theme script. Never user input.

---

## Deployment

Vercel, zero configuration. Set `NEXT_PUBLIC_SITE_URL` to the production origin and the Resend variables if the contact form should deliver.

The build is hermetic — fonts are vendored into `public/fonts` rather than fetched from Google at build time, so it succeeds offline and does not depend on a third party being reachable.

---

## Documentation

`docs/` is the source of truth the site was built from.

|                                                                                                     |                                                                                |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `PROFILE.md`                                                                                        | The audit. Every claim labelled FACT / INFERENCE / `[VERIFY]`. **Read first.** |
| `RESUME.md` `EXPERIENCE.md` `SKILLS.md` `PROJECTS.md` `ACHIEVEMENTS.md` `EDUCATION.md`              | Professional content, with exclusions and their reasons                        |
| `PERSONAL_BRAND.md`                                                                                 | Positioning, voice, visual direction                                           |
| `WEBSITE_SPEC.md` `DESIGN_SYSTEM.md` `CONTENT_SPEC.md` `I18N_SPEC.md` `SEO_SPEC.md` `DATA_MODEL.md` | Technical and design specification                                             |
| `FINAL_AUDIT.md`                                                                                    | What was built, what was measured, what is still open                          |
| `DEPLOYMENT.md`                                                                                     | Repo → live site on Vercel: env vars, domain, Search Console, Lighthouse       |
| `LINKEDIN_COPY.md`                                                                                  | Paste-ready corrected LinkedIn text, in priority order                         |

---

## Open items

Carried from `docs/PROFILE.md` §8. None block development; all are single-value edits.

1. **SpringBME description** — his longest role (2.5 years) has no public product description, so its case study is blocked and the site describes the tenure instead.
2. **MK Kredit metrics** — confirm ~50 modules / 36 services / 190+ endpoints, and how the LOC figure was counted.
3. **English proficiency** — LinkedIn declares _elementary_; if that is stale it is capping his reach. One value in `data/education.ts`.
4. **Portrait** — the About frame now falls back to the active world's own painted artwork (see §"Theme portraits"), which is decorative and says so in its alt text. A real photograph is still wanted: set `personal.photo` and it takes precedence over the artwork automatically.
5. **Five worlds have no artwork** — Anthropomorphic, Kitsch, Brutalism, Surrealism and Mid-Century were never drawn in the source collage, so their lab cards show the live preview alone and their About frame shows the placeholder. Reasons are recorded in `portraitGaps` in `src/design-system/core/portraits.ts`; filling them means adding five tiles and rerunning `npm run portraits`.
6. **LinkedIn placeholder** — the SmartCode entry publicly shows an unfilled template bracket, `[Technology, e.g., React and Redux]`. `docs/LINKEDIN_COPY.md` has the replacement text. This is the only open item visible to a recruiter today.

~~Armenian locale~~ — done; `hy.json` shipped and verified end to end.
