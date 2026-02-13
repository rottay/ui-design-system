/**
 * BhAppealTimeline - Main Export
 * Appeal process timeline for BitHire ATS platform
 */

import type { BhAppealTimelineProps } from './core';
import { BH_APPEAL_TIMELINE_DEFAULTS } from './core';
import { BH_APPEAL_TIMELINE_PRESETS } from './presets';

export {
  type BhAppealTimelineProps,
  type BhAppealTimelinePreset,
  type AppealTimelineEvent,
  BH_APPEAL_TIMELINE_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhAppealTimeline component
 * Renders the appropriate preset based on the preset prop
 */
export function BhAppealTimeline(props: BhAppealTimelineProps): React.ReactElement {
  const preset = props.preset ?? BH_APPEAL_TIMELINE_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = BH_APPEAL_TIMELINE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAppealTimeline.displayName = 'BhAppealTimeline';

export { TimelineBhAppealTimeline, CompactBhAppealTimeline } from './presets';
