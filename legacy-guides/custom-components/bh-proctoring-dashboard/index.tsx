/**
 * BhProctoringDashboard - Main Export
 * Proctoring event monitoring dashboard for BitHire ATS platform
 */

import type { BhProctoringDashboardProps } from './core';
import { BH_PROCTORING_DASHBOARD_DEFAULTS } from './core';
import { BH_PROCTORING_DASHBOARD_PRESETS } from './presets';

export {
  type BhProctoringDashboardProps,
  type BhProctoringDashboardPreset,
  type ProctoringEventType,
  type ProctoringEventSeverity,
  type ProctoringEventSummary,
  type SeverityCount,
  type EventTypeCount,
  type ProctoringStats,
  BH_PROCTORING_DASHBOARD_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhProctoringDashboard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhProctoringDashboard(props: BhProctoringDashboardProps): React.ReactElement {
  const preset = props.preset ?? BH_PROCTORING_DASHBOARD_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_PROCTORING_DASHBOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProctoringDashboard.displayName = 'BhProctoringDashboard';

export { DashboardBhProctoringDashboard, CompactBhProctoringDashboard } from './presets';
