'use client';

import { useState } from 'react';

import { Reveal } from '@/components/animations/Reveal';

import styles from './TechStack.module.scss';

export type SkillView = {
  id: string;
  name: string;
  depth: string;
  depthLabel: string;
  usage: string;
  personalOnly: boolean;
  evidence: readonly string[];
  evidenceLabel: string;
};

export type SkillGroupView = {
  id: string;
  title: string;
  skills: SkillView[];
};

type Props = {
  groups: SkillGroupView[];
  personalOnlyLabel: string;
};

export function SkillGroups({ groups, personalOnlyLabel }: Props) {
  const [focused, setFocused] = useState<SkillView | null>(null);

  const isRelated = (skill: SkillView) =>
    focused !== null &&
    skill.id !== focused.id &&
    skill.evidence.some((source) => focused.evidence.includes(source));

  return (
    <div
      className={styles.groups}
      data-probing={focused ? '' : undefined}
      onPointerLeave={() => setFocused(null)}
    >
      {groups.map((group, groupIndex) => (
        <Reveal key={group.id} index={groupIndex} className={styles.group}>
          <h3 className={styles.groupTitle}>{group.title}</h3>

          <ul className={styles.skills}>
            {group.skills.map((skill) => (
              <li
                key={skill.id}
                className={styles.skill}
                data-focused={focused?.id === skill.id || undefined}
                data-related={isRelated(skill) || undefined}
                onPointerEnter={() => setFocused(skill)}
              >
                <div className={styles.skillHead}>
                  <span
                    className={styles.skillDot}
                    data-depth={skill.depth}
                    aria-hidden="true"
                  />
                  <span className={styles.skillName}>{skill.name}</span>
                  <span className={styles.skillDepth}>{skill.depthLabel}</span>
                  {skill.personalOnly ? (
                    <span className={styles.personal}>{personalOnlyLabel}</span>
                  ) : null}
                </div>
                <p className={styles.skillUsage}>{skill.usage}</p>
                <p className={styles.skillEvidence}>{skill.evidenceLabel}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
