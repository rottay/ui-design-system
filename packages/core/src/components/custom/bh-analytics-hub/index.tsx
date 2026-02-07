/**
 * BhAnalyticsHub - Main Export
 * Comprehensive Analytics Dashboard for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhAnalyticsHubProps } from './core';
import { BH_ANALYTICS_HUB_DEFAULTS } from './core';
import { BH_ANALYTICS_HUB_PRESETS } from './presets';

export {
  type BhAnalyticsHubProps,
  type BhAnalyticsHubPreset,
  type DateRangePreset,
  type FunnelStage,
  type TimeToHireData,
  type SourceEffectiveness,
  type RecruiterPerformance,
  type CostAnalysis,
  type PipelineVelocity,
  type TrendComparison,
  BH_ANALYTICS_HUB_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhAnalyticsHub component
 * Renders the appropriate preset based on the preset prop
 */
export function BhAnalyticsHub(props: BhAnalyticsHubProps): React.ReactElement {
  const preset = props.preset ?? BH_ANALYTICS_HUB_DEFAULTS.preset ?? 'executive';
  const PresetComponent = BH_ANALYTICS_HUB_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAnalyticsHub.displayName = 'BhAnalyticsHub';

export { ExecutiveBhAnalyticsHub, OperationalBhAnalyticsHub } from './presets';
