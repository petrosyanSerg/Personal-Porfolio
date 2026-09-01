# PROJECTS.md — Source of truth for Projects & case studies

Two tiers: **commercial** (the substance, described without breaching confidentiality) and **public** (the code anyone can open). Commercial work leads — it is what the positioning rests on.

---

# Tier 1 — Commercial

## 1. MK Kredit — Enterprise leasing & credit management platform
`slug: mk-kredit` · **Featured case study**

| | |
|---|---|
| Company | ActualSolutions |
| Role | Frontend architect & engineer |
| Year | 2026 – present |
| Category | Enterprise fintech |
| Live | `my.mkkredit.am` — production, access restricted |

**Overview.** The frontend of a platform banks and leasing organizations run their credit business on: application intake through to disbursement, with the authorization, auditability and workflow rules that regulated lending requires. Built from an empty repository into roughly fifty business modules.

**Problem.** Leasing and credit operations are long, multi-stage and evidence-heavy. Every application accumulates financial analysis, collateral records, credit history and committee decisions — each stage with different actors, permissions and validation rules. Build this as ordinary screens and it becomes unmaintainable by module fifteen.

**Context.** Greenfield, regulated domain, Armenian-first user base, an expanding feature surface, and a small team. The architecture had to absorb growth without proportional growth in complexity.

**Role & responsibilities.** Frontend architecture and technical direction; platform systems (authorization, API layer, error handling, forms, tables, theming, i18n); delivery of lifecycle modules; establishing the AI-native workflow the team develops with.

**Architecture.** Feature-Sliced Design, with enforced layer boundaries so dependencies flow one way and business modules stay isolated. On top of it: a centralized Axios client with JWT and automatic token refresh; TanStack Query for all server state; Redux Toolkit for client state; a reusable form system on React Hook Form + Zod; a shared data-table system; a type-safe authorization model; a unified error-handling architecture; a multi-theme design system on Ant Design + SCSS; i18next with Armenian as the primary locale. Automated CI quality gates on GitHub Actions; Docker; Azure.

**Technologies.** React 19 · TypeScript · Vite · TanStack Query · Redux Toolkit · React Hook Form · Zod · Ant Design · SCSS · Axios · i18next · Docker · GitHub Actions · Azure · Claude Code

**Technical challenges**
1. Keeping fifty business modules navigable — solved by FSD layer boundaries enforced in CI rather than by convention.
2. Integrating 36 domain services across 190+ endpoints without the API layer fragmenting — solved with a single typed client, shared interceptors and centralized error handling.
3. Modelling permissions for a regulated workflow — solved with a type-safe authorization model so unauthorized states are unrepresentable rather than merely hidden.
4. Validation-heavy multi-stage forms — solved with a reusable form system pairing React Hook Form with Zod schemas.
5. Armenian-first internationalization, including layout and typography for a non-Latin script as the *default*, not a retrofit.
6. Sustaining AI-assisted velocity without architectural erosion — solved with project-aware scaffolding, spec-driven development and human review gates.

**Results.** Greenfield → ~50 business modules covering the full leasing lifecycle; 36 services / 190+ endpoints integrated behind one type-safe layer; mobile-first responsive UI with PWA capability, multi-theme support and personalization; Armenian-first i18n; CI quality gates from the start.

**Lessons.** Architecture is what makes AI-assisted development safe. Generation speed is only an asset when there are boundaries for generated code to respect — the constraint system is the leverage, not the generator.

> `[VERIFY]` before publication: ~50 modules · 36 services · 190+ endpoints · ~106K LOC (and how counted). Confirm what may be said publicly about the client and the product.

---

## 2. AI-native development workflow
`slug: ai-native-workflow` · **Featured case study** — *the strongest differentiator on the site*

| | |
|---|---|
| Company | ActualSolutions |
| Role | Designed and adopted the workflow |
| Year | 2026 – present |
| Category | Engineering practice / developer experience |

**Overview.** An internal engineering workflow built on Claude Code, in which AI participates across requirements, architecture, implementation, refactoring, documentation and code review — under constraints that keep its output inside the project's architecture and business rules.

**Problem.** AI-generated code is fast and architecturally indifferent. On a regulated fintech codebase, unconstrained generation produces working code that quietly violates layer boundaries, duplicates existing abstractions and misses domain rules. The cost lands later, as erosion.

**Solution.** Four mechanisms:
1. **Context engineering** — the project's architecture, conventions and domain rules structured as durable context, so generation starts inside the constraints.
2. **Project-aware scaffolding** — new modules generated against the real FSD structure, not generic templates.
3. **Spec-driven development** — specification precedes generation; the spec is the contract.
4. **Human-in-the-loop validation** — explicit review gates where an engineer verifies architectural and business-rule compliance before merge.

