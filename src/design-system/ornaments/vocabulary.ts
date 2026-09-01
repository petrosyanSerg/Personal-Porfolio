import type { DesignSystemId } from '../core/types';

export type OrnamentVocabulary =
  | 'none'
  | 'filigree'
  | 'acanthus'
  | 'baroque'
  | 'sketch'
  | 'deco'
  | 'nouveau'
  | 'tracery'
  | 'brass'
  | 'ribbon';

export type OrnamentRole = 'divider' | 'corner' | 'badge';

export const ornamentVocabulary: Readonly<Record<DesignSystemId, OrnamentVocabulary>> = {
  neoclassical: 'none',
  baroque: 'baroque',
  aurora: 'none',
  ethereal: 'none',
  filigree: 'filigree',
  acanthus: 'acanthus',
  anthropomorphic: 'none',
  'pixel-art': 'none',
  'conceptual-sketch': 'sketch',
  'luxury-typography': 'none',
  japandi: 'none',
  memphis: 'none',
  bohemian: 'none',
  'shabby-chic': 'none',
  cottagecore: 'none',
  victorian: 'baroque',
  'art-deco': 'deco',
  'art-nouveau': 'nouveau',
  'mystical-western': 'none',
  kitsch: 'none',
  y2k: 'none',
  bauhaus: 'none',
  brutalism: 'none',
  cybercore: 'none',
  synthwave: 'none',
  vaporwave: 'none',
  'pop-art': 'none',
  'bento-box': 'none',
  graffiti: 'none',
  tenebrism: 'none',
  gothic: 'tracery',
  pointillism: 'none',
  'mixed-media': 'none',
  steampunk: 'brass',
  kawaii: 'none',
  coquette: 'ribbon',
  surrealism: 'none',
  utilitarian: 'none',
  'mid-century': 'none',
  scrapbook: 'none',
  'frutiger-aero': 'none',
  'dark-academia': 'acanthus',
  'light-academia': 'none',
  'wabi-sabi': 'none',
  'wild-west': 'none',
  nautical: 'none',
  rebus: 'none',
  glassmorphism: 'none',
  'modular-typography': 'none',
  'neo-brutalism': 'none',
};

type RoleGeometry = {
  readonly box: readonly [number, number];
  readonly paths: readonly string[];
};

export const ornamentGeometry: Readonly<
  Record<
    Exclude<OrnamentVocabulary, 'none'>,
    Readonly<Record<OrnamentRole, RoleGeometry>>
  >
