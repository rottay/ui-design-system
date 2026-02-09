/**
 * EvRecipeManager - Core Interface
 * Recipe/ingredient management
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvRecipeManagerPreset = 'editor' | 'card';

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  yield: number;
  yieldUnit: string;
  costPerUnit: number;
  ingredients: Array<{ name: string;
  quantity: number;
  unit: string;
  available: boolean }>;
  instructions: string;
}

export interface EvRecipeManagerProps extends EngineAwareProps {
  preset?: EvRecipeManagerPreset;
  recipes?: Recipe[];
  onRecipeClick?: (id: string) => void;
  onSave?: (recipe: Recipe) => void;
  onDelete?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_RECIPE_MANAGER_DEFAULTS: Partial<EvRecipeManagerProps> = {
  preset: 'editor',

};
