/**
 * BhRetentionForecast - Core Interface
 * Dashboard widget showing AI-powered retention predictions for recent hires.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhRetentionForecastPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Retention prediction for a single hire */
export interface RetentionPrediction {
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  hireDate: Date | string;
  retentionProbability6Month: number;
  retentionProbability12Month: number;
  riskFactors: string[];
  status: 'strong' | 'moderate' | 'at_risk';
}

/** Full retention forecast data */
export interface RetentionForecastData {
  predictions: RetentionPrediction[];
  avgRetentionRate: number;
  atRiskCount: number;
  modelConfidence: number;
  lastUpdated: Date | string;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhRetentionForecastProps extends EngineAwareProps {
  preset?: BhRetentionForecastPreset;

  /** Retention forecast data */
  data?: RetentionForecastData;

  /** Loading state */
  loading?: boolean;

  /** Callback when a candidate is clicked */
  onViewCandidate?: (candidateId: string) => void;

  /** Maximum number of predictions to display */
  maxDisplay?: number;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_RETENTION_FORECAST_DEFAULTS: Partial<BhRetentionForecastProps> = {
  preset: 'compact',
  maxDisplay: 3,
};

/** Re-export n helper for convenience */
export { n };
