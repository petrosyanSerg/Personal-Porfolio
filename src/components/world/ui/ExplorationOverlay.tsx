'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { personal } from '@/data/personal';
import { architectureLayers } from '@/data/architecture';
import { experience } from '@/data/experience';
import { featuredProjects } from '@/data/projects';
import { skillGroups } from '@/data/skills';
import type { Locale } from '@/config/i18n';
import { Link } from '@/i18n/navigation';
import { formatMonthYear } from '@/lib/format';

import { hoverNode, releaseNode, toggleNode } from '../core/exploration-store';
import { worldNodes } from '../core/graph';
import { registerAnchor } from '../core/projection';
import { useExploration, useHashDeepLink } from '../core/useExploration';
import type { WorldNode, WorldNodeId } from '../core/types';

import styles from './ExplorationOverlay.module.scss';

type OverlayProps = {
  /** True when the WebGL layer is actually running behind this overlay. */
  readonly live: boolean;
  readonly loading: boolean;
};

type NavKey = 'about' | 'experience' | 'architecture' | 'stack' | 'projects' | 'contact';

type TaglineKey =
  | 'nodes.about.tagline'
  | 'nodes.experience.tagline'
  | 'nodes.architecture.tagline'
  | 'nodes.stack.tagline'
  | 'nodes.projects.tagline'
  | 'nodes.contact.tagline';

type UnitKey =
  | 'units.years'
  | 'units.roles'
  | 'units.layers'
  | 'units.technologies'
  | 'units.projects';

/** The words that belong to a node, resolved once and shared by every surface
 * that shows it: the floating label, the rail and the panel. */
function useNodeCopy() {
  const world = useTranslations('hero.world');
  const nav = useTranslations('nav');

  return (node: WorldNode) => ({
    label: nav(node.labelKey as NavKey),
    tagline: world(`nodes.${node.id}.tagline` as TaglineKey),
    count:
      node.count !== null && node.countKey !== null
        ? world(`units.${node.countKey}` as UnitKey, { count: node.count })
        : null,
  });
}

