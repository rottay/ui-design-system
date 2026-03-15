/**
 * W3AnalyticsDashboard - Main Export
 * Comprehensive Web3 analytics with transaction volume, gas usage, and wallet metrics
 */

import type { W3AnalyticsDashboardProps } from './core';
import { W3_ANALYTICS_DASHBOARD_DEFAULTS } from './core';
import { W3_ANALYTICS_DASHBOARD_PRESETS } from './presets';

export { type W3AnalyticsDashboardProps, type W3AnalyticsDashboardPreset, W3_ANALYTICS_DASHBOARD_DEFAULTS } from './core';
export * from './presets';

export function W3AnalyticsDashboard(props: W3AnalyticsDashboardProps): React.ReactElement {
  const preset = props.preset ?? W3_ANALYTICS_DASHBOARD_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = W3_ANALYTICS_DASHBOARD_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3AnalyticsDashboard.displayName = 'W3AnalyticsDashboard';
