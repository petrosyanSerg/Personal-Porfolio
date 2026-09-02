import { cn } from '@/lib/cn';
import type { ProjectCategory } from '@/types/profile';

import styles from './Visual.module.scss';

/*
 * An abstract plate per project category.
 *
 * Deliberately not a screenshot. Most of this work sits behind a client NDA, and
 * inventing a product UI for it would be a claim the profile audit does not
 * support. These draw the *shape* of the work instead — a ledger and an approval
 * gate, an inference pipeline, a layer stack, a component grid — which is honest
 * and still reads at card size.
 *
 * Geometry only, no lettering: the plate carries nothing the card heading and
 * description do not already say, so it is hidden from assistive technology.
 */

type ProjectVisualProps = {
  category: ProjectCategory;
  className?: string | undefined;
};

const W = 640;
const H = 360;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="visual-wash" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.14" />
          <stop offset="55%" stopColor="var(--color-accent)" stopOpacity="0.03" />
          <stop offset="100%" stopColor="var(--color-teal)" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} className={styles.wash} />

      <g className={styles.grid}>
        {Array.from({ length: 15 }, (_, i) => (
          <path key={`v${i}`} d={`M${i * 44 + 22} 0V${H}`} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`h${i}`} d={`M0 ${i * 44 + 20}H${W}`} />
        ))}
      </g>

      {children}
    </svg>
  );
}

/* Ledger rows, an approval gate, an exposure curve. */
function Fintech() {
  const rows = [186, 132, 208, 154, 176, 118];

  return (
    <Frame>
      <g transform="translate(46 74)">
        {rows.map((width, i) => (
          <g key={i}>
            <rect
              y={i * 34}
              width={width}
              height="14"
              rx="3"
              className={i === 2 ? styles.blockAccent : styles.block}
            />
            <rect
              x={width + 12}
              y={i * 34 + 3}
              width="34"
              height="8"
              rx="2"
              className={styles.block}
            />
          </g>
        ))}
      </g>

      <path className={styles.lineDashed} d="M296 96h44" />
      <path className={styles.lineDashed} d="M296 164h44" />
      <path className={styles.lineDashed} d="M296 232h44" />

      <path className={styles.blockAccent} d="M382 164 L414 132 L446 164 L414 196 Z" />
      <path className={styles.accent} d="M400 164l10 10 18-20" />

      <path className={styles.line} d="M446 164h34" />
      <path className={styles.line} d="M414 196v40h66" />
      <path className={styles.line} d="M414 132V92h66" />

      <g transform="translate(480 74)">
        <path className={styles.line} d="M0 212h118M0 0v212" />
        <path
          d="M8 186l22-14 22 18 22-46 22-22 22-52V212H8Z"
          fill="var(--color-teal)"
          fillOpacity="0.1"
          stroke="none"
        />
        <path className={styles.signal} d="M8 186l22-14 22 18 22-46 22-22 22-52" />
        {[
          [8, 186],
          [52, 190],
          [96, 122],
          [118, 70],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" className={styles.dotSignal} />
        ))}
      </g>
    </Frame>
  );
}

/* Context sources, an inference node, validation branches that re-merge. */
function Pipeline() {
  return (
    <Frame>
      <g transform="translate(40 92)">
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect y={i * 52} width="96" height="34" rx="6" className={styles.block} />
            <path className={styles.line} d={`M96 ${i * 52 + 17}h44`} />
          </g>
        ))}
      </g>

      <path className={styles.line} d="M140 109v104" />

      <rect
        x="176"
        y="130"
        width="112"
        height="100"
        rx="10"
        className={styles.blockAccent}
      />
      {[0, 1, 2].map((i) => (
        <path key={i} className={styles.accent} d={`M204 ${156 + i * 24}l16 12-16 12`} />
      ))}
      <path className={styles.accent} d="M258 156v48" />
      <path className={styles.line} d="M140 161h36" />

      <path className={styles.line} d="M288 180h40" />

      <path className={styles.line} d="M328 180V116h44" />
      <path className={styles.line} d="M328 180v64h44" />
      {[116, 244].map((y, i) => (
        <rect
          key={i}
          x="372"
          y={y - 17}
          width="104"
          height="34"
          rx="6"
          className={styles.block}
        />
      ))}
      <path className={styles.signal} d="M392 116l9 9 15-17" />
      <path className={styles.signal} d="M392 244l9 9 15-17" />

      <path className={styles.line} d="M476 116h32v128h-32" />
      <path className={styles.lineStrong} d="M508 180h36" />
      <circle cx="568" cy="180" r="17" className={styles.blockAccent} />
      <circle cx="568" cy="180" r="5" className={styles.dot} />

      <path className={styles.lineDashed} d="M568 212v52H232v-34" />
    </Frame>
  );
}

