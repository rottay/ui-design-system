/**
 * BhSprintVelocity - Core Interface
 * Positions filled per sprint BarChart for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhSprintVelocityPreset = 'chart' | 'compact';

export interface SprintVelocityData {
  sprintName: string;
  planned: number;
  completed: number;
  carryOver: number;
}

export interface BhSprintVelocityProps extends EngineAwareProps {
  preset?: BhSprintVelocityPreset;

  /** Sprint velocity data points */
  sprints: SprintVelocityData[];

  /** Average velocity across sprints */
  averageVelocity?: number;

  /** Card title */
  title?: string;

  /** Callback when a sprint bar is clicked */
  onSprintClick?: (sprintName: string) => void;

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
