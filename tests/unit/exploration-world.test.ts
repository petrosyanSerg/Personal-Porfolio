import { beforeEach, describe, expect, it } from 'vitest';

import {
  initialExploration,
  nodeFromHash,
  reduce,
  type ExplorationState,
} from '@/components/world/core/exploration-store';
import { positionOf, worldEdges, worldNodes } from '@/components/world/core/graph';
import { VIEW_EXTENT, worldLayout } from '@/components/world/core/layout';
import { worldNodeIds, type WorldNodeId } from '@/components/world/core/types';
import { worldThemeFor } from '@/components/world/core/worldTheme';
import en from '@/content/en.json';
import hy from '@/content/hy.json';
import ru from '@/content/ru.json';
import { locales } from '@/config/i18n';
import { architectureLayers } from '@/data/architecture';
import { designSystemList } from '@/design-system';
import { experience } from '@/data/experience';
import { metrics } from '@/data/metrics';
import { projects } from '@/data/projects';
import { allSkills } from '@/data/skills';

type Json = Record<string, unknown>;

const localeFiles: Record<string, Json> = {
  en: en as Json,
  ru: ru as Json,
  hy: hy as Json,
};

function resolve(source: Json, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc == null) return undefined;
    return (acc as Json)[part];
  }, source);
}

/** The sections the page actually renders, from `src/app/[locale]/page.tsx`. */
const PAGE_SECTIONS = [
  'about',
  'experience',
  'architecture',
  'ai-native',
  'stack',
  'projects',
  'journey',
  'contact',
];

describe('the world graph stands on real data', () => {
  it('covers every declared node id exactly once', () => {
    expect([...worldNodes.map((node) => node.id)].sort()).toEqual(
      [...worldNodeIds].sort(),
    );
    expect(worldNodes).toHaveLength(worldNodeIds.length);
  });

  it('numbers the nodes for the panel counter in the order it renders them', () => {
    expect(worldNodes.map((node) => node.index)).toEqual(
      worldNodes.map((_, index) => index),
    );
  });

  it('points every node at a section the page really renders', () => {
    for (const node of worldNodes) {
      expect(PAGE_SECTIONS).toContain(node.section);
    }
  });

  it('derives every advertised number from the profile data', () => {
    const counts = new Map(worldNodes.map((node) => [node.id, node.count]));

    expect(counts.get('stack')).toBe(allSkills.length);
    expect(counts.get('projects')).toBe(projects.length);
    expect(counts.get('experience')).toBe(experience.length);
    expect(counts.get('architecture')).toBe(architectureLayers.length);
    expect(counts.get('contact')).toBeNull();
  });

  it('only shows the years figure while its evidence holds', () => {
    const years = metrics.find((metric) => metric.id === 'years');
    const about = worldNodes.find((node) => node.id === 'about');

    expect(about?.count).toBe(years?.evidence === 'fact' ? years.value : null);
  });

  it('carries a unit key wherever it carries a number', () => {
    for (const node of worldNodes) {
      expect(node.countKey === null).toBe(node.count === null && node.countKey === null);
      if (node.count !== null) expect(node.countKey).not.toBeNull();
    }
  });
});

describe('the graph is a connected system, not a scatter of points', () => {
  it('only joins nodes that exist', () => {
    const known = new Set<string>([...worldNodeIds, 'core']);

    for (const [from, to] of worldEdges) {
      expect(known.has(from)).toBe(true);
      expect(known.has(to)).toBe(true);
      expect(from).not.toBe(to);
    }
  });

  it('draws no edge twice', () => {
    const seen = worldEdges.map(([from, to]) => [from, to].sort().join('~'));
    expect(new Set(seen).size).toBe(seen.length);
  });

  it('reaches every node from the core', () => {
    const neighbours = new Map<string, string[]>();

    for (const [from, to] of worldEdges) {
      neighbours.set(from, [...(neighbours.get(from) ?? []), to]);
      neighbours.set(to, [...(neighbours.get(to) ?? []), from]);
    }

    const seen = new Set<string>(['core']);
    const queue = ['core'];

    while (queue.length > 0) {
      for (const next of neighbours.get(queue.shift()!) ?? []) {
        if (seen.has(next)) continue;
        seen.add(next);
        queue.push(next);
      }
    }

    for (const id of worldNodeIds) expect(seen.has(id)).toBe(true);
  });

  it('keeps every node clear of the core and of its neighbours', () => {
    const places = [
      ...worldNodes.map((node) => ({ id: node.id as string, at: node.position })),
      { id: 'core', at: positionOf('core') },
    ];

    for (let i = 0; i < places.length; i += 1) {
      for (let j = i + 1; j < places.length; j += 1) {
        const a = places[i]!.at;
        const b = places[j]!.at;
        const distance = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

        expect(distance).toBeGreaterThan(1.8);
      }
    }
  });
});

