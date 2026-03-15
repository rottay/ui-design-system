/**
 * BhDeiPipeline - Core Interface
 * Dashboard widget for monitoring DEI metrics across the hiring pipeline.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhDeiPipelinePreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Demographic breakdown for a single pipeline stage */
export interface DeiStageData {
  stage: string;
  total: number;
  demographics: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

/** DEI alert for pipeline anomalies */
export interface DeiAlert {
  type: 'dropoff' | 'underrepresentation' | 'goal_met';
  stage: string;
  category: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

/** Representation goal with progress tracking */
export interface DeiGoal {
  category: string;
  target: number;
  current: number;
}

/** Full DEI pipeline dataset */
export interface DeiPipelineData {
  stages: DeiStageData[];
  overallDiversityScore: number;
  trend: 'improving' | 'stable' | 'declining';
  alerts: DeiAlert[];
  representationGoals: DeiGoal[];
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhDeiPipelineProps extends EngineAwareProps {
  preset?: BhDeiPipelinePreset;

  /** DEI pipeline data */
  data?: DeiPipelineData;

  /** Loading state */
  loading?: boolean;

  /** Callback when "View Details" is clicked */
  onViewDetails?: () => void;

  /** Callback when alerts are clicked */
  onViewAlerts?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_DEI_PIPELINE_DEFAULTS: Partial<BhDeiPipelineProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
