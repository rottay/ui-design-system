import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type HStackGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

export interface HStackProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between children */
  gap?: HStackGap;
  /** Align items vertically */
  align?: CSSProperties['alignItems'];
  /** Enable flex-wrap */
  wrap?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Child elements */
  children?: ReactNode;
}
