import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  designSystemIds,
  designSystemList,
  designSystems,
  type DesignSystemId,
} from '@/design-system';
import { ornamentVocabulary } from '@/design-system/ornaments/vocabulary';
import en from '@/content/en.json';

const root = process.cwd();

function readScss(path: string): string {
  return readFileSync(join(root, path), 'utf8');
}

function parseScssMap(source: string, name: string): Record<string, string[]> {
  const start = source.indexOf(`$${name}: (`);
  if (start === -1) throw new Error(`No $${name} map in _worlds.scss`);

  let depth = 0;
  let end = start;

  for (let i = source.indexOf('(', start); i < source.length; i += 1) {
    if (source[i] === '(') depth += 1;
    if (source[i] === ')') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  const body = source.slice(start, end);
  const out: Record<string, string[]> = {};
  const entry = /"([a-z-]+)":\s*\(([^)]*)\)/g;
  let match: RegExpExecArray | null;

  while ((match = entry.exec(body)) !== null) {
    out[match[1]!] = [...match[2]!.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]!);
  }

  return out;
}

const worlds = readScss('src/styles/abstracts/_worlds.scss');

describe('the registry is complete', () => {
  it('declares exactly fifty worlds', () => {
    expect(designSystemIds).toHaveLength(50);
  });

  it('has no duplicate ids', () => {
    expect(new Set(designSystemIds).size).toBe(designSystemIds.length);
  });

  it('numbers them 1–50 in tuple order', () => {
    expect(designSystemList.map((design) => design.index)).toEqual(
      Array.from({ length: 50 }, (_, i) => i + 1),
    );
  });

  it('gives every world a distinct name', () => {
    const names = designSystemList.map((design) => design.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every world a distinct ground colour', () => {
    const grounds = designSystemList.map((design) => design.swatches[0].toLowerCase());
    expect(new Set(grounds).size).toBe(grounds.length);
  });
});

describe('every world is registered everywhere it has to be', () => {
  it.each(designSystemIds)('%s has a token file', (id) => {
    expect(existsSync(join(root, `src/styles/design/_${id}.scss`))).toBe(true);
  });

  it.each(designSystemIds)('%s is @used by the design index', (id) => {
    expect(readScss('src/styles/design/_index.scss')).toContain(`@use "${id}"`);
  });

  it.each(designSystemIds)('%s scopes its tokens to its own attribute', (id) => {
    expect(readScss(`src/styles/design/_${id}.scss`)).toContain(`[data-design="${id}"]`);
  });

  it.each(designSystemIds)('%s has a hero scene module', (id) => {
    expect(existsSync(join(root, `src/components/hero3d/scenes/${id}.tsx`))).toBe(true);
  });

  it.each(designSystemIds)('%s is wired into the scene registry', (id) => {
    const registry = readFileSync(
      join(root, 'src/components/hero3d/sceneRegistry.ts'),
      'utf8',
    );
    expect(registry).toContain(`import('./scenes/${id}')`);
  });

  it.each(designSystemIds)('%s has a description in every locale', (id) => {
    const descriptions = en.design.systems as Record<string, string>;
    expect(typeof descriptions[id]).toBe('string');
    expect(descriptions[id]!.length).toBeGreaterThan(20);
  });

  it.each(designSystemIds)('%s declares an ornament vocabulary', (id) => {
    expect(ornamentVocabulary[id as DesignSystemId]).toBeDefined();
  });
});

describe('the SCSS selector maps match the registry', () => {
  it('the composition map is exactly the registry, in both directions', () => {
    const map = parseScssMap(worlds, 'compositions');

    const fromScss = new Map<string, string>();
    for (const [composition, ids] of Object.entries(map)) {
      for (const id of ids) fromScss.set(id, composition);
    }

    const fromRegistry = new Map(
      designSystemList.map((design) => [design.id as string, design.hero as string]),
    );

    expect([...fromScss.entries()].sort()).toEqual([...fromRegistry.entries()].sort());
  });

  it('the voice map is exactly the registry, in both directions', () => {
    const map = parseScssMap(worlds, 'voices');

    const fromScss = new Map<string, string>();
    for (const [voice, ids] of Object.entries(map)) {
      for (const id of ids) fromScss.set(id, voice);
    }

    const fromRegistry = new Map(
      designSystemList.map((design) => [design.id as string, design.voice as string]),
    );

    expect([...fromScss.entries()].sort()).toEqual([...fromRegistry.entries()].sort());
  });

  it('the capability map is exactly the registry', () => {
    const map = parseScssMap(worlds, 'capabilities');

    for (const [capability, ids] of Object.entries(map)) {
      const fromRegistry = designSystemList
        .filter((design) =>
          (design.capabilities as readonly string[]).includes(capability),
        )
        .map((design) => design.id)
        .sort();

      expect([...ids].sort()).toEqual(fromRegistry);
    }

    const declared = new Set(designSystemList.flatMap((design) => design.capabilities));
    expect([...declared].sort()).toEqual(Object.keys(map).sort());
  });
});

function normaliseHex(value: string): string {
  const hex = value.replace('#', '').toLowerCase();
  if (hex.length !== 3) return hex;
  return hex
    .split('')
    .map((channel) => channel + channel)
    .join('');
}

describe('swatches do not drift from the tokens they preview', () => {
  it.each(designSystemIds)('%s previews its real ground colour', (id) => {
    const source = readScss(`src/styles/design/_${id}.scss`);
    const declared = /--color-bg:\s*(#[0-9a-f]{3,8})/i.exec(source)?.[1];

    expect(declared).toBeDefined();
    expect(normaliseHex(declared!)).toBe(
      normaliseHex(designSystems[id as DesignSystemId].swatches[0]),
    );
  });
});

describe('scene cost policy is coherent', () => {
  it('every high-cost scene is cut or reduced on a phone', () => {
    const offenders = designSystemList
      .filter((design) => design.scene.cost === 'high' && design.scene.mobile === 'full')
      .map((design) => design.id);

    expect(offenders).toEqual([]);
  });

  it('every world declares at least one interaction channel', () => {
    const inert = designSystemList
      .filter((design) => design.scene.interaction.length === 0)
      .map((design) => design.id);

    expect(inert).toEqual([]);
  });
});
