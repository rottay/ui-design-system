import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type GridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

export interface ResponsiveColumns {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns or responsive column configuration */
  columns?: number | string | ResponsiveColumns;
  /** Gap between grid items */
  gap?: GridGap;
  /** Gap between rows (overrides gap) */
  rowGap?: GridGap;
  /** Gap between columns (overrides gap) */
  columnGap?: GridGap;
  /** Minimum width for auto-fit columns */
  minChildWidth?: string;
  /** Grid auto flow direction */
  autoFlow?: CSSProperties['gridAutoFlow'];
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Child elements */
  children?: ReactNode;
}
