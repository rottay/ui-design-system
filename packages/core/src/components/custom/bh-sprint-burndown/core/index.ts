/**
 * BhSprintBurndown - Core Interface
 * Sprint burndown chart with actual vs ideal line for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhSprintBurndownPreset = 'chart' | 'compact';

export interface BurndownDataPoint {
  day: number;
  ideal: number;
  actual: number;
  date: string;
}

export interface BhSprintBurndownProps extends EngineAwareProps {
  preset?: BhSprintBurndownPreset;

  /** Burndown data points */
  data: BurndownDataPoint[];

  /** Sprint name */
  sprintName?: string;

  /** Total story points in the sprint */
  totalPoints: number;

  /** Total days in the sprint */
  daysTotal: number;

  /** Days elapsed so far */
  daysElapsed: number;

  /** Card title */
  title?: string;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SPRINT_BURNDOWN_DEFAULTS: Partial<BhSprintBurndownProps> = {
  preset: 'chart',
};
