/**
 * BarRecipeEditor - All Presets
 */

export { DetailedBarRecipeEditor } from './detailed';
export { CompactBarRecipeEditor } from './compact';

import type { BarRecipeEditorPreset } from '../core';
import type { ComponentType } from 'react';
import type { BarRecipeEditorProps } from '../core';
import { DetailedBarRecipeEditor } from './detailed';
import { CompactBarRecipeEditor } from './compact';

export const BAR_RECIPE_EDITOR_PRESETS: Record<BarRecipeEditorPreset, ComponentType<BarRecipeEditorProps>> = {
  detailed: DetailedBarRecipeEditor,
  compact: CompactBarRecipeEditor,
};
