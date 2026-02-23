/**
 * BhDeiPipeline - Main Export
 * Dashboard widget for monitoring DEI metrics across the hiring pipeline.
 */

import type { BhDeiPipelineProps } from './core';
import { BH_DEI_PIPELINE_DEFAULTS } from './core';
import { BH_DEI_PIPELINE_PRESETS } from './presets';

export {
  type BhDeiPipelineProps,
  type BhDeiPipelinePreset,
  type DeiPipelineData,
  type DeiStageData,
  type DeiAlert,
  type DeiGoal,
  BH_DEI_PIPELINE_DEFAULTS,
} from './core';
export * from './presets';

export function BhDeiPipeline(props: BhDeiPipelineProps): React.ReactElement {
  const preset = props.preset ?? BH_DEI_PIPELINE_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_DEI_PIPELINE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhDeiPipeline.displayName = 'BhDeiPipeline';

export { CompactBhDeiPipeline } from './presets';
