/**
 * BhPipelineComparison - Main Export
 * Side-by-side pipeline comparison for two jobs
 * in the BitHire ATS platform
 */

import type { BhPipelineComparisonProps } from './core';
import { BH_PIPELINE_COMPARISON_DEFAULTS } from './core';
import { BH_PIPELINE_COMPARISON_PRESETS } from './presets';

export {
  type BhPipelineComparisonProps,
  type BhPipelineComparisonPreset,
  type ComparisonStage,
  type ComparisonJob,
  BH_PIPELINE_COMPARISON_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhPipelineComparison component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPipelineComparison(props: BhPipelineComparisonProps): React.ReactElement {
  const preset = props.preset ?? BH_PIPELINE_COMPARISON_DEFAULTS.preset ?? 'side-by-side';
  const PresetComponent = BH_PIPELINE_COMPARISON_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPipelineComparison.displayName = 'BhPipelineComparison';

export { SideBySideBhPipelineComparison, OverlayBhPipelineComparison } from './presets';
