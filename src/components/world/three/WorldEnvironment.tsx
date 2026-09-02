'use client';

import type { ScenePalette } from '@/components/hero3d/core/palette';
import { detail, type SceneQuality } from '@/components/hero3d/core/quality';

import type { WorldTheme } from '../core/types';

type EnvironmentProps = {
  readonly theme: WorldTheme;
  readonly palette: ScenePalette;
  readonly quality: SceneQuality;
};

/** The floor the world stands on. One primitive per dialect, chosen by
 * configuration — never a per-theme scene. */
function Ground({ theme, palette, quality }: EnvironmentProps) {
  switch (theme.ground) {
    case 'grid':
      return (
        <gridHelper
          args={[34, detail(quality, 26, 12), palette.border, palette.border]}
          position={[0, -5.4, 0]}
        />
      );

    case 'plane':
      return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.4, 0]}>
          <circleGeometry args={[15, detail(quality, 64, 20)]} />
          <meshStandardMaterial
            color={palette.surface}
            roughness={0.9}
            metalness={0.05}
            transparent
            opacity={0.55}
          />
        </mesh>
      );

    case 'horizon':
      return (
        <mesh position={[0, -5.4, -6]}>
          <planeGeometry args={[12, 0.04]} />
          <meshBasicMaterial
            color={palette.accentText}
            transparent
            opacity={0.28}
            toneMapped={false}
          />
        </mesh>
      );

    case 'none':
    default:
      return null;
  }
}

function Lighting({ theme, palette }: Omit<EnvironmentProps, 'quality'>) {
  switch (theme.light) {
    case 'dramatic':
      return (
        <>
          <ambientLight intensity={0.35} color={palette.surfaceHigh} />
          <spotLight
            position={[6, 9, 7]}
            angle={0.7}
            penumbra={0.9}
            intensity={26}
            color={palette.text}
          />
          <pointLight position={[-7, -3, 4]} intensity={9} color={palette.accent} />
        </>
      );

    case 'flat':
      return (
        <>
          <ambientLight intensity={1.5} color={palette.text} />
          <directionalLight position={[3, 6, 8]} intensity={0.9} color={palette.text} />
        </>
      );

    case 'ambient':
      return (
        <>
          <ambientLight intensity={1.1} color={palette.accentText} />
          <pointLight position={[0, 2, 6]} intensity={16} color={palette.accent} />
        </>
      );

    case 'studio':
    default:
      return (
        <>
          <ambientLight intensity={0.8} color={palette.surfaceHigh} />
          <directionalLight position={[5, 8, 6]} intensity={1.5} color={palette.text} />
          <directionalLight
            position={[-6, -2, 3]}
            intensity={0.5}
            color={palette.accent}
          />
        </>
      );
  }
}

export function WorldEnvironment(props: EnvironmentProps) {
  return (
    <>
      <Lighting theme={props.theme} palette={props.palette} />
      <Ground {...props} />
    </>
  );
}
