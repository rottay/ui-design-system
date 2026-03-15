export { PanelFilterBuilder } from './panel';
export { BarFilterBuilder } from './bar';

import type { FilterBuilderPreset } from '../core';
import type { ComponentType } from 'react';
import type { FilterBuilderProps } from '../core';
import { PanelFilterBuilder } from './panel';
import { BarFilterBuilder } from './bar';

export const FILTER_BUILDER_PRESETS: Record<FilterBuilderPreset, ComponentType<FilterBuilderProps>> = {
  panel: PanelFilterBuilder,
  bar: BarFilterBuilder,
};
