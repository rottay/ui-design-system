import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type StackGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between children */
  gap?: StackGap;
  /** Align items horizontally */
  align?: CSSProperties['alignItems'];
  /** Divider element to insert between children */
  divider?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Child elements */
  children?: ReactNode;
}