Integrations pull design (Figma), requirements (Jira) and API contracts (Swagger) into that context. Specialized agents handle distinct lifecycle jobs rather than one general assistant handling everything.

**Result.** AI-native throughput on a greenfield enterprise codebase, with architecture that held. Evidence: ~50 modules in seven months, inside an FSD structure with CI quality gates.

**Lessons.** The interesting problem is not generating code; it is constraining generation. Architecture, specs and review gates are what convert model output into software a bank can run.

> **Presentation note.** The seven-month/fifty-module figure invites scepticism. **Meet it directly** — this case study is the answer to "how?", and answering it well converts the objection into the proof.
> `[VERIFY]` how much of this may be described publicly as employer practice.

---

## 3. SpringBME
`slug: springbme` · Summary card only — no case study until described

| | |
|---|---|
| Company | SoftConstruct |
| Role | Software Engineer |
| Year | 2023 – 2025 (2 yrs 6 mos) |

Feature modules and UI components on a large-scale platform; asset and performance optimization; refactoring for maintainability and consistency; user-guide authorship; sprint planning, code review and architecture discussion.

**Technologies.** React · Redux Toolkit · SCSS · React Hook Form · GitFlow

> `[VERIFY]` **BLOCKING.** SpringBME has no public description and no third-party coverage. One NDA-safe sentence is required — what it does, who uses it, rough scale — before this can be more than a card. Until then, the site presents the **tenure and contribution**, not the product.

---

# Tier 2 — Public code

Framed honestly as **engineering studies and challenge builds**, never as products. Section intro on the site:

> *Commercial work is private. These are the public builds — architecture studies and challenge implementations. The production work is described above.*

## 4. Feature-Sliced Design reference build
`slug: fsd-reference` · [`FSD_Test`](https://github.com/petrosyanSerg/FSD_Test) · 2025 · React · TypeScript · Vite · React Compiler
A React + TypeScript application structured with Feature-Sliced Design, used to validate layer boundaries and scaling patterns — the same architecture applied at enterprise scale on MK Kredit. **The only public artefact corroborating the architecture claim.**
> **Action:** replace the default Vite README with a real explanation of the layer structure. Consider renaming — "Test" undersells it.

## 5. Vecto Digital build
`slug: vecto-digital` · [`VectoDigital`](https://github.com/petrosyanSerg/VectoDigital) · 2025 · React · TypeScript · Vite · [live](https://vectodigitaltest.netlify.app/)
The largest deployed public React/TypeScript build. Marketing-site work: layout, responsive behaviour and interaction.
> **Action:** replace the template README; rename away from the client name.

## 6. Next.js routing, SSR & SSG study
`slug: nextjs-rendering-study` · [`Project_NextJS_TypeScript`](https://github.com/petrosyanSerg/Project_NextJS_TypeScript) · 2023 · Next.js · TypeScript
Routing strategies and the trade-offs between server-side rendering and static generation. His most-starred public repository.

## 7. Milky Way — SCSS motion study
`slug: milky-way` · [`Milky-Way`](https://github.com/petrosyanSerg/Milky-Way) · 2023 · SCSS
An animated vector rendering of the galaxy, built in SCSS alone. Evidence for motion and visual craft — and a bridge to the design background.

## 8–11. Supporting builds (cards only, no case studies)
`React-patterns` (2025, TS) — composition and reuse patterns · `React-Hooks` (2025, TS) — custom hook studies · `Netflix-Copy` (2023, TS + Vite) — UI reconstruction · `GitHub-Users-Search` (2023, TS) — API integration and search UI, [live](https://gitsearchhub.netlify.app/)

---

# Excluded from the website

`Java-Script`, `ITWEBS-test`, `LeetCode_Solutions`, `Grand-Candy` (empty scaffold), `Advice-Generator`, `Personal-Portfolio-Page` (superseded by this site), `URL_Shortener`, `Hydra-Landing-Page`, `Search-country`, `Sunnyside`, `ToDo-List-ReactJS`, `ToDo-List-JS`, `Weather-App-in-React`, `Weather-App`, `Disco`, `Clock`, `Music-Playeer`, `Slider-In-JS`, `Tic-Tac-Toe`, `documentation` (fork).

**Reason:** beginner tutorials, Frontend Mentor challenges and empty scaffolds. Showing twenty-nine repositories of practice work next to a fifty-module fintech platform drags the perceived level *down*. Curation is the point.

---

# Case study coverage

| Project | Page | Architecture diagram |
|---|---|---|
| MK Kredit | Full case study | ✅ FSD layers + API/auth/state flow |
| AI-native workflow | Full case study | ✅ context → spec → generation → validation → merge |
| SpringBME | Card only (blocked) | — |
| FSD reference build | Short case study | ✅ FSD layer diagram |
| Vecto Digital | Card + live link | — |
| Next.js study | Card | — |
| Milky Way | Card | — |
| Supporting builds | Compact grid | — |
