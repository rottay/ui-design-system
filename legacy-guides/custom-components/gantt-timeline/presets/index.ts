/**
 * GanttTimeline - All Presets
 */

import type { GanttTimelinePreset, GanttTimelineProps } from '../core';
import type { ComponentType } from 'react';
import { StandardGanttTimeline } from './standard';
import { CompactGanttTimeline } from './compact';

export { StandardGanttTimeline } from './standard';
export { CompactGanttTimeline } from './compact';

export const GANTT_TIMELINE_PRESETS: Record<GanttTimelinePreset, ComponentType<GanttTimelineProps>> = {
  standard: StandardGanttTimeline as ComponentType<GanttTimelineProps>,
  compact: CompactGanttTimeline as ComponentType<GanttTimelineProps>,
};
