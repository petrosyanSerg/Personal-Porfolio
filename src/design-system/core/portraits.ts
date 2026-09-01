import { type DesignSystemId } from './types';

export const portraitSizes = {
  plate: { width: 140, height: 112 },
  about: { width: 400, height: 500 },
} as const;

export type ThemePortrait = {
  readonly plate: string;
  readonly about: string;
};

const slugs: Readonly<Record<DesignSystemId, string | null>> = {
  neoclassical: '01-neoclassical',
  baroque: '02-baroque',
  aurora: '03-aurora',
  ethereal: '04-ethereal',
  filigree: '05-filigree',
  acanthus: '06-acanthus',
  anthropomorphic: null,
  'pixel-art': '08-pixel-art',
  'conceptual-sketch': '09-conceptual-sketch',
  'luxury-typography': '10-luxury-typography',
  japandi: '11-japandi',
  memphis: '12-memphis',
  bohemian: '13-bohemian',
  'shabby-chic': '14-shabby-chic',
  cottagecore: '15-cottagecore',
  victorian: '16-victorian',
  'art-deco': '17-art-deco',
  'art-nouveau': '18-art-nouveau',
  'mystical-western': '19-mystical-western',
  kitsch: null,
  y2k: '21-y2k',
  bauhaus: '22-bauhaus',
  brutalism: null,
  cybercore: '24-cybercore',
  synthwave: '25-synthwave',
  vaporwave: '26-vaporwave',
  'pop-art': '27-pop-art',
  'bento-box': '28-bento-box',
  graffiti: '29-graffiti',
  tenebrism: '30-tenebrism',
  gothic: '31-gothic',
  pointillism: '32-pointillism',
  'mixed-media': '33-mixed-media',
  steampunk: '34-steampunk',
  kawaii: '35-kawaii',
  coquette: '36-coquette',
  surrealism: null,
  utilitarian: '38-utilitarian',
  'mid-century': null,
  scrapbook: '40-scrapbook',
  'frutiger-aero': '41-frutiger-aero',
  'dark-academia': '42-dark-academia',
  'light-academia': '43-light-academia',
  'wabi-sabi': '44-wabi-sabi',
  'wild-west': '45-wild-west',
  nautical: '46-nautical',
  rebus: '47-rebus',
  glassmorphism: '48-glassmorphism',
  'modular-typography': '49-modular-typography',
  'neo-brutalism': '50-neo-brutalism',
};

export const portraitGaps: Readonly<Partial<Record<DesignSystemId, string>>> = {
  anthropomorphic: 'the tile captioned Anthropomorphic draws Pixel Art',
  kitsch: 'both "Kitsch" captions sit on Bohemian and Cybercore artwork',
  brutalism: 'the "Brutalism" caption sits on a second Vaporwave tile',
  surrealism: 'no tile was drawn between Coquette and Scrapbook',
  'mid-century': 'no tile; the nearest candidate reads as Light Academia',
};

export const portraitSlugs = slugs;

export function portraitFor(id: DesignSystemId): ThemePortrait | null {
  const slug = slugs[id];
  if (slug === null) return null;

  return {
    plate: `/themes/portraits/${slug}.webp`,
    about: `/themes/about/${slug}.webp`,
  };
}
