/**
 * BhSprintVelocity - Core Interface
 * Positions filled per sprint BarChart for BitHire ATS platform
 *
 * DB Reference: DBTeamSprint from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBTeamSprint } from '@rottay/recruiter';

export type BhSprintVelocityPreset = 'chart' | 'compact';

/** Re-export for consumer convenience */
export type { DBTeamSprint };

export interface SprintVelocityData {
  sprintName?: string;
  planned?: number;
  completed?: number;
  carryOver?: number;
  /** Revenue target for the sprint (from DBTeamSprint.revenueTarget) */
  revenueTarget?: number;
  /** Revenue generated in the sprint (from DBTeamSprint.revenueGenerated) */
  revenueGenerated?: number;
  /** Sprint duration in weeks (from DBTeamSprint.durationWeeks) */
  durationWeeks?: number;
  /** Overall sprint completion percentage (from DBTeamSprint.completionPercentage) */
  completionPercentage?: number;
  /** Position target for the sprint (from DBTeamSprint.positionTarget) */
  positionTarget?: number;
  /** Positions actually filled (from DBTeamSprint.positionsFilled) */
  positionsFilled?: number;
}

export interface BhSprintVelocityProps extends EngineAwareProps {
  preset?: BhSprintVelocityPreset;

  /** Active sprint - accepts DBTeamSprint directly from @rottay/recruiter */
  activeSprint?: DBTeamSprint;

  /** Sprint velocity data points */
  sprints?: SprintVelocityData[];

  /** Average velocity across sprints */
  averageVelocity?: number;

  /** Card title */
  title?: string;

  /** Callback when a sprint bar is clicked */
  onSprintClick?: (sprintName: string) => void;

  /** Currency for revenue display */
  revenueCurrency?: string;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SPRINT_VELOCITY_DEFAULTS: Partial<BhSprintVelocityProps> = {
  preset: 'chart',
};
