# DESIGN_SYSTEM.md

Visual concept: **Structured depth** (`PERSONAL_BRAND.md` §6). The work is imposing order on complexity — layered architecture, enforced boundaries, systems legible at scale. The interface should read as *engineered*, not decorated.

Dark-first. A light theme is defined but the dark theme is canonical.

---

## 1. Colour

Near-black with a cool blue-violet cast — not pure black, which reads cheap and crushes depth. One saturated accent for emphasis and interaction; one cyan-teal for data, 3D and secondary accents. Gradients are atmospheric (depth and light), never decoration.

### Dark theme — canonical

```scss
// Ground
--color-bg:            #0A0B0F;  // page ground
--color-bg-elevated:   #0E1016;  // sticky header, overlays
--color-surface:       #12141C;  // cards
--color-surface-2:     #191C26;  // nested / hover
--color-surface-3:     #212533;  // active

// Line
--color-border:        #232838;
--color-border-strong: #333A4F;
--color-border-accent: rgba(91, 124, 255, 0.38);

// Text
--color-text:          #EAECF2;  // 15.8:1 on bg
--color-text-secondary:#B4BAC9;  //  9.4:1
--color-text-muted:    #848CA0;  //  5.3:1
--color-text-faint:    #5C6377;  //  3.1:1 — non-text only

// Accent
--color-accent:        #5B7CFF;
--color-accent-hover:  #7A93FF;
--color-accent-press:  #4869E8;
--color-accent-soft:   rgba(91, 124, 255, 0.12);
--color-accent-text:   #93A9FF;  //  7.1:1 — accent text on bg

// Secondary
--color-teal:          #35D8C4;
--color-teal-soft:     rgba(53, 216, 196, 0.12);
--color-teal-text:     #5FE3D2;

// Status
--color-warn:          #F5B544;
--color-danger:        #FF6B6B;
--color-success:       #48D597;
```

### Light theme

```scss
--color-bg:            #FBFBFD;
--color-bg-elevated:   #FFFFFF;
--color-surface:       #FFFFFF;
--color-surface-2:     #F4F5F9;
--color-surface-3:     #EAECF3;
--color-border:        #E2E5EE;
--color-border-strong: #C9CEDD;
--color-text:          #101219;
--color-text-secondary:#3B4254;
--color-text-muted:    #656D82;
--color-text-faint:    #949BAD;
--color-accent:        #3557F0;
--color-accent-hover:  #2544DC;
--color-accent-text:   #2544DC;  // 6.9:1
--color-teal:          #0E9E8C;
--color-teal-text:     #0A7D6F;
```

### Cinematic theme

A tuning of the dark theme, not a third palette. The hues stay; the ground drops toward true black, the surfaces gain a trace of blue, and the text gets *lighter* rather than dimmer — a darker ground is only atmospheric if the type stays legible on it.

```scss
--color-bg:            #04050A;
--color-bg-elevated:   #080A12;
--color-surface:       #0C0F19;
--color-surface-2:     #121623;
--color-surface-3:     #1A1F30;
--color-border:        #1B2133;
--color-border-strong: #2C3550;
--color-text:          #EEF1F8;
--color-text-secondary:#BCC4D6;
--color-text-muted:    #8A93AA;
--color-accent:        #6C9CFF;
--color-accent-strong: #4460E8;  // 5.1:1 against white
--color-teal:          #3FE0CC;
```

> **The one number that needed care.** `--color-accent-strong` carries white button labels, so it must clear 4.5:1 against `#FFF`. The first cinematic value, `#4A6BF0`, measured **4.51** — technically passing, with 0.01 of margin, which is not a margin. `#4460E8` measures 5.1. The axe suite now runs against all three themes for exactly this reason.

#### Atmosphere variables

The cinematic layers are switched by variables, not by mounting components. Every theme declares them; only cinematic sets them non-zero, so `CinematicBackground` renders identical markup in all three and simply paints nothing in two of them.

```scss
--atmos-strata:   0 | 1      // horizontal volumetric bands
--atmos-fog:      0 | 1      // large blurred masses
--atmos-motes:    0 | 1      // drifting particles
--atmos-grain:    0 | 0.035  // film grain
--atmos-vignette: 0 | 0.55
--cursor-light:   0.045 | 0.055 | 0.10  // flashlight strength, per ground
```

