/**
 * EvTableAnalytics - All Presets
 */

export { HeatmapEvTableAnalytics } from './heatmap';
export { InsightsEvTableAnalytics } from './insights';

import type { EvTableAnalyticsPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvTableAnalyticsProps } from '../core';
import { HeatmapEvTableAnalytics } from './heatmap';
import { InsightsEvTableAnalytics } from './insights';

export const EV_TABLE_ANALYTICS_PRESETS: Record<EvTableAnalyticsPreset, ComponentType<EvTableAnalyticsProps>> = {
  heatmap: HeatmapEvTableAnalytics,
  insights: InsightsEvTableAnalytics,
};
