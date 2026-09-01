import type { DiagramId } from '@/types/profile';

import styles from './ArchitectureDiagram.module.scss';

const FSD_LAYERS = [
  { id: 'app', note: 'providers · routing · config' },
  { id: 'pages', note: 'route compositions' },
  { id: 'widgets', note: 'self-contained blocks' },
  { id: 'features', note: 'user actions' },
  { id: 'entities', note: 'domain models' },
  { id: 'shared', note: 'ui kit · api · utils' },
];

function FsdLayers() {
  const rowHeight = 46;
  const gap = 10;
  const width = 620;

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${width} ${FSD_LAYERS.length * (rowHeight + gap) + 34}`}
      role="img"
      aria-label="Feature-Sliced Design layers: app, pages, widgets, features, entities, shared. Dependencies flow downward only."
    >
      {FSD_LAYERS.map((layer, index) => {
        const y = index * (rowHeight + gap);
        const inset = index * 14;
        return (
          <g key={layer.id}>
            <rect
              x={inset}
              y={y}
              width={width - inset * 2}
              height={rowHeight}
              rx="8"
              className={styles.slab}
            />
            <text x={inset + 18} y={y + 27} className={styles.slabLabel}>
              {layer.id}
            </text>
            <text
              x={width - inset - 18}
              y={y + 27}
              textAnchor="end"
              className={styles.slabNote}
            >
              {layer.note}
            </text>
            {index < FSD_LAYERS.length - 1 ? (
              <path
                d={`M${width / 2} ${y + rowHeight + 1}v${gap - 2}`}
                className={styles.arrow}
                markerEnd="url(#arrowhead)"
              />
            ) : null}
          </g>
        );
      })}

      <text
        x={width / 2}
        y={FSD_LAYERS.length * (rowHeight + gap) + 22}
        textAnchor="middle"
        className={styles.caption}
      >
        dependencies flow downward only — enforced in CI
      </text>

      <defs>
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M0 0L6 3L0 6z" className={styles.arrowHead} />
        </marker>
      </defs>
    </svg>
  );
}

function MkKreditArchitecture() {
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 620 400"
      role="img"
      aria-label="MK Kredit frontend architecture: business modules built on shared form, table, authorization and error-handling systems, over a centralized Axios client with JWT refresh and TanStack Query, integrating 36 domain services across 190-plus endpoints."
    >
      <g className={styles.box}>
        <rect x="10" y="10" width="600" height="66" rx="10" />
        <text x="30" y="38" className={styles.boxTitle}>
          ~50 business modules
        </text>
        <text x="30" y="58" className={styles.boxNote}>
          application analysis · collateral · cash flow · committee · disbursement
        </text>
      </g>

      <path d="M310 78v20" className={styles.arrow} markerEnd="url(#arrowhead2)" />

      <g className={styles.box}>
        <rect x="10" y="102" width="290" height="76" rx="10" />
        <text x="30" y="130" className={styles.boxTitle}>
          Form system
        </text>
        <text x="30" y="150" className={styles.boxNote}>
          React Hook Form + Zod
        </text>
        <text x="30" y="168" className={styles.boxNote}>
          multi-stage, validation-heavy
        </text>
      </g>

      <g className={styles.box}>
        <rect x="320" y="102" width="290" height="76" rx="10" />
        <text x="340" y="130" className={styles.boxTitle}>
          Data-table system
        </text>
        <text x="340" y="150" className={styles.boxNote}>
          shared column & filter model
        </text>
      </g>

      <g className={styles.boxAccent}>
        <rect x="10" y="196" width="290" height="70" rx="10" />
        <text x="30" y="224" className={styles.boxTitle}>
          Type-safe authorization
        </text>
        <text x="30" y="244" className={styles.boxNote}>
          unauthorized states unrepresentable
        </text>
      </g>

      <g className={styles.boxAccent}>
        <rect x="320" y="196" width="290" height="70" rx="10" />
        <text x="340" y="224" className={styles.boxTitle}>
          Centralized error handling
        </text>
        <text x="340" y="244" className={styles.boxNote}>
          one boundary, one failure model
        </text>
      </g>

      <path d="M310 270v20" className={styles.arrow} markerEnd="url(#arrowhead2)" />

      <g className={styles.box}>
        <rect x="10" y="294" width="600" height="70" rx="10" />
        <text x="30" y="322" className={styles.boxTitle}>
          Axios client · JWT + auto refresh · TanStack Query
        </text>
        <text x="30" y="344" className={styles.boxNote}>
          36 domain services · 190+ endpoints · generated from Swagger contracts
        </text>
      </g>

      <text x="310" y="388" textAnchor="middle" className={styles.caption}>
        Feature-Sliced Design · CI quality gates · Docker · Azure
      </text>

      <defs>
        <marker
          id="arrowhead2"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M0 0L6 3L0 6z" className={styles.arrowHead} />
        </marker>
      </defs>
    </svg>
  );
}

const PIPELINE = [
  { id: 'Context', note: 'architecture as durable context' },
  { id: 'Spec', note: 'the contract, not the prompt' },
  { id: 'Scaffold', note: 'generated into the real structure' },
  { id: 'Validate', note: 'human review gate' },
  { id: 'Merge', note: 'CI quality gates' },
];

function AiWorkflowPipeline() {
  const boxWidth = 108;
  const gap = 20;

  return (
    <svg
      className={styles.svg}
      viewBox="0 0 620 220"
      role="img"
      aria-label="AI-native workflow: context, spec, scaffold, validate, merge — with Figma, Jira and Swagger feeding context, and rejected output returning to the spec stage."
    >
      {PIPELINE.map((stage, index) => {
        const x = index * (boxWidth + gap) + 8;
        const accent = stage.id === 'Validate';
        return (
          <g key={stage.id} className={accent ? styles.boxAccent : styles.box}>
            <rect x={x} y="70" width={boxWidth} height="72" rx="10" />
            <text
              x={x + boxWidth / 2}
              y="98"
              textAnchor="middle"
              className={styles.boxTitle}
            >
              {stage.id}
            </text>
            <foreignObject x={x + 6} y="104" width={boxWidth - 12} height="36">
              <span className={styles.foreignNote}>{stage.note}</span>
            </foreignObject>
            {index < PIPELINE.length - 1 ? (
              <path
                d={`M${x + boxWidth + 2} 106h${gap - 6}`}
                className={styles.arrow}
                markerEnd="url(#arrowhead3)"
              />
            ) : null}
          </g>
        );
      })}

      <text x="8" y="40" className={styles.boxNote}>
        Figma · Jira · Swagger
      </text>
      <path d="M64 48v16" className={styles.arrow} markerEnd="url(#arrowhead3)" />

      <path
        d="M448 148v34H136v-34"
        className={styles.arrowDashed}
        markerEnd="url(#arrowhead3)"
      />
      <text x="292" y="200" textAnchor="middle" className={styles.caption}>
        rejected → back to spec
      </text>

      <defs>
        <marker
          id="arrowhead3"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M0 0L6 3L0 6z" className={styles.arrowHead} />
        </marker>
      </defs>
    </svg>
  );
}

const REGISTRY: Record<DiagramId, () => React.ReactElement> = {
  'fsd-layers': FsdLayers,
  'mk-kredit-architecture': MkKreditArchitecture,
  'ai-workflow-pipeline': AiWorkflowPipeline,
};

export function ArchitectureDiagram({ id, label }: { id: DiagramId; label: string }) {
  const Diagram = REGISTRY[id];
  return (
    <figure className={styles.figure} tabIndex={0} role="group" aria-label={label}>
      <Diagram />
    </figure>
  );
}
