# LinkedIn — corrected profile copy

Paste-ready replacement text for `linkedin.com/in/petrosyanserg`, derived from the audit in `PROFILE.md`. Nothing here is invented: every claim traces to a fact already on your profile, minus the ones the audit could not verify.

**Do the first item today.** The rest can wait for a quiet evening.

---

## 0. Priority order

| # | Fix | Why now |
|---|---|---|
| 1 | **Delete the `[Technology, e.g., React and Redux]` placeholder** in the SmartCode entry | It is publicly visible on your profile right now. One unfilled template bracket tells a reviewer the bullets were pasted and never finished — and it casts doubt on the two metrics sitting next to it. This is the single highest-value edit on this page. |
| 2 | Replace the About section | The current one leads with years; the new one leads with what you own. |
| 3 | Rewrite the EdEl Photostudio bullets | They contain marketing filler that clashes with the rest of the profile. |
| 4 | Headline | Minor; already good. |
| 5 | Featured section | Currently empty. Cheapest credibility you will ever buy. |

---

## 1. Headline

**Current** (fine, keep if you prefer it):

> Software Engineer | React / TypeScript | Enterprise Architecture | AI-First & Agentic Development

**Suggested** — same content, front-loads the domain, since "enterprise" and "fintech" are what recruiters filter on:

> Software Engineer · Enterprise Frontend Architecture · React & TypeScript · AI-Native Development

LinkedIn truncates the headline in search results at roughly 60 characters on mobile. Both versions survive to "Enterprise", which is the word doing the work.

---

## 2. About

Replaces the current About entirely.

> I build enterprise frontends for financial software — the kind where authorization, auditability and correctness are the product, not a feature.
>
> At Actual Solutions I own the frontend architecture of MK Kredit, a leasing and credit management platform. It went from an empty repository to roughly 50 business modules covering the complete credit lifecycle: application analysis, credit history, collateral, income and expenses, cash flow, credit committee approval, conclusions and disbursement. I designed its Feature-Sliced architecture, type-safe authorization, centralized API and error-handling layers, and the reusable form and table systems the product is built from — plus 36 API services across 190+ endpoints, PWA support, multi-theme design and Armenian-first internationalization.
>
> I also work AI-native, as professional practice rather than experiment. I use agentic development with Claude Code — specialized agents, project-aware scaffolding, Figma/Jira/Swagger integrations — together with context engineering, spec-driven development and human-in-the-loop validation. The interesting problem isn't getting AI to generate code. It's getting generated code to respect architecture, business rules and engineering standards, at speed, without eroding the system underneath.
>
> Before engineering I spent two years as a graphic designer. It still shows in how I treat interfaces.
>
> Stack: React 19 · TypeScript · Vite · TanStack Query · Redux Toolkit · React Hook Form · Zod · Ant Design · SCSS · i18next · Docker · GitHub Actions · Azure · Claude Code
>
> Focus: Enterprise frontend architecture · AI-native development · React/TypeScript · Developer experience

**Two deliberate changes from what is on your profile now.**

**"4+ years" is gone.** Counting from the SmartCode internship in September 2022, you are at 3 years 11 months as of August 2026. "4+" rounds eleven-twelfths up to a plus sign. It buys nothing, and it is the only overstatement on an otherwise clean profile — which makes it the one thing a careful reader might catch. If you want a number in the About, "four years building web applications, three of them commercial" is both true and more informative.

**The LOC figure is gone.** ~106K lines is the weakest of your four metrics: nobody can verify it, generated code and Ant Design configuration inflate it fast, and it invites the question "how did you count?" *~50 business modules* and *190+ endpoints* are stronger claims about the same codebase, because they describe scope rather than volume. If you do want to use the LOC number, qualify it — "~106K lines including generated API clients" reads as *more* credible than the bare figure, not less.

---

## 3. Experience — Actual Solutions

Your current bullets here are accurate and specific. Keep them. If you want a tightened version, this is the one used on the site and in the resume:

> Frontend architect and engineer for MK Kredit, an enterprise leasing and credit management platform.
>
> • Built and evolved a React 19 + TypeScript application from a greenfield codebase into roughly 50 business modules covering the complete leasing lifecycle — application analysis, credit history, collateral, income and expenses, cash flow, credit committee approval, conclusions and disbursement.
> • Architected the codebase around Feature-Sliced Design with enforced module boundaries and automated CI quality gates, so the application stays navigable as the domain expands.
> • Designed type-safe authorization, a centralized API layer and a unified error-handling architecture, plus reusable form and data-table systems that most business modules are composed from.
> • Integrated 36 domain API services spanning 190+ endpoints, with JWT authentication and automatic token refresh.
> • Delivered mobile-first responsive UI, PWA capabilities, a multi-theme design system, user personalization, and Armenian-first internationalization.
> • Applied AI-first and agentic development across the engineering lifecycle — requirements, architecture, implementation, refactoring, documentation and code review — using Claude Code, specialized agents, project-aware scaffolding and Figma / Jira / Swagger integrations.
> • Established context engineering, spec-driven development and human-in-the-loop validation so AI-generated code conforms to project architecture, business rules and engineering standards rather than merely compiling.

