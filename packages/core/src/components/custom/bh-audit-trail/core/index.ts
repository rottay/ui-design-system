/**
 * BhAuditTrail - Core Interface
 * Activity & Audit Log for BitHire ATS platform
 *
 * DB Reference: DBAuditLog, DBAuditAction, DBActorType from @rottay/recruiter
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { DBAuditLog } from '@rottay/recruiter';
import type { DBAuditLog as DBIaChatAuditLog } from '@rottay/ia-chat';

export type BhAuditTrailPreset = 'timeline' | 'table';

/** Re-export for consumer convenience */
export type { DBAuditLog };

/**
 * Re-export the ia-chat audit log type for AI-specific audit trails.
 * DBAuditLog (recruiter) tracks recruiting entity changes.
 * DBIaChatAuditLog tracks AI provider operations (api_key rotation, config changes, etc.).
 */
export type IaChatAuditLog = DBIaChatAuditLog;

/* -- Entity & Action Types -------------------------------------------- */

export type EntityType =
  | 'candidate'
  | 'job'
  | 'interview'
  | 'offer'
  | 'team'
  | 'settings';

export type ActionType =
  | 'created'
  | 'updated'
  | 'state_change'
  | 'deleted';

/* -- Audit Event ------------------------------------------------------ */

export interface AuditEvent {
  id: string;
  timestamp: string;
  userName: string;
  userAvatar?: string;
  entityType: EntityType;
  actionType: ActionType;
  entityName: string;
  ipAddress?: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  relatedEvents?: string[];
}

/* -- Stats ------------------------------------------------------------ */

export interface AuditStats {
  totalEvents: number;
  eventsToday: number;
  mostActiveUser: string;
  mostChangedEntity: string;
}

/* -- Filter ----------------------------------------------------------- */

export interface AuditFilter {
  entityType?: EntityType;
  userId?: string;
  actionType?: ActionType;
  dateRange?: [string, string];
}

/* -- Main Props ------------------------------------------------------- */

export interface BhAuditTrailProps extends EngineAwareProps {
  preset?: BhAuditTrailPreset;

  /* data */
  events?: AuditEvent[];
  /** AI provider audit logs - accepts DBIaChatAuditLog[] from @rottay/ia-chat */
  aiAuditEvents?: DBIaChatAuditLog[];
  stats?: AuditStats;

  /* state & callbacks */
  filters?: AuditFilter;
  onFilterChange?: (filters: AuditFilter) => void;
  selectedEvent?: string | null;
  onEventSelect?: (eventId: string | null) => void;
  showDetail?: boolean;
  onDetailToggle?: () => void;
  viewMode?: 'timeline' | 'table';
  onViewModeChange?: (mode: 'timeline' | 'table') => void;
  liveMode?: boolean;
  onLiveModeToggle?: () => void;
  exportRange?: [string, string] | null;
  onExport?: (format: 'csv' | 'json') => void;

  /* layout */
  className?: string;
  style?: CSSProperties;
}

export const BH_AUDIT_TRAIL_DEFAULTS: Partial<BhAuditTrailProps> = {
  preset: 'timeline',
  events: [],
  liveMode: false,
  showDetail: false,
};

/* -- Helpers ---------------------------------------------------------- */

export function getEntityTypeColors(tokens: DesignTokens) {
  return {
    candidate: {
      color: tokens.colors.primaryScale[700],
      bg: tokens.colors.primaryScale[50],
      dot: tokens.colors.primaryScale[500],
      border: tokens.colors.primaryScale[200],
    },
    job: {
      color: tokens.colors.secondaryScale[700],
      bg: tokens.colors.secondaryScale[50],
      dot: tokens.colors.secondaryScale[500],
      border: tokens.colors.secondaryScale[200],
    },
    interview: {
      color: tokens.colors.infoScale[700],
      bg: tokens.colors.infoScale[50],
      dot: tokens.colors.infoScale[500],
      border: tokens.colors.infoScale[200],
    },
    offer: {
      color: tokens.colors.successScale[700],
      bg: tokens.colors.successScale[50],
      dot: tokens.colors.successScale[500],
      border: tokens.colors.successScale[200],
    },
    team: {
      color: tokens.colors.warningScale[700],
      bg: tokens.colors.warningScale[50],
      dot: tokens.colors.warningScale[500],
      border: tokens.colors.warningScale[200],
    },
    settings: {
      color: tokens.colors.neutral[700],
      bg: tokens.colors.neutral[50],
      dot: tokens.colors.neutral[500],
      border: tokens.colors.neutral[200],
    },
  };
}

export function getActionTypeColors(tokens: DesignTokens) {
  return {
    created: {
      color: tokens.colors.successScale[700],
      bg: tokens.colors.successScale[100],
    },
    updated: {
      color: tokens.colors.infoScale[700],
      bg: tokens.colors.infoScale[100],
    },
    state_change: {
      color: tokens.colors.warningScale[700],
      bg: tokens.colors.warningScale[100],
    },
    deleted: {
      color: tokens.colors.errorScale[700],
      bg: tokens.colors.errorScale[100],
    },
  };
}

export function formatAuditTimestamp(isoString: string): string {
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
