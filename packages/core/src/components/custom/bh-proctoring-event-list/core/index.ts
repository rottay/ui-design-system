/**
 * BhProctoringEventList - Core Interface
 * DataTable-style list of proctoring events with severity badges,
 * type icons, candidate names, and review status.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhProctoringEventListPreset = 'table' | 'cards';

export type ProctoringEventType =
  | 'tab_switch'
  | 'copy_paste'
  | 'screen_share'
  | 'unusual_typing'
  | 'browser_focus_lost';

export type ProctoringEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ProctoringEventItem {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  eventType: ProctoringEventType;
  severity: ProctoringEventSeverity;
  timestamp: Date;
  reviewed: boolean;
  dismissed: boolean;
  metadata?: Record<string, unknown>;
}

export interface BhProctoringEventListProps extends EngineAwareProps {
  preset?: BhProctoringEventListPreset;

  /** Array of proctoring events to display */
  events: ProctoringEventItem[];

  /** Callback when an event row/card is clicked */
  onEventClick?: (eventId: string) => void;

  /** Callback to review an event */
  onReviewEvent?: (eventId: string) => void;

  /** Callback to dismiss an event */
  onDismissEvent?: (eventId: string) => void;

  /** Currently selected event */
  selectedEventId?: string | null;

  /** Sort field */
  sortBy?: 'timestamp' | 'severity' | 'type';

  /** Sort order */
  sortOrder?: 'asc' | 'desc';

  /** Callback when sort changes */
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;

  /** Filter by severity levels */
  filterSeverity?: ProctoringEventSeverity[];

  /** Filter by event types */
  filterType?: ProctoringEventType[];

  /** Callback when filters change */
  onFilterChange?: (filters: { severity?: ProctoringEventSeverity[]; type?: ProctoringEventType[] }) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCTORING_EVENT_LIST_DEFAULTS: Partial<BhProctoringEventListProps> = {
  preset: 'table',
  sortBy: 'timestamp',
  sortOrder: 'desc',
};
