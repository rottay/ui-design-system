/**
 * BhScoringInsights - All Presets
 */

import type { BhScoringInsightsPreset, BhScoringInsightsProps } from '../core';
import type { ComponentType } from 'react';
import { DashboardBhScoringInsights } from './dashboard';
import { DetailedBhScoringInsights } from './detailed';

export { DashboardBhScoringInsights } from './dashboard';
export { DetailedBhScoringInsights } from './detailed';

export const BH_SCORING_INSIGHTS_PRESETS: Record<BhScoringInsightsPreset, ComponentType<BhScoringInsightsProps>> = {
  dashboard: DashboardBhScoringInsights,
  detailed: DetailedBhScoringInsights,
};
