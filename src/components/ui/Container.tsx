import { cn } from '@/lib/cn';

import styles from './Container.module.scss';

type ContainerWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ContainerProps = {
  children: React.ReactNode;
  width?: ContainerWidth;
  className?: string;
  as?: 'div' | 'section' | 'header' | 'footer' | 'article';
};

export function Container({
  children,
  width = 'lg',
  className,
  as: Tag = 'div',
}: ContainerProps) {
  return <Tag className={cn(styles.container, styles[width], className)}>{children}</Tag>;
}
