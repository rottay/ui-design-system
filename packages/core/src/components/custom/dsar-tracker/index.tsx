/**
 * DsarTracker - Main Export
 * Automatically selects preset based on props
 */

import type { DsarTrackerProps } from './core';
import { DSAR_TRACKER_DEFAULTS } from './core';
import { DSAR_TRACKER_PRESETS } from './presets';

export { type DsarTrackerProps, type DsarTrackerPreset, type DsarRequest, type DsarStatus, type DsarType, type DsarMetrics, DSAR_TRACKER_DEFAULTS } from './core';
export { getDsarStatusColors, getDsarTypeLabel, getPriorityColors, getDaysRemaining } from './core';
export * from './presets';

/**
 * DsarTracker component
 * Renders the appropriate preset based on the preset prop
 */
export function DsarTracker(props: DsarTrackerProps): React.ReactElement {
  const preset = props.preset ?? DSAR_TRACKER_DEFAULTS.preset ?? 'board';
  const PresetComponent = DSAR_TRACKER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

DsarTracker.displayName = 'DsarTracker';

export { BoardDsarTracker, TableDsarTracker, DetailDsarTracker } from './presets';