/* An inset layer stack with one downward dependency spine. */
function Layers() {
  const rows = 6;

  return (
    <Frame>
      <g transform="translate(0 44)">
        {Array.from({ length: rows }, (_, i) => {
          const inset = 84 + i * 26;
          const y = i * 46;
          return (
            <g key={i}>
              <rect
                x={inset}
                y={y}
                width={W - inset * 2}
                height="32"
                rx="6"
                className={i === 0 ? styles.blockAccent : styles.block}
              />
              <rect
                x={inset + 14}
                y={y + 13}
                width={44 - i * 4}
                height="6"
                rx="3"
                fill="var(--ink-line)"
                stroke="none"
              />
            </g>
          );
        })}

        <path className={styles.accent} d={`M${W / 2} 32v${(rows - 1) * 46 - 10}`} />
        {Array.from({ length: rows - 1 }, (_, i) => (
          <path
            key={i}
            className={styles.accent}
            d={`M${W / 2 - 5} ${i * 46 + 40}l5 6 5-6`}
          />
        ))}
      </g>

      <path className={styles.lineDashed} d="M474 286V102" />
      <g stroke="var(--ink-line-strong)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M466 100l16 16M482 100l-16 16" />
      </g>
    </Frame>
  );
}

/* A module grid with one cell resolved into its parts. */
function Modules() {
  const cells = Array.from({ length: 12 }, (_, i) => ({
    x: 44 + (i % 4) * 74,
    y: 74 + Math.floor(i / 4) * 74,
  }));

  return (
    <Frame>
      {cells.map((cell, i) => (
        <rect
          key={i}
          x={cell.x}
          y={cell.y}
          width="56"
          height="56"
          rx="6"
          className={i === 5 ? styles.blockAccent : styles.block}
        />
      ))}

      <path className={styles.line} d="M234 176h56" />

      <g transform="translate(300 74)">
        <rect width="236" height="56" rx="6" className={styles.blockAccent} />
        <rect
          x="16"
          y="22"
          width="72"
          height="12"
          rx="3"
          fill="var(--ink-accent)"
          fillOpacity="0.55"
          stroke="none"
        />
        <rect
          x="100"
          y="22"
          width="42"
          height="12"
          rx="3"
          fill="var(--ink-line)"
          stroke="none"
        />

        <path className={styles.line} d="M56 56v22h124v-22M118 78v20" />

        <rect y="98" width="112" height="44" rx="6" className={styles.block} />
        <rect x="124" y="98" width="112" height="44" rx="6" className={styles.block} />
        <rect y="160" width="236" height="44" rx="6" className={styles.block} />

        <path className={styles.line} d="M56 142v18M180 142v18" />
        <circle cx="56" cy="98" r="4" className={styles.dotHollow} />
        <circle cx="180" cy="98" r="4" className={styles.dotHollow} />
      </g>

      <circle cx="118" cy="212" r="5" className={styles.dotSignal} />
      <path className={styles.signal} d="M118 212l30 38" />
    </Frame>
  );
}

const PLATES: Record<ProjectCategory, () => React.JSX.Element> = {
  'enterprise-fintech': Fintech,
  'engineering-practice': Pipeline,
  'architecture-study': Layers,
  'public-build': Modules,
};

export function ProjectVisual({ category, className }: ProjectVisualProps) {
  const Plate = PLATES[category];

  return (
    <div className={cn(styles.plate, className)}>
      <Plate />
      <span className={styles.sheen} aria-hidden="true" />
    </div>
  );
}
