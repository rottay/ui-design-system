/**
 * BhInterviewMonitor - Core Interface
 * Real-Time Interview Dashboard for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * Monitor-specific types (ActiveSession, ProviderStatus, etc.) are UI-only.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBInterview } from '@rottay/recruiter';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterInterview = DBInterview;

export type BhInterviewMonitorPreset = 'standard';

export interface ActiveSession {
  id: string;
  candidateName: string;
  jobTitle: string;
  stageName: string;
  providerName: string;
  durationSeconds: number;
  status: 'connected' | 'processing' | 'error';
  /** Billing mode for this session (e.g. per_interview, per_minute, token_based) */
  billingMode?: string;
  /** Estimated token cost for AI interviews */
  estimatedTokenCost?: number;
  /** Actual token cost accrued so far */
  actualTokenCost?: number;
  /** Whether proctoring is enabled for this session */
  proctoringEnabled?: boolean;
  /** Number of proctoring violations detected */
  proctoringViolations?: number;
  /** Whether this session was resumed from a previous disconnection */
  wasResumed?: boolean;
  /** Number of times the session has been resumed */
  resumeCount?: number;
}

export interface ProviderStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  circuitBreaker: 'closed' | 'open' | 'half-open';
  /** Provider response latency in milliseconds (more granular than latencyMs) */
  latency?: number;
  /** Error rate as a percentage (0-100) */
  errorRate?: number;
}

export interface MonitorAlert {
  id: string;
  type: 'no_show' | 'tech_failure' | 'sla_breach' | 'completion';
  message: string;
  time: Date;
  severity: 'info' | 'warning' | 'error';
}

export interface MetricsDataPoint {
  time: string;
  value: number;
}

export interface RecentCompletion {
  id: string;
  candidateName: string;
  jobTitle: string;
  score: number;
  completedAt: Date;
}

export interface BhInterviewMonitorProps extends EngineAwareProps {
  preset?: BhInterviewMonitorPreset;

  /** Active interview sessions currently running */
  activeSessions?: ActiveSession[];

  /** Health status of AI interview providers */
  providerHealth?: ProviderStatus[];

  /** System alerts and notifications */
  alerts?: MonitorAlert[];

  /** Real-time metrics data */
  metricsData?: {
    interviewsPerHour: MetricsDataPoint[];
    avgDuration: number;
    completionRate: number;
  };

  /** Recently completed interviews */
  recentCompletions?: RecentCompletion[];

  /** End an active interview session */
  onEndSession?: (sessionId: string) => void;

  /** Transfer session to human interviewer */
  onTransferToHuman?: (sessionId: string) => void;

  /** Retry a failed provider */
  onRetryProvider?: (providerName: string) => void;

  /** Currently selected session ID */
  selectedSession?: string | null;

  /** Callback when a session is selected */
  onSessionSelect?: (sessionId: string | null) => void;

  /** Whether auto-refresh is enabled */
  autoRefresh?: boolean;

  /** Toggle auto-refresh */
  onAutoRefreshToggle?: (enabled: boolean) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_INTERVIEW_MONITOR_DEFAULTS: Partial<BhInterviewMonitorProps> = {
  preset: 'standard',
};
