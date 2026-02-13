/**
 * BhCalibrationScatter - Core Interface
 * Human vs AI score scatter plot for calibration analysis in BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhCalibrationScatterPreset = 'chart' | 'compact';

export interface ScatterPoint {
  id: string;
  humanScore: number; // 0-5
  aiScore: number; // 0-5
  candidateName: string;
  dimensionName?: string;
  deviation: number;
  calibrated: boolean;
}

export interface CalibrationStats {
  correlation: number;
  meanDeviation: number;
  sampleCount: number;
  agreementRate: number;
}

export interface BhCalibrationScatterProps extends EngineAwareProps {
  preset?: BhCalibrationScatterPreset;

  /** Data points for the scatter plot */
  points: ScatterPoint[];

  /** Aggregate calibration statistics */
  stats: CalibrationStats;

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
