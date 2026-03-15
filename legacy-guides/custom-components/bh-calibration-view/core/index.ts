/**
 * BhCalibrationView - Core Interface
 * Human-AI Calibration session view for the BitHire ATS platform
 *
 * Uses CalibrationSelect and CalibrationSampleSelect from @rottay/scoring.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { CalibrationSelect, CalibrationSampleSelect } from '@rottay/scoring';
import { n } from '../../helpers';

export type BhCalibrationViewPreset = 'session' | 'results';

export interface TranscriptLine {
  speaker: string;
  text: string;
}

export interface CalibrationSampleData {
  id: string;
  transcriptLines?: TranscriptLine[];
  humanScores?: Record<string, number>;
  aiScores?: Record<string, number>;
  /** Weighted human score (accounts for dimension weights) */
  humanWeightedScore?: number;
  /** Weighted LLM score (accounts for dimension weights) */
  llmWeightedScore?: number;
  /** Human score level/band */
  humanScoreLevel?: string;
  /** LLM score level/band */
  llmScoreLevel?: string;
  /** Whether human and LLM agree on the score level */
  levelMatch?: boolean;
  /** ID or name of the person who scored the sample */
  scoredBy?: string;
  /** Reviewer or scorer notes */
  notes?: string;
}

export interface AlignmentMetrics {
  agreementRate?: number;
  meanAbsoluteError?: number;
  confidenceCorrelation?: number;
  perDimensionAlignment?: { dimension: string; agreement: number }[];
  /** Pearson correlation between human and LLM scores */
  overallCorrelation?: number;
  /** Per-dimension calibration metrics */
  dimensionMetrics?: Record<string, unknown>[];
  /** LLM model used for scoring */
  llmModel?: string;
  /** Prompt version used for scoring */
  promptVersion?: string;
  /** Target number of samples for the session */
  targetSamples?: number;
  /** Minimum samples required before metrics are valid */
  minSamples?: number;
}

export interface DimensionAdjustment {
  dimension: string;
  misalignment?: number;
  suggestedTweak?: string;
}

export interface BhCalibrationViewProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhCalibrationViewPreset;

  /** The calibration DB entity */
  calibration?: Partial<CalibrationSelect>;

  /** Name of the rubric being calibrated */
  rubricName?: string;

  /** Scoring dimensions */
  dimensions?: string[];

  /** Calibration samples */
  samples?: CalibrationSampleData[];

  /** Current sample index */
  currentSampleIndex?: number;

  /** Callback when sample changes */
  onSampleChange?: (index: number) => void;

  /** Human scores for current sample */
  humanScores?: Record<string, number>;

  /** Callback when a human score changes */
  onHumanScoreChange?: (dimension: string, value: number) => void;

  /** Whether AI scores are revealed */
  showAIScores?: boolean;

  /** Callback to reveal AI scores */
  onReveal?: () => void;

  /** Alignment metrics for completed calibration */
  alignmentMetrics?: AlignmentMetrics;

  /** Adjustment recommendations */
  adjustments?: DimensionAdjustment[];

  /** Whether calibration is being submitted */
  isSubmitting?: boolean;

  /** Callback when calibration is submitted */
  onSubmit?: () => void;

  /** Progress tracker */
  progress?: { completed: number; total: number };

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CALIBRATION_VIEW_DEFAULTS: Partial<BhCalibrationViewProps> = {
  preset: 'session',
};

/** Backward-compat alias (old name from pre-migration) */
export type CalibrationSample = CalibrationSampleData;

/** Re-export n helper for convenience */
export { n };

/** Re-export DB types for convenience */
export type { CalibrationSelect, CalibrationSampleSelect };
