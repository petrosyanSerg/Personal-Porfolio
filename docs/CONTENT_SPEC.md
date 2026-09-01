# CONTENT_SPEC.md

Every string that ships. English is authored here; `ru` and `hy` are authored to the same meaning per `I18N_SPEC.md` §4 — not translated word-for-word.

**Governing rule:** every claim traces to `PROFILE.md`. Nothing on this site is invented, and nothing the audit excluded appears here.

**Voice** (`PERSONAL_BRAND.md` §5): precise, calm, concrete, quietly confident. Prefer a number to an adjective. Name the practice, not the buzzword. No "passionate", no "ninja", no exclamation marks, no emoji.

---

## 1. Hero

> **Eyebrow** `SOFTWARE ENGINEER · YEREVAN, ARMENIA`
>
> **H1** I build enterprise frontends that hold their shape.
>
> **Sub** React and TypeScript architecture for regulated financial software — and AI-native workflows that keep the code honest.
>
> **CTA** See the architecture → · Get in touch

**Why this headline.** It says something specific and slightly unusual in six words, and every subsequent section proves it. It avoids the two failure modes of engineer portfolios: the generic ("Full-stack developer passionate about clean code") and the grandiose ("Crafting digital experiences"). "Hold their shape" is a structural metaphor a CTO reads as *architecture* and a recruiter reads as *competent*.

Character budget for translation: **≤48 characters** (`I18N_SPEC.md` §6). Each locale is authored to fit, not stretched to match.

## 2. Proof bar

`~50` business modules · `190+` API endpoints · `36` domain services · `4` years engineering

Mono, count-up on first reveal. Caption beneath: *Enterprise leasing and credit platform, built from a greenfield codebase.*

## 3. About

> **Eyebrow** `ABOUT`
> **H2** Software that cannot afford to be wrong.
>
> I'm a software engineer in Yerevan. I work on financial software — leasing and credit systems where authorization, auditability and correctness aren't features, they're the product.
>
> At Actual Solutions I own the frontend architecture of MK Kredit. It went from an empty repository to roughly fifty business modules covering the complete credit lifecycle: application analysis, credit history, collateral, income and expenses, cash flow, credit committee approval, conclusions, disbursement. I designed its Feature-Sliced architecture, its type-safe authorization model, its centralized API and error-handling layers, and the reusable form and table systems most of the product is built from.
>
> I also work AI-native — as professional practice, not experiment. The interesting problem isn't getting a model to generate code. It's getting generated code to respect architecture, business rules and engineering standards at speed, without eroding the system underneath.
>
> Before engineering I spent two years as a graphic designer. It still shows in how I treat interfaces.

Portrait: `YOUR_PHOTO_HERE` placeholder until supplied.

## 4. Experience

> **Eyebrow** `EXPERIENCE` **H2** Four years, three of them commercial.

| Role | Line |
|---|---|
| **Software Engineer — ActualSolutions** · Feb 2026 – Present · Yerevan, Hybrid | Frontend architecture of MK Kredit, an enterprise leasing and credit management platform. |
| **Software Engineer — SoftConstruct** · Jun 2023 – Nov 2025 · Yerevan, On-site | Two and a half years on the SpringBME platform — feature modules, performance, refactoring, documentation. |
| **Frontend Developer — SmartCode** · Sep 2022 – May 2023 · Internship | Nine months moving from coursework to shipped product work. |
| **Graphic Designer — EdEl Photostudio** · Jul 2019 – May 2020 · Hrazdan | Colour grading and retouching. Where the eye came from. |

Bullets per role: exactly as in `RESUME.md`. **SmartCode ships without percentages** (`PROFILE.md` §2.3).

> `[VERIFY]` SoftConstruct copy is deliberately thin — it describes the *tenure*, not the product, because SpringBME has no public description. One sentence from Sergey converts his longest role from a weak card into a real section.

## 5. Architecture ⭐

> **Eyebrow** `HOW IT'S BUILT` **H2** Fifty modules, one shape.
> **Lead** Feature-Sliced Design isn't a folder convention. It's a dependency rule: every layer may only reach downward. Enforce that in CI and the fiftieth module costs about what the fifth did.

Scroll-pinned; each layer reveals with one line:

| Layer | Line |
|---|---|
| `app` | Providers, routing, global configuration. Knows about everything; nothing knows about it. |
| `pages` | Route compositions. Assembles widgets — contains no business logic. |
| `widgets` | Self-contained blocks: the application table, the credit committee panel. |
| `features` | User actions with business meaning: approve, reject, attach collateral. |
| `entities` | Domain models — application, client, collateral, payment schedule. |
| `shared` | UI kit, API client, hooks, utilities. Knows nothing about the domain. |

> **Closing** Dependencies flow one way. CI fails the build when they don't. That single constraint is what makes fifty modules navigable — and what makes AI-generated code safe to accept.

That last sentence is the hinge of the entire site: it connects architecture to the AI story.

