/**
 * BhPipelineAnalytics - All Presets
 */

export { OverviewBhPipelineAnalytics } from './overview';
export { DetailedBhPipelineAnalytics } from './detailed';

import type { BhPipelineAnalyticsPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhPipelineAnalyticsProps } from '../core';
import { OverviewBhPipelineAnalytics } from './overview';
import { DetailedBhPipelineAnalytics } from './detailed';

export const BH_PIPELINE_ANALYTICS_PRESETS: Record<BhPipelineAnalyticsPreset, ComponentType<BhPipelineAnalyticsProps>> = {
  overview: OverviewBhPipelineAnalytics,
  detailed: DetailedBhPipelineAnalytics,
};
