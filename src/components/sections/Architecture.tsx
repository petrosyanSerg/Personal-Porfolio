'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';

import styles from './Architecture.module.scss';

const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] as const;

type LayerId = (typeof LAYERS)[number];

export function Architecture() {
  const t = useTranslations('architecture');
  const [active, setActive] = useState<LayerId>('app');
  const stepRefs = useRef<Map<LayerId, HTMLElement>>(new Map());

  useEffect(() => {
    const nodes = [...stepRefs.current.entries()];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0];
        if (!top) return;

        const id = top.target.getAttribute('data-layer') as LayerId | null;
        if (id) setActive(id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.5, 1] },
    );

    nodes.forEach(([, node]) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const activeIndex = LAYERS.indexOf(active);

  const [probed, setProbed] = useState<LayerId | null>(null);
  const shown = probed ?? active;
  const shownIndex = LAYERS.indexOf(shown);

  return (
    <section
      id="architecture"
      className={styles.section}
      aria-labelledby="architecture-title"
    >
      <Container>
        <SectionHeader
          id="architecture-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <div className={styles.grid}>
          <div className={styles.diagramWrap}>
            <div className={styles.diagram}>
              {LAYERS.map((layer, index) => (
                <button
                  key={layer}
                  type="button"
                  className={styles.slab}
                  data-active={layer === shown || undefined}
                  data-passed={index < activeIndex || undefined}
                  data-permitted={index > shownIndex || undefined}
                  style={
                    {
                      '--depth': index,
                      '--reach': LAYERS.length - 1 - index,
                    } as React.CSSProperties
                  }
                  onPointerEnter={() => setProbed(layer)}
                  onPointerLeave={() => setProbed(null)}
                  onFocus={() => setProbed(layer)}
                  onBlur={() => setProbed(null)}
                  onClick={() => {
                    const step = stepRefs.current.get(layer);
                    step?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    step?.focus({ preventScroll: true });
                  }}
                >
                  <span className={styles.slabLabel}>{layer}</span>
                </button>
              ))}
              <p className={styles.flowNote} aria-hidden="true">
                dependencies ↓ only
              </p>
            </div>
          </div>

          <ol className={styles.steps}>
            {LAYERS.map((layer, index) => (
              <li
                key={layer}
                data-layer={layer}
                data-active={layer === shown || undefined}
                className={styles.step}
                tabIndex={-1}
                onPointerEnter={() => setProbed(layer)}
                onPointerLeave={() => setProbed(null)}
                ref={(node) => {
                  if (node) stepRefs.current.set(layer, node);
                }}
              >
                <p className={styles.stepIndex}>{String(index + 1).padStart(2, '0')}</p>
                <h3 className={styles.stepName}>{layer}</h3>
                <p className={styles.stepBody}>{t(`layers.${layer}`)}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className={styles.closing}>{t('closing')}</p>
      </Container>
    </section>
  );
}
