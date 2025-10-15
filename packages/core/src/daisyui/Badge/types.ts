import type { ReactNode } from 'react';

export type DaisyBadgeVariant = 'neutral' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'info' | 'success' | 'warning' | 'error';
export type DaisyBadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface DaisyBadgeProps {
  /** Badge variant/color */
  variant?: DaisyBadgeVariant;
  /** Badge size */
  size?: DaisyBadgeSize;
  /** Outline style */
  outline?: boolean;
  /** Badge content */
  children?: ReactNode;
  /** Custom className */
  className?: string;
}
