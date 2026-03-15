/**
 * BhPredictiveModels - Core Interface
 * Dashboard widget showing ML model performance and active predictions.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhPredictiveModelsPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A single predictive model */
export interface PredictiveModel {
  id: string;
  name: string;
  type: 'hire_success' | 'time_to_fill' | 'offer_acceptance' | 'retention' | 'source_quality';
  accuracy: number;
  predictions: number;
  status: 'active' | 'training' | 'degraded' | 'retired';
  lastUpdated: Date | string;
  trend: 'improving' | 'stable' | 'degrading';
}

/** Complete predictive models dataset */
export interface PredictiveModelsData {
  models: PredictiveModel[];
  overallAccuracy: number;
  totalPredictions: number;
  lastTrainedAt: Date | string;
  activePredictions: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhPredictiveModelsProps extends EngineAwareProps {
  preset?: BhPredictiveModelsPreset;

  /** Predictive models data */
  data?: PredictiveModelsData;

  /** Loading state */
  loading?: boolean;

  /** Callback when a model is clicked */
  onViewModel?: (modelId: string) => void;

  /** Callback when retrain is clicked for a degraded model */
  onRetrain?: (modelId: string) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_PREDICTIVE_MODELS_DEFAULTS: Partial<BhPredictiveModelsProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
