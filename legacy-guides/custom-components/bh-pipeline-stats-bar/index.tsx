/**
 * BhPipelineStatsBar - Main Export
 * Pipeline conversion stats bar showing conversion rates,
 * avg time-to-hire, bottleneck indicator for BitHire ATS platform
 */

import type { BhPipelineStatsBarProps } from './core';
import { BH_PIPELINE_STATS_BAR_DEFAULTS } from './core';
import { BH_PIPELINE_STATS_BAR_PRESETS } from './presets';

export {
  type BhPipelineStatsBarProps,
  type BhPipelineStatsBarPreset,
  type TrendDirection,
  type StageConversion,
  type TimeToHireMetric,
  BH_PIPELINE_STATS_BAR_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhPipelineStatsBar component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPipelineStatsBar(props: BhPipelineStatsBarProps): React.ReactElement {
  const preset = props.preset ?? BH_PIPELINE_STATS_BAR_DEFAULTS.preset ?? 'detailed';
  const PresetComponent = BH_PIPELINE_STATS_BAR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPipelineStatsBar.displayName = 'BhPipelineStatsBar';

export { DetailedBhPipelineStatsBar, CompactBhPipelineStatsBar } from './presets';
