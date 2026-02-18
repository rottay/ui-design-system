/**
 * BhSprintBurndown - Core Interface
 * Sprint burndown chart with actual vs ideal line for BitHire ATS platform
 *
 * DB Reference: DBTeamSprint from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBTeamSprint } from '@rottay/recruiter';

export type BhSprintBurndownPreset = 'chart' | 'compact';

/** Re-export for consumer convenience */
export type { DBTeamSprint };

export interface BurndownDataPoint {
  day?: number;
  ideal?: number;
  actual?: number;
  date?: string;
  /** Display label for the data point */
  label?: string;
  /** Milestone marker name (if this point represents a milestone) */
  milestone?: string;
}

export interface BhSprintBurndownProps extends EngineAwareProps {
  preset?: BhSprintBurndownPreset;

  /** Sprint data - accepts DBTeamSprint directly from @rottay/recruiter */
  sprint?: DBTeamSprint;

  /** Burndown data points */
  data?: BurndownDataPoint[];

  /** Sprint name (falls back to sprint?.name if not provided) */
  sprintName?: string;

  /** Total story points in the sprint */
  totalPoints?: number;

  /** Total days in the sprint */
  daysTotal?: number;

  /** Days elapsed so far */
  daysElapsed?: number;

  /** Card title */
  title?: string;

  /** Position target for the sprint (from DBTeamSprint.positionTarget) */
  positionTarget?: number;

  /** Placement target for the sprint (from DBTeamSprint.placementTarget) */
  placementTarget?: number;

  /** Revenue target for the sprint (from DBTeamSprint.revenueTarget) */
  revenueTarget?: number;

  /** Overall sprint completion percentage (from DBTeamSprint.completionPercentage) */
  completionPercentage?: number;

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
