import type { ReactNode } from 'react';

export type DaisyButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'info' | 'success' | 'warning' | 'error';
export type DaisyButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type DaisyButtonShape = 'square' | 'circle' | 'default';

export interface DaisyButtonProps {
  /** Button variant */
  variant?: DaisyButtonVariant;
  /** Button size */
  size?: DaisyButtonSize;
  /** Button shape */
  shape?: DaisyButtonShape;
  /** Outline style */
  outline?: boolean;
  /** Wide button (full width) */
  wide?: boolean;
  /** Glass effect */
  glass?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Click handler */
  onClick?: () => void;
  /** Children */
  children?: ReactNode;
  /** Custom className */
  className?: string;
}
