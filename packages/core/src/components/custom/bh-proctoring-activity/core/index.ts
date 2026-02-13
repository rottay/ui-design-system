/**
 * BhProctoringActivity - Core Interface
 * Activity feed showing proctoring events in chronological order
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhProctoringActivityPreset = 'feed' | 'compact';

export type ProctoringEventType =
  | 'tab_switch'
  | 'copy_paste'
  | 'screen_share'
  | 'unusual_typing'
  | 'browser_focus_lost';

export type ProctoringEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ProctoringActivityEvent {
  id: string;
  candidateName: string;
  eventType: ProctoringEventType;
  severity: ProctoringEventSeverity;
  timestamp: Date;
  description: string;
}

export interface BhProctoringActivityProps extends EngineAwareProps {
  preset?: BhProctoringActivityPreset;

  /** Events to display */
  events: ProctoringActivityEvent[];

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
