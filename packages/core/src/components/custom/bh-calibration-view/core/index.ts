/**
 * BhCalibrationView - Core Interface
 * Human-AI Calibration session view for the BitHire ATS platform
 *
 * Uses CalibrationSelect and CalibrationSampleSelect from @rottay/scoring.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { CalibrationSelect, CalibrationSampleSelect } from '@rottay/scoring';

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
}

export interface AlignmentMetrics {
  agreementRate?: number;
  meanAbsoluteError?: number;
  confidenceCorrelation?: number;
  perDimensionAlignment?: { dimension: string; agreement: number }[];
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

/** Convert Drizzle numeric string to number. Handles null/undefined/string/number safely. */
export function n(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const parsed = Number(v);
  return isNaN(parsed) ? 0 : parsed;
}

/** Re-export DB types for convenience */
export type { CalibrationSelect, CalibrationSampleSelect };
