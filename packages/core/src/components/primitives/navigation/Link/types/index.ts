/**
 * Link Types
 */
import type { ReactNode, CSSProperties, AnchorHTMLAttributes } from 'react';

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> {
  /** Link content */
  children?: ReactNode;
  /** Link destination */
  href?: string;
  /** Link type/variant */
  type?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Whether link is disabled */
  disabled?: boolean;
  /** Whether to show underline */
  underline?: boolean;
  /** Open in new tab */
  external?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export const LINK_DEFAULTS: Partial<LinkProps> = {
  type: 'default',
  disabled: false,
  underline: true,
  external: false,
};
