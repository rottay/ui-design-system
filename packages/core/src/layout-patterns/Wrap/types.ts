import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type WrapGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

export interface WrapProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between children */
  gap?: WrapGap;
  /** Spacing (alias for gap, for backwards compatibility) */
  spacing?: WrapGap;
  /** Align items */
  align?: CSSProperties['alignItems'];
  /** Justify content */
  justify?: CSSProperties['justifyContent'];
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Child elements */
  children?: ReactNode;
}
