import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/ui/Container';
import { DesignCharacters } from '@/design-system/components/DesignCharacters';
import { Ornament } from '@/design-system/ornaments/Ornament';
import { Magnetic } from '@/components/ui/Magnetic';
import { fullName, personal } from '@/data/personal';
import { skillGroups } from '@/data/skills';
import { Link } from '@/i18n/navigation';

import { HeroIntro } from './HeroIntro';
import { HeroStage, type HeroModule } from './HeroStage';
import styles from './Hero.module.scss';

const TECHNOLOGIES_PER_MODULE = 4;

const depthRank: Record<string, number> = {
  core: 0,
  strong: 1,
  working: 2,
  familiar: 3,
};

export async function Hero() {
  const t = await getTranslations('hero');
  const skills = await getTranslations('skills');
  const footer = await getTranslations('footer');
  const a11y = await getTranslations('a11y');

  const modules: HeroModule[] = skillGroups.map((group) => ({
    id: group.id,
    label: skills(`groups.${group.id}` as 'groups.frontend'),
    technologies: [...group.skills]
      .sort((a, b) => (depthRank[a.depth] ?? 9) - (depthRank[b.depth] ?? 9))
      .slice(0, TECHNOLOGIES_PER_MODULE)
      .map((skill) => skill.name),
  }));

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <HeroStage
        modules={modules}
        countLabel={t('modules')}
        completeLabel={t('systemMapped')}
      />

      <HeroIntro init={t('boot.init')} online={t('boot.online')} />

      <div className={styles.ornament} aria-hidden="true">
        <Ornament role="corner" corner="tl" />
        <Ornament role="corner" corner="tr" />
        <Ornament role="corner" corner="bl" />
        <Ornament role="corner" corner="br" />
      </div>

      <DesignCharacters />

      <Container className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.voiceClaim} aria-hidden="true">
            {t('voices.manifesto.claim')}
          </p>

          <p className={styles.voiceGreeting} aria-hidden="true">
            {t('voices.playful.greeting')}
          </p>

          <p className={styles.identity} data-enter="1">
            <span className={styles.nameRow}>
              <span className={styles.rule} aria-hidden="true" />
              <span className={styles.name}>{fullName}</span>
            </span>
            <span className={styles.role}>{footer('role')}</span>
          </p>

          <h1 id="hero-heading" className={styles.headline} data-enter="2">
            {t('headline')}
          </h1>

          <p className={styles.voiceStatus} aria-hidden="true">
            <span className={styles.prompt}>&gt;</span>
            {t('voices.terminal.status')}
          </p>

          <p className={styles.sub} data-enter="3">
            {t('sub')}
          </p>

          <p className={styles.voiceFlow} aria-hidden="true">
            <span>{t('voices.flow.a')}</span>
            <span className={styles.voiceArrow}>→</span>
            <span>{t('voices.flow.b')}</span>
            <span className={styles.voiceArrow}>→</span>
            <span>{t('voices.flow.c')}</span>
          </p>

          <dl className={styles.voiceSpec} aria-hidden="true">
            <div className={styles.voiceRow}>
              <dt>{t('voices.spec.role')}</dt>
              <dd>{footer('role')}</dd>
            </div>
            <div className={styles.voiceRow}>
              <dt>{t('voices.spec.stack')}</dt>
              <dd>{modules[0]?.technologies.slice(0, 3).join(' · ')}</dd>
            </div>
            <div className={styles.voiceRow}>
              <dt>{t('voices.spec.base')}</dt>
              <dd>
                {personal.location.city}, {personal.location.country}
              </dd>
            </div>
            <div className={styles.voiceRow}>
              <dt>{t('voices.spec.status')}</dt>
              <dd className={styles.voiceLamp}>{t('voices.spec.statusValue')}</dd>
            </div>
          </dl>

          <p className={styles.spec} data-enter="4">
            {modules.map((module, index) => (
              <span key={module.id} className={styles.specItem}>
                {index > 0 ? (
                  <span className={styles.specDot} aria-hidden="true">
                    ·
                  </span>
                ) : null}
                {module.label}
              </span>
            ))}
          </p>

          <div className={styles.actions} data-enter="5">
            <Magnetic>
              <Link href="/#architecture" className={styles.ctaPrimary}>
                {t('ctaPrimary')}
                <span className={styles.ctaArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </Magnetic>
            <Magnetic strength={4}>
              <Link href="/#contact" className={styles.ctaSecondary}>
                {t('ctaSecondary')}
              </Link>
            </Magnetic>
          </div>

          <p className={styles.locale} data-enter="5">
            {personal.location.city}, {personal.location.country}
          </p>

          <div className={styles.flourish}>
            <Ornament role="divider" />
          </div>
        </div>
      </Container>

      <div className="visually-hidden">
        <p>{a11y('heroScene')}</p>
        <ul>
          {modules.map((module) => (
            <li key={module.id}>
              {module.label}: {module.technologies.join(', ')}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
