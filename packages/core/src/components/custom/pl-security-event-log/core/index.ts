/**
 * PlSecurityEventLog - Core Interface
 * Security event logging and monitoring with timeline and table views
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlSecurityEventLogPreset = 'timeline' | 'table';

export type EventType =
  | 'login_success'
  | 'login_failure'
  | 'password_change'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'role_change'
  | 'permission_change'
  | 'session_revoked'
  | 'account_locked'
  | 'suspicious_activity'
  | 'api_key_created'
  | 'data_export';

export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface EventActor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface EventTarget {
  type: string;
  id: string;
  name: string;
}

export interface SecurityEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  actor: EventActor;
  target?: EventTarget;
  ip: string;
  location: string;
  userAgent: string;
  timestamp: Date;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EventLogStats {
  total: number;
  critical: number;
  warnings: number;
  errors: number;
}

export interface EventLogFilter {
  severity?: EventSeverity | null;
  type?: EventType | null;
  dateRange?: { start: Date; end: Date } | null;
  search?: string;
}

export interface PlSecurityEventLogProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlSecurityEventLogPreset;

  /** Security events to display */
  events: SecurityEvent[];

  /** Statistics for the stats ribbon */
  stats?: EventLogStats;

  /** Active filters */
  filters?: EventLogFilter;

  /** Callback when filters change */
  onFilterChange?: (filters: EventLogFilter) => void;

  /** Callback when an event is clicked */
  onEventClick?: (eventId: string) => void;

  /** Current search query */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;

  /** Text shown when no events found */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_SECURITY_EVENT_LOG_DEFAULTS: Partial<PlSecurityEventLogProps> = {
  preset: 'timeline',
  emptyText: 'No security events found',
};
