/**
 * EvRecipeManager - All Presets
 */

export { EditorEvRecipeManager } from './editor';
export { CardEvRecipeManager } from './card';

import type { EvRecipeManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvRecipeManagerProps } from '../core';
import { EditorEvRecipeManager } from './editor';
import { CardEvRecipeManager } from './card';

export const EV_RECIPE_MANAGER_PRESETS: Record<EvRecipeManagerPreset, ComponentType<EvRecipeManagerProps>> = {
  editor: EditorEvRecipeManager,
  card: CardEvRecipeManager,
};
