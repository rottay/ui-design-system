/**
 * BhProctoringReview - Core Interface
 * Split-view event detail + review form for proctoring events
 *
 * Uses ProctoringEventSelect from @rottay/scoring as the entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity } from '@rottay/scoring';

export type BhProctoringReviewPreset = 'split' | 'stacked';

/** Backward-compat aliases (old names from pre-migration) */
export type ProctoringEventTypeValue = ProctoringEventType;
export type ProctoringEventSeverityValue = ProctoringEventSeverity;

/** Extended event view combining DB entity with UI display fields */
export interface ProctoringReviewEventView {
  /** The DB entity (all fields optional for safety) */
  event?: Partial<ProctoringEventSelect>;
  /** Display name of the candidate (resolved externally) */
  candidateName?: string;
  /** Event description (UI-computed) */
  description?: string;
  /** Screenshot URL (resolved externally) */
  screenshotUrl?: string;
  /** Session duration in seconds (UI-computed) */
  sessionDuration?: number;
  /** Previous review notes from the DB entity (pre-filled in form) */
  previousReviewNotes?: string;
  /** Name of the previous reviewer (for display) */
  previousReviewedBy?: string;
  /** When the previous review occurred */
  previousReviewedAt?: Date | string;
  /** Candidate avatar URL (resolved externally) */
  candidateAvatar?: string;
  /** Flat metadata for convenience (alternative to event.metadata) */
  metadata?: Record<string, unknown>;
}

export interface ReviewSubmission {
  eventId: string;
  notes: string;
  severityOverride?: ProctoringEventSeverity;
  action: 'confirm' | 'dismiss';
}

export interface BhProctoringReviewProps extends EngineAwareProps {
  preset?: BhProctoringReviewPreset;

  /** Full event detail to review */
  event?: ProctoringReviewEventView;

  /** Callback when review is submitted */
  onSubmitReview?: (review: ReviewSubmission) => void;

  /** Callback when event is dismissed */
  onDismiss?: (eventId: string) => void;

  /** Callback when severity is overridden */
  onSeverityOverride?: (eventId: string, severity: ProctoringEventSeverity) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCTORING_REVIEW_DEFAULTS: Partial<BhProctoringReviewProps> = {
  preset: 'split',
};

/** Re-export DB types for convenience */
export type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity };
