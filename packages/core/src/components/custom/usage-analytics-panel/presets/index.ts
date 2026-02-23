/**
 * UsageAnalyticsPanel - All Presets
 */

import type { UsageAnalyticsPanelPreset, UsageAnalyticsPanelProps } from '../core';
import type { ComponentType } from 'react';
import { DashboardUsageAnalyticsPanel } from './dashboard';
import { WidgetUsageAnalyticsPanel } from './widget';

export { DashboardUsageAnalyticsPanel } from './dashboard';
export { WidgetUsageAnalyticsPanel } from './widget';

export const USAGE_ANALYTICS_PANEL_PRESETS: Record<UsageAnalyticsPanelPreset, ComponentType<UsageAnalyticsPanelProps>> = {
  dashboard: DashboardUsageAnalyticsPanel,
  widget: WidgetUsageAnalyticsPanel,
};
