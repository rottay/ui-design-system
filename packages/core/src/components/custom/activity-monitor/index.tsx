/**
 * ActivityMonitor - Main Export
 * Automatically selects preset based on props
 */

import type { ActivityMonitorProps } from './core';
import { ACTIVITY_MONITOR_DEFAULTS } from './core';
import { ACTIVITY_MONITOR_PRESETS } from './presets';

export { type ActivityMonitorProps, type ActivityMonitorPreset, type LogEntry, type LogDetail, type LogStatus, type Evaluation, type TimelineDataPoint, type TimeRange, type DetailTab, ACTIVITY_MONITOR_DEFAULTS } from './core';
export * from './presets';

/**
 * ActivityMonitor component
 * Renders the appropriate preset based on the preset prop
 */
export function ActivityMonitor(props: ActivityMonitorProps): React.ReactElement {
  const preset = props.preset ?? ACTIVITY_MONITOR_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = ACTIVITY_MONITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

ActivityMonitor.displayName = 'ActivityMonitor';

export { DashboardActivityMonitor, CompactActivityMonitor } from './presets';
