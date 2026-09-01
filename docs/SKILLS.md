# SKILLS.md — Source of truth for the Skills & Tech Stack sections

**Rule:** nothing appears on the website unless it appears here with evidence. Each entry carries *what it's used for*, *depth*, and *where* — the site never shows a bare logo.

**Depth scale**
- **Core** — architected with it in production; could own it for a team
- **Strong** — used substantially in production work
- **Working** — used in production or serious personal work; productive, not deep
- **Familiar** — real exposure, would need ramp-up

**Evidence keys:** `AS` ActualSolutions · `SC` SoftConstruct · `SM` SmartCode · `GH` public repositories · `LI` LinkedIn skill/cert

---

## Frontend

| Technology | Depth | What it's used for | Evidence |
|---|---|---|---|
| **React 19** | Core | Every commercial role. Component systems and business modules for an enterprise platform. | AS, SC, SM, GH, LI |
| **TypeScript** | Core | Type-safe authorization, typed API layer, domain modelling across ~50 modules. | AS, GH, LI |
| **JavaScript (ES2023+)** | Core | Foundation across all roles and 29 public repositories. | All |
| **SCSS / CSS** | Core | Design system, theming and layout in every role; SCSS-only animation work. | AS, SC, GH, LI |
| **HTML5 / semantics** | Strong | Accessible, semantic markup. | SM, GH, LI |
| **React Hook Form** | Strong | Reusable form system underpinning most MK Kredit business modules. | AS, SC |
| **Zod** | Strong | Schema validation paired with typed forms and API boundaries. | AS |
| **Ant Design** | Strong | Component foundation and multi-theme design system for MK Kredit. | AS |
| **Material UI** | Working | Component library work. | LI |
| **i18next** | Strong | Armenian-first internationalization with multi-locale support. | AS |
| **nuqs** | Working | Type-safe URL search-param state. | LI |
| **Next.js** | Working | Routing, SSR and SSG in TypeScript. **Personal projects only — not commercial.** | GH |

## State & data

| Technology | Depth | What it's used for | Evidence |
|---|---|---|---|
| **TanStack Query** | Core | Server-state architecture for MK Kredit — caching, invalidation, request lifecycle. | AS |
| **Redux Toolkit** | Strong | Client state across two commercial platforms. | AS, SC |
| **Axios** | Strong | Centralized API client with interceptors, JWT refresh, unified error handling. | AS |
| **REST / OpenAPI** | Strong | 36 domain services, 190+ endpoints; Swagger-driven client work. | AS |
| **JWT auth** | Strong | Token handling with automatic refresh and type-safe authorization. | AS |

## Architecture

| Capability | Depth | What it's used for | Evidence |
|---|---|---|---|
| **Feature-Sliced Design** | Core | The architecture of MK Kredit; validated separately in a public reference build. | AS, GH (`FSD_Test`) |
| **Enterprise frontend architecture** | Core | Greenfield → ~50 business modules with enforced module boundaries. | AS |
| **Design systems & theming** | Strong | Multi-theme system, tokens, reusable component and table systems. | AS |
| **Type-safe authorization** | Strong | Role and permission modelling in a regulated financial product. | AS |
| **Error-handling architecture** | Strong | Centralized error boundaries and API failure handling. | AS |
| **PWA** | Working | Offline/installable capability on MK Kredit. | AS |
| **Internationalization** | Strong | Armenian-first, multi-locale. | AS |
| **Responsive / mobile-first** | Strong | Mobile-first delivery on enterprise UI. | AS, SC |
| **Accessibility** | Working | Semantic markup and keyboard support. `[VERIFY]` no formal a11y programme claimed — do not overstate. | INFERENCE |

## AI & agentic engineering

| Capability | Depth | What it's used for | Evidence |
|---|---|---|---|
| **Claude Code** | Core | Primary AI development environment across the engineering lifecycle. | AS, LI |
| **Agentic development** | Core | Specialized agents for architecture, implementation, refactoring, docs, review. | AS |
| **Project-aware scaffolding** | Strong | Generating modules that already conform to project architecture. | AS |
| **Context engineering** | Strong | Structuring project context so generated code respects real constraints. | AS |
| **Spec-driven development** | Strong | Specification before generation, as a delivery method. | AS |
| **Human-in-the-loop validation** | Strong | Review gates keeping AI output compliant with architecture and business rules. | AS |
| **Figma / Jira / Swagger integrations** | Working | Feeding design, ticket and API context into the AI workflow. | AS |

> This block is the strongest differentiator on the site. It is also the most scrutinised — every line names a **specific, checkable practice**, never "AI-powered".

## Tooling & infrastructure

| Technology | Depth | What it's used for | Evidence |
|---|---|---|---|
| **Vite** | Core | Build tooling on the enterprise platform and recent personal work. | AS, GH, LI |
| **Git / GitFlow** | Strong | Branching and release discipline in team settings. | SC, LI |
| **GitHub Actions** | Working | Automated CI quality gates. | AS |
| **Docker** | Working | Containerized development and delivery. | AS |
| **Azure** | Familiar | Deployment target for MK Kredit. `[VERIFY]` depth of ownership. | AS |
| **ESLint / Prettier** | Strong | Enforced standards across commercial and personal repositories. | AS, GH |
| **PostCSS** | Working | Style pipeline. | GH |
| **Netlify / Vercel** | Working | Deployment of personal projects. | GH |

## Design

| Tool | Depth | What it's used for | Evidence |
|---|---|---|---|
| **Figma** | Working | Design handoff; integrated into the AI workflow. | AS |
| **Adobe Photoshop** | Strong | Two years professional — colour grading, retouching, restoration. | EdEl, LI |
| **Adobe Lightroom** | Strong | Two years professional — colour correction and grading. | EdEl, LI |

## Soft skills (INFERENCE — supported, not self-declared)

| Skill | Support |
|---|---|
| Architectural ownership | Sole architect of a greenfield enterprise codebase |
| Technical writing | Authored user guides for end users and internal teams at SoftConstruct |
| Cross-functional collaboration | Sprint planning, code review, architecture discussion |
| Mentorship-adjacent context | Employer runs a student mentorship programme. `[VERIFY]` personal involvement — **excluded** from public copy |
| Design collaboration | Two years professional design work before engineering |
| Audience building | 13,000+ LinkedIn followers |

---

## Explicitly excluded from the website

| Excluded | Reason |
|---|---|
| **Full-Stack Development** | Listed on LinkedIn; **no supporting evidence anywhere**. Highest-risk claim on the profile. |
| Node.js, NestJS, PostgreSQL, Redis | No evidence in any role or repository. |
| Testing (unit/E2E) | No tests in any public repository; not claimed in any role. `[VERIFY]` — likely exists in commercial work but cannot be asserted. |
| Three.js / WebGL | No evidence. **Used to build this site; never claimed as commercial experience.** |
| Microservices, Kubernetes, AWS/GCP | No evidence. |
| C#, Pascal | Appear only in the YSCI certificate skill tags. Academic; not current. |

---

## Presentation rules for the Tech Stack section

1. Group by **Frontend · State & Data · Architecture · AI Engineering · Tooling & Infrastructure · Design**.
2. Each item shows depth and a one-line "what I use it for". No decontextualised logo grids.
3. Sort within each group by depth, then by relevance to the primary positioning.
4. Mark `Next.js` visibly as personal-project experience. Honesty here costs nothing and is noticed.
5. Never render the excluded list.
