/**
 * BhSprintReview - Core Interface
 * Sprint review/summary view for BitHire recruiting sprints.
 * Displays goals, metrics, highlights, and improvements.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhSprintReviewPreset = 'summary';

// =============================================================================
// SPRINT REVIEW DATA TYPES
// =============================================================================

/**
 * A goal tracked during the sprint.
 */
export interface SprintGoal {
  title: string;
  target: number;
  achieved: number;
  status: 'completed' | 'partial' | 'missed';
}

/**
 * A metric measured during the sprint.
 */
export interface SprintMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'stable' | 'down';
  benchmark?: number;
}

/**
 * Complete sprint review data.
 */
export interface SprintReviewData {
  sprintId: string;
  sprintName: string;
  startDate: Date;
  endDate: Date;
  goals: SprintGoal[];
  metrics: SprintMetric[];
  highlights: string[];
  improvements: string[];
  teamVelocity: number;
  prevVelocity?: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhSprintReviewProps extends EngineAwareProps {
  preset?: BhSprintReviewPreset;

  /** Sprint review data */
  data?: SprintReviewData;

  /** Whether data is loading */
  loading?: boolean;

  /** Callback to view details of a goal or metric */
  onViewDetails?: (type: 'goal' | 'metric', index: number) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SPRINT_REVIEW_DEFAULTS: Partial<BhSprintReviewProps> = {
  preset: 'summary',
};
