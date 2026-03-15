'use client';

/**
 * BarRecipeEditor - Detailed Preset
 * Full recipe editor with ingredient list, costs, instructions
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, createProgressBarStyle } from '../../../helpers';
import type { BarRecipeEditorProps, Recipe } from '../../core';

const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r1', name: 'Margarita', category: 'Cocktails', description: 'Classic lime margarita with salt rim',
    ingredients: [
      { id: 'i1', name: 'Tequila', quantity: 60, unit: 'ml', costPerUnit: 0.05, totalCost: 3.00 },
      { id: 'i2', name: 'Lime Juice', quantity: 30, unit: 'ml', costPerUnit: 0.02, totalCost: 0.60 },
      { id: 'i3', name: 'Triple Sec', quantity: 30, unit: 'ml', costPerUnit: 0.03, totalCost: 0.90 },
      { id: 'i4', name: 'Salt', quantity: 2, unit: 'g', costPerUnit: 0.01, totalCost: 0.02 },
    ],
    totalCost: 4.52, sellingPrice: 14.00, margin: 67.7, preparationTime: 3, isActive: true,
    instructions: ['Rim glass with salt', 'Shake tequila, lime juice, and triple sec with ice', 'Strain into glass over ice', 'Garnish with lime wheel'],
  },
  {
    id: 'r2', name: 'Old Fashioned', category: 'Cocktails', description: 'Bourbon whiskey cocktail',
    ingredients: [
      { id: 'i5', name: 'Bourbon', quantity: 60, unit: 'ml', costPerUnit: 0.06, totalCost: 3.60 },
      { id: 'i6', name: 'Sugar Syrup', quantity: 10, unit: 'ml', costPerUnit: 0.01, totalCost: 0.10 },
      { id: 'i7', name: 'Angostura Bitters', quantity: 3, unit: 'dash', costPerUnit: 0.10, totalCost: 0.30 },
    ],
    totalCost: 4.00, sellingPrice: 15.00, margin: 73.3, preparationTime: 2, isActive: true,
  },
  {
    id: 'r3', name: 'Mojito', category: 'Cocktails',
    ingredients: [
      { id: 'i8', name: 'White Rum', quantity: 60, unit: 'ml', costPerUnit: 0.04, totalCost: 2.40 },
      { id: 'i9', name: 'Lime Juice', quantity: 30, unit: 'ml', costPerUnit: 0.02, totalCost: 0.60 },
      { id: 'i10', name: 'Mint Leaves', quantity: 10, unit: 'leaves', costPerUnit: 0.05, totalCost: 0.50 },
      { id: 'i11', name: 'Sugar', quantity: 10, unit: 'g', costPerUnit: 0.01, totalCost: 0.10 },
      { id: 'i12', name: 'Soda Water', quantity: 60, unit: 'ml', costPerUnit: 0.01, totalCost: 0.60 },
    ],
    totalCost: 4.20, sellingPrice: 13.00, margin: 67.7, preparationTime: 4, isActive: true,
  },
];

export const DetailedBarRecipeEditor = createPreset<BarRecipeEditorProps>({
  name: 'BarRecipeEditor.Detailed',
  render: ({ primitives, props, tokens }: PresetContext<BarRecipeEditorProps>) => {
    const { Box, Text } = primitives;
    const { recipes: propRecipes, selectedRecipe, onRecipeSelect, onRecipeCreate, onRecipeSave, onAddIngredient, onRemoveIngredient, className, style } = props;

    const recipes = propRecipes && propRecipes.length > 0 ? propRecipes : MOCK_RECIPES;
    const active = selectedRecipe || recipes[0];
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Recipe Editor</Text>
          <button onClick={onRecipeCreate} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>+ New Recipe</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: tokens.spacing[5] }}>
          {/* Recipe List */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            {recipes.map(recipe => (
              <div key={recipe.id} onClick={() => onRecipeSelect?.(recipe.id)} style={{ ...cardBase, padding: tokens.spacing[3], cursor: 'pointer', ...hoverStyle, borderLeft: active?.id === recipe.id ? `3px solid ${tokens.colors.primaryScale[600]}` : '3px solid transparent' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{recipe.name}</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{recipe.category}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600] }}>{recipe.margin.toFixed(0)}% margin</Text>
                </div>
              </div>
            ))}
          </div>

          {/* Recipe Detail */}
          {active && (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
              <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[4] }}>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{active.name}</Text>
                    {active.description && <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block', marginTop: tokens.spacing[1] }}>{active.description}</Text>}
                  </div>
                  <span style={createBadgeStyle(tokens, active.isActive ? 'success' : 'error')}>{active.isActive ? 'Active' : 'Inactive'}</span>
                </div>

                {/* Cost Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
                  {[
                    { label: 'Cost', value: `$${active.totalCost.toFixed(2)}`, color: tokens.colors.neutral[900] },
                    { label: 'Price', value: `$${active.sellingPrice.toFixed(2)}`, color: tokens.colors.primaryScale[600] },
                    { label: 'Margin', value: `${active.margin.toFixed(1)}%`, color: tokens.colors.successScale[600] },
                    { label: 'Prep Time', value: `${active.preparationTime}min`, color: tokens.colors.neutral[700] },
                  ].map((stat, i) => (
                    <div key={i} style={{ textAlign: 'center' as const, padding: tokens.spacing[3], backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.md }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: stat.color, display: 'block' }}>{stat.value}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
                    </div>
                  ))}
                </div>

                {/* Ingredients */}
                <div style={{ marginBottom: tokens.spacing[4] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>Ingredients</Text>
                    <button onClick={() => onAddIngredient?.(active.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: 'none', borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
                        {['Ingredient', 'Qty', 'Unit', 'Cost/Unit', 'Total'].map(h => (
                          <th key={h} style={{ padding: `${tokens.spacing[2]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600] }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {active.ingredients.map(ing => (
                        <tr key={ing.id} style={{ borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                          <td style={{ padding: `${tokens.spacing[2]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{ing.name}</Text></td>
                          <td style={{ padding: `${tokens.spacing[2]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{ing.quantity}</Text></td>
                          <td style={{ padding: `${tokens.spacing[2]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{ing.unit}</Text></td>
                          <td style={{ padding: `${tokens.spacing[2]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>${ing.costPerUnit.toFixed(2)}</Text></td>
                          <td style={{ padding: `${tokens.spacing[2]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>${ing.totalCost.toFixed(2)}</Text></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Instructions */}
                {active.instructions && active.instructions.length > 0 && (
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800], display: 'block', marginBottom: tokens.spacing[2] }}>Instructions</Text>
                    {active.instructions.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                        <div style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, flexShrink: 0 }}>{i + 1}</div>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{step}</Text>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[4] }}>
                  <button onClick={() => onRecipeSave?.(active)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>Save Recipe</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