Declared on bare `:root` **before** any `[data-theme]` block: `:root` and `[data-theme="…"]` have equal specificity, so a later `:root` would silently cancel the cinematic values.

#### The layer order

Ground → volumetric light → fog → motes → grain → content → cursor light → vignette.

The light is **banded horizontally**, not pooled. The site's entire argument is six architectural layers with strictly downward dependencies, so the room it is lit in is built the same way — and the motes drift downward only, for the same reason. That constraint is what keeps the atmosphere from being generic; a fog layer that could belong to any dark portfolio would be decoration, and this one is the thesis restated in light.

### Gradients

```scss
--gradient-hero:    radial-gradient(120% 90% at 50% 0%, rgba(91,124,255,0.20) 0%, rgba(10,11,15,0) 62%);
--gradient-accent:  linear-gradient(135deg, #5B7CFF 0%, #35D8C4 100%);
--gradient-text:    linear-gradient(180deg, #FFFFFF 0%, #A9B2C9 100%);
--gradient-surface: linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0) 100%);
--gradient-edge:    linear-gradient(90deg, transparent, rgba(91,124,255,0.5), transparent); // hairline dividers
```

> **Contrast is a hard gate.** Every text token above is verified against its background at ≥4.5:1 (body) or ≥3:1 (large display). `--color-text-faint` is for decorative rules and disabled non-text only. **Never put body text on a gradient.**

---

## 2. Typography

Three faces, each with a job. Chosen for coverage as much as for looks — the site ships in Latin, Cyrillic **and Armenian**, and a display face that lacks Armenian would break the `hy` locale.

| Role | Family | Coverage | Used for |
|---|---|---|---|
| Display & body | **Inter Variable** | Latin, Cyrillic | Headlines through body |
| Mono | **JetBrains Mono** | Latin, Cyrillic | Metrics, tech tags, labels, code, eyebrows |
| Armenian | **Noto Sans Armenian** | Armenian | Automatic fallback in the `hy` locale |

**Why one family for display and body.** The brand is *engineered, not decorated*. Inter across the whole scale — separated by size, weight and tracking rather than by a second personality — is the more disciplined choice, and it halves the font payload. Character comes from **JetBrains Mono** used deliberately: every number, tech tag and section eyebrow is monospace. That is the engineering signal, and it is what makes the type feel authored rather than default.

```scss
--font-sans: "Inter", "Noto Sans Armenian", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
```

Loaded via `next/font/google` with `display: swap`, subset per locale (`latin` + `cyrillic` + `armenian`), preloaded, self-hosted at build. No layout shift, no external font request at runtime.

### Scale — fluid, `clamp()` between 375px and 1440px

```scss
--fs-display-1: clamp(2.75rem, 1.30rem + 6.20vw, 7.00rem);  //  44 → 112  hero H1
--fs-display-2: clamp(2.25rem, 1.32rem + 3.97vw, 4.50rem);  //  36 →  72  section H2
--fs-h3:        clamp(1.50rem, 1.19rem + 1.32vw, 2.25rem);  //  24 →  36
--fs-h4:        clamp(1.25rem, 1.13rem + 0.53vw, 1.50rem);  //  20 →  24
--fs-lead:      clamp(1.0625rem, 0.98rem + 0.37vw, 1.3125rem); // 17 → 21
--fs-body:      1rem;      // 16
--fs-small:     0.875rem;  // 14
--fs-caption:   0.8125rem; // 13
--fs-mono-sm:   0.75rem;   // 12  tags, eyebrows
```

```scss
--lh-tight: 0.98;  --lh-snug: 1.14;  --lh-normal: 1.55;  --lh-relaxed: 1.7;
--ls-display: -0.035em;  --ls-heading: -0.02em;  --ls-body: -0.005em;  --ls-mono: 0.02em;  --ls-eyebrow: 0.16em;
--fw-regular: 400; --fw-medium: 500; --fw-semibold: 600; --fw-bold: 700;
```

