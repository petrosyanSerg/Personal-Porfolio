import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { designSystemIds, type DesignSystemId } from '@/design-system';

/*
 * Contrast invariants for the fifty design systems.
 *
 * Every palette here is hand-written, one file per system, each declaring the
 * same forty-odd colour tokens twice — once for light, once for dark. That is
 * 4,000 hand-picked values, and nothing was checking that the text tokens could
 * actually be read against the surfaces they land on. They could not: the proof
 * bar numbers were invisible in eleven systems and six call-to-action buttons
 * were white-on-pastel.
 *
 * These tests are the floor. They do not judge taste; they only assert that
 * every text role clears WCAG AA against every surface it is used on, so a new
 * palette cannot ship unreadable.
 */

const DESIGN_DIR = join(process.cwd(), 'src/styles/design');

/** Body copy and anything below 18.66px: AA normal text. */
const AA_TEXT = 4.5;

type Rgb = { r: number; g: number; b: number; a: number };

function parseColor(value: string): Rgb | null {
  const raw = value.trim();

  const hex = /^#([0-9a-f]{3,8})$/i.exec(raw);
  if (hex?.[1]) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a,
    };
  }

  const rgb = /^rgba?\(([^)]+)\)$/i.exec(raw);
  if (rgb?.[1]) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean);
    const num = (token: string | undefined): number => {
      if (!token) return 0;
      return token.endsWith('%') ? parseFloat(token) / 100 : parseFloat(token);
    };
    const channel = (token: string | undefined): number => {
      if (!token) return 0;
      return token.endsWith('%') ? (parseFloat(token) / 100) * 255 : parseFloat(token);
    };
    return {
      r: channel(parts[0]),
      g: channel(parts[1]),
      b: channel(parts[2]),
      a: parts.length > 3 ? num(parts[3]) : 1,
    };
  }

  return null;
}

/**
 * Average the colour stops of a gradient. Text sitting on a gradient has to
 * clear contrast at the *worst* stop, so gradients are also checked stop by
 * stop; this is only used where a single representative colour is wanted.
 */
