/**
 * BhInterviewMonitor - Main Export
 * Real-Time Interview Dashboard for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhInterviewMonitorProps } from './core';
import { BH_INTERVIEW_MONITOR_DEFAULTS } from './core';
import { BH_INTERVIEW_MONITOR_PRESETS } from './presets';

export {
  type BhInterviewMonitorProps,
  type BhInterviewMonitorPreset,
  type RecruiterInterview,
  type ActiveSession,
  type ProviderStatus,
  type MonitorAlert,
  type MetricsDataPoint,
  type RecentCompletion,
  BH_INTERVIEW_MONITOR_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhInterviewMonitor component
 * Renders the appropriate preset based on the preset prop
 */
export function BhInterviewMonitor(props: BhInterviewMonitorProps): React.ReactElement {
  const preset = props.preset ?? BH_INTERVIEW_MONITOR_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_INTERVIEW_MONITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhInterviewMonitor.displayName = 'BhInterviewMonitor';

export { StandardBhInterviewMonitor } from './presets';
