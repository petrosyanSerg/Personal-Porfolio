import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

import type { DesignSystemId } from '@/design-system';

import type { SceneProps } from './HeroCanvas';

export const sceneComponents: Readonly<
  Record<DesignSystemId, ComponentType<SceneProps>>
> = {
  neoclassical: dynamic(() => import('./scenes/neoclassical'), { ssr: false }),
  baroque: dynamic(() => import('./scenes/baroque'), { ssr: false }),
  aurora: dynamic(() => import('./scenes/aurora'), { ssr: false }),
  ethereal: dynamic(() => import('./scenes/ethereal'), { ssr: false }),
  filigree: dynamic(() => import('./scenes/filigree'), { ssr: false }),
  acanthus: dynamic(() => import('./scenes/acanthus'), { ssr: false }),
  anthropomorphic: dynamic(() => import('./scenes/anthropomorphic'), { ssr: false }),
  'pixel-art': dynamic(() => import('./scenes/pixel-art'), { ssr: false }),
  'conceptual-sketch': dynamic(() => import('./scenes/conceptual-sketch'), {
    ssr: false,
  }),
  'luxury-typography': dynamic(() => import('./scenes/luxury-typography'), {
    ssr: false,
  }),
  japandi: dynamic(() => import('./scenes/japandi'), { ssr: false }),
  memphis: dynamic(() => import('./scenes/memphis'), { ssr: false }),
  bohemian: dynamic(() => import('./scenes/bohemian'), { ssr: false }),
  'shabby-chic': dynamic(() => import('./scenes/shabby-chic'), { ssr: false }),
  cottagecore: dynamic(() => import('./scenes/cottagecore'), { ssr: false }),
  victorian: dynamic(() => import('./scenes/victorian'), { ssr: false }),
  'art-deco': dynamic(() => import('./scenes/art-deco'), { ssr: false }),
  'art-nouveau': dynamic(() => import('./scenes/art-nouveau'), { ssr: false }),
  'mystical-western': dynamic(() => import('./scenes/mystical-western'), {
    ssr: false,
  }),
  kitsch: dynamic(() => import('./scenes/kitsch'), { ssr: false }),
  y2k: dynamic(() => import('./scenes/y2k'), { ssr: false }),
  bauhaus: dynamic(() => import('./scenes/bauhaus'), { ssr: false }),
  brutalism: dynamic(() => import('./scenes/brutalism'), { ssr: false }),
  cybercore: dynamic(() => import('./scenes/cybercore'), { ssr: false }),
  synthwave: dynamic(() => import('./scenes/synthwave'), { ssr: false }),
  vaporwave: dynamic(() => import('./scenes/vaporwave'), { ssr: false }),
  'pop-art': dynamic(() => import('./scenes/pop-art'), { ssr: false }),
  'bento-box': dynamic(() => import('./scenes/bento-box'), { ssr: false }),
  graffiti: dynamic(() => import('./scenes/graffiti'), { ssr: false }),
  tenebrism: dynamic(() => import('./scenes/tenebrism'), { ssr: false }),
  gothic: dynamic(() => import('./scenes/gothic'), { ssr: false }),
  pointillism: dynamic(() => import('./scenes/pointillism'), { ssr: false }),
  'mixed-media': dynamic(() => import('./scenes/mixed-media'), { ssr: false }),
  steampunk: dynamic(() => import('./scenes/steampunk'), { ssr: false }),
  kawaii: dynamic(() => import('./scenes/kawaii'), { ssr: false }),
  coquette: dynamic(() => import('./scenes/coquette'), { ssr: false }),
  surrealism: dynamic(() => import('./scenes/surrealism'), { ssr: false }),
  utilitarian: dynamic(() => import('./scenes/utilitarian'), { ssr: false }),
  'mid-century': dynamic(() => import('./scenes/mid-century'), { ssr: false }),
  scrapbook: dynamic(() => import('./scenes/scrapbook'), { ssr: false }),
  'frutiger-aero': dynamic(() => import('./scenes/frutiger-aero'), { ssr: false }),
  'dark-academia': dynamic(() => import('./scenes/dark-academia'), { ssr: false }),
  'light-academia': dynamic(() => import('./scenes/light-academia'), { ssr: false }),
  'wabi-sabi': dynamic(() => import('./scenes/wabi-sabi'), { ssr: false }),
  'wild-west': dynamic(() => import('./scenes/wild-west'), { ssr: false }),
  nautical: dynamic(() => import('./scenes/nautical'), { ssr: false }),
  rebus: dynamic(() => import('./scenes/rebus'), { ssr: false }),
  glassmorphism: dynamic(() => import('./scenes/glassmorphism'), { ssr: false }),
  'modular-typography': dynamic(() => import('./scenes/modular-typography'), {
    ssr: false,
  }),
  'neo-brutalism': dynamic(() => import('./scenes/neo-brutalism'), { ssr: false }),
};
