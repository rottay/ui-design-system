/**
 * BhCalibrationSample - Core Interface
 * Calibration sample review for comparing human vs AI scoring
 *
 * Uses CalibrationSampleSelect from @rottay/scoring as the entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { CalibrationSampleSelect } from '@rottay/scoring';
import { n } from '../../helpers';

export type BhCalibrationSamplePreset = 'review' | 'compact';

/** Dimension-level comparison data (from CalibrationSampleSelect.dimensionComparisons jsonb) */
export interface DimensionComparison {
  dimensionName?: string;
  humanScore?: number;
  aiScore?: number;
  deviation?: number;
  maxScore?: number;
  weight?: number;
  humanNotes?: string;
  aiNotes?: string;
  agreed?: boolean;
}

/**
 * UI-friendly calibration sample view with flat fields.
 * Pre-computed/mapped from DB data by the consuming application.
 */
export interface CalibrationSampleView {
  /** Sample identifier */
  id: string;
  /** Scorable entity identifier */
  scorableId?: string;
  /** Display name of the candidate (resolved externally) */
  candidateName?: string;
  /** Parsed dimension comparisons */
  dimensions?: DimensionComparison[];
  /** Overall human score */
  overallHumanScore?: number;
  /** Overall AI score */
  overallAiScore?: number;
  /** Overall deviation between human and AI */
  overallDeviation?: number;
  /** Computed agreement rate (0-1) */
  agreementRate?: number;
  /** Review status (UI-derived) */
  status?: 'pending' | 'reviewed' | 'adjusted';
  /** Adjustment notes */
  adjustmentNotes?: string;
  /** Weighted human score (accounts for dimension weights) */
  humanWeightedScore?: number;
  /** Weighted LLM score (accounts for dimension weights) */
  llmWeightedScore?: number;
  /** Human score level/band (e.g. 'strong', 'adequate') */
  humanScoreLevel?: string;
  /** LLM score level/band (e.g. 'strong', 'adequate') */
  llmScoreLevel?: string;
  /** Whether human and LLM agree on the score level */
  levelMatch?: boolean;
  /** ID or name of the person who scored the sample */
  scoredBy?: string;
  /** Reviewer or scorer notes */
  notes?: string;
}

export interface BhCalibrationSampleProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhCalibrationSamplePreset;

  /** Calibration sample data */
  sample?: CalibrationSampleView;

  /** Callback to adjust a dimension score */
  onAdjustScore?: (dimensionName: string, newScore: number) => void;

  /** Callback to submit the review */
  onSubmitReview?: (sampleId: string, notes: string) => void;

  /** Callback to dismiss the sample */
  onDismiss?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CALIBRATION_SAMPLE_DEFAULTS: Partial<BhCalibrationSampleProps> = {
  preset: 'review',
};

/** Backward-compat aliases (old names from pre-migration) */
export type CalibrationSample = CalibrationSampleView;
export type CalibrationSampleStatus = 'pending' | 'reviewed' | 'adjusted';

/** Re-export n helper for convenience */
export { n };

/** Re-export DB type for convenience */
export type { CalibrationSampleSelect };
