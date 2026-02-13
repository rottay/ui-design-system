/**
 * BhPipelineFilterBar - All Presets
 */

import type { BhPipelineFilterBarPreset } from '../core';
import { HorizontalBhPipelineFilterBar } from './horizontal';
import { DropdownBhPipelineFilterBar } from './dropdown';

export { HorizontalBhPipelineFilterBar } from './horizontal';
export { DropdownBhPipelineFilterBar } from './dropdown';

export const BH_PIPELINE_FILTER_BAR_PRESETS: Record<BhPipelineFilterBarPreset, React.ComponentType<any>> = {
  'horizontal': HorizontalBhPipelineFilterBar,
  'dropdown': DropdownBhPipelineFilterBar,
};
