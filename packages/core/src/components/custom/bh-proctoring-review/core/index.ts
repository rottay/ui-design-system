/**
 * BhProctoringReview - Core Interface
 * Split-view event detail + review form for proctoring events
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhProctoringReviewPreset = 'split' | 'stacked';

export type ProctoringEventType =
  | 'tab_switch'
  | 'copy_paste'
  | 'screen_share'
  | 'unusual_typing'
  | 'browser_focus_lost';

export type ProctoringEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ProctoringEventDetail {
  id: string;
  scorableId: string;
  candidateName: string;
  eventType: ProctoringEventType;
  severity: ProctoringEventSeverity;
  timestamp: Date;
  description: string;
  metadata?: Record<string, unknown>;
  screenshotUrl?: string;
  sessionDuration?: number;
  reviewed: boolean;
  dismissed: boolean;
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
  event: ProctoringEventDetail;

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
