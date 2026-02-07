/**
 * GanttTimeline - Main Export
 * Automatically selects preset based on props
 */

import type { GanttTimelineProps } from './core';
import { GANTT_TIMELINE_DEFAULTS } from './core';
import { GANTT_TIMELINE_PRESETS } from './presets';

export {
  type GanttTimelineProps,
  type GanttTimelinePreset,
  type TimeScale,
  type GanttTaskStatus,
  type GanttTaskPriority,
  type DependencyType,
  type DateRange,
  type GanttTask,
  type GanttDependency,
  type GanttFilter,
  type GanttToolbarAction,
  type GanttTaskNode,
  type TimeColumn,
  type TimeScaleConfig,
  GANTT_TIMELINE_DEFAULTS,
  getTaskStatusColors,
  getTodayMarkerColors,
  getTimeScaleConfig,
  getTimeScaleOptions,
  calculateBarPosition,
  computeAutoRange,
  generateTimeColumns,
  getTodayPosition,
  isToday,
  buildTaskTree,
  flattenTaskTree,
  calculateDependencyPath,
} from './core';
export * from './presets';

/**
 * GanttTimeline component
 * Renders the appropriate preset based on the preset prop
 */
export function GanttTimeline(props: GanttTimelineProps): React.ReactElement {
  const preset = props.preset ?? GANTT_TIMELINE_DEFAULTS.preset ?? 'standard';
  const PresetComponent = GANTT_TIMELINE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

GanttTimeline.displayName = 'GanttTimeline';

export { StandardGanttTimeline, CompactGanttTimeline } from './presets';
