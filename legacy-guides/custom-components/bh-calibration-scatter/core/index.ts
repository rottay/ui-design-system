/**
 * BhCalibrationScatter - Core Interface
 * Human vs AI score scatter plot for calibration analysis
 *
 * Uses CalibrationSampleSelect from @rottay/scoring for data context.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { CalibrationSampleSelect, CalibrationSelect } from '@rottay/scoring';
import { n } from '../../helpers';

export type BhCalibrationScatterPreset = 'chart' | 'compact';

export interface ScatterPoint {
  id: string;
  humanScore: number;
  aiScore: number;
  candidateName?: string;
  dimensionName?: string;
  deviation?: number;
  calibrated?: boolean;
  /** Weighted human score (accounts for dimension weights) */
  humanWeightedScore?: number;
  /** Weighted LLM score (accounts for dimension weights) */
  llmWeightedScore?: number;
  /** Whether human and LLM agree on the score level */
  levelMatch?: boolean;
}

export interface CalibrationStats {
  correlation?: number;
  meanDeviation?: number;
  sampleCount?: number;
  agreementRate?: number;
}

export interface BhCalibrationScatterProps extends EngineAwareProps {
  preset?: BhCalibrationScatterPreset;

  /** Data points for the scatter plot */
  points?: ScatterPoint[];

  /** Aggregate calibration statistics */
  stats?: CalibrationStats;

  /** Callback when a point is clicked */
  onPointClick?: (pointId: string) => void;

  /** Currently selected point ID */
  selectedPointId?: string;

  /** Whether to show the regression line */
  showRegressionLine?: boolean;

  /** Whether to show the diagonal reference line */
  showDiagonal?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CALIBRATION_SCATTER_DEFAULTS: Partial<BhCalibrationScatterProps> = {
  preset: 'chart',
  showRegressionLine: false,
  showDiagonal: true,
};

/** Re-export n helper for convenience */
export { n };

/** Re-export DB types for convenience */
export type { CalibrationSampleSelect, CalibrationSelect };
