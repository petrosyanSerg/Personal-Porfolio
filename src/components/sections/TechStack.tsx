import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { skillGroups } from '@/data/skills';

import { SkillGroups, type SkillGroupView } from './SkillGroups';
import styles from './TechStack.module.scss';

const DEPTHS = ['core', 'strong', 'working', 'familiar'] as const;

const depthRank: Record<string, number> = {
  core: 0,
  strong: 1,
  working: 2,
  familiar: 3,
};

export async function TechStack() {
  const t = await getTranslations('skills');

  const groups: SkillGroupView[] = skillGroups.map((group) => ({
    id: group.id,
    title: t(`groups.${group.id}` as 'groups.frontend'),
    skills: [...group.skills]
      .sort((a, b) => (depthRank[a.depth] ?? 9) - (depthRank[b.depth] ?? 9))
      .map((skill) => ({
        id: skill.id,
        name: skill.name,
        depth: skill.depth,
        depthLabel: t(`depth.${skill.depth}`),
        usage: t(skill.usageKey.replace('skills.', '') as 'usage.react'),
        personalOnly: skill.personalOnly ?? false,
        evidence: skill.evidence,
        evidenceLabel: t('usedAt', { sources: skill.evidence.join(' · ') }),
      })),
  }));

  return (
    <section id="stack" className={styles.section} aria-labelledby="stack-title">
      <Container>
        <SectionHeader
          id="stack-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <ul className={styles.legend}>
          {DEPTHS.map((depth) => (
            <li key={depth} className={styles.legendItem}>
              <span className={styles.legendDot} data-depth={depth} aria-hidden="true" />
              <span className={styles.legendName}>{t(`depth.${depth}`)}</span>
              <span className={styles.legendDesc}>{t(`depthLegend.${depth}`)}</span>
            </li>
          ))}
        </ul>

        <SkillGroups groups={groups} personalOnlyLabel={t('personalOnly')} />

        <p className={styles.footnote}>{t('footnote')}</p>
      </Container>
    </section>
  );
}
