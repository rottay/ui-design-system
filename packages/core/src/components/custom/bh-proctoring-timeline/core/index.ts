/**
 * BhProctoringTimeline - Core Interface
 * Timeline visualization of proctoring events showing colored dots
 * positioned along a time axis with zoom controls and event tooltips.
 *
 * Uses ProctoringEventSelect from @rottay/scoring as the entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity } from '@rottay/scoring';

export type BhProctoringTimelinePreset = 'horizontal' | 'vertical';

/** Backward-compat aliases (old names from pre-migration) */
export type ProctoringEventTypeValue = ProctoringEventType;
export type ProctoringEventSeverityValue = ProctoringEventSeverity;

/** Extended timeline event combining DB entity with UI display fields */
export interface TimelineEventView {
  /** The DB entity (all fields optional for safety) */
  event?: Partial<ProctoringEventSelect>;
  /** Display name of the candidate (resolved externally) */
  candidateName?: string;
  /** Optional label for the timeline dot */
  label?: string;
}

export interface BhProctoringTimelineProps extends EngineAwareProps {
  preset?: BhProctoringTimelinePreset;

  /** Events to plot on the timeline */
  events?: TimelineEventView[];

  /** Timeline start time */
  startTime?: Date;

  /** Timeline end time */
  endTime?: Date;

  /** Callback when an event dot is clicked */
  onEventClick?: (eventId: string) => void;

  /** Currently selected event */
  selectedEventId?: string | null;

  /** Zoom level (1 = default, higher = more zoomed in) */
  zoomLevel?: number;

  /** Callback when zoom changes */
  onZoomChange?: (level: number) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCTORING_TIMELINE_DEFAULTS: Partial<BhProctoringTimelineProps> = {
  preset: 'horizontal',
  zoomLevel: 1,
};

/** Re-export DB types for convenience */
export type { ProctoringEventSelect, ProctoringEventType, ProctoringEventSeverity };
