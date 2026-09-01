export { designSystemIds, isDesignSystemId } from './core/types';
export type {
  CursorKind,
  DesignCapability,
  DesignFamily,
  DesignSystem,
  DesignSystemId,
  HeroComposition,
  HeroVoice,
  SceneMobileMode,
  SceneProfile,
} from './core/types';

export {
  designFamilies,
  designSystemList,
  designSystems,
  designSystemsByFamily,
  getDesignSystem,
  hasCapability,
} from './core/registry';

export {
  DESIGN_ATTRIBUTE,
  DESIGN_SESSION_KEY,
  DESIGN_STORAGE_KEY,
  defaultDesignSystem,
  designInitScript,
} from './core/runtime';

export { DesignPortrait } from './components/DesignPortrait';
export { portraitFor, portraitGaps, portraitSizes } from './core/portraits';
export type { ThemePortrait } from './core/portraits';

export { setDesignSystem } from './core/design-store';
export {
  useDesignCapability,
  useDesignSystem,
  useDesignSystemId,
} from './core/useDesignSystem';
