/**
 * GanttTimeline - All Presets
 */

import type { GanttTimelinePreset } from '../core';
import { StandardGanttTimeline } from './standard';
import { CompactGanttTimeline } from './compact';

export { StandardGanttTimeline } from './standard';
export { CompactGanttTimeline } from './compact';

export const GANTT_TIMELINE_PRESETS: Record<GanttTimelinePreset, React.ComponentType<any>> = {
  standard: StandardGanttTimeline,
  compact: CompactGanttTimeline,
};
