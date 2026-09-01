'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { setDesignSystem } from '../core/design-store';
import { portraitFor, portraitSizes } from '../core/portraits';
import { designFamilies, designSystemList } from '../core/registry';
import { useDesignSystem } from '../core/useDesignSystem';
import type { DesignSystemId } from '../core/types';

import { DesignPreview } from './DesignPreview';
import styles from './DesignLab.module.scss';

// Memoised because it takes no props and mounts fifty previews. The header
// re-renders on every section crossing as the active nav link moves, and
// without this each of those reconciles the whole tray.
export const DesignLab = memo(function DesignLab() {
  const t = useTranslations('design');
  const activeDesign = useDesignSystem();
  const active = activeDesign.id;
  const currentPortrait = portraitFor(active);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') return designSystemList;

    return designSystemList.filter((design) => {
      const description = t(`systems.${design.descriptionKey}` as 'systems.aurora');
      const family = t(`families.${design.family}` as 'families.classical');

      return `${design.name} ${family} ${description}`.toLowerCase().includes(needle);
    });
  }, [query, t]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;

    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  const select = (id: DesignSystemId) => {
    setDesignSystem(id);
  };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={t('open')}
        title={t('open')}
      >
        <span className={styles.chip} aria-hidden="true" data-design={active} />
      </button>

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="design-lab-title"
        onCancel={close}
        onClose={close}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
      >
        <div className={styles.panel}>
          <header className={styles.nameplate}>
            <div className={styles.identity}>
              <h2 id="design-lab-title" className={styles.title}>
                {t('lab')}
              </h2>
              <p className={styles.lead}>{t('lead')}</p>
            </div>

            <p className={styles.readout} aria-hidden="true">
              {currentPortrait ? (
                // eslint-disable-next-line @next/next/no-img-element -- local, pre-sized WebP; see DesignPreview
                <img
                  className={styles.readoutPlate}
                  src={currentPortrait.plate}
                  alt=""
                  width={portraitSizes.plate.width}
                  height={portraitSizes.plate.height}
                  decoding="async"
                  draggable={false}
                />
              ) : (
                <span className={styles.readoutChip} data-design={active} />
              )}

              <span className={styles.readoutText}>
                <span className={styles.readoutLabel}>{t('active')}</span>
                <span className={styles.readoutName}>
                  <span className={styles.readoutIndex}>
                    {String(activeDesign.index).padStart(2, '0')}
                  </span>
                  {activeDesign.name}
                </span>
              </span>
            </p>

            <button
              type="button"
              className={styles.close}
              onClick={close}
              aria-label={t('close')}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </header>

          <div className={styles.controls}>
            <label className={styles.search}>
              <span className="visually-hidden">{t('filter')}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('filterPlaceholder')}
                autoComplete="off"
              />
            </label>
            <p className={styles.count} aria-live="polite">
              {t('results', { count: shown.length })}
            </p>
          </div>

          <div className={styles.tray}>
            {shown.length === 0 ? (
              <p className={styles.empty}>{t('empty')}</p>
            ) : (
              <div className={styles.families}>
                {designFamilies.map((family) => {
                  const members = shown.filter((design) => design.family === family);
                  if (members.length === 0) return null;

                  return (
                    <section key={family} className={styles.family}>
                      <h3 className={styles.familyName}>
                        {t(`families.${family}` as 'families.classical')}
                        <span className={styles.familyRule} aria-hidden="true" />
                        <span className={styles.familyCount}>{members.length}</span>
                      </h3>

                      <ul className={styles.list}>
                        {members.map((design) => {
                          const current = design.id === active;

                          return (
                            <li key={design.id}>
                              <button
                                type="button"
                                className={styles.option}
                                onClick={() => select(design.id)}
                                aria-pressed={current}
                                data-current={current || undefined}
                              >
                                <DesignPreview
                                  design={design}
                                  applyLabel={t('apply')}
                                  portraitAlt={t('portraitAlt', { name: design.name })}
                                />

                                <span className={styles.meta}>
                                  <span className={styles.index}>
                                    {String(design.index).padStart(2, '0')}
                                  </span>
                                  <span className={styles.name}>{design.name}</span>
                                  <span className={styles.description}>
                                    {t(
                                      `systems.${design.descriptionKey}` as 'systems.aurora',
                                    )}
                                  </span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )}
          </div>

          <p className={styles.hint}>{t('hint')}</p>
        </div>
      </dialog>
    </>
  );
});