## 6. AI-Native Engineering ⭐

> **Eyebrow** `AI-NATIVE ENGINEERING` **H2** The hard part isn't generating code.
> **Lead** It's making generated code obey the architecture. Speed is only an asset when there's a shape for it to fill.

Pipeline diagram — five stages:

1. **Context** — architecture, conventions and domain rules structured as durable context, so generation starts inside the constraints.
2. **Spec** — specification before implementation. The spec is the contract, not the prompt.
3. **Scaffold** — modules generated against the real Feature-Sliced structure, with Figma, Jira and Swagger feeding design, requirements and API contracts in.
4. **Validate** — human-in-the-loop review gates. An engineer verifies architectural and business-rule compliance before merge.
5. **Merge** — automated CI quality gates catch what review doesn't.

> **Closing** This is how a greenfield repository became ~50 business modules in seven months without the architecture eroding. The velocity is the visible part. The constraint system is the part that matters.

**Meeting the objection head-on.** A reader who has done the arithmetic is already sceptical of seven months. Naming it before they do converts scepticism into interest — and this section is the answer. Hiding the timeframe would be the mistake.

## 7. Tech Stack

> **Eyebrow** `TECH STACK` **H2** What I use, and what I use it for.
> **Lead** Depth over breadth. Every item here is something I've shipped with — with a note on how deeply.

Six groups from `SKILLS.md` §Frontend → Design. Each item: name, depth badge (Core / Strong / Working / Familiar), one line of *what I use it for*. `Next.js` carries a visible **Personal projects** marker.

> **Footnote** Nothing here is aspirational. If it's on this page, there's work behind it.

## 8. Projects

> **Eyebrow** `SELECTED WORK` **H2** Production work, and public code.
> **Lead** Commercial work is private — it's fintech. The case studies below describe it in the detail I can. The public repositories are architecture studies and challenge builds, and they're labelled as such.

Featured: **MK Kredit**, **AI-Native Development Workflow**. Then SpringBME (card only). Then public builds under a clear divider: *Public code — studies and challenge builds, not products.*

**That honesty is a feature.** A reviewer who opens `FSD_Test` expecting a product and finding a study loses trust. One told it's a study, and finding a clean one, gains it.

## 9. Journey

> **Eyebrow** `JOURNEY` **H2** Design, then engineering, then architecture.
>
> `2019` Colour grading in a photo studio in Hrazdan. Learning to see.
> `2022` Software engineering at YSCI, and a nine-month internship at SmartCode. Theory into shipped code.
> `2023` Two and a half years at SoftConstruct — a large platform, a real team, code review as a habit.
> `2025` Feature-Sliced Design, studied deliberately in a sandbox before applying it anywhere that mattered.
> `2026` Frontend architecture of an enterprise credit platform. Greenfield to fifty modules.

The 2025 line is small and does real work: it shows he learns architecture on purpose, then applies it — the opposite of picking up patterns by accident.

## 10. Contact

> **Eyebrow** `CONTACT` **H2** Let's talk.
> **Lead** Open to on-site, hybrid and remote roles. Based in Yerevan, working in Armenian, Russian and English.
>
> Fields: Name · Email · Message · Send message
> Direct: LinkedIn · GitHub · Telegram · Email
> Success: *Thanks — I'll reply within a couple of days.*
> Error: *That didn't send. Email me directly at petrosyanserg33@gmail.com.*

> `[VERIFY]` The "working in … English" clause depends on the unresolved proficiency question (`PROFILE.md` §5.4). If English is genuinely elementary, this line becomes *"working in Armenian and Russian"* — honest, and it sets expectations before a call rather than during one.

## 11. Footer

Name + role line · nav · locale switcher · theme toggle · social links · `© 2026 Sergey Petrosyan` · *Built with Next.js, TypeScript and Three.js. Source on GitHub.*

## 12. Accessibility strings

- Skip link: *Skip to content*
- Scene alt: *A rotating three-dimensional lattice of connected nodes arranged in six horizontal layers, representing the Feature-Sliced Design architecture: app, pages, widgets, features, entities and shared. Connections flow downward between adjacent layers only.*
- Theme toggle: *Switch to light theme* / *Switch to dark theme*
- Locale switcher: *Change language. Current language: English.*
- External links: *(opens in a new tab)*

## 13. Words this site never uses

`passionate` · `ninja` · `rockstar` · `guru` · `10x` · `crafting digital experiences` · `I love coding` · `enthusiast` · `cutting-edge` · `game-changing` · `leverage synergies` · `full-stack` (excluded by the audit) · `senior` (not his title) · any emoji · any exclamation mark.

## 14. Content sign-off

- [ ] Every claim traces to `PROFILE.md`
- [ ] No excluded claim appears (`SKILLS.md` §Excluded)
- [ ] No unverified metric is displayed
- [ ] Hero H1 ≤48 characters in all three locales
- [ ] `ru` and `hy` reviewed by Sergey
- [ ] Banned-word list checked against the built HTML
