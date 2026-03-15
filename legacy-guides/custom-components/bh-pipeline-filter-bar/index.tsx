/**
 * BhPipelineFilterBar - Main Export
 * Pipeline filter bar with filters for job, recruiter, date range,
 * priority, source, and saved presets for BitHire ATS platform
 */

import type { BhPipelineFilterBarProps } from './core';
import { BH_PIPELINE_FILTER_BAR_DEFAULTS } from './core';
import { BH_PIPELINE_FILTER_BAR_PRESETS } from './presets';

export {
  type BhPipelineFilterBarProps,
  type BhPipelineFilterBarPreset,
  type FilterType,
  type FilterPriority,
  type FilterConfig,
  type FilterOption,
  type ActiveFilter,
  type SavedPreset,
  BH_PIPELINE_FILTER_BAR_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhPipelineFilterBar component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPipelineFilterBar(props: BhPipelineFilterBarProps): React.ReactElement {
  const preset = props.preset ?? BH_PIPELINE_FILTER_BAR_DEFAULTS.preset ?? 'horizontal';
  const PresetComponent = BH_PIPELINE_FILTER_BAR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPipelineFilterBar.displayName = 'BhPipelineFilterBar';

export { HorizontalBhPipelineFilterBar, DropdownBhPipelineFilterBar } from './presets';
