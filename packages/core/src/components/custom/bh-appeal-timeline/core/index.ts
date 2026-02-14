/**
 * BhAppealTimeline - Core Interface
 * Appeal process timeline for BitHire ATS platform
 *
 * Uses AppealSelect from @rottay/scoring for entity context.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { AppealSelect } from '@rottay/scoring';

export type BhAppealTimelinePreset = 'timeline' | 'compact';

export interface AppealTimelineEvent {
  id: string;
  type: 'submitted' | 'assigned' | 'reviewed' | 'decision' | 'notified';
  description?: string;
  date?: Date;
  actor?: string;
}

export interface BhAppealTimelineProps extends EngineAwareProps {
  preset?: BhAppealTimelinePreset;

  /** The appeal DB entity */
  appeal?: Partial<AppealSelect>;

  /** Timeline events */
  events?: AppealTimelineEvent[];

  /** Appeal ID reference */
  appealId?: string;

  /** Candidate name */
  candidateName?: string;

  /** Callback when an event is clicked */
  onEventClick?: (eventId: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_APPEAL_TIMELINE_DEFAULTS: Partial<BhAppealTimelineProps> = {
  preset: 'timeline',
};

/** Re-export DB type for convenience */
export type { AppealSelect };