function gradientStops(value: string): Rgb[] {
  const stops = value.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]+\)/gi) ?? [];
  return stops.map(parseColor).filter((c): c is Rgb => c !== null);
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function flatten(fg: Rgb, bg: Rgb): Rgb {
  if (fg.a >= 1) return fg;
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function contrast(fg: Rgb, bg: Rgb): number {
  const a = relativeLuminance(flatten(fg, bg));
  const b = relativeLuminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

type Palette = Record<string, string>;

/**
 * Pull the two palette blocks out of a design system file. Each file is three
 * blocks: structural tokens that do not vary by mode, then the light palette,
 * then the dark one written as `:not([data-theme="light"])` so it also covers
 * the pre-hydration and cinematic cases.
 */
function readPalettes(id: DesignSystemId): { light: Palette; dark: Palette } {
  const source = readFileSync(join(DESIGN_DIR, `_${id}.scss`), 'utf8');

  const blockFor = (selector: string): Palette => {
    const start = source.indexOf(selector);
    if (start === -1) throw new Error(`No \`${selector}\` block in _${id}.scss`);

    const open = source.indexOf('{', start);
    let depth = 0;
    let end = open;
    for (let i = open; i < source.length; i += 1) {
      if (source[i] === '{') depth += 1;
      if (source[i] === '}') {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }

    const body = source.slice(open + 1, end);
    const palette: Palette = {};
    // Declarations can wrap across lines (gradients do), so split on `;`.
    for (const decl of body.split(';')) {
      const match = /(--[a-z0-9-]+)\s*:\s*([\s\S]+)/i.exec(decl);
      if (match?.[1] && match[2])
        palette[match[1]] = match[2].replace(/\s+/g, ' ').trim();
    }
    return palette;
  };

  return {
    light: blockFor(`[data-design="${id}"][data-theme="light"]`),
    dark: blockFor(`[data-design="${id}"]:not([data-theme="light"])`),
  };
}

/**
 * Resolve a token to a colour, following one level of `var(--other)` and
 * falling back to the base contract where a system does not override.
 */
function resolve(palette: Palette, token: string, fallback?: string): string | null {
  const seen = new Set<string>();
  let value = palette[token] ?? fallback;

  while (value && value.startsWith('var(')) {
    const inner = /^var\(\s*(--[a-z0-9-]+)/i.exec(value)?.[1];
    if (!inner || seen.has(inner)) return null;
    seen.add(inner);
    value = palette[inner];
  }

  return value ?? null;
}

/**
 * The pairs the components actually render. Each entry is
 * [text token, surface token, minimum ratio, where it shows up].
 */
const PAIRS: Array<[string, string, number, string]> = [
  ['--color-text', '--color-bg', AA_TEXT, 'body copy on the page'],
  ['--color-text-secondary', '--color-bg', AA_TEXT, 'section lead paragraphs'],
  ['--color-text-muted', '--color-bg', AA_TEXT, 'dates, metadata, evidence lines'],
  ['--color-accent-text', '--color-bg', AA_TEXT, 'eyebrows, journey years, links'],
  ['--color-teal-text', '--color-bg', AA_TEXT, 'signal labels'],
  ['--color-text', '--color-surface', AA_TEXT, 'card titles'],
  ['--color-text-muted', '--color-surface', AA_TEXT, 'card metadata'],
  ['--color-text', '--color-surface-2', AA_TEXT, 'tags, inset panels'],
  ['--color-text-secondary', '--color-surface-2', AA_TEXT, 'architecture slab labels'],
  /*
   * Borders are deliberately quiet in most of these systems and carry no
   * information on their own, so they are not held to a contrast floor here.
   * What matters is that nothing a reader has to *read* falls below AA.
   */
];

const systems = designSystemIds as readonly DesignSystemId[];

describe('design system palettes', () => {
  it('ships one file per registered design system', () => {
    const files = readdirSync(DESIGN_DIR)
      .filter((f) => f.startsWith('_') && f.endsWith('.scss'))
      .map((f) => f.slice(1, -5))
      .filter((name) => !['index', 'contract', 'world'].includes(name));

    expect([...files].sort()).toEqual([...systems].sort());
  });

  describe.each(systems)('%s', (id) => {
    const palettes = readPalettes(id);

    it.each(['light', 'dark'] as const)('%s palette keeps text readable', (mode) => {
      const palette = palettes[mode];
      const failures: string[] = [];

      for (const [fgToken, bgToken, min, usage] of PAIRS) {
        const fgRaw = resolve(palette, fgToken);
        const bgRaw = resolve(palette, bgToken, '#ffffff');
        if (!fgRaw || !bgRaw) continue;

        const fg = parseColor(fgRaw);
        if (!fg) continue;

        // A surface can be a gradient; the text has to survive every stop.
        const backgrounds = bgRaw.includes('gradient')
          ? gradientStops(bgRaw)
          : [parseColor(bgRaw)].filter((c): c is Rgb => c !== null);

        for (const bg of backgrounds) {
          if (bg.a < 0.9) continue; // translucent surfaces are checked in the browser sweep
          const ratio = contrast(fg, bg);
          if (ratio < min) {
            failures.push(
              `${fgToken} on ${bgToken} is ${ratio.toFixed(2)}:1, needs ${min}:1 (${usage})`,
            );
          }
        }
      }

      expect(failures).toEqual([]);
    });

    it.each(['light', 'dark'] as const)('%s button label is readable', (mode) => {
      const palette = palettes[mode];

      const fgRaw = resolve(palette, '--control-fg', '#ffffff');
      const bgRaw = resolve(palette, '--control-bg', '--color-accent-strong');
      if (!fgRaw || !bgRaw) return;

      const fg = parseColor(fgRaw);
      if (!fg) return;

      const backgrounds = bgRaw.includes('gradient')
        ? gradientStops(bgRaw)
        : [parseColor(bgRaw)].filter((c): c is Rgb => c !== null);

      const failures = backgrounds
        .filter((bg) => bg.a >= 0.9 && contrast(fg, bg) < AA_TEXT)
        .map((bg) => {
          const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
          return `--control-fg on #${hex(bg.r)}${hex(bg.g)}${hex(bg.b)} is ${contrast(
            fg,
            bg,
          ).toFixed(2)}:1, needs ${AA_TEXT}:1`;
        });

      expect(failures).toEqual([]);
    });

    it.each(['light', 'dark'] as const)('%s display text is painted', (mode) => {
      const palette = palettes[mode];
      const gradient = palette['--gradient-text'];

      /*
       * `@mixin text-gradient` clips the background to the glyphs and sets
       * `color: transparent`. A system is free to opt out of gradients with
       * `--gradient-text: none` — the mixin falls back to a flat
       * `background-color` — but it must never also blank the flat colour, or
       * the proof-bar numbers and the theatrical headline disappear.
       */
      if (gradient && gradient !== 'none') {
        expect(gradientStops(gradient).length).toBeGreaterThan(0);
      }

      const flat =
        resolve(palette, '--gradient-text-flat') ?? resolve(palette, '--color-text');
      expect(flat, `${id}/${mode} has no colour to paint clipped text with`).toBeTruthy();
      expect(parseColor(flat as string)?.a ?? 0).toBeGreaterThan(0.5);
    });
  });
});
