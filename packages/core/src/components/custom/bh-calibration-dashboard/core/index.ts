/**
 * BhCalibrationDashboard - Core Interface
 * Calibration session management dashboard for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhCalibrationDashboardPreset = 'dashboard' | 'compact';

export interface CalibrationSession {
  id: string;
  rubricName: string;
  status: 'active' | 'completed' | 'paused';
  progress: number; // 0-1
  totalSamples: number;
  completedSamples: number;
  participants: string[];
  agreementRate: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface CalibrationMetrics {
  activeSessions: number;
  totalCompleted: number;
  avgAgreementRate: number;
  avgDeviation: number;
  topPerformingRubric?: string;
  worstPerformingRubric?: string;
}

export interface BhCalibrationDashboardProps extends EngineAwareProps {
  preset?: BhCalibrationDashboardPreset;

  /** List of calibration sessions */
  sessions: CalibrationSession[];

  /** Aggregate calibration metrics */
  metrics: CalibrationMetrics;

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
