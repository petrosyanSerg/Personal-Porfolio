import { cn } from '@/lib/cn';

import styles from './SectionHeader.module.scss';

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  id: string;
  align?: 'start' | 'center';
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  lead,
  id,
  align = 'start',
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn(styles.header, styles[align], className)}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </header>
  );
}
