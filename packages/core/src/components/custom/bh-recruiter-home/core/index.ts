/**
 * BhRecruiterHome - Core Interface
 * Recruiter Main Dashboard for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhRecruiterHomePreset = 'overview' | 'compact';

export interface KpiStat {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'flat';
  trendValue: number;
  icon?: ReactNode;
  sparklineData?: number[];
}

export interface PipelineStage {
  name: string;
  count: number;
}

export interface PipelineJob {
  id: string;
  title: string;
  stages: PipelineStage[];
}

export interface UpcomingInterview {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  stageName: string;
  time: Date;
  isAI?: boolean;
}

export interface QuickAction {
  key: string;
  label: string;
  icon: ReactNode;
  description?: string;
  onClick?: () => void;
}

export type ActivityType = 'applied' | 'interview' | 'offer' | 'hired' | 'rejected' | 'note' | 'stage-change';
export type EntityType = 'candidate' | 'job' | 'interview' | 'offer';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  time: Date;
  entityType?: EntityType;
  entityName?: string;
}

export type NotificationType = 'breach' | 'approval' | 'candidate';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  time: Date;
}

export interface AISuggestion {
  id: string;
  action: string;
  confidence: number;
  reason: string;
}

export interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
}

export interface BhRecruiterHomeProps extends EngineAwareProps {
  preset?: BhRecruiterHomePreset;

  /** Recruiter name displayed in the header greeting */
  recruiterName?: string;

  /** KPI statistics shown in the hero ribbon */
  kpiStats?: KpiStat[];

  /** Pipeline jobs with stage counts */
  pipelineJobs?: PipelineJob[];

  /** Upcoming interviews within the next 48 hours */
  upcomingInterviews?: UpcomingInterview[];

  /** Quick action cards */
  quickActions?: QuickAction[];

  /** Recent activity feed items */
  activityFeed?: ActivityItem[];

  /** Notification items (SLA breaches, approvals, new candidates) */
  notifications?: Notification[];

  /** AI-powered next action suggestions */
  aiSuggestions?: AISuggestion[];

  /** Personal performance metrics */
  performanceMetrics?: PerformanceMetric[];

  /** Callback when a quick action is triggered */
  onQuickAction?: (actionKey: string) => void;

  /** Callback when a pipeline job is clicked */
  onPipelineJobClick?: (jobId: string) => void;

  /** Callback when an interview is clicked */
  onInterviewClick?: (interviewId: string) => void;

  /** Callback when a notification is dismissed */
  onNotificationDismiss?: (notificationId: string) => void;

  /** Callback when an AI suggestion is accepted */
  onSuggestionAccept?: (suggestionId: string) => void;

  /** Callback when an AI suggestion is dismissed */
  onSuggestionDismiss?: (suggestionId: string) => void;

  /** Callback when an activity item is clicked */
  onActivityClick?: (activityId: string) => void;

  /** Date range label for the dashboard header */
  dateRangeLabel?: string;

  /** Whether to show the AI suggestions panel */
  showAISuggestions?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_RECRUITER_HOME_DEFAULTS: Partial<BhRecruiterHomeProps> = {
  preset: 'overview',
  recruiterName: 'Recruiter',
  showAISuggestions: true,
  dateRangeLabel: 'Last 30 days',
};
