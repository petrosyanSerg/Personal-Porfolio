import type { DesignSystemId } from '@/design-system';

export const worldNodeIds = [
  'about',
  'experience',
  'architecture',
  'stack',
  'projects',
  'contact',
] as const;

export type WorldNodeId = (typeof worldNodeIds)[number];

export function isWorldNodeId(value: unknown): value is WorldNodeId {
  return typeof value === 'string' && (worldNodeIds as readonly string[]).includes(value);
}

/** What the node grows into when the visitor selects it. */
export type NodeDetail =
  | 'identity' // the portrait plate and the name
  | 'timeline' // one slab per role, oldest to newest
  | 'layers' // the dependency stack, top layer first
  | 'network' // skill groups and the technologies inside them
  | 'modules' // one module per project
  | 'beacon'; // the contact signal

export type Vec3 = readonly [number, number, number];

export type WorldNode = {
  readonly id: WorldNodeId;
  readonly index: number;
  /** Resting position in world space. The core sits at the origin. */
  readonly position: Vec3;
  /** The HTML section this node stands for — the accessible equivalent. */
  readonly section: string;
  readonly labelKey: string;
  readonly detail: NodeDetail;
  /** A real, sourced number. `null` where no honest figure exists. */
  readonly count: number | null;
  readonly countKey: string | null;
};

export type WorldEdge = readonly [WorldNodeId | 'core', WorldNodeId | 'core'];

/**
 * The visual dialect a design system speaks in the world. Fifty design systems
 * resolve into this one shape; there is no second scene implementation.
 */
export type WorldDialect = {
  readonly node: 'sphere' | 'box' | 'octahedron' | 'ring' | 'crystal' | 'plate';
  readonly surface: 'solid' | 'wire' | 'glow' | 'flat';
  readonly link: 'line' | 'dashed' | 'beam';
  readonly motes: 'drift' | 'grid' | 'spark' | 'none';
  readonly ground: 'grid' | 'plane' | 'horizon' | 'none';
  readonly light: 'studio' | 'ambient' | 'dramatic' | 'flat';
  readonly motion: 'float' | 'orbit' | 'pulse' | 'still';
  /** Multiplies node radius. Chunky worlds read larger. */
  readonly weight: number;
};

export type WorldTheme = WorldDialect & {
  readonly id: DesignSystemId;
};
