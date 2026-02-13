/**
 * BhPipelineBottleneck - Main Export
 * Stage bottleneck indicator showing where candidates are
 * getting stuck in the pipeline for BitHire ATS platform
 */

import type { BhPipelineBottleneckProps } from './core';
import { BH_PIPELINE_BOTTLENECK_DEFAULTS } from './core';
import { BH_PIPELINE_BOTTLENECK_PRESETS } from './presets';

export {
  type BhPipelineBottleneckProps,
  type BhPipelineBottleneckPreset,
  type BottleneckStage,
  BH_PIPELINE_BOTTLENECK_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhPipelineBottleneck component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPipelineBottleneck(props: BhPipelineBottleneckProps): React.ReactElement {
  const preset = props.preset ?? BH_PIPELINE_BOTTLENECK_DEFAULTS.preset ?? 'visual';
  const PresetComponent = BH_PIPELINE_BOTTLENECK_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPipelineBottleneck.displayName = 'BhPipelineBottleneck';

export { VisualBhPipelineBottleneck, ListBhPipelineBottleneck } from './presets';
