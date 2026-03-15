/**
 * BhPipelineAnalytics - Main Export
 * Funnel visualization of application pipeline with conversion rates,
 * time-in-stage metrics, and bottleneck detection.
 */

import type { BhPipelineAnalyticsProps } from './core';
import { BH_PIPELINE_ANALYTICS_DEFAULTS } from './core';
import { BH_PIPELINE_ANALYTICS_PRESETS } from './presets';

export {
  type BhPipelineAnalyticsProps,
  type BhPipelineAnalyticsPreset,
  type PipelineStageStatus,
  type PipelineStage,
  type PipelineBottleneck,
  type PipelineSummary,
  BH_PIPELINE_ANALYTICS_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhPipelineAnalytics component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPipelineAnalytics(props: BhPipelineAnalyticsProps): React.ReactElement {
  const preset = props.preset ?? BH_PIPELINE_ANALYTICS_DEFAULTS.preset ?? 'overview';
  const PresetComponent = BH_PIPELINE_ANALYTICS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPipelineAnalytics.displayName = 'BhPipelineAnalytics';

export { OverviewBhPipelineAnalytics, DetailedBhPipelineAnalytics } from './presets';
