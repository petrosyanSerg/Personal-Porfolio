/**
 * The Feature-Sliced Design layers, top to bottom. Dependencies point downward
 * only. Shared by the Architecture section and by the world's architecture node,
 * so the two can never disagree about what the stack is.
 */
export const architectureLayers = [
  'app',
  'pages',
  'widgets',
  'features',
  'entities',
  'shared',
] as const;

export type ArchitectureLayer = (typeof architectureLayers)[number];
