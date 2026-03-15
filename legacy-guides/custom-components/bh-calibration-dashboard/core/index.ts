/**
 * BhCalibrationDashboard - Core Interface
 * Calibration session management dashboard for BitHire ATS platform
 *
 * Uses CalibrationSelect from @rottay/scoring as the DB entity type.
 * CalibrationSessionView is a UI-friendly flat interface used by presets.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { CalibrationSelect } from '@rottay/scoring';
import { n } from '../../helpers';

export type BhCalibrationDashboardPreset = 'dashboard' | 'compact';

/** DB calibration status values */
export type CalibrationStatus = CalibrationSelect['status'];

/**
 * UI-friendly calibration session view with flat fields.
 * Pre-computed/mapped from DB data by the consuming application.
 */
export interface CalibrationSessionView {
  /** Session identifier */
  id: string;
  /** Display name of the rubric (resolved externally) */
  rubricName?: string;
  /** Session status */
  status: string;
  /** Computed progress 0-1 */
  progress?: number;
  /** Total samples in the session */
  totalSamples?: number;
  /** Number of completed samples */
  completedSamples?: number;
  /** Participant names (resolved externally) */
  participants?: string[];
  /** Computed agreement rate */
  agreementRate?: number;
  /** When the session started */
  startedAt?: Date;
  /** When the session completed (if applicable) */
  completedAt?: Date;
  /** Pearson correlation between human and LLM scores */
  overallCorrelation?: number;
  /** Mean absolute error across all samples */
  meanAbsoluteError?: number;
  /** Per-dimension calibration metrics (from CalibrationSelect.dimensionMetrics) */
  dimensionMetrics?: Record<string, unknown>[];
  /** LLM model used for scoring in this session */
  llmModel?: string;
  /** Prompt version used for scoring */
  promptVersion?: string;
  /** Target number of samples for the session */
  targetSamples?: number;
  /** Minimum samples required before metrics are valid */
  minSamples?: number;
}

export interface CalibrationMetrics {
  activeSessions?: number;
  totalCompleted?: number;
  avgAgreementRate?: number;
  avgDeviation?: number;
  topPerformingRubric?: string;
  worstPerformingRubric?: string;
}

export interface BhCalibrationDashboardProps extends EngineAwareProps {
  preset?: BhCalibrationDashboardPreset;

  /** List of calibration sessions */
  sessions?: CalibrationSessionView[];

  /** Aggregate calibration metrics */
  metrics?: CalibrationMetrics;

  /** Callback when a session row is clicked */
  onSessionClick?: (sessionId: string) => void;

  /** Callback when create session button is clicked */
  onCreateSession?: () => void;

  /** Currently selected session ID */
  selectedSessionId?: string;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CALIBRATION_DASHBOARD_DEFAULTS: Partial<BhCalibrationDashboardProps> = {
  preset: 'dashboard',
};

/** Backward-compat alias (old name from pre-migration) */
export type CalibrationSession = CalibrationSessionView;

/** Re-export n helper for convenience */
export { n };

/** Re-export DB type for convenience */
export type { CalibrationSelect };
