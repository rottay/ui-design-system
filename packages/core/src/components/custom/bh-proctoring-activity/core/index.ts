/**
 * BhProctoringActivity - Core Interface
 * Activity feed showing proctoring events in chronological order
 *
 * Uses ProctoringEventSelect from @rottay/scoring as the entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity } from '@rottay/scoring';

export type BhProctoringActivityPreset = 'feed' | 'compact';

/** Backward-compat aliases (old names from pre-migration) */
export type ProctoringEventTypeValue = ProctoringEventType;
export type ProctoringEventSeverityValue = ProctoringEventSeverity;

/**
 * UI-friendly proctoring activity event with flat fields.
 * Pre-computed/mapped from DB data by the consuming application.
 */
export interface ProctoringActivityEvent {
  /** Event identifier */
  id: string;
  /** Display name of the candidate (resolved externally) */
  candidateName?: string;
  /** Type of proctoring event */
  eventType?: ProctoringEventType;
  /** Event severity */
  severity?: ProctoringEventSeverity;
  /** When the event occurred */
  timestamp?: Date;
  /** Event description (UI-computed) */
  description?: string;
}

export interface BhProctoringActivityProps extends EngineAwareProps {
  preset?: BhProctoringActivityPreset;

  /** Events to display */
  events?: ProctoringActivityEvent[];

  /** Callback when an event is clicked */
  onEventClick?: (eventId: string) => void;

  /** Maximum items to show */
  maxItems?: number;

  /** Show timestamps */
  showTimestamps?: boolean;

  /** Group events by candidate */
  groupByCandidate?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCTORING_ACTIVITY_DEFAULTS: Partial<BhProctoringActivityProps> = {
  preset: 'feed',
  maxItems: 20,
  showTimestamps: true,
  groupByCandidate: false,
};

/** Re-export DB types for convenience */
export type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity };
