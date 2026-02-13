/**
 * BhTokenUsageAnalytics - All Presets
 */

export { DetailedBhTokenUsageAnalytics } from './detailed';
export { CompactBhTokenUsageAnalytics } from './compact';

import type { BhTokenUsageAnalyticsPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhTokenUsageAnalyticsProps } from '../core';
import { DetailedBhTokenUsageAnalytics } from './detailed';
import { CompactBhTokenUsageAnalytics } from './compact';

export const BH_TOKEN_USAGE_ANALYTICS_PRESETS: Record<BhTokenUsageAnalyticsPreset, ComponentType<BhTokenUsageAnalyticsProps>> = {
  detailed: DetailedBhTokenUsageAnalytics,
  compact: CompactBhTokenUsageAnalytics,
};