---

## 4. Experience — SoftConstruct

Keep the existing bullets. One addition worth making, once you decide what is safe to say:

**Add a one-line description of what SpringBME actually is.** Right now the entry names a product that a recruiter cannot look up — `springbme.com` returns no indexable content, and there is no third-party coverage. This is your longest tenure (2 years 6 months) and it currently reads as the thinnest section of your profile, purely because the reader has no idea what you worked on.

One NDA-safe sentence fixes it. Something in the shape of:

> SpringBME is a [what kind of system] for [what kind of user], operating at [rough scale].

If nothing about the product can be said, lead with the organization instead — SoftConstruct is a large Armenian engineering group, and 2.5 years there is a real credibility signal about team-scale delivery, code review culture and sprint process. That framing is honest and available to you today.

---

## 5. Experience — SmartCode ⚠️ fix this one first

**Current, live on your profile:**

> Built the new User Dashboard filter feature using **[Technology, e.g., React and Redux]**, resulting in a 15% faster data lookup for users.

**Replace the whole entry with:**

> Nine-month intensive internship moving from coursework to shipped product work.
>
> • Built user dashboard filtering functionality and contributed React components to an existing application.
> • Refactored an API data-fetching module to reduce duplication and improve response handling.
> • Worked to team standards for Git workflow, code review and delivery.

**About the two metrics.** *"15% faster data lookup"* and *"20% reduced average API response time"* are dropped here, and they are excluded from the resume and the website. Not because they are false — because they arrived in the same paste as the unfilled placeholder, and I have no way to verify them. If they are real and you remember how they were measured, put them back; a metric you can explain in an interview is worth more than three you cannot. If you cannot reconstruct the measurement, leave them out. An internship does not need metrics to be credible, and unverifiable numbers are the fastest way to lose a technical interview.

---

## 6. Experience — EdEl Photostudio

**Current bullets contain:** *"proving that Photoshop truly has no limits!"* and *"the growth I experienced was phenomenal"*. These read as machine-written, and they sit oddly against the precise engineering language everywhere else on the profile.

**Replace with:**

> • Handled colour correction and grading across portrait, product and event photography.
> • Streamlined the workflow between shoot, edit and delivery, reducing client turnaround time.
> • Carried out image restoration and cleanup on complex source material.

**Do not delete this role.** Two years of professional visual work before engineering is a genuine differentiator for a frontend engineer — real evidence of design sensibility and the ability to talk to designers as peers. It just needs to be stated plainly. The About section's closing line ("It still shows in how I treat interfaces") is what turns it from a detour into an asset.

---

## 7. Featured section

Currently empty. Add, in this order:

1. **Your website**, once deployed — it is the strongest single artifact you have.
2. **`github.com/petrosyanSerg/FSD_Test`** — the Feature-Sliced Design reference build. It is the only public repository that demonstrates the architecture your profile claims.

---

## 8. Skills

Reorder so the top three — the ones LinkedIn shows without expanding — are:

1. React
2. TypeScript
3. Frontend Architecture (or Feature-Sliced Design)

**Remove "Full-Stack Development"** if it is listed. The audit found no evidence for it anywhere in your public profile: no backend repository, no backend responsibility in any role, no server-side technology in any stack list. It is also absent from the website and from the JSON-LD, enforced by a test. A frontend architect who is precise about their own boundaries reads as more senior than one who claims everything.

**Certifications:** keep YSCI and the SmartCode Front-End Engineer credential prominent. The four Sololearn certificates are entry-level and three years behind your actual work — collapse or remove them. Beginner certificates sitting next to an enterprise fintech platform drag the perceived level down rather than adding to it.

---

## 9. Two questions to have an answer ready for

Neither is a problem. Both will be asked.

**The Nov 2025 – Feb 2026 gap (~3 months).** Short and unremarkable. One sentence is enough; have it ready rather than improvising.

**English proficiency.** Your profile declares English at *elementary*. If that rating is stale — and given that you are reading and writing English technical material daily, it likely is — it is capping your reach in exactly the market that pays most. Recruiters filter on it. Update it to whatever is honestly true.