describe('the exploration state machine', () => {
  let state: ExplorationState;

  beforeEach(() => {
    state = initialExploration;
  });

  it('starts idle with nothing selected', () => {
    expect(state).toEqual({ phase: 'idle', active: null, hovered: null, visited: [] });
  });

  it('moves between idle and exploring on hover alone', () => {
    state = reduce(state, { type: 'hover', id: 'projects' });
    expect(state.phase).toBe('exploring');
    expect(state.active).toBeNull();

    state = reduce(state, { type: 'hover', id: null });
    expect(state.phase).toBe('idle');
  });

  it('records a node as visited once, however often it is opened', () => {
    state = reduce(state, { type: 'focus', id: 'stack' });
    state = reduce(state, { type: 'release' });
    state = reduce(state, { type: 'focus', id: 'stack' });

    expect(state.visited).toEqual(['stack']);
    expect(state.phase).toBe('focused');
  });

  it('only lets the camera settle out of a return', () => {
    state = reduce(state, { type: 'focus', id: 'about' });
    expect(reduce(state, { type: 'settle' })).toBe(state);

    state = reduce(state, { type: 'release' });
    expect(state.phase).toBe('returning');
    expect(state.active).toBeNull();

    // The pointer has left the node by the time the camera gets home.
    state = reduce(state, { type: 'hover', id: null });
    state = reduce(state, { type: 'settle' });
    expect(state.phase).toBe('idle');
  });

  it('returns to exploring, not idle, when the pointer is still on a node', () => {
    state = reduce(state, { type: 'focus', id: 'contact' });
    state = reduce(state, { type: 'release' });
    state = reduce(state, { type: 'hover', id: 'experience' });
    state = reduce(state, { type: 'settle' });

    expect(state.phase).toBe('exploring');
  });

  it('hands the same state back when nothing changes, so nothing re-renders', () => {
    const hovered = reduce(state, { type: 'hover', id: 'stack' });

    expect(reduce(hovered, { type: 'hover', id: 'stack' })).toBe(hovered);
    expect(reduce(state, { type: 'release' })).toBe(state);
  });

  it('reads a node out of a deep link and ignores anything else', () => {
    for (const id of worldNodeIds) {
      expect(nodeFromHash(`#explore-${id}`)).toBe(id);
    }

    expect(nodeFromHash('#projects')).toBeNull();
    expect(nodeFromHash('#explore-nonsense')).toBeNull();
    expect(nodeFromHash('')).toBeNull();
  });
});

describe('the world is laid out inside the frame it is given', () => {
  const frames = [
    { width: 1920, height: 1080 },
    { width: 1440, height: 968 },
    { width: 1440, height: 1400 },
    { width: 1024, height: 900 },
    { width: 768, height: 1100 },
    { width: 390, height: 1000 },
    { width: 320, height: 900 },
  ];

  const compositions = [...new Set(designSystemList.map((design) => design.hero))];

  /** Themes with an instrument readout hand the world a band that starts lower. */
  const reserves = [0, 190];

  it.each(frames)('fits at $width×$height, in every composition', (frame) => {
    for (const composition of compositions) {
      for (const top of reserves) {
        const band = Math.min(frame.height - top, 700);
        const layout = worldLayout({ ...frame, top, band, composition });

        const perPixel = (2 * VIEW_EXTENT) / frame.height;
        const halfWidth = VIEW_EXTENT * (frame.width / frame.height);
        const reach = { x: 5.5 * layout.scale, y: 3.3 * layout.scale };

        const bandTop = (frame.height / 2 - top) * perPixel;
        const bandBottom = (frame.height / 2 - (top + band)) * perPixel;

        expect(layout.scale).toBeGreaterThan(0);
        expect(Math.abs(layout.offset[0]) + reach.x).toBeLessThanOrEqual(halfWidth);
        expect(layout.offset[1] + reach.y).toBeLessThanOrEqual(bandTop + 0.001);
        expect(layout.offset[1] - reach.y).toBeGreaterThanOrEqual(bandBottom - 0.001);
      }
    }
  });

  it('puts the world beside the copy only when there is a side to use', () => {
    const desktop = { width: 1440, height: 900, band: 700 } as const;
    const phone = { width: 390, height: 900, band: 700 } as const;

    expect(worldLayout(desktop).wide).toBe(true);
    expect(worldLayout(phone).wide).toBe(false);
    expect(worldLayout(phone).offset[0]).toBe(0);
  });

  it('steps aside for compositions whose copy claims the full measure', () => {
    const frame = { width: 1440, height: 968, band: 700 } as const;
    const beside = worldLayout({ ...frame, composition: 'atmospheric' });
    const edge = worldLayout({ ...frame, composition: 'axial' });

    expect(edge.scale).toBeLessThan(beside.scale);
    expect(edge.offset[0]).toBeGreaterThan(beside.offset[0]);
  });
});

