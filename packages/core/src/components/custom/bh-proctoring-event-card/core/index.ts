/**
 * BhProctoringEventCard - Core Interface
 * Individual event card showing severity badge, event type icon,
 * candidate info, metadata details, timestamp, and review actions.
 *
 * Uses ProctoringEventSelect from @rottay/scoring as the entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity } from '@rottay/scoring';

export type BhProctoringEventCardPreset = 'default' | 'compact';

/** Backward-compat aliases (old names from pre-migration) */
export type ProctoringEventTypeValue = ProctoringEventType;
export type ProctoringEventSeverityValue = ProctoringEventSeverity;

/** Extended event view combining DB entity with UI display fields */
export interface ProctoringEventCardView {
  /** The DB entity (all fields optional for safety) */
  event?: Partial<ProctoringEventSelect>;
  /** Display name of the candidate (resolved externally) */
  candidateName?: string;
  /** Candidate avatar URL (resolved externally) */
  candidateAvatar?: string;
}

export interface BhProctoringEventCardProps extends EngineAwareProps {
  preset?: BhProctoringEventCardPreset;

  /** The event to display */
  event?: ProctoringEventCardView;

  /** Callback when the review button is clicked */
  onReview?: () => void;

  /** Callback when the dismiss button is clicked */
  onDismiss?: () => void;

  /** Callback when the card is clicked */
  onClick?: () => void;

  /** Whether this card is currently selected */
  selected?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCTORING_EVENT_CARD_DEFAULTS: Partial<BhProctoringEventCardProps> = {
  preset: 'default',
};

/** Re-export DB types for convenience */
export type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity };
