/**
 * SystemHealthDashboard - Main Export
 * Automatically selects preset based on props
 */

import type { SystemHealthDashboardProps } from './core';
import { SYSTEM_HEALTH_DASHBOARD_DEFAULTS } from './core';
import { SYSTEM_HEALTH_DASHBOARD_PRESETS } from './presets';

export { type SystemHealthDashboardProps, type SystemHealthDashboardPreset, type ServiceHealth, type ServiceStatus, type HealthMetric, SYSTEM_HEALTH_DASHBOARD_DEFAULTS } from './core';
export * from './presets';

/**
 * SystemHealthDashboard component
 * Renders the appropriate preset based on the preset prop
 */
export function SystemHealthDashboard(props: SystemHealthDashboardProps): React.ReactElement {
  const preset = props.preset ?? SYSTEM_HEALTH_DASHBOARD_DEFAULTS.preset ?? 'status-page';
  const PresetComponent = SYSTEM_HEALTH_DASHBOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

SystemHealthDashboard.displayName = 'SystemHealthDashboard';

export { StatusPageSystemHealthDashboard, OpsDashboardSystemHealthDashboard, CompactSystemHealthDashboard } from './presets';
