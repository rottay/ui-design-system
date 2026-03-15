/**
 * BarRecipeEditor - Core Interface
 * Recipe/cocktail builder with ingredients, costs, margins
 * Tables: bar_recipes, bar_recipe_ingredients
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarRecipeEditorPreset = 'detailed' | 'compact';

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  description?: string;
  ingredients: RecipeIngredient[];
  totalCost: number;
  sellingPrice: number;
  margin: number;
  preparationTime: number;
  instructions?: string[];
  isActive: boolean;
}

export interface BarRecipeEditorProps extends EngineAwareProps {
  preset?: BarRecipeEditorPreset;
  recipes?: Recipe[];
  selectedRecipe?: Recipe;
  onRecipeSelect?: (recipeId: string) => void;
  onRecipeCreate?: () => void;
  onRecipeSave?: (recipe: Recipe) => void;
  onRecipeDelete?: (recipeId: string) => void;
  onAddIngredient?: (recipeId: string) => void;
  onRemoveIngredient?: (recipeId: string, ingredientId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_RECIPE_EDITOR_DEFAULTS: Partial<BarRecipeEditorProps> = {
  preset: 'detailed',
};
