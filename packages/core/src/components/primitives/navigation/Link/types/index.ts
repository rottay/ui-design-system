/**
 * Link - Type Definitions
 * @module Link/types
 */

import type { ReactNode, CSSProperties, AnchorHTMLAttributes } from 'react';

export type LinkType = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> {
  children?: ReactNode;
  href?: string;
  type?: LinkType;
  disabled?: boolean;
  underline?: boolean;
  external?: boolean;
  engine?: 'titan' | 'hermes' | 'apollo';
  className?: string;
  style?: CSSProperties;
}

export const LINK_DEFAULTS: Required<Pick<LinkProps, 'type' | 'disabled' | 'underline' | 'external'>> = {
  type: 'default',
  disabled: false,
  underline: true,
  external: false,
};

export const LINK_TYPE_COLORS: Record<LinkType, { color: string; hoverColor: string }> = {
  default: { color: '#1890ff', hoverColor: '#40a9ff' },
  primary: { color: '#1677ff', hoverColor: '#4096ff' },
  secondary: { color: '#722ed1', hoverColor: '#9254de' },
  success: { color: '#52c41a', hoverColor: '#73d13d' },
  warning: { color: '#faad14', hoverColor: '#ffc53d' },
  danger: { color: '#ff4d4f', hoverColor: '#ff7875' },
};
