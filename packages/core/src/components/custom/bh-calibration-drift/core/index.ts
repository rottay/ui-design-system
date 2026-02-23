/**
 * BhCalibrationDrift - Core Interface
 * Dashboard monitoring panel for interviewer scoring consistency
 * using Statistical Process Control (SPC) charts.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { ControlChartData } from '../../bh-control-chart/core';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhCalibrationDriftPreset = 'monitoring';

// =============================================================================
// DATA TYPES
// =============================================================================

/** SPC control limits */
export interface DriftControlLimits {
  ucl: number;
  lcl: number;
  centerLine: number;
  upperWarning: number;
  lowerWarning: number;
}

/** A single data point on the drift chart */
export interface DriftDataPoint {
  date: Date | string;
  score: number;
  interviewId: string;
  candidateName?: string;
  isOutlier: boolean;
}

/** Drift data for a single interviewer */
export interface InterviewerDrift {
  interviewerId: string;
  interviewerName: string;
  avatarUrl?: string;
  currentMean: number;
  historicalMean: number;
  standardDeviation: number;
  drift: number;
  driftDirection: 'hawkish' | 'dovish' | 'stable';
  controlLimits: DriftControlLimits;
  dataPoints: DriftDataPoint[];
  status: 'in_control' | 'warning' | 'out_of_control';
  alertCount: number;
  lastInterviewAt: Date | string;
}

/** Drift alert */
export interface DriftAlert {
  id: string;
  interviewerId: string;
  interviewerName: string;
  type: 'mean_shift' | 'trend' | 'run' | 'outlier' | 'range_expansion';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  detectedAt: Date | string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date | string;
}

/** Calibration summary for the dashboard header */
export interface CalibrationSummary {
  healthScore: number;
  totalInterviewers: number;
  inControl: number;
  warning: number;
  outOfControl: number;
  topDrifters: Array<{ interviewerId: string; name: string; drift: number }>;
  recentAlerts: DriftAlert[];
  trendDirection: 'improving' | 'stable' | 'degrading';
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhCalibrationDriftProps extends EngineAwareProps {
  /** Which preset to render */
  preset?: BhCalibrationDriftPreset;

  /** Drift data for all interviewers */
  driftData?: {
    interviewers: InterviewerDrift[];
    overallHealth: 'healthy' | 'warning' | 'critical';
    totalInterviewers: number;
    driftingCount: number;
    lastCalculated: Date | string;
  };

  /** Dashboard summary data */
  summary?: CalibrationSummary;

  /** Active drift alerts */
  alerts?: DriftAlert[];

  /** Loading state */
  loading?: boolean;

  /** Callback when an interviewer card is selected */
  onSelectInterviewer?: (interviewerId: string) => void;

  /** Callback when an alert is acknowledged */
  onAcknowledgeAlert?: (alertId: string) => void;

  /** Currently selected interviewer ID */
  selectedInterviewerId?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_CALIBRATION_DRIFT_DEFAULTS: Partial<BhCalibrationDriftProps> = {
  preset: 'monitoring',
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns the appropriate color scale for a drift status.
 * in_control = successScale, warning = warningScale, out_of_control = errorScale
 */
export function getDriftStatusColor(
  status: 'in_control' | 'warning' | 'out_of_control',
  tokens: DesignTokens
): { bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case 'in_control':
      return {
        bg: tokens.colors.successScale[100],
        text: tokens.colors.successScale[700],
        border: tokens.colors.successScale[200],
        dot: tokens.colors.successScale[500],
      };
    case 'warning':
      return {
        bg: tokens.colors.warningScale[100],
        text: tokens.colors.warningScale[700],
        border: tokens.colors.warningScale[200],
        dot: tokens.colors.warningScale[500],
      };
    case 'out_of_control':
      return {
        bg: tokens.colors.errorScale[100],
        text: tokens.colors.errorScale[700],
        border: tokens.colors.errorScale[200],
        dot: tokens.colors.errorScale[500],
      };
  }
}

/**
 * Returns a human-readable label for drift direction.
 */
export function getDriftDirectionLabel(
  direction: 'hawkish' | 'dovish' | 'stable'
): string {
  switch (direction) {
    case 'hawkish':
      return 'Scoring High';
    case 'dovish':
      return 'Scoring Low';
    case 'stable':
      return 'Stable';
  }
}

/**
 * Converts InterviewerDrift data to ControlChartData format.
 */
export function toControlChartData(interviewer: InterviewerDrift): ControlChartData {
  return {
    dataPoints: interviewer.dataPoints.map(dp => ({
      date: typeof dp.date === 'string' ? dp.date : dp.date.toISOString(),
      value: dp.score,
      isOutlier: dp.isOutlier,
      label: dp.candidateName,
    })),
    controlLimits: {
      ucl: interviewer.controlLimits.ucl,
      lcl: interviewer.controlLimits.lcl,
      centerLine: interviewer.controlLimits.centerLine,
      upperWarning: interviewer.controlLimits.upperWarning,
      lowerWarning: interviewer.controlLimits.lowerWarning,
    },
  };
}