describe('all fifty design systems speak the world', () => {
  const shapes = ['sphere', 'box', 'octahedron', 'ring', 'crystal', 'plate'];
  const surfaces = ['solid', 'wire', 'glow', 'flat'];
  const links = ['line', 'dashed', 'beam'];
  const motes = ['drift', 'grid', 'spark', 'none'];
  const grounds = ['grid', 'plane', 'horizon', 'none'];
  const lights = ['studio', 'ambient', 'dramatic', 'flat'];
  const motions = ['float', 'orbit', 'pulse', 'still'];

  it.each(designSystemList)('$id resolves to a valid dialect', (design) => {
    const theme = worldThemeFor(design);

    expect(theme.id).toBe(design.id);
    expect(shapes).toContain(theme.node);
    expect(surfaces).toContain(theme.surface);
    expect(links).toContain(theme.link);
    expect(motes).toContain(theme.motes);
    expect(grounds).toContain(theme.ground);
    expect(lights).toContain(theme.light);
    expect(motions).toContain(theme.motion);
    expect(theme.weight).toBeGreaterThan(0.5);
    expect(theme.weight).toBeLessThan(2);
  });

  it('does not collapse into one look — the families stay distinguishable', () => {
    const looks = new Set(
      designSystemList.map((design) => {
        const theme = worldThemeFor(design);
        return `${theme.node}/${theme.surface}/${theme.link}/${theme.ground}`;
      }),
    );

    expect(looks.size).toBeGreaterThanOrEqual(8);
  });
});

describe('the world says the same thing in every language', () => {
  const keys = [
    'hero.world.title',
    'hero.world.hint',
    'hero.world.hintStatic',
    'hero.world.loading',
    'hero.world.rail',
    'hero.world.skip',
    'hero.world.open',
    ...worldNodes.map((node) => `hero.world.nodes.${node.id}.tagline`),
    ...worldNodes
      .filter(
        (node): node is typeof node & { countKey: string } => node.countKey !== null,
      )
      .map((node) => `hero.world.units.${node.countKey}`),
    ...worldNodes.map((node) => `nav.${node.labelKey}`),
  ];

  for (const locale of locales) {
    it(`${locale}: every world string exists`, () => {
      const missing = keys.filter(
        (key) => typeof resolve(localeFiles[locale]!, key) !== 'string',
      );

      expect(missing).toEqual([]);
    });
  }

  it('counts every node in a form the reader’s language can inflect', () => {
    for (const locale of locales) {
      for (const node of worldNodes) {
        if (node.countKey === null) continue;

        const message = resolve(
          localeFiles[locale]!,
          `hero.world.units.${node.countKey}`,
        );

        expect(String(message)).toContain('{count, plural,');
      }
    }
  });

  it('names each node from the navigation, so the world and the menu agree', () => {
    const nav = (en as Json).nav as Record<string, string>;

    for (const node of worldNodes) {
      expect(typeof nav[node.labelKey]).toBe('string');
    }
  });
});

describe('every node id is a legal deep link', () => {
  it.each(worldNodeIds)('%s round-trips through the hash', (id: WorldNodeId) => {
    expect(nodeFromHash(`#explore-${id}`)).toBe(id);
  });
});
