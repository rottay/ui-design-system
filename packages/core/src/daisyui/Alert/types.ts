import type { ReactNode } from 'react';

export type DaisyAlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface DaisyAlertProps {
  /** Alert variant/type */
  variant?: DaisyAlertVariant;
  /** Alert title */
  title?: string;
  /** Alert message */
  message?: string;
  /** Icon element */
  icon?: ReactNode;
  /** Actions (buttons, links) */
  actions?: ReactNode;
  /** Children content */
  children?: ReactNode;
  /** Custom className */
  className?: string;
}
