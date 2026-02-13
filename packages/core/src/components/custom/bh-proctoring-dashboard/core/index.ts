/**
 * BhProctoringDashboard - Core Interface
 * Proctoring event monitoring dashboard for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhProctoringDashboardPreset = 'dashboard' | 'compact';

export type ProctoringEventType =
  | 'tab_switch'
  | 'copy_paste'
  | 'screen_share'
  | 'unusual_typing'
  | 'browser_focus_lost';

export type ProctoringEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ProctoringEventSummary {
  id: string;
  scorableId: string;
  candidateName?: string;
  eventType: ProctoringEventType;
  severity: ProctoringEventSeverity;
  timestamp: Date;
  reviewed: boolean;
  dismissed: boolean;
  metadata?: Record<string, unknown>;
}

export interface SeverityCount {
  severity: ProctoringEventSeverity;
  count: number;
}

export interface EventTypeCount {
  eventType: ProctoringEventType;
  count: number;
}

export interface ProctoringStats {
  totalEvents: number;
  unreviewedCount: number;
  suspiciousCandidates: number;
  averageRiskScore: number;
}

export interface BhProctoringDashboardProps extends EngineAwareProps {
  preset?: BhProctoringDashboardPreset;

  /** Summary statistics */
  stats: ProctoringStats;

  /** Severity distribution for donut chart */
  severityCounts: SeverityCount[];

  /** Event type distribution for bar chart */
  eventTypeCounts: EventTypeCount[];

  /** Recent events feed */
  recentEvents: ProctoringEventSummary[];

  /** Callback when an event is clicked */
  onEventClick?: (eventId: string) => void;

  /** Callback when review is triggered */
  onReviewEvent?: (eventId: string) => void;

  /** Callback when dismiss is triggered */
  onDismissEvent?: (eventId: string) => void;

  /** Currently selected event */
  selectedEventId?: string | null;

  /** Date range filter */
  dateRange?: [string, string];

  /** Callback when date range changes */
  onDateRangeChange?: (range: [string, string]) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCTORING_DASHBOARD_DEFAULTS: Partial<BhProctoringDashboardProps> = {
  preset: 'dashboard',
};
