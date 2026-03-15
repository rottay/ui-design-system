/**
 * EvRecipeManager - Main Export
 * Recipe/ingredient management
 * Automatically selects preset based on props
 */

import type { EvRecipeManagerProps } from './core';
import { EV_RECIPE_MANAGER_DEFAULTS } from './core';
import { EV_RECIPE_MANAGER_PRESETS } from './presets';

export {
  type EvRecipeManagerProps,
  type EvRecipeManagerPreset,
  type Recipe as EvRecipeManagerRecipe,
  EV_RECIPE_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvRecipeManager component
 * Renders the appropriate preset based on the preset prop
 */
export function EvRecipeManager(props: EvRecipeManagerProps): React.ReactElement {
  const preset = props.preset ?? EV_RECIPE_MANAGER_DEFAULTS.preset ?? 'editor';
  const PresetComponent = EV_RECIPE_MANAGER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvRecipeManager.displayName = 'EvRecipeManager';

export { EditorEvRecipeManager, CardEvRecipeManager } from './presets';
