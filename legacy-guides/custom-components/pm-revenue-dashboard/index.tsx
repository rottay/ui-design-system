/**
 * PmRevenueDashboard - Main Export
 * Track revenue metrics with MRR, ARR, churn, and growth rate dashboards
 */

import type { PmRevenueDashboardProps } from './core';
import { PM_REVENUE_DASHBOARD_DEFAULTS } from './core';
import { PM_REVENUE_DASHBOARD_PRESETS } from './presets';

export { type PmRevenueDashboardProps, type PmRevenueDashboardPreset, PM_REVENUE_DASHBOARD_DEFAULTS } from './core';
export * from './presets';

export function PmRevenueDashboard(props: PmRevenueDashboardProps): React.ReactElement {
  const preset = props.preset ?? PM_REVENUE_DASHBOARD_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = PM_REVENUE_DASHBOARD_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmRevenueDashboard.displayName = 'PmRevenueDashboard';
