/**
 * BhInterviewCenter - Core Interface
 * Interview Management Hub for the BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBInterview[] directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBInterview } from '@rottay/recruiter';

export type BhInterviewCenterPreset = 'calendar' | 'list' | 'timeline';

/**
 * Re-export the DB type for convenience.
 * Consumers can import { RecruiterInterview } from the DS or use DBInterview from @rottay/recruiter.
 */
export type RecruiterInterview = DBInterview;

/**
 * Interview status values the UI cares about for filtering/display.
 * Subset of the full InterviewStatus in the DB schema.
 */
export type InterviewDisplayStatus =
  | 'pending'
  | 'scheduled'
  | 'invitation_sent'
  | 'ready'
  | 'in_progress'
  | 'completed'
  | 'scored'
  | 'approved'
  | 'cancelled'
  | 'expired'
  | 'no_show'
  | 'technical_issue'
  | 'candidate_declined';

/**
 * Interview mode from the DB schema.
 */
export type InterviewDisplayMode = 'ai_voice' | 'ai_chat' | 'human_video' | 'human_phone' | 'in_person';

export type CalendarView = 'month' | 'week' | 'day';

export interface InterviewStats {
  scheduledToday: number;
  inProgress: number;
  completedToday: number;
  noShows: number;
  avgDuration: number;
  completionRate: number;
  completionTrend: number;
  /** Average interview score across completed interviews */
  avgScore?: number;
  /** Net Promoter Score from candidate feedback */
  npsScore?: number;
  /** Rate of interviews with reported technical issues */
  technicalIssueRate?: number;
}

export interface InterviewFilter {
  status?: InterviewDisplayStatus | null;
  mode?: InterviewDisplayMode | null;
  dateRange?: [string, string];
  jobId?: string | null;
  recruiterId?: string | null;
  /** Filter by interview mode (ai_voice, ai_chat, human_video, etc.) */
  interviewMode?: InterviewDisplayMode | null;
  /** Filter by billing mode */
  billingMode?: string | null;
  /** Filter by proctoring enabled/disabled */
  proctoringEnabled?: boolean | null;
}

export type SortDirection = 'asc' | 'desc';

/**
 * Backward-compatible type aliases.
 * These were removed/renamed but are still referenced by consumers.
 */
export type InterviewType = InterviewDisplayMode;
export type InterviewStatus = InterviewDisplayStatus;
export type InterviewItem = InterviewFilter;

export interface BhInterviewCenterProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhInterviewCenterPreset;

  /** Interview items to display - accepts DBInterview[] directly from @rottay/recruiter */
  interviews?: DBInterview[];

  /** Summary statistics */
  stats?: InterviewStats;

  /** Active filters */
  filters?: InterviewFilter;

  /** Callback when filters change */
  onFilterChange?: (filters: InterviewFilter) => void;

  /** Currently selected interview */
  selectedInterview?: string | null;

  /** Callback when an interview is selected */
  onInterviewSelect?: (interviewId: string | null) => void;

  /** Callback when schedule new button is clicked */
  onScheduleNew?: () => void;

  /** Current calendar view mode */
  calendarView?: CalendarView;

  /** Callback when calendar view changes */
  onCalendarViewChange?: (view: CalendarView) => void;

  /** Current sort field */
  sortBy?: string;

  /** Current sort direction */
  sortDirection?: SortDirection;

  /** Callback when sort changes */
  onSortChange?: (field: string, direction: SortDirection) => void;

  /** Date range for display */
  dateRange?: [string, string];

  /** Callback when date range changes */
  onDateRangeChange?: (range: [string, string]) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_INTERVIEW_CENTER_DEFAULTS: Partial<BhInterviewCenterProps> = {
  preset: 'calendar',
  calendarView: 'week',
  sortBy: 'scheduledAt',
  sortDirection: 'asc',
};

// ---------------------------------------------------------------------------
// Helpers for deriving display values from DBInterview
// ---------------------------------------------------------------------------

/** Whether an interview is AI-based (ai_voice or ai_chat) */
export function isAiInterview(interview: DBInterview): boolean {
  return interview.interviewMode === 'ai_voice' || interview.interviewMode === 'ai_chat';
}

/** Human-readable label for interview mode */
export function getInterviewModeLabel(mode: string | null | undefined): string {
  const labels: Record<string, string> = {
    ai_voice: 'AI Voice',
    ai_chat: 'AI Chat',
    human_video: 'Video',
    human_phone: 'Phone',
    in_person: 'In Person',
  };
  return labels[mode ?? ''] ?? 'Unknown';
}

/** Human-readable label for interview status */
export function getInterviewStatusLabel(status: string | null | undefined): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    scheduled: 'Scheduled',
    invitation_sent: 'Invitation Sent',
    ready: 'Ready',
    in_progress: 'In Progress',
    completed: 'Completed',
    scored: 'Scored',
    approved: 'Approved',
    cancelled: 'Cancelled',
    expired: 'Expired',
    no_show: 'No Show',
    technical_issue: 'Technical Issue',
    candidate_declined: 'Declined',
  };
  return labels[status ?? ''] ?? 'Unknown';
}

/** Get the effective date string from a DBInterview (scheduledAt or createdAt) */
export function getInterviewDateStr(interview: DBInterview): string {
  const raw = interview.scheduledAt ?? interview.createdAt;
  if (!raw) return new Date(0).toISOString();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

/** Get the effective duration in minutes */
export function getInterviewDuration(interview: DBInterview): number {
  return interview.actualDurationMinutes ?? interview.scheduledDurationMinutes ?? 30;
}

/** Get score as a number, or undefined */
export function getInterviewScore(interview: DBInterview): number | undefined {
  if (interview.score == null) return undefined;
  return Number(interview.score);
}
