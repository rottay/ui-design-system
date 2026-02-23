/**
 * BhOkrTracker - Main Export
 * Dashboard widget for tracking OKR objectives and key results.
 */

import type { BhOkrTrackerProps } from './core';
import { BH_OKR_TRACKER_DEFAULTS } from './core';
import { BH_OKR_TRACKER_PRESETS } from './presets';

export {
  type BhOkrTrackerProps,
  type BhOkrTrackerPreset,
  type OkrTrackerData,
  type OkrObjective,
  type KeyResult,
  BH_OKR_TRACKER_DEFAULTS,
} from './core';
export * from './presets';

export function BhOkrTracker(props: BhOkrTrackerProps): React.ReactElement {
  const preset = props.preset ?? BH_OKR_TRACKER_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_OKR_TRACKER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhOkrTracker.displayName = 'BhOkrTracker';

export { CompactBhOkrTracker } from './presets';
