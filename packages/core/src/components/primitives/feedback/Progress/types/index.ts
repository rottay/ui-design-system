/**
 * Progress - Core Interface
 */

import type { EngineAwareProps } from '../../../../../types';

export type ProgressType = 'line' | 'circle';
export type ProgressStatus = 'normal' | 'success' | 'error' | 'active';

export interface ProgressProps extends EngineAwareProps {
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