**Rules**
1. Display sizes always pair with `--ls-display` and `--lh-tight`. Large type at default tracking looks unset.
2. Measure caps at **68ch** for body, **24ch** for display headlines.
3. Eyebrows: mono, 12px, uppercase, `--ls-eyebrow`, `--color-accent-text`.
4. Numbers in mono, always — `~50`, `190+`, `36`. The metrics are the evidence; they should look like readings.
5. Armenian runs ~12% wider than Latin. Never size a container to Latin text. See `I18N_SPEC.md` §6.

---

## 3. Spacing

8px base, with a 4px step for dense UI.

```scss
--space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;  --space-4: 1rem;
--space-5: 1.5rem;   --space-6: 2rem;     --space-7: 2.5rem;   --space-8: 3rem;
--space-9: 4rem;     --space-10: 5rem;    --space-11: 6rem;    --space-12: 8rem;
--space-13: 10rem;   --space-14: 12rem;

--section-y: clamp(5rem, 3.2rem + 7.7vw, 10rem);   //  80 → 160  vertical rhythm between sections
--gutter:    clamp(1.25rem, 0.7rem + 2.3vw, 2.5rem); //  20 →  40  page side padding
```

---

## 4. Layout

```scss
--container-xs:   36rem;  // 576  prose
--container-sm:   48rem;  // 768  case-study body
--container-md:   64rem;  // 1024
--container-lg:   75rem;  // 1200 default
--container-xl:   87.5rem;// 1400 wide / full-bleed sections
--container-full: 100%;
```

12-column grid at ≥1024px, 6-column 768–1023px, 4-column below. Column gap `--space-5`.

### Breakpoints

```scss
$bp-xs: 375px;  $bp-sm: 480px;  $bp-md: 768px;
$bp-lg: 1024px; $bp-xl: 1280px; $bp-2xl: 1440px; $bp-3xl: 1920px;
```

Mobile-first: `min-width` only. Verified at 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920.

---

## 5. Radius, elevation, blur

```scss
--radius-xs: 4px;  --radius-sm: 6px;   --radius-md: 10px;
--radius-lg: 16px; --radius-xl: 24px;  --radius-2xl: 32px; --radius-full: 999px;

// Depth is built from a hairline + a soft shadow + an inner top highlight.
--shadow-sm:  0 1px 2px rgba(0,0,0,.30);
--shadow-md:  0 4px 16px rgba(0,0,0,.34);
--shadow-lg:  0 12px 40px rgba(0,0,0,.42);
--shadow-xl:  0 24px 72px rgba(0,0,0,.50);
--shadow-glow: 0 0 0 1px var(--color-border-accent), 0 8px 32px rgba(91,124,255,.22);
--highlight-top: inset 0 1px 0 rgba(255,255,255,.06);

--blur-sm: 8px;  --blur-md: 16px;  --blur-lg: 32px;
--glass-bg: rgba(18, 20, 28, 0.62);
--glass-border: rgba(255, 255, 255, 0.075);
```

**Glass is used exactly twice** — the sticky header and the language switcher. Everywhere else, depth comes from surface tokens, hairlines and shadow. `backdrop-filter` is expensive and, used broadly, is the single fastest way to make a site feel cheap and drop INP.

```scss
--z-base: 0; --z-raised: 10; --z-sticky: 100; --z-header: 200;
--z-dropdown: 300; --z-overlay: 400; --z-modal: 500; --z-toast: 600;
```

---

## 6. Motion

Motion clarifies structure. If an animation does not aid comprehension or feedback, it does not ship.

```scss
--dur-instant: 90ms;  --dur-fast: 150ms;  --dur-base: 250ms;
--dur-slow: 400ms;    --dur-slower: 650ms; --dur-reveal: 850ms;

--ease-out:     cubic-bezier(0.22, 1, 0.36, 1);      // default — reveals, entrances
--ease-in-out:  cubic-bezier(0.65, 0, 0.35, 1);      // moves between two states
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);   // playful — buttons only
--ease-linear:  linear;                               // 3D and continuous loops only
```

