import type { HTMLAttributes, ReactNode } from 'react';

export type SectionSize = 'sm' | 'md' | 'lg';
export type SectionContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Section vertical padding size */
  size?: SectionSize;
  /** Background color */
  background?: string;
  /** Whether to wrap children in a Container */
  contained?: boolean;
  /** Container size when contained is true */
  containerSize?: SectionContainerSize;
  /** Section children */
  children?: ReactNode;
}
