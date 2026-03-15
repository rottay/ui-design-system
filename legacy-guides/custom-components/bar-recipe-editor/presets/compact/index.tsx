'use client';

/**
 * BarRecipeEditor - Compact Preset
 * Compact recipe cards with cost summary
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type { BarRecipeEditorProps, Recipe } from '../../core';

const MOCK_RECIPES: Recipe[] = [
  { id: 'r1', name: 'Margarita', category: 'Cocktails', ingredients: [{ id: 'i1', name: 'Tequila', quantity: 60, unit: 'ml', costPerUnit: 0.05, totalCost: 3.00 }, { id: 'i2', name: 'Lime Juice', quantity: 30, unit: 'ml', costPerUnit: 0.02, totalCost: 0.60 }], totalCost: 4.52, sellingPrice: 14.00, margin: 67.7, preparationTime: 3, isActive: true },
  { id: 'r2', name: 'Old Fashioned', category: 'Cocktails', ingredients: [{ id: 'i3', name: 'Bourbon', quantity: 60, unit: 'ml', costPerUnit: 0.06, totalCost: 3.60 }], totalCost: 4.00, sellingPrice: 15.00, margin: 73.3, preparationTime: 2, isActive: true },
  { id: 'r3', name: 'Mojito', category: 'Cocktails', ingredients: [{ id: 'i4', name: 'White Rum', quantity: 60, unit: 'ml', costPerUnit: 0.04, totalCost: 2.40 }], totalCost: 4.20, sellingPrice: 13.00, margin: 67.7, preparationTime: 4, isActive: true },
];

export const CompactBarRecipeEditor = createPreset<BarRecipeEditorProps>({
  name: 'BarRecipeEditor.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BarRecipeEditorProps>) => {
    const { Box, Text } = primitives;
    const { recipes: propRecipes, onRecipeSelect, className, style } = props;

    const recipes = propRecipes && propRecipes.length > 0 ? propRecipes : MOCK_RECIPES;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Recipes</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
          {recipes.map(recipe => (
            <div key={recipe.id} onClick={() => onRecipeSelect?.(recipe.id)} style={{ ...cardBase, padding: tokens.spacing[4], cursor: 'pointer', ...hoverStyle }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{recipe.name}</Text>
                <span style={createBadgeStyle(tokens, 'success')}>{recipe.margin.toFixed(0)}%</span>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[2] }}>{recipe.ingredients.length} ingredients - {recipe.preparationTime}min</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>Cost: ${recipe.totalCost.toFixed(2)}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>${recipe.sellingPrice.toFixed(2)}</Text>
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
