# CLAUDE.md

Personal engineering site for Sergey Petrosyan. Next.js 16 App Router, React 19,
TypeScript, SCSS modules, Three.js, three first-class locales.

`README.md` is the full tour and `docs/` is the specification the site was built
from. This file is the short operational brief: what "done" means, and the
invariants that fail the build if you break them.

## Done means `npm run validate`

```bash
npm run validate       # typecheck → lint → lint:styles → test
npm run validate:full  # + build + Playwright e2e — the full CI chain
```

`.github/workflows/ci.yml` runs the same chain, plus `format:check`. Run
`validate` before claiming a change works. `validate:full` is slow — Playwright
builds and boots a production server on :3399 — so save it for changes that
touch routing, SEO, the 3D scene, or accessibility.

Edits are auto-formatted by `.claude/hooks/format.mjs` (Prettier, plus Stylelint
`--fix` on `.scss`), so `format:check` should never be the thing that fails.

## The rule that shapes everything

**No personal information lives inside a component.** Structure — dates, slugs,
technologies, links, numbers — is typed data in `src/data/`. Translatable prose
is keyed strings in `src/content/`. They join at render.

Adding a job, project, skill, or metric is a data edit plus a content edit. If
you are reaching for JSX to add a fact, you are in the wrong file. README
§"The one rule that shapes everything" has the full change table.

## Invariants the test suite enforces

These are audit decisions from `docs/PROFILE.md`, encoded so they cannot rot.
`tests/unit/data-integrity.test.ts` fails on all of them:

- **Locale parity** — `src/content/en.json`, `ru.json` and `hy.json` must have
  identical key paths. Adding an English string without both translations is a
  red build, not a TODO. All three locales are first-class, not translations of
  an English original (`docs/I18N_SPEC.md`).
- **Skill evidence** — a `Skill` with an empty `evidence` array fails. This is
  what keeps "Full-Stack Development" off the site. A test also asserts
  `Full-Stack` never reaches the JSON-LD `knowsAbout` array.
- **Metric evidence** — unverified figures carry `evidence: 'unverified'` and
  `display: false`. Do not flip either without a source.
- **Blocked case studies** — `Project.blockedBy` renders the card but 404s the
  case-study route, and a test asserts the 404.

Never add a claim about Sergey that `docs/` does not support. When a fact is
missing, the honest move is to leave the open item open — `README.md`
§"Open items" tracks them.

## Conventions

- Imports use the `@/*` alias for `src/*`. Type imports are inline
  (`import { type Foo }`), enforced by ESLint.
- `any` is an error, except under `src/components/hero3d/**` where R3F's JSX
  namespace is intentionally loose. That directory also turns off
  `react-hooks/immutability`, because a scene animates by writing into a
  geometry's typed arrays inside the frame loop — see the reasoning in
  `eslint.config.mjs`.
- `console` is a warning; only `warn` and `error` are allowed.
- `strict` plus `noUncheckedIndexedAccess`, `noUnusedLocals` and
  `noUnusedParameters` — indexed access is `T | undefined`, so narrow it.
- SCSS modules colocate with their component. `@use "abstracts" as *;` resolves
  through `sassOptions.loadPaths`; never write `../../../styles`.
- Tokens, breakpoints and mixins live in `src/styles/abstracts`. Reach for an
  existing token before adding a value.
- Env is parsed once by `src/lib/env.ts` with Zod. Add a variable there and in
  `.env.example`, never read `process.env` directly.

## Boundaries

- `docs/` is source material, not generated output, and is Prettier-ignored.
  Do not reformat or rewrite it as a side effect of another change.
- Never write to `.env.local`. Secrets belong there and nowhere else;
  `.env.example` documents shape only.
- The CSP in `next.config.ts` disallows `unsafe-eval` and restricts
  `script-src` to self. Do not loosen it to make a library work.
- This directory is **not yet a git repository**, so `.github/workflows/ci.yml`
  never runs. `git init` and push before relying on CI.
