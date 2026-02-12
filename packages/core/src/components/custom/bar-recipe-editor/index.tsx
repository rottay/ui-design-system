/**
 * BarRecipeEditor - Main Export
 * Recipe/cocktail builder with ingredients, costs, margins
 */

import type { BarRecipeEditorProps } from './core';
import { BAR_RECIPE_EDITOR_DEFAULTS } from './core';
import { BAR_RECIPE_EDITOR_PRESETS } from './presets';

export {
  type BarRecipeEditorProps,
  type BarRecipeEditorPreset,
  type Recipe as BarRecipeEditorRecipe,
  type RecipeIngredient as BarRecipeEditorIngredient,
  BAR_RECIPE_EDITOR_DEFAULTS,
} from './core';
export * from './presets';

export function BarRecipeEditor(props: BarRecipeEditorProps): React.ReactElement {
  const preset = props.preset ?? BAR_RECIPE_EDITOR_DEFAULTS.preset ?? 'detailed';
  const PresetComponent = BAR_RECIPE_EDITOR_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BarRecipeEditor.displayName = 'BarRecipeEditor';

export { DetailedBarRecipeEditor, CompactBarRecipeEditor } from './presets';
