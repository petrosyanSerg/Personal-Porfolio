# Deployment

From a local repository to a live, indexed site on Vercel. Roughly 40 minutes, most of it waiting for DNS.

Do it in this order. Steps 1–4 get the site live; 5–7 make it findable; 8 is the honest check that the performance claims in `WEBSITE_SPEC.md` §9 hold on real hardware.

---

## 0. Before you start

```bash
npm run validate:full
```

That runs the whole chain — typecheck, lint, stylelint, format, unit tests, production build, Playwright — and it is exactly what CI runs. If it is green locally, the deploy will not fail on anything this repository controls.

Confirm nothing secret is tracked:

```bash
git status --porcelain --ignored | grep -E "\.env" || echo "no env files tracked"
```

`.env.local` must never be committed. `.env.example` must be, and it is.

---

## 1. Push to GitHub

If the repository does not exist yet:

```bash
git init
git add .
git commit -m "Personal engineering site"
git branch -M main
git remote add origin https://github.com/petrosyanSerg/portfolio.git
git push -u origin main
```

Public or private both work with Vercel. **Public is better here** — the repository is itself a work sample, and the thing it demonstrates (typed data, evidence gates enforced by tests, a real CI workflow) is more persuasive to an engineer reading the code than the rendered site is. If you make it public, add a short description and topics: `nextjs`, `typescript`, `react`, `scss`, `three-js`, `i18n`, `accessibility`.

`.github/workflows/ci.yml` starts running on this first push. It needs no secrets — the build uses a placeholder `NEXT_PUBLIC_SITE_URL`, and the contact route is checked at request time, not at build time.

---

## 2. Import into Vercel

1. vercel.com → **Add New** → **Project** → import the repository.
2. Framework preset: **Next.js**, detected automatically.
3. Build command, output directory, install command: **leave every one on the default.** Next.js 16 on Vercel needs no configuration, and overriding these is how deployments break for no reason.
4. Do **not** deploy yet — set the environment variables first (next step). A first deploy without `NEXT_PUBLIC_SITE_URL` will build fine but bake the fallback origin into the canonical tags, and you would immediately redeploy anyway.

---

## 3. Environment variables

In **Project → Settings → Environment Variables**. Add each to **Production, Preview and Development** unless noted.

| Variable | Value | Required |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your final origin, no trailing slash — e.g. `https://petrosyanserg.dev` | Strongly recommended |
| `RESEND_API_KEY` | From resend.com/api-keys | Optional |
| `CONTACT_FROM_EMAIL` | A verified sender on your Resend domain | With Resend |
| `CONTACT_TO_EMAIL` | `petrosyanserg33@gmail.com` | With Resend |

Three things worth knowing about how this app treats them:

**`NEXT_PUBLIC_SITE_URL` is not decoration.** Canonical URLs, hreflang, the sitemap, `robots.txt` and OpenGraph image resolution all derive from it (`src/config/site.ts`). Without it the site falls back to `https://petrosyanserg.vercel.app`, and if you later attach a custom domain you get canonicals pointing at the wrong origin — which is the single most common way a small site fails to rank. **Set it to the domain you intend to keep**, before the first production deploy, not after.

**Nothing is secret in a `NEXT_PUBLIC_` variable.** `NEXT_PUBLIC_SITE_URL` is inlined into the client bundle and that is fine — it is a public URL. `RESEND_API_KEY` must never carry that prefix.

**Email is optional by design.** `src/lib/env.ts` validates all four; `isEmailConfigured` is true only when the key, sender and destination are all present. Without them the contact route returns 503 and the form shows your direct address instead of failing silently. You can ship without Resend and add it later — the form degrades honestly rather than swallowing messages.

Then **Deploy**.

---

## 4. Custom domain

**Project → Settings → Domains → Add.**

Add both `petrosyanserg.dev` and `www.petrosyanserg.dev`, and let Vercel redirect one to the other — it offers this and the apex is the better canonical. At your registrar:

| Record | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Vercel's dashboard shows the exact values for your project — **use those, not these, if they differ.** Propagation is usually minutes, occasionally an hour. TLS is issued automatically once DNS resolves; the site is HTTPS-only and sends HSTS with a two-year max-age and `preload`, so do not attach a domain here that you need to serve over plain HTTP anywhere else.

**After the domain resolves, update `NEXT_PUBLIC_SITE_URL` to the final origin and redeploy.** The environment variable is read at build time; changing it without a redeploy changes nothing.

---

## 5. Verify the deploy

Against the live URL:

```bash
curl -sI https://petrosyanserg.dev/ | head -20            # 308 → /en
curl -s  https://petrosyanserg.dev/robots.txt
curl -s  https://petrosyanserg.dev/sitemap.xml | head -40
```

