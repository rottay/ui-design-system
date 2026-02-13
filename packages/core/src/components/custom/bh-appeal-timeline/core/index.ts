/**
 * BhAppealTimeline - Core Interface
 * Appeal process timeline for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhAppealTimelinePreset = 'timeline' | 'compact';

export interface AppealTimelineEvent {
  id: string;
  type: 'submitted' | 'assigned' | 'reviewed' | 'decision' | 'notified';
  description: string;
  date: Date;
  actor: string;
}

export interface BhAppealTimelineProps extends EngineAwareProps {
  preset?: BhAppealTimelinePreset;

  /** Timeline events */
  events: AppealTimelineEvent[];

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
