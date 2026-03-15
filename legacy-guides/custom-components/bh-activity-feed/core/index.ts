/**
 * BhActivityFeed - Core Interface
 * Activity feed component for BitHire ATS platform.
 * Displays a chronological feed of recruiting activities grouped by date.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhActivityFeedPreset = 'full';

/* -- Activity Action Types -------------------------------------------- */

export type ActivityActionType =
  | 'applied'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer_made'
  | 'offer_accepted'
  | 'offer_declined'
  | 'stage_change'
  | 'note_added'
  | 'feedback_submitted'
  | 'candidate_rejected'
  | 'candidate_hired'
  | 'job_published'
  | 'job_closed';

/* -- Entity Types ----------------------------------------------------- */

export type ActivityEntityType =
  | 'candidate'
  | 'job'
  | 'interview'
  | 'offer'
  | 'position';

/* -- Actor ------------------------------------------------------------ */

export interface ActivityActor {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

/* -- Activity Item ---------------------------------------------------- */

export interface ActivityItem {
  id: string;
  actor: ActivityActor;
  actionType: ActivityActionType;
  entityType: ActivityEntityType;
  entityId: string;
  entityName: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/* -- Stats ------------------------------------------------------------ */

export interface ActivityFeedStats {
  events?: number;
  interviews?: number;
  offers?: number;
  hires?: number;
}

/* -- Filter ----------------------------------------------------------- */

export interface ActivityFeedFilter {
  actionType?: ActivityActionType;
  entityType?: ActivityEntityType;
  actorId?: string;
  dateRange?: [string, string];
}

/* -- Main Props ------------------------------------------------------- */

export interface BhActivityFeedProps extends EngineAwareProps {
  preset?: BhActivityFeedPreset;

  /* data */
  activities?: ActivityItem[];
  stats?: ActivityFeedStats;

  /* state & callbacks */
  filters?: ActivityFeedFilter;
  onFilterChange?: (filters: ActivityFeedFilter) => void;
  selectedActivity?: string | null;
  onActivitySelect?: (activityId: string | null) => void;
  onEntityClick?: (entityType: ActivityEntityType, entityId: string) => void;

  /* layout */
  className?: string;
  style?: CSSProperties;
}

export const BH_ACTIVITY_FEED_DEFAULTS: Partial<BhActivityFeedProps> = {
  preset: 'full',
  activities: [],
};

/* -- Helpers ---------------------------------------------------------- */

export function getActionTypeLabel(actionType: ActivityActionType): string {
  const labels: Record<ActivityActionType, string> = {
    applied: 'applied to',
    interview_scheduled: 'scheduled interview for',
    interview_completed: 'completed interview for',
    offer_made: 'made an offer to',
    offer_accepted: 'accepted offer for',
    offer_declined: 'declined offer for',
    stage_change: 'moved',
    note_added: 'added a note on',
    feedback_submitted: 'submitted feedback for',
    candidate_rejected: 'rejected',
    candidate_hired: 'hired',
    job_published: 'published',
    job_closed: 'closed',
  };
  return labels[actionType] ?? actionType.replace(/_/g, ' ');
}

export function getActionTypeColorKey(actionType: ActivityActionType): string {
  switch (actionType) {
    case 'applied':
    case 'job_published':
      return 'primaryScale';
    case 'interview_scheduled':
    case 'interview_completed':
    case 'feedback_submitted':
      return 'infoScale';
    case 'offer_made':
    case 'offer_accepted':
    case 'candidate_hired':
      return 'successScale';
    case 'offer_declined':
    case 'candidate_rejected':
    case 'job_closed':
      return 'errorScale';
    case 'stage_change':
    case 'note_added':
      return 'warningScale';
    default:
      return 'neutral';
  }
}

export function formatActivityTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function groupActivitiesByDate(activities: ActivityItem[]): { label: string; items: ActivityItem[] }[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;

  const groups: Record<string, ActivityItem[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Earlier: [],
  };

  for (const item of activities) {
    const ts = new Date(item.timestamp).getTime();
    if (ts >= todayStart) {
      groups['Today'].push(item);
    } else if (ts >= yesterdayStart) {
      groups['Yesterday'].push(item);
    } else if (ts >= weekStart) {
      groups['This Week'].push(item);
    } else {
      groups['Earlier'].push(item);
    }
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}