**Rules**
1. Hover and focus feedback within `--dur-fast`. Anything slower feels broken.
2. Section reveals: 24px rise + fade over `--dur-reveal`, `--ease-out`, staggered 60ms in reading order.
3. Reveals fire **once**, at 15% viewport intersection. Content that re-animates on scroll-up is nauseating.
4. Parallax capped at 12% travel. More than that and text detaches from its context.
5. **Never animate `width`, `height`, `top` or `left`.** `transform` and `opacity` only.
6. Everything animated gets `will-change` applied on interaction start and removed on end — never left on statically.

### Pointer-driven motion

Four effects follow the cursor. All four are written as **CSS custom properties on `<html>`**, updated by exactly one rAF loop (`usePointerAmbience`); every visual consequence is CSS reading those variables. No React component re-renders while the pointer moves.

| Variable | Written by | Read by |
|---|---|---|
| `--pointer-x` / `--pointer-y` | rAF loop, raw position | the flashlight — a lagging light reads as a bug |
| `--cursor-x` / `--cursor-y` | rAF loop, lerped at 0.16 | the cursor ring — the lag is what gives it weight |
| `--spot-x` / `--spot-y` | `Spotlight`, per element, in % | card surface and edge lighting |
| `--magnet-x` / `--magnet-y` | `Magnetic`, per control | primary CTAs, max 6px |
| `--scroll-progress` | `ScrollProgress`, 0–1 | the top rail, and anything else that wants reading position |

The loop parks itself when the pointer stops within half a pixel of its target, so an idle tab schedules zero frames.

**Rules**
1. Every pointer effect is gated on `(hover: hover) and (pointer: fine)` **and** no reduced-motion preference. On a phone the flashlight would track a tap and the custom cursor would replace nothing.
2. The custom cursor is **additive**: the native cursor stays visible. Nothing is lost if it fails to paint.
3. Magnetism is spent on primary calls to action only. On every button it says nothing.
4. Contextual cursor labels come from `data-cursor-label` on the element, carrying a string the element already renders — so the label is translated by construction and cannot drift from the link it describes.

### Reduced motion

`prefers-reduced-motion: reduce` is a first-class path, not a degradation:

- The cursor, flashlight and magnetism are not merely stilled — `Atmosphere` renders nothing and the rAF loop never starts.
- The cinematic atmosphere **stays**, holding still. Someone who asked for less movement did not ask for less environment.
- All transforms, parallax and stagger removed; content appears at final state immediately.
- Opacity fades ≤150ms are retained — they aid orientation and do not trigger vestibular symptoms.
- The 3D scene renders **a single static frame** and stops its loop. It is never removed — removing it would strip content from users who did not ask for less content, only less movement.
- The scroll-pinned architecture sequence becomes a normally-scrolling stacked layout.

---

## 7. Components

| Component | Rules |
|---|---|
| **Button — primary** | Accent fill, `--radius-md`, 44px min height, `--dur-fast` hover lift 1px + `--shadow-glow`. Magnetic pull (max 6px) on pointer-fine devices only, disabled under reduced motion. |
| **Button — secondary** | Transparent, `--color-border-strong` hairline; hover fills `--color-surface-2` and brightens border. |
| **Card** | `--color-surface`, hairline border, `--radius-lg`, `--highlight-top`. Hover: border → `--color-border-accent`, `--shadow-lg`, 2px rise. |
| **Metric** | Mono, `--fs-display-2`, `--gradient-text` clipped to text; mono caption below in `--color-text-muted`. Optional count-up on first reveal (skipped under reduced motion). |
| **Tag / chip** | Mono 12px, `--color-surface-2`, hairline, `--radius-full`, 3px 10px padding. Depth-tinted in the tech stack: Core → accent border, Strong → default, Working → muted. |
| **Spotlight wrapper** | Composes around a card rather than replacing it: it owns `--spot-x/y` and the illuminated edge; the card keeps its own surface and adds a much softer interior wash. Both read as one light source. Hover and `:focus-within`, pointer-fine only. |
| **Magnetic wrapper** | `translate` on a `<span>` around the control, `--dur-slow --ease-spring` on release. Offset normalised to the control's own half-extents, so a wide button pulls the same distance as a narrow one. Off below `lg` and under reduced motion. |

