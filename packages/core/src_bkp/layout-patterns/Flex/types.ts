import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type FlexGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  /** Flex direction */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  /** Align items */
  align?: CSSProperties['alignItems'];
  /** Justify content */
  justify?: CSSProperties['justifyContent'];
  /** Enable flex-wrap */
  wrap?: boolean;
  /** Gap between children */
  gap?: FlexGap;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Child elements */
  children?: ReactNode;
}
