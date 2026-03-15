/**
 * W3TvlTracker - Main Export
 * Track Total Value Locked across protocols with historical trends and breakdowns
 */

import type { W3TvlTrackerProps } from './core';
import { W3_TVL_TRACKER_DEFAULTS } from './core';
import { W3_TVL_TRACKER_PRESETS } from './presets';

export { type W3TvlTrackerProps, type W3TvlTrackerPreset, W3_TVL_TRACKER_DEFAULTS } from './core';
export * from './presets';

export function W3TvlTracker(props: W3TvlTrackerProps): React.ReactElement {
  const preset = props.preset ?? W3_TVL_TRACKER_DEFAULTS.preset ?? 'chart';
  const PresetComponent = W3_TVL_TRACKER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3TvlTracker.displayName = 'W3TvlTracker';