> = {
  filigree: {
    divider: {
      box: [240, 24],
      paths: [
        'M0 12h74',
        'M166 12h74',
        'M120 4l7 8-7 8-7-8 7-8Z',
        'M113 12c-8 0-10-7-16-7s-9 5-9 7 3 7 9 7 8-7 16-7Z',
        'M127 12c8 0 10-7 16-7s9 5 9 7-3 7-9 7-8-7-16-7Z',
        'M88 12h-6M158 12h-6',
      ],
    },
    corner: {
      box: [56, 56],
      paths: [
        'M2 54V14C2 7 7 2 14 2h40',
        'M2 30c10 0 18-8 18-18',
        'M14 54c0-12 10-22 22-22',
        'M8 8l6 6',
      ],
    },
    badge: {
      box: [64, 64],
      paths: [
        'M32 3a29 29 0 1 1 0 58 29 29 0 0 1 0-58Z',
        'M32 9a23 23 0 1 1 0 46 23 23 0 0 1 0-46Z',
        'M32 3v6M32 55v6M3 32h6M55 32h6',
      ],
    },
  },

  acanthus: {
    divider: {
      box: [240, 28],
      paths: [
        'M0 14h82',
        'M158 14h82',
        'M120 3c9 6 12 14 9 22-6-2-10-6-12-12',
        'M120 3c-9 6-12 14-9 22 6-2 10-6 12-12',
        'M104 14c-7-1-11-5-13-11 8 0 13 4 15 10',
        'M136 14c7-1 11-5 13-11-8 0-13 4-15 10',
        'M120 14v11',
      ],
    },
    corner: {
      box: [56, 56],
      paths: [
        'M2 54C2 26 26 2 54 2',
        'M6 42c14-2 24-12 28-26',
        'M14 52c2-12 10-20 22-24',
        'M22 30c6 2 10 6 12 12',
      ],
    },
    badge: {
      box: [64, 64],
      paths: [
        'M32 4c14 8 20 20 16 34-8-2-14-8-16-16',
        'M32 4c-14 8-20 20-16 34 8-2 14-8 16-16',
        'M32 60c-10-4-16-10-18-18M32 60c10-4 16-10 18-18',
        'M32 4v56',
      ],
    },
  },

  baroque: {
    divider: {
      box: [260, 32],
      paths: [
        'M0 16h72',
        'M188 16h72',
        'M130 5c14 0 22 5 22 11s-8 11-22 11-22-5-22-11 8-11 22-11Z',
        'M108 16c-10 0-14-8-22-8s-12 5-12 8 4 8 12 8 12-8 22-8Z',
        'M152 16c10 0 14-8 22-8s12 5 12 8-4 8-12 8-12-8-22-8Z',
        'M130 11v10M124 16h12',
      ],
    },
    corner: {
      box: [64, 64],
      paths: [
        'M2 62V20C2 10 10 2 20 2h42',
        'M2 40c14-2 24-12 26-26',
        'M12 62c2-16 14-28 30-30',
        'M20 20c8 0 14 6 14 14',
        'M6 6l10 10',
      ],
    },
    badge: {
      box: [72, 72],
      paths: [
        'M36 4c16 0 32 12 32 32S52 68 36 68 4 52 4 36 20 4 36 4Z',
        'M36 12c12 0 24 9 24 24s-12 24-24 24-24-9-24-24 12-24 24-24Z',
        'M36 2v10M36 60v10M2 36h10M60 36h10',
        'M14 14l7 7M58 14l-7 7M14 58l7-7M58 58l-7-7',
      ],
    },
  },

  sketch: {
    divider: {
      box: [240, 24],
      paths: [
        'M4 13c40-3 78 2 116-1 36-3 74 3 116 0',
        'M108 6c5 3 9 5 14 6-5 2-9 4-13 8',
        'M6 11c-1 3-1 5 0 7',
      ],
    },
    corner: {
      box: [56, 56],
      paths: [
        'M4 54c-2-24 0-38 4-44 5-6 20-8 44-6',
        'M6 20c0-6 1-10 3-13',
        'M22 5c6-1 11-1 16 0',
      ],
    },
    badge: {
      box: [64, 64],
      paths: [
        'M32 5c17-1 27 9 27 26 0 18-9 28-27 27C15 57 5 48 5 31 5 14 15 6 32 5Z',
        'M30 4c-9 1-16 4-21 9',
      ],
    },
  },

  deco: {
    divider: {
      box: [240, 24],
      paths: [
        'M0 12h86',
        'M154 12h86',
        'M120 2l10 10-10 10-10-10 10-10Z',
        'M104 4v16M98 6v12M92 8v8',
        'M136 4v16M142 6v12M148 8v8',
      ],
    },
    corner: {
      box: [56, 56],
      paths: ['M2 54V2h52', 'M2 40h14V2M2 28h26V2M2 16h38V2', 'M8 48l40-40'],
    },
    badge: {
      box: [64, 64],
      paths: [
        'M32 4l28 28-28 28L4 32 32 4Z',
        'M32 14l18 18-18 18-18-18 18-18Z',
        'M32 4v56M4 32h56',
        'M12 12l40 40M52 12L12 52',
      ],
    },
  },

  nouveau: {
    divider: {
      box: [240, 30],
      paths: [
        'M0 18c40 0 52-12 76-12s28 14 44 14 20-14 44-14 36 12 76 12',
        'M120 20c-6-4-8-9-6-14 5 1 8 5 9 11',
        'M120 20c6-4 8-9 6-14-5 1-8 5-9 11',
        'M60 12c-4 2-6 5-6 9',
      ],
    },
    corner: {
      box: [56, 56],
      paths: [
        'M2 54c0-30 6-42 18-46 8-3 20-4 34-4',
        'M4 34c12 2 20-2 24-12 3-8 3-14 2-18',
        'M12 50c0-14 6-22 18-24',
        'M30 22c5 1 8 4 9 9',
      ],
    },
    badge: {
      box: [64, 64],
      paths: [
        'M32 4c16 2 26 12 26 28 0 18-10 28-26 28C16 60 6 50 6 32 6 16 16 6 32 4Z',
        'M32 12c-8 6-12 14-10 24 6-2 10-8 12-16',
        'M32 12c8 6 12 14 10 24-6-2-10-8-12-16',
      ],
    },
  },

  tracery: {
    divider: {
      box: [240, 28],
      paths: [
        'M0 26h96M144 26h96',
        'M120 2l14 24h-28L120 2Z',
        'M120 10l7 12h-14l7-12Z',
        'M104 26c0-8 7-14 16-14s16 6 16 14',
      ],
    },
    corner: {
      box: [56, 56],
      paths: [
        'M2 54V22L20 2h34',
        'M2 54c0-18 4-30 12-36',
        'M10 54V28l10-12',
        'M20 2v14M2 22h18',
      ],
    },
    badge: {
      box: [64, 64],
      paths: [
        'M32 2l26 30v28H6V32L32 2Z',
        'M32 16l14 18v26H18V34l14-18Z',
        'M32 34v26',
        'M18 44h28',
      ],
    },
  },

  brass: {
    divider: {
      box: [240, 26],
      paths: [
        'M0 13h84M156 13h84',
        'M84 8h8v10h-8zM148 8h8v10h-8z',
        'M120 3a10 10 0 1 1 0 20 10 10 0 0 1 0-20Z',
        'M120 8a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z',
        'M120 1v4M120 21v4M108 13h4M128 13h4M112 5l3 3M128 18l3 3M131 5l-3 3M112 21l3-3',
      ],
    },
    corner: {
      box: [56, 56],
      paths: [
        'M2 54V18a16 16 0 0 1 16-16h36',
        'M8 54V20a12 12 0 0 1 12-12h34',
        'M14 14a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z',
        'M14 10v4M14 26v4M4 20h4M20 20h4',
      ],
    },
    badge: {
      box: [64, 64],
      paths: [
        'M32 6a26 26 0 1 1 0 52 26 26 0 0 1 0-52Z',
        'M32 18a14 14 0 1 1 0 28 14 14 0 0 1 0-28Z',
        'M32 2v8M32 54v8M2 32h8M54 32h8',
        'M11 11l6 6M47 47l6 6M53 11l-6 6M17 47l-6 6',
      ],
    },
  },

  ribbon: {
    divider: {
      box: [240, 26],
      paths: [
        'M0 13h96M144 13h96',
        'M120 13c-6-8-14-10-18-6s0 10 8 10 10-4 10-4Z',
        'M120 13c6-8 14-10 18-6s0 10-8 10-10-4-10-4Z',
        'M120 13c-3 4-5 8-4 11M120 13c3 4 5 8 4 11',
      ],
    },
    corner: {
      box: [56, 56],
      paths: [
        'M2 54c0-26 4-40 12-46 6-4 20-6 40-6',
        'M8 30c8 0 14-4 16-12',
        'M24 18c-5-6-11-7-14-4s0 8 6 8 8-4 8-4Z',
        'M24 18c5-6 11-7 14-4s0 8-6 8-8-4-8-4Z',
      ],
    },
    badge: {
      box: [64, 64],
      paths: [
        'M32 10a24 24 0 1 1 0 48 24 24 0 0 1 0-48Z',
        'M32 10c-7-8-15-10-19-6s0 10 9 11 10-5 10-5Z',
        'M32 10c7-8 15-10 19-6s0 10-9 11-10-5-10-5Z',
        'M32 10v6',
      ],
    },
  },
};
