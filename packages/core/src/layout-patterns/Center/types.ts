import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface CenterProps extends HTMLAttributes<HTMLDivElement> {
  /** Minimum height ('screen' for 100vh, 'full' for 100%, or custom value) */
  minHeight?: 'screen' | 'full' | string;
  /** Use inline-flex instead of flex */
  inline?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Child elements */
  children?: ReactNode;
}
