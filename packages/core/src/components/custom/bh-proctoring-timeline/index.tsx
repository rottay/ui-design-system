/**
 * BhProctoringTimeline - Main Export
 * Timeline visualization of proctoring events showing colored dots
 * positioned along a time axis with zoom controls and event tooltips.
 */

import type { BhProctoringTimelineProps } from './core';
import { BH_PROCTORING_TIMELINE_DEFAULTS } from './core';
import { BH_PROCTORING_TIMELINE_PRESETS } from './presets';

export {
  type BhProctoringTimelineProps,
  type BhProctoringTimelinePreset,
  type ProctoringEventType,
  type ProctoringEventSeverity,
  type TimelineEvent,
  BH_PROCTORING_TIMELINE_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhProctoringTimeline component
 * Renders the appropriate preset based on the preset prop
 */
export function BhProctoringTimeline(props: BhProctoringTimelineProps): React.ReactElement {
  const preset = props.preset ?? BH_PROCTORING_TIMELINE_DEFAULTS.preset ?? 'horizontal';
  const PresetComponent = BH_PROCTORING_TIMELINE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProctoringTimeline.displayName = 'BhProctoringTimeline';

export { HorizontalBhProctoringTimeline, VerticalBhProctoringTimeline } from './presets';
