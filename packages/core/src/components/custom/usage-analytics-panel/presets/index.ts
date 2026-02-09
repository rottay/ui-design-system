/**
 * UsageAnalyticsPanel - All Presets
 */

import type { UsageAnalyticsPanelPreset } from '../core';
import { DashboardUsageAnalyticsPanel } from './dashboard';
import { WidgetUsageAnalyticsPanel } from './widget';

export { DashboardUsageAnalyticsPanel } from './dashboard';
export { WidgetUsageAnalyticsPanel } from './widget';

export const USAGE_ANALYTICS_PANEL_PRESETS: Record<UsageAnalyticsPanelPreset, React.ComponentType<any>> = {
  dashboard: DashboardUsageAnalyticsPanel,
  widget: WidgetUsageAnalyticsPanel,
};
