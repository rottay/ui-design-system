/**
 * EvAnalyticsHub - Main Export
 * Analytics command center
 * Automatically selects preset based on props
 */

import type { EvAnalyticsHubProps } from './core';
import { EV_ANALYTICS_HUB_DEFAULTS } from './core';
import { EV_ANALYTICS_HUB_PRESETS } from './presets';

export {
  type EvAnalyticsHubProps,
  type EvAnalyticsHubPreset,
  type RealtimeMetric as EvAnalyticsHubRealtimeMetric,
  type AnalyticsChart as EvAnalyticsHubAnalyticsChart,
  type PredictionItem as EvAnalyticsHubPredictionItem,
  type BenchmarkEntry as EvAnalyticsHubBenchmarkEntry,
  EV_ANALYTICS_HUB_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvAnalyticsHub component
 * Renders the appropriate preset based on the preset prop
 */
export function EvAnalyticsHub(props: EvAnalyticsHubProps): React.ReactElement {
  const preset = props.preset ?? EV_ANALYTICS_HUB_DEFAULTS.preset ?? 'realtime';
  const PresetComponent = EV_ANALYTICS_HUB_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvAnalyticsHub.displayName = 'EvAnalyticsHub';

export { RealtimeEvAnalyticsHub, HistoricalEvAnalyticsHub } from './presets';
