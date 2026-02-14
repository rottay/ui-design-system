/**
 * BhProctoringAlert - Core Interface
 * Fixed/sticky banner or toast for critical proctoring events
 *
 * Uses ProctoringEventSelect from @rottay/scoring as the entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity } from '@rottay/scoring';

export type BhProctoringAlertPreset = 'banner' | 'toast';

/** Backward-compat aliases (old names from pre-migration) */
export type ProctoringEventTypeValue = ProctoringEventType;
export type ProctoringEventSeverityValue = ProctoringEventSeverity;

export type AlertVariant = 'banner' | 'toast';

/** Extended alert event combining DB entity with UI display fields */
export interface ProctoringAlertEvent {
  /** The DB entity (all fields optional for safety) */
  event?: Partial<ProctoringEventSelect>;
  /** Display name of the candidate (resolved externally) */
  candidateName?: string;
  /** Alert summary text (UI-computed) */
  summary?: string;
}

export interface BhProctoringAlertProps extends EngineAwareProps {
  preset?: BhProctoringAlertPreset;

  /** Event triggering the alert */
  event?: ProctoringAlertEvent;

  /** Callback to review the event */
  onReview?: (eventId: string) => void;

  /** Callback to dismiss the event */
  onDismiss?: (eventId: string) => void;

  /** Callback to close the alert */
  onClose?: () => void;

  /** Visual variant */
  variant?: AlertVariant;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCTORING_ALERT_DEFAULTS: Partial<BhProctoringAlertProps> = {
  preset: 'banner',
  variant: 'banner',
};

/** Re-export DB types for convenience */
export type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity };
