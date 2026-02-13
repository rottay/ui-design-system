/**
 * BhCalibrationSample - Core Interface
 * Calibration sample review for comparing human vs AI scoring
 * in the BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhCalibrationSamplePreset = 'review' | 'compact';

export type CalibrationSampleStatus = 'pending' | 'reviewed' | 'adjusted';

export interface DimensionComparison {
  dimensionName: string;
  humanScore: number;
  aiScore: number;
  deviation: number;
  maxScore: number;
  weight: number;
  humanNotes?: string;
  aiNotes?: string;
  agreed: boolean;
}

export interface CalibrationSample {
  id: string;
  scorableId: string;
  candidateName: string;
  dimensions: DimensionComparison[];
  overallHumanScore: number;
  overallAiScore: number;
  overallDeviation: number;
  agreementRate: number;
  status: CalibrationSampleStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  adjustmentNotes?: string;
}

export interface BhCalibrationSampleProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhCalibrationSamplePreset;

  /** Calibration sample data */
  sample: CalibrationSample;

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
