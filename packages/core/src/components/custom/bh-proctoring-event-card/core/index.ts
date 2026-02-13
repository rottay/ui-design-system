/**
 * BhProctoringEventCard - Core Interface
 * Individual event card showing severity badge, event type icon,
 * candidate info, metadata details, timestamp, and review actions.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhProctoringEventCardPreset = 'default' | 'compact';

export type ProctoringEventType =
  | 'tab_switch'
  | 'copy_paste'
  | 'screen_share'
  | 'unusual_typing'
  | 'browser_focus_lost';

export type ProctoringEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ProctoringEventMetadata {
  /** Number of tab switches detected */
  tabSwitchCount?: number;
  /** Length of pasted text in characters */
  pastedTextLength?: number;
  /** Duration the browser lost focus (in seconds) */
  focusLostDuration?: number;
  /** Screen share detected to external app */
  screenShareTarget?: string;
  /** Typing speed anomaly (words per minute) */
  typingSpeedWpm?: number;
  /** IP address at time of event */
  ipAddress?: string;
  /** Browser user agent */
  userAgent?: string;
  /** Additional context notes */
  notes?: string;
}

export interface ProctoringEventDetail {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  eventType: ProctoringEventType;
  severity: ProctoringEventSeverity;
  timestamp: Date;
  metadata: ProctoringEventMetadata;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  dismissed: boolean;
}

export interface BhProctoringEventCardProps extends EngineAwareProps {
  preset?: BhProctoringEventCardPreset;

  /** The event to display */
  event: ProctoringEventDetail;

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
