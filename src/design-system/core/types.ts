export const designSystemIds = [
  'neoclassical',
  'baroque',
  'aurora',
  'ethereal',
  'filigree',
  'acanthus',
  'anthropomorphic',
  'pixel-art',
  'conceptual-sketch',
  'luxury-typography',
  'japandi',
  'memphis',
  'bohemian',
  'shabby-chic',
  'cottagecore',
  'victorian',
  'art-deco',
  'art-nouveau',
  'mystical-western',
  'kitsch',
  'y2k',
  'bauhaus',
  'brutalism',
  'cybercore',
  'synthwave',
  'vaporwave',
  'pop-art',
  'bento-box',
  'graffiti',
  'tenebrism',
  'gothic',
  'pointillism',
  'mixed-media',
  'steampunk',
  'kawaii',
  'coquette',
  'surrealism',
  'utilitarian',
  'mid-century',
  'scrapbook',
  'frutiger-aero',
  'dark-academia',
  'light-academia',
  'wabi-sabi',
  'wild-west',
  'nautical',
  'rebus',
  'glassmorphism',
  'modular-typography',
  'neo-brutalism',
] as const;

export type DesignSystemId = (typeof designSystemIds)[number];

export type HeroComposition =
  | 'axial' // symmetric, centred, architectural
  | 'theatrical' // off-centre, deep, dramatic entrance
  | 'atmospheric' // full-bleed light field, type floats in it
  | 'character' // playful, illustrative, cursor-reactive
  | 'terminal' // retro computer interface
  | 'notebook' // annotated engineering page
  | 'editorial' // typography IS the composition
  | 'poster' // one oversized block, hard edges, flush left
  | 'collage' // layered fragments at angles
  | 'modular'; // a grid of cells the type is dealt into

export type HeroVoice =
  | 'institutional' // NAME / rule / role — the classical masthead
  | 'editorial' // the name at display size and almost nothing else
  | 'terminal' // prompt lines, a status, a monospace identity
  | 'flow' // IDEA -> SYSTEM -> PRODUCT
  | 'manifesto' // shouted, stacked, unornamented
  | 'atmospheric' // small identity, poetic headline, floating meta
  | 'spec' // label / value pairs, like a datasheet
  | 'playful'; // a greeting, a name, a role that talks back

export type CursorKind =
  | 'minimal'
  | 'ornamental'
  | 'glow'
  | 'feather'
  | 'pixel'
  | 'pencil'
  | 'character'
  | 'editorial'
  | 'crosshair'
  | 'blade'
  | 'bloom'
  | 'chrome'
  | 'spray'
  | 'lantern'
  | 'stitch'
  | 'brass';

export type DesignCapability =
  | 'pointer-field' // pointer-driven light/parallax written as CSS variables
  | 'ornament' // SVG ornament layer
  | 'characters' // the anthropomorphic character layer
  | 'system-readout'; // the interactive module readout over the scene

export type SceneMobileMode = 'full' | 'reduced' | 'disabled';

export type SceneProfile = {
  readonly mobile: SceneMobileMode;
  readonly cost: 'low' | 'medium' | 'high';
  readonly interaction: readonly ('pointer' | 'scroll')[];
};

export type PreviewSwatches = readonly [string, string, string];

export type DesignFamily =
  | 'classical'
  | 'ornamental'
  | 'atmospheric'
  | 'modernist'
  | 'retro'
  | 'digital'
  | 'expressive'
  | 'domestic';

export type DesignSystem = {
  readonly id: DesignSystemId;
  readonly index: number;
  readonly name: string;
  readonly descriptionKey: string;
  readonly family: DesignFamily;
  readonly hero: HeroComposition;
  readonly voice: HeroVoice;
  readonly cursor: CursorKind;
  readonly capabilities: readonly DesignCapability[];
  readonly scene: SceneProfile;
  readonly swatches: PreviewSwatches;
  readonly specimen: string;
};

export function isDesignSystemId(value: unknown): value is DesignSystemId {
  return (
    typeof value === 'string' && (designSystemIds as readonly string[]).includes(value)
  );
}
