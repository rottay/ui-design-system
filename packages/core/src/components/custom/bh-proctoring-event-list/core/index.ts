/**
 * BhProctoringEventList - Core Interface
 * DataTable-style list of proctoring events with severity badges,
 * type icons, candidate names, and review status.
 *
 * Uses ProctoringEventSelect from @rottay/scoring as the entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity } from '@rottay/scoring';

export type BhProctoringEventListPreset = 'table' | 'cards';

/** Backward-compat aliases (old names from pre-migration) */
export type ProctoringEventTypeValue = ProctoringEventType;
export type ProctoringEventSeverityValue = ProctoringEventSeverity;

/** Extended event view combining DB entity with UI display fields */
export interface ProctoringEventListItem {
  /** The DB entity (all fields optional for safety) */
  event?: Partial<ProctoringEventSelect>;
  /** Display name of the candidate (resolved externally) */
  candidateName?: string;
  /** Candidate avatar URL (resolved externally) */
  candidateAvatar?: string;
}

export interface BhProctoringEventListProps extends EngineAwareProps {
  preset?: BhProctoringEventListPreset;

  /** Array of proctoring events to display */
  events?: ProctoringEventListItem[];

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

/** Re-export DB types for convenience */
export type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity };
