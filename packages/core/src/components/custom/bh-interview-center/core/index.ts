/**
 * BhInterviewCenter - Core Interface
 * Interview Management Hub for the BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhInterviewCenterPreset = 'calendar' | 'list' | 'timeline';

export type InterviewType = 'ai' | 'human';

export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type CalendarView = 'month' | 'week' | 'day';

export interface InterviewItem {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  stageName: string;
  type: InterviewType;
  status: InterviewStatus;
  dateTime: string;
  duration: number;
  score?: number;
  recruiterName?: string;
  agentName?: string;
  location?: string;
}

export interface InterviewStats {
  scheduledToday: number;
  inProgress: number;
  completedToday: number;
  noShows: number;
  avgDuration: number;
  completionRate: number;
  completionTrend: number;
}

export interface InterviewFilter {
  status?: InterviewStatus | null;
  type?: InterviewType | null;
  dateRange?: [string, string];
  jobId?: string | null;
  recruiterId?: string | null;
}

export type SortDirection = 'asc' | 'desc';

export interface BhInterviewCenterProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhInterviewCenterPreset;

  /** Interview items to display */
  interviews: InterviewItem[];

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
  sortBy: 'dateTime',
  sortDirection: 'asc',
};
