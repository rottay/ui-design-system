/**
 * UsageAnalyticsPanel - Main Export
 * Automatically selects preset based on props
 */

import type { UsageAnalyticsPanelProps } from './core';
import { USAGE_ANALYTICS_PANEL_DEFAULTS } from './core';
import { USAGE_ANALYTICS_PANEL_PRESETS } from './presets';

export { type UsageAnalyticsPanelProps, type UsageAnalyticsPanelPreset, type UsageMetric, type TimeSeriesPoint, type UsageDataset, USAGE_ANALYTICS_PANEL_DEFAULTS } from './core';
export * from './presets';

/**
 * UsageAnalyticsPanel component
 * Renders the appropriate preset based on the preset prop
 */
export function UsageAnalyticsPanel(props: UsageAnalyticsPanelProps): React.ReactElement {
  const preset = props.preset ?? USAGE_ANALYTICS_PANEL_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = USAGE_ANALYTICS_PANEL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

UsageAnalyticsPanel.displayName = 'UsageAnalyticsPanel';

export { DashboardUsageAnalyticsPanel, WidgetUsageAnalyticsPanel } from './presets';
