/**
 * BhProctoringDashboard - Core Interface
 * Proctoring event monitoring dashboard for BitHire ATS platform
 *
 * Uses ProctoringEventSelect from @rottay/scoring as the entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity } from '@rottay/scoring';

export type BhProctoringDashboardPreset = 'dashboard' | 'compact';

/** Backward-compat aliases (old names from pre-migration) */
export type ProctoringEventTypeValue = ProctoringEventType;
export type ProctoringEventSeverityValue = ProctoringEventSeverity;

/**
 * UI-friendly proctoring event summary with flat fields.
 * Pre-computed/mapped from DB data by the consuming application.
 */
export interface ProctoringEventSummary {
  /** Event identifier */
  id: string;
  /** Scorable entity identifier */
  scorableId?: string;
  /** Display name of the candidate (resolved externally) */
  candidateName?: string;
  /** Type of proctoring event */
  eventType?: ProctoringEventType;
  /** Event severity */
  severity?: ProctoringEventSeverity;
  /** When the event occurred */
  timestamp?: Date;
  /** Whether the event has been reviewed */
  reviewed?: boolean;
  /** Whether the event has been dismissed */
  dismissed?: boolean;
  /** Event metadata (JSONB from DB) */
  metadata?: Record<string, unknown>;
  /** Who reviewed this event (user ID or display name) */
  reviewedBy?: string;
  /** When the event was reviewed */
  reviewedAt?: Date | string;
  /** Notes left by the reviewer */
  reviewNotes?: string;
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
  totalEvents?: number;
  unreviewedCount?: number;
  suspiciousCandidates?: number;
  averageRiskScore?: number;
}

export interface BhProctoringDashboardProps extends EngineAwareProps {
  preset?: BhProctoringDashboardPreset;

  /** Summary statistics */
  stats?: ProctoringStats;

  /** Severity distribution for donut chart */
  severityCounts?: SeverityCount[];

  /** Event type distribution for bar chart */
  eventTypeCounts?: EventTypeCount[];

  /** Recent events feed */
  recentEvents?: ProctoringEventSummary[];

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

/** Re-export DB types for convenience */
export type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity };
