/**
 * BhScoringInsights - All Presets
 */

import type { BhScoringInsightsPreset } from '../core';
import { DashboardBhScoringInsights } from './dashboard';
import { DetailedBhScoringInsights } from './detailed';

export { DashboardBhScoringInsights } from './dashboard';
export { DetailedBhScoringInsights } from './detailed';

export const BH_SCORING_INSIGHTS_PRESETS: Record<BhScoringInsightsPreset, React.ComponentType<any>> = {
  dashboard: DashboardBhScoringInsights,
  detailed: DetailedBhScoringInsights,
};