Then by eye, once each:

- `/` redirects to `/en`; `/ru` and `/hy` load; the language switcher on `/en/projects/mk-kredit` lands on the same page in the other locale, not the home page.
- `/en/projects/springbme` returns **404**. This is correct — that case study is blocked on a public product description (`PROFILE.md` §2.2). It is asserted by a test, but confirm it in production once.
- The 3D scene mounts on desktop and the static SVG appears on mobile.
- The theme toggle persists across a reload.
- Send yourself a message through the contact form. If Resend is not configured, confirm the form shows the direct email address rather than a generic error.
- View source and check that `<link rel="canonical">` points at your real domain, not `*.vercel.app`.

**OpenGraph** — paste the URL into opengraph.xyz or LinkedIn's Post Inspector. Images are generated per locale at build; check `/en`, `/ru` and `/hy` each render a card. LinkedIn caches aggressively, so inspect before you post the link anywhere.

---

## 6. Google Search Console

1. search.google.com/search-console → **Add property** → **Domain** (not URL prefix — domain covers every subdomain and protocol).
2. Verify with the `TXT` record it gives you, at the same registrar as step 4.
3. **Sitemaps** → submit `sitemap.xml`.
4. **URL Inspection** → paste `https://petrosyanserg.dev/en` → **Request indexing**. Do the same for `/ru` and `/hy`.

Then leave it alone for a week. The thing to check when you come back is **International Targeting**: hreflang errors show up there, and reciprocal hreflang is the most common reason a multilingual site ranks in one language and not the others. The tags here are reciprocal and self-inclusive with `x-default`, and a test asserts it, so this should be clean — but confirm it once against the live site rather than trusting the test.

Optional and worth five minutes: Bing Webmaster Tools imports directly from Search Console.

---

## 7. Point everything at it

The site is the artifact; the profiles are the traffic. In order of value:

1. **LinkedIn Featured section** — add the site. Also do the fixes in `LINKEDIN_COPY.md`, starting with the unfilled template placeholder that is publicly visible right now.
2. **LinkedIn contact info** → Website.
3. **GitHub profile** → website field, and add the repository to your pinned repositories.
4. **GitHub profile README** — you do not have one. It is the first thing an engineer sees on your profile, and yours currently shows 29 repositories of coursework with nothing pinned (`PROFILE.md` §6). A short README plus four pinned repositories changes what that page says about you more than any single commit will.
5. **Telegram bio** → the URL.

---

## 8. Lighthouse, on real hardware

Everything in `WEBSITE_SPEC.md` §9 that is measurable in CI has been measured. Lighthouse has not: numbers from a sandboxed container are meaningless, which is why `FINAL_AUDIT.md` lists this as an open item rather than a green check.

Run it against the **production URL**, not a preview deployment and not `localhost`:

```
Chrome DevTools → Lighthouse → Mobile → Analyze page load
```

Check `/en`, `/en/projects/mk-kredit` and `/en/resume`.

| Target | |
|---|---|
| Performance | ≥ 90 (mobile) |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |
| LCP | < 2.0s |
| CLS | < 0.05 |
| INP | < 200ms |

**If Performance comes in low**, look at the 3D chunk first. It is 228.8 KB gzipped against a 180 KB budget — the audit's position is that the budget was wrong rather than the code (three.js is ~150 KB before any scene exists), and the chunk is lazy, desktop-only and capability-gated, so it should not touch a mobile Lighthouse run at all. If it *is* being loaded on mobile, that is a real bug in `useDeviceCapability`, not a budget question.

**If Accessibility is below 95**, that would be a surprise: axe-core reports zero violations across 15 route × locale combinations on both desktop and mobile viewports. Lighthouse and axe overlap heavily but not completely — if they disagree, read the specific audit before changing anything, because three of the contrast fixes in this codebase were made in response to real axe failures and are load-bearing.

Record the numbers in `FINAL_AUDIT.md` when you have them. That closes the last open item that belongs to this repository rather than to you.

---

## 9. Ongoing

**Every push to `main` deploys.** Every pull request gets a preview URL. CI runs the full gate chain on both; a red build does not block the Vercel deploy by default, so if you want that, enable **Settings → Git → "Only deploy when checks pass"**.

**Adding a project or a job** touches `src/data/` and `src/content/*.json` and nothing else. The tests will tell you if you forgot a locale, referenced a technology that is not in the skills registry, or added a skill with no evidence — that last one is what keeps unsupported claims off the site, and it is the reason this repository is worth showing to an engineer.

**Adding a locale** is one JSON file and one entry in `src/config/i18n.ts`. The type system will fail the build until the file has all 303 keys.
