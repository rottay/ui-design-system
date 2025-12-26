/**
 * Progress - Core Interface
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps, BaseComponentProps } from '../../../../../types';

export type ProgressType = 'line' | 'circle';
export type ProgressStatus = 'normal' | 'success' | 'error' | 'active';

export interface ProgressProps extends BaseComponentProps, EngineAwareProps {
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Children elements */
  children?: ReactNode;
  percent: number;
  type?: ProgressType;
  status?: ProgressStatus;
  showInfo?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
}

export const PROGRESS_DEFAULTS: Partial<ProgressProps> = {
  type: 'line',
  status: 'normal',
  showInfo: true,
  strokeWidth: 8,
};
