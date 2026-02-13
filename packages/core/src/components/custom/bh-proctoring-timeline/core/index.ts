/**
 * BhProctoringTimeline - Core Interface
 * Timeline visualization of proctoring events showing colored dots
 * positioned along a time axis with zoom controls and event tooltips.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhProctoringTimelinePreset = 'horizontal' | 'vertical';

export type ProctoringEventType =
  | 'tab_switch'
  | 'copy_paste'
  | 'screen_share'
  | 'unusual_typing'
  | 'browser_focus_lost';

export type ProctoringEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface TimelineEvent {
  id: string;
  eventType: ProctoringEventType;
  severity: ProctoringEventSeverity;
  timestamp: Date;
  candidateName: string;
  label?: string;
}

export interface BhProctoringTimelineProps extends EngineAwareProps {
  preset?: BhProctoringTimelinePreset;

  /** Events to plot on the timeline */
  events: TimelineEvent[];

  /** Timeline start time */
  startTime: Date;

  /** Timeline end time */
  endTime: Date;

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
