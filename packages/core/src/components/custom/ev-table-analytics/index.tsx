/**
 * EvTableAnalytics - Main Export
 * Table analytics with revenue heatmap, turnover, dwell time, and AI recommendations
 */

import type { EvTableAnalyticsProps } from './core';
import { EV_TABLE_ANALYTICS_DEFAULTS } from './core';
import { EV_TABLE_ANALYTICS_PRESETS } from './presets';

export {
  type EvTableAnalyticsProps,
  type EvTableAnalyticsPreset,
  type TableMetric as EvTableAnalyticsTableMetric,
  type TableInsight as EvTableAnalyticsTableInsight,
  EV_TABLE_ANALYTICS_DEFAULTS,
} from './core';
export * from './presets';

export function EvTableAnalytics(props: EvTableAnalyticsProps): React.ReactElement {
  const preset = props.preset ?? EV_TABLE_ANALYTICS_DEFAULTS.preset ?? 'heatmap';
  const PresetComponent = EV_TABLE_ANALYTICS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvTableAnalytics.displayName = 'EvTableAnalytics';

export { HeatmapEvTableAnalytics, InsightsEvTableAnalytics } from './presets';
