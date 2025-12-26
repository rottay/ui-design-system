/**
 * Result Types
 * Display status of an operation
 */
import type { ReactNode, CSSProperties } from 'react';

export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';

export interface ResultProps {
  /** Result status */
  status?: ResultStatus;
  /** Custom icon */
  icon?: ReactNode;
  /** Title text */
  title?: ReactNode;
  /** Subtitle/description text */
  subTitle?: ReactNode;
  /** Extra content (usually buttons) */
  extra?: ReactNode;
  /** Children content */
  children?: ReactNode;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: CSSProperties;
}

export const RESULT_DEFAULTS: Partial<ResultProps> = {
  status: 'info',
};

export const RESULT_ICONS: Record<ResultStatus, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
  '404': '404',
  '403': '403',
  '500': '500',
};

export const RESULT_COLORS: Record<ResultStatus, string> = {
  success: '#52c41a',
  error: '#ff4d4f',
  info: '#1677ff',
  warning: '#faad14',
  '404': '#1677ff',
  '403': '#faad14',
  '500': '#ff4d4f',
};
