import type { SkillDepth } from '@/types/profile';
import { cn } from '@/lib/cn';

import styles from './Tag.module.scss';

type TagProps = {
  children: React.ReactNode;
  depth?: SkillDepth;
  className?: string;
};

export function Tag({ children, depth, className }: TagProps) {
  return (
    <span className={cn(styles.tag, depth && styles[depth], className)}>{children}</span>
  );
}
