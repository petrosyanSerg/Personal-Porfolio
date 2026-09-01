import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import en from '@/content/en.json';
import hy from '@/content/hy.json';
import ru from '@/content/ru.json';
import {
  portraitFor,
  portraitGaps,
  portraitSizes,
  portraitSlugs,
} from '@/design-system/core/portraits';
import { designSystemIds } from '@/design-system/core/types';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

function webpSize(file: string): { width: number; height: number } {
  const bytes = readFileSync(file);
  expect(bytes.toString('ascii', 0, 4), `${file} is not a RIFF container`).toBe('RIFF');
  expect(bytes.toString('ascii', 8, 12), `${file} is not WebP`).toBe('WEBP');

  return {
    width: bytes.readUInt16LE(26) & 0x3fff,
    height: bytes.readUInt16LE(28) & 0x3fff,
  };
}

const drawn = designSystemIds.filter((id) => portraitSlugs[id] !== null);

describe('theme portraits', () => {
  it('covers every world exactly once, and no world twice', () => {
    expect(Object.keys(portraitSlugs).sort()).toEqual([...designSystemIds].sort());

    const slugs = Object.values(portraitSlugs).filter((slug) => slug !== null);
    expect(new Set(slugs).size, 'two worlds share one slug').toBe(slugs.length);
  });

  it('names each asset for the index its world carries in the registry', () => {
    for (const id of drawn) {
      const index = designSystemIds.indexOf(id) + 1;
      expect(portraitSlugs[id]).toBe(`${String(index).padStart(2, '0')}-${id}`);
    }
  });

  it('serves both renditions at their declared sizes', () => {
    for (const id of drawn) {
      const portrait = portraitFor(id);
      expect(portrait, `${id} should have artwork`).not.toBeNull();

      for (const [rendition, src] of Object.entries(portrait!)) {
        const size = portraitSizes[rendition as keyof typeof portraitSizes];
        expect(webpSize(path.join(PUBLIC_DIR, src)), `${id} ${rendition}`).toEqual({
          width: size.width,
          height: size.height,
        });
      }
    }
  });

  it('leaves nothing orphaned in either folder', () => {
    const expected = drawn.map((id) => `${portraitSlugs[id]}.webp`).sort();

    for (const rendition of Object.keys(portraitSizes)) {
      const dir = rendition === 'plate' ? 'portraits' : 'about';
      const onDisk = readdirSync(path.join(PUBLIC_DIR, 'themes', dir))
        .filter((name) => name.endsWith('.webp'))
        .sort();

      expect(onDisk, `public/themes/${dir}`).toEqual(expected);
    }
  });

  it('returns null, not a broken path, for a world with no artwork', () => {
    for (const id of designSystemIds) {
      if (portraitSlugs[id] === null) expect(portraitFor(id)).toBeNull();
      else expect(portraitFor(id)).not.toBeNull();
    }
  });

  it('documents exactly the worlds it has no artwork for', () => {
    const missing = designSystemIds.filter((id) => portraitSlugs[id] === null);

    expect([...missing].sort()).toEqual(Object.keys(portraitGaps).sort());
    for (const reason of Object.values(portraitGaps)) {
      expect(reason.trim().length).toBeGreaterThan(0);
    }
  });

  it('has alt text in all three locales, each keeping the {name} placeholder', () => {
    for (const [locale, content] of [
      ['en', en],
      ['ru', ru],
      ['hy', hy],
    ] as const) {
      const alt: unknown = content.design.portraitAlt;
      expect(typeof alt, `${locale} is missing design.portraitAlt`).toBe('string');
      expect(alt as string, `${locale} dropped the {name} placeholder`).toContain(
        '{name}',
      );
    }
  });
});
