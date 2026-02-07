import type { ProgressTrackerProps } from './core';
import { PROGRESS_TRACKER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ProgressTrackerProps, ProgressTrackerPreset, ProgressStage } from './core';
export { PROGRESS_TRACKER_DEFAULTS } from './core';

export function ProgressTracker(props: ProgressTrackerProps): React.ReactElement {
  const preset = props.preset ?? PROGRESS_TRACKER_DEFAULTS.preset ?? 'linear';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

ProgressTracker.displayName = 'ProgressTracker';
