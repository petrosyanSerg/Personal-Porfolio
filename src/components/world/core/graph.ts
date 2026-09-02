import { architectureLayers } from '@/data/architecture';
import { experience } from '@/data/experience';
import { metrics } from '@/data/metrics';
import { projects } from '@/data/projects';
import { allSkills } from '@/data/skills';

import type { Vec3, WorldEdge, WorldNode, WorldNodeId } from './types';

const years = metrics.find((metric) => metric.id === 'years');

/**
 * The world graph. Positions are authored, everything countable is derived from
 * `src/data` — a node can never advertise a number the profile does not hold.
 */
export const worldNodes: readonly WorldNode[] = [
  {
    id: 'about',
    index: 0,
    position: [0, 3.3, -0.9],
    section: 'about',
    labelKey: 'about',
    detail: 'identity',
    count: years?.evidence === 'fact' ? years.value : null,
    countKey: 'years',
  },
  {
    id: 'stack',
    index: 1,
    position: [-5.5, 0.9, -0.2],
    section: 'stack',
    labelKey: 'stack',
    detail: 'network',
    count: allSkills.length,
    countKey: 'technologies',
  },
  {
    id: 'projects',
    index: 2,
    position: [5.5, 0.9, -0.2],
    section: 'projects',
    labelKey: 'projects',
    detail: 'modules',
    count: projects.length,
    countKey: 'projects',
  },
  {
    id: 'architecture',
    index: 3,
    position: [0, -1.75, 2.4],
    section: 'architecture',
    labelKey: 'architecture',
    detail: 'layers',
    count: architectureLayers.length,
    countKey: 'layers',
  },
  {
    id: 'experience',
    index: 4,
    position: [-3.4, -3.3, 0.7],
    section: 'experience',
    labelKey: 'experience',
    detail: 'timeline',
    count: experience.length,
    countKey: 'roles',
  },
  {
    id: 'contact',
    index: 5,
    position: [3.4, -3.3, 0.7],
    section: 'contact',
    labelKey: 'contact',
    detail: 'beacon',
    count: null,
    countKey: null,
  },
];

export const worldNodeById = new Map(worldNodes.map((node) => [node.id, node]));

export function getWorldNode(id: WorldNodeId): WorldNode {
  const node = worldNodeById.get(id);
  if (!node) throw new Error(`No world node for "${id}"`);
  return node;
}

export const CORE_POSITION: Vec3 = [0, 0, 0];

/** Every node hangs off the core; the build chain is drawn on top of that. */
export const worldEdges: readonly WorldEdge[] = [
  ['core', 'about'],
  ['core', 'stack'],
  ['core', 'projects'],
  ['core', 'architecture'],
  ['core', 'experience'],
  ['core', 'contact'],
  ['stack', 'architecture'],
  ['architecture', 'projects'],
  ['architecture', 'experience'],
];

export function positionOf(id: WorldEdge[number]): Vec3 {
  return id === 'core' ? CORE_POSITION : getWorldNode(id).position;
}
