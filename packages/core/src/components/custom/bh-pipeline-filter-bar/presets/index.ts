/**
 * BhPipelineFilterBar - All Presets
 */

import type { BhPipelineFilterBarPreset, BhPipelineFilterBarProps } from '../core';
import type { ComponentType } from 'react';
import { HorizontalBhPipelineFilterBar } from './horizontal';
import { DropdownBhPipelineFilterBar } from './dropdown';

export { HorizontalBhPipelineFilterBar } from './horizontal';
export { DropdownBhPipelineFilterBar } from './dropdown';

export const BH_PIPELINE_FILTER_BAR_PRESETS: Record<BhPipelineFilterBarPreset, ComponentType<BhPipelineFilterBarProps>> = {
  'horizontal': HorizontalBhPipelineFilterBar,
  'dropdown': DropdownBhPipelineFilterBar,
};
