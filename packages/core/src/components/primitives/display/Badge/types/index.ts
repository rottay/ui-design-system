/**
 * Badge - Core Interface
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends EngineAwareProps {
  children?: ReactNode;
  count?: number;
  dot?: boolean;
  variant?: BadgeVariant;
  size?: BadgeSize;
  showZero?: boolean;
  maxCount?: number;
}

export const BADGE_DEFAULTS: Partial<BadgeProps> = {
  variant: 'default',
  size: 'md',
  showZero: false,
  maxCount: 99,
};

export const VARIANT_COLOR_MAP = {
  default: '#d9d9d9',
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
};
