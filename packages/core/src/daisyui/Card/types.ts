import type { ReactNode } from 'react';

export type DaisyCardVariant = 'bordered' | 'compact' | 'normal' | 'side';
export type DaisyCardImagePosition = 'top' | 'bottom' | 'side';

export interface DaisyCardProps {
  /** Card title */
  title?: string;
  /** Card description/subtitle */
  description?: string;
  /** Image URL */
  image?: string;
  /** Image position */
  imagePosition?: DaisyCardImagePosition;
  /** Card variant */
  variant?: DaisyCardVariant;
  /** Shadow effect */
  shadow?: boolean;
  /** Glass effect */
  glass?: boolean;
  /** Actions (buttons, etc.) */
  actions?: ReactNode;
  /** Card body content */
  children?: ReactNode;
  /** Custom className */
  className?: string;
}
