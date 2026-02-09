/**
 * EvCheckInMonitor - Main Export
 * Real-time check-in monitoring
 * Automatically selects preset based on props
 */

import type { EvCheckInMonitorProps } from './core';
import { EV_CHECK_IN_MONITOR_DEFAULTS } from './core';
import { EV_CHECK_IN_MONITOR_PRESETS } from './presets';

export {
  type EvCheckInMonitorProps,
  type EvCheckInMonitorPreset,
  type CheckInStat as EvCheckInMonitorCheckInStat,
  type ZoneHeat as EvCheckInMonitorZoneHeat,
  type EntryPoint as EvCheckInMonitorEntryPoint,
  EV_CHECK_IN_MONITOR_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvCheckInMonitor component
 * Renders the appropriate preset based on the preset prop
 */
export function EvCheckInMonitor(props: EvCheckInMonitorProps): React.ReactElement {
  const preset = props.preset ?? EV_CHECK_IN_MONITOR_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = EV_CHECK_IN_MONITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvCheckInMonitor.displayName = 'EvCheckInMonitor';

export { DashboardEvCheckInMonitor, MapEvCheckInMonitor } from './presets';