function NodeFacts({
  id,
  locale,
}: {
  readonly id: WorldNodeId;
  readonly locale: Locale;
}) {
  const architecture = useTranslations('architecture');
  const skills = useTranslations('skills');
  const projects = useTranslations('projects');
  const hero = useTranslations('hero');

  switch (id) {
    case 'experience':
      return (
        <ul className={styles.facts}>
          {[...experience]
            .sort((a, b) => b.start.localeCompare(a.start))
            .map((entry) => (
              <li key={entry.id}>
                <span className={styles.factKey}>{entry.company}</span>
                <span className={styles.factValue}>
                  {formatMonthYear(entry.start, locale)} —{' '}
                  {entry.end
                    ? formatMonthYear(entry.end, locale)
                    : hero('voices.spec.statusValue')}
                </span>
              </li>
            ))}
        </ul>
      );

    case 'architecture':
      return (
        <ol className={styles.facts} data-numbered>
          {architectureLayers.map((layer) => (
            <li key={layer}>
              <span className={styles.factKey}>{layer}</span>
              <span className={styles.factValue}>
                {architecture(`layers.${layer}` as 'layers.app')}
              </span>
            </li>
          ))}
        </ol>
      );

    case 'stack':
      return (
        <ul className={styles.facts}>
          {skillGroups.map((group) => (
            <li key={group.id}>
              <span className={styles.factKey}>
                {skills(`groups.${group.id}` as 'groups.frontend')}
              </span>
              <span className={styles.factValue}>
                {group.skills
                  .filter((skill) => skill.depth === 'core' || skill.depth === 'strong')
                  .slice(0, 3)
                  .map((skill) => skill.name)
                  .join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      );

    case 'projects':
      return (
        <ul className={styles.facts}>
          {featuredProjects.map((project) => (
            <li key={project.slug}>
              <span className={styles.factKey}>
                {projects(`${project.slug}.title` as 'mk-kredit.title')}
              </span>
              <span className={styles.factValue}>
                {project.year} · {project.company ?? project.tier}
              </span>
            </li>
          ))}
        </ul>
      );

    case 'contact':
      return (
        <ul className={styles.facts}>
          <li>
            <span className={styles.factKey}>{hero('voices.spec.base')}</span>
            <span className={styles.factValue}>
              {personal.location.city}, {personal.location.country}
            </span>
          </li>
          <li>
            <span className={styles.factKey}>{hero('voices.spec.status')}</span>
            <span className={styles.factValue}>{hero('voices.spec.statusValue')}</span>
          </li>
        </ul>
      );

    case 'about':
    default:
      return (
        <ul className={styles.facts}>
          <li>
            <span className={styles.factKey}>{hero('voices.spec.role')}</span>
            <span className={styles.factValue}>
              {hero('voices.flow.a')} → {hero('voices.flow.b')} → {hero('voices.flow.c')}
            </span>
          </li>
          <li>
            <span className={styles.factKey}>{hero('voices.spec.base')}</span>
            <span className={styles.factValue}>
              {personal.location.city}, {personal.location.country}
            </span>
          </li>
        </ul>
      );
  }
}

/**
 * Everything a visitor has to read lives here, in HTML: the labels, the panel,
 * the map and the way out. WebGL carries the exploration; it never carries the
 * information. That is what keeps the hero readable to a recruiter in the first
 * five seconds — and usable with a keyboard, a screen reader, or no GPU at all.
 */
export function ExplorationOverlay({ live, loading }: OverlayProps) {
  const world = useTranslations('hero.world');
  const common = useTranslations('common');
  const locale = useLocale() as Locale;
  const { phase, active, hovered, visited } = useExploration();
  const copy = useNodeCopy();
  const panel = useRef<HTMLElement>(null);
  const rails = useRef(new Map<WorldNodeId, HTMLButtonElement>());

  useHashDeepLink(true);

  const railRef = useCallback(
    (id: WorldNodeId) => (element: HTMLButtonElement | null) => {
      if (element) rails.current.set(id, element);
      else rails.current.delete(id);
    },
    [],
  );

  const lastOpened = useRef<WorldNodeId | null>(null);

  useEffect(() => {
    if (active !== null) lastOpened.current = active;
  }, [active]);

  const carriedFocus = useRef(false);

  /**
   * Disclosure focus. A node opened from the map — by click or by keyboard —
   * takes focus into the panel and hands it back to the button that opened it
   * when the panel closes. A node opened by clicking the 3D world leaves focus
   * where it was: nothing was focused, so nothing should be stolen.
   */
  useEffect(() => {
    if (active !== null) {
      const opener = document.activeElement;
      const fromRail = [...rails.current.values()].some((button) => button === opener);

      if (fromRail) {
        panel.current?.focus({ preventScroll: true });
        carriedFocus.current = true;
      }
      return;
    }

    // The panel is already gone by now, so the browser has parked focus on the
    // body. That — and only that — is the case worth rescuing.
    const stranded =
      document.activeElement === null || document.activeElement === document.body;

    if (carriedFocus.current && stranded) {
      rails.current.get(lastOpened.current ?? 'about')?.focus({ preventScroll: true });
    }

    carriedFocus.current = false;
  }, [active]);

  // One attribute the rest of the hero can style against, instead of a prop
  // drilled through every component that wants to step back while a node is up.
  useEffect(() => {
    document.documentElement.dataset.world = phase;
    return () => {
      delete document.documentElement.dataset.world;
    };
  }, [phase]);

  useEffect(() => {
    if (active === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') releaseNode();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  const activeNode = worldNodes.find((node) => node.id === active) ?? null;

  return (
    <div className={styles.overlay} data-phase={phase}>
      {live ? (
        <div className={styles.labels} aria-hidden="true">
          {worldNodes.map((node) => {
            const { label, count } = copy(node);

            return (
              <button
                key={node.id}
                type="button"
                tabIndex={-1}
                ref={(element) => {
                  registerAnchor(node.id, element);
                  return () => registerAnchor(node.id, null);
                }}
                className={styles.label}
                data-projected="0"
                data-state={
                  active === node.id ? 'active' : hovered === node.id ? 'hover' : 'idle'
                }
                onPointerEnter={() => hoverNode(node.id)}
                onPointerLeave={() => hoverNode(null)}
                onClick={() => toggleNode(node.id)}
              >
                <span className={styles.labelName}>{label}</span>
                {count ? <span className={styles.labelCount}>{count}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className={styles.bar}>
        <div className={styles.trail}>
          <p className={styles.breadcrumb}>
            <button
              type="button"
              className={styles.crumb}
              onClick={() => releaseNode()}
              disabled={activeNode === null}
            >
              {world('title')}
            </button>
            {activeNode ? (
              <>
                <span className={styles.crumbMark} aria-hidden="true">
                  /
                </span>
                <span className={styles.crumbHere}>{copy(activeNode).label}</span>
              </>
            ) : null}
          </p>

          <p className={styles.hint} data-quiet={visited.length > 0 || undefined}>
            {loading ? world('loading') : live ? world('hint') : world('hintStatic')}
          </p>
        </div>

        <nav className={styles.rail} aria-label={world('rail')}>
          <ul className={styles.railList}>
            {worldNodes.map((node) => {
              const { label } = copy(node);

              return (
                <li key={node.id}>
                  <button
                    type="button"
                    ref={railRef(node.id)}
                    className={styles.railItem}
                    aria-expanded={active === node.id}
                    aria-controls="world-panel"
                    data-visited={visited.includes(node.id) || undefined}
                    onPointerEnter={() => hoverNode(node.id)}
                    onPointerLeave={() => hoverNode(null)}
                    onFocus={() => hoverNode(node.id)}
                    onBlur={() => hoverNode(null)}
                    onClick={() => toggleNode(node.id)}
                  >
                    <span className={styles.railDot} aria-hidden="true" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>

          <a className={styles.skip} href="#about">
            {world('skip')}
          </a>
        </nav>
      </div>

      {activeNode ? (
        <section
          ref={panel}
          id="world-panel"
          tabIndex={-1}
          className={styles.panel}
          aria-label={copy(activeNode).label}
          data-detail={activeNode.detail}
        >
          <header className={styles.panelHead}>
            <p className={styles.panelEyebrow}>
              {String(activeNode.index + 1).padStart(2, '0')}
              <span aria-hidden="true"> / </span>
              {String(worldNodes.length).padStart(2, '0')}
            </p>
            <h2 className={styles.panelTitle}>{copy(activeNode).label}</h2>
            <p className={styles.panelTagline}>{copy(activeNode).tagline}</p>
          </header>

          <NodeFacts id={activeNode.id} locale={locale} />

          <footer className={styles.panelFoot}>
            <Link className={styles.panelLink} href={`/#${activeNode.section}`}>
              {world('open')}
              <span aria-hidden="true"> →</span>
            </Link>
            <button
              type="button"
              className={styles.panelClose}
              onClick={() => releaseNode()}
            >
              {common('close')}
            </button>
          </footer>
        </section>
      ) : null}
    </div>
  );
}
