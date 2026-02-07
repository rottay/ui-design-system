/**
 * BhCalibrationView - Core Interface
 * Human-AI Calibration for the BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhCalibrationViewPreset = 'session' | 'results';

export interface TranscriptLine {
  speaker: string;
  text: string;
}

export interface CalibrationSample {
  id: string;
  transcriptLines: TranscriptLine[];
  humanScores?: Record<string, number>;
  aiScores?: Record<string, number>;
}

export interface AlignmentMetrics {
  agreementRate: number;
  meanAbsoluteError: number;
  confidenceCorrelation: number;
  perDimensionAlignment: { dimension: string; agreement: number }[];
}

export interface DimensionAdjustment {
  dimension: string;
  misalignment: number;
  suggestedTweak: string;
}

export interface BhCalibrationViewProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhCalibrationViewPreset;

  /** Name of the rubric being calibrated */
  rubricName: string;

  /** Scoring dimensions */
  dimensions: string[];

  /** Calibration samples */
  samples: CalibrationSample[];

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