### State, and why almost none of it is opacity

Three interaction states in this system deliberately avoid `opacity` for anything containing text:

- **Architecture slabs** carry active/passed/permitted state in surface and border colour. Dimming a slab dims its label, which measured 3.5:1.
- **Tech-stack relationships** mark related items with a 2px rule down the left edge and the focused item with a filled surface. Only the mono citation line dims, and only to 0.35 — it is a repeat of information already on screen.
- **Nav current state** is colour *and* a rule. Colour alone is the only signal a colour-blind reader would not get.

The rule generalises: **opacity cannot be made accessible.** If a state needs to recede, move the surface, not the text.
| **Section header** | Mono eyebrow + display H2 + optional lead. Preceded by a `--gradient-edge` hairline. |
| **Timeline entry** | Left rail with node markers; node fills accent as its entry enters the viewport. |
| **Nav link** | `--color-text-secondary` → `--color-text` on hover; active gets a 2px accent underline that slides between items. |
| **Language switcher** | Glass dropdown, each locale in its own script (English / Русский / Հայերեն), current marked `aria-current`. |
| **Architecture diagram** | Inline SVG, `currentColor`-driven so it themes automatically. Never a raster image. |

### Focus

```scss
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: var(--radius-xs);
}
```

Never removed, never replaced with a colour change alone. Visible against every surface token.

---

## 8. SCSS architecture

```
styles/
├── abstracts/    _tokens.scss  _breakpoints.scss  _mixins.scss  _functions.scss
├── base/         _reset.scss  _typography.scss  _global.scss  _a11y.scss
├── themes/       _dark.scss  _light.scss
└── main.scss     // global entry — tokens, reset, base only
```

Component styles are **SCSS Modules** (`Component.module.scss`) colocated with the component. `main.scss` holds only tokens, reset and base typography — never component rules.

Tokens are emitted as CSS custom properties on `:root` (dark) and `[data-theme="light"]`, so the theme swaps without a re-render. SCSS variables are used only for breakpoints and compile-time maps, which cannot be custom properties.

Every module imports abstracts through `@use "@/styles/abstracts" as *;` — configured via `sassOptions.includePaths`, so no `../../..` chains.

---

## 9. The 3D visual language

Full technical spec in `WEBSITE_SPEC.md` §7. Visually:

- Core: six unjoined plates in **line work**, `--color-accent-text`. Flat-shaded solids in an unlit scene read as cheap plastic; outlines read as a drawing, and cost one draw call.
- Joints: the plate corners as points, `--color-text`. They brighten and breathe once every module has been opened — the only reward in the scene, and deliberately quiet.
- Modules: small faceted octahedra, each at a fixed orientation so the ring reads as six solids rather than six flat diamonds. `--color-accent-text`, lerping to `--color-teal` on emphasis.
- Connections: one `LineSegments` with per-vertex colour, so a single draw call can brighten exactly the run being hovered.
- Pulses: travelling inward only, eased so they accelerate as they arrive — data landing, not a dot sliding.
- Ground: transparent — the page background shows through; no skybox
- Light: none. Unlit basic materials throughout; no lights, no shadow maps, no post-processing.
- Motion: 0.055 rad/s rotation on the group; the camera does the reacting, so the two motions never fight.

**Every colour comes from the CSS custom properties**, read through `useThemeColors`. Switch to the light theme and the diagram switches with it. Hard-coding hexes into the scene would have been shorter and permanently wrong in two of the three themes.

It never sits behind body text — and not by being positioned clear of it, which fails the moment the group turns, but by a **mask** that fades the canvas out across the left of the hero. On narrow viewports the type owns the full width, so the diagram drops to a 0.55-opacity backdrop with a vertical mask through the middle.

---

## 10. Non-negotiables

1. **Contrast ≥4.5:1 for body text, ≥3:1 for large display.** No exceptions for aesthetics.
2. **No text over a gradient or over the 3D scene.**
3. **Reduced motion is a designed path**, not a stripped one.
4. **Focus rings are never removed.**
5. **Touch targets ≥44×44px.**
6. **Glass twice, no more.**
7. **Every colour, size and duration comes from a token.** No magic numbers in component styles.
