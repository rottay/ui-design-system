/**
 * BhProctoringActivity - Main Export
 * Activity feed showing proctoring events in chronological order
 */

import type { BhProctoringActivityProps } from './core';
import { BH_PROCTORING_ACTIVITY_DEFAULTS } from './core';
import { BH_PROCTORING_ACTIVITY_PRESETS } from './presets';

export {
  type BhProctoringActivityProps,
  type BhProctoringActivityPreset,
  type ProctoringEventType,
  type ProctoringEventSeverity,
  type ProctoringActivityEvent,
  BH_PROCTORING_ACTIVITY_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhProctoringActivity component
 * Renders the appropriate preset based on the preset prop
 */
export function BhProctoringActivity(props: BhProctoringActivityProps): React.ReactElement {
  const preset = props.preset ?? BH_PROCTORING_ACTIVITY_DEFAULTS.preset ?? 'feed';
  const PresetComponent = BH_PROCTORING_ACTIVITY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProctoringActivity.displayName = 'BhProctoringActivity';

export { FeedBhProctoringActivity, CompactBhProctoringActivity } from './presets';
