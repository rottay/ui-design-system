'use client';

/**
 * EvRecipeManager - Card Preset
 * Recipe cards grid with yield/cost/ingredients/stock status,
 * search, category filters, KPI stats, hover effects, empty state, summary bar
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createHoverStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvRecipeManagerProps, Recipe } from '../../core';

const MOCK: Recipe[] = [
  {
    id: 'r1', name: 'Classic Mojito', description: 'Fresh Cuban cocktail with white rum and mint', yield: 1, yieldUnit: 'glass', costPerUnit: 3.50,
    ingredients: [
      { name: 'White Rum', quantity: 60, unit: 'ml', available: true },
      { name: 'Fresh Lime Juice', quantity: 30, unit: 'ml', available: true },
      { name: 'Simple Syrup', quantity: 20, unit: 'ml', available: true },
      { name: 'Mint Leaves', quantity: 8, unit: 'pcs', available: false },
      { name: 'Soda Water', quantity: 90, unit: 'ml', available: true },
    ],
    instructions: 'Muddle mint, add rum, syrup, lime, ice, top with soda',
  },
  {
    id: 'r2', name: 'Margarita', description: 'Classic tequila cocktail with salt rim', yield: 1, yieldUnit: 'glass', costPerUnit: 4.20,
    ingredients: [
      { name: 'Tequila Silver', quantity: 60, unit: 'ml', available: true },
      { name: 'Triple Sec', quantity: 30, unit: 'ml', available: true },
      { name: 'Fresh Lime Juice', quantity: 30, unit: 'ml', available: true },
      { name: 'Salt', quantity: 1, unit: 'pinch', available: true },
    ],
    instructions: 'Rim glass with salt, shake all with ice, strain into glass',
  },
  {
    id: 'r3', name: 'Beer Tower', description: 'Craft beer tower service for groups', yield: 6, yieldUnit: 'glasses', costPerUnit: 1.80,
    ingredients: [
      { name: 'Craft IPA', quantity: 3, unit: 'liters', available: true },
      { name: 'Ice', quantity: 500, unit: 'g', available: true },
    ],
    instructions: 'Fill tower with beer, add ice to cooling column, serve with glasses',
  },
  {
    id: 'r4', name: 'Loaded Nachos', description: 'Crispy tortilla chips with cheese and toppings', yield: 2, yieldUnit: 'servings', costPerUnit: 2.80,
    ingredients: [
      { name: 'Tortilla Chips', quantity: 200, unit: 'g', available: true },
      { name: 'Cheddar Cheese', quantity: 100, unit: 'g', available: true },
      { name: 'Jalapenos', quantity: 30, unit: 'g', available: true },
      { name: 'Sour Cream', quantity: 50, unit: 'g', available: false },
      { name: 'Salsa', quantity: 60, unit: 'g', available: true },
    ],
    instructions: 'Layer chips, add cheese and jalapenos, bake 8 min at 180C',
  },
  {
    id: 'r5', name: 'Espresso Martini', description: 'Rich coffee cocktail with vodka and Kahlua', yield: 1, yieldUnit: 'glass', costPerUnit: 4.80,
    ingredients: [
      { name: 'Vodka Premium', quantity: 45, unit: 'ml', available: true },
      { name: 'Kahlua', quantity: 30, unit: 'ml', available: true },
      { name: 'Fresh Espresso', quantity: 30, unit: 'ml', available: true },
      { name: 'Simple Syrup', quantity: 10, unit: 'ml', available: true },
    ],
    instructions: 'Shake all ingredients with ice, double strain into coupe glass',
  },
  {
    id: 'r6', name: 'Chicken Wings', description: 'Crispy buffalo wings with blue cheese dip', yield: 3, yieldUnit: 'servings', costPerUnit: 3.20,
    ingredients: [
      { name: 'Chicken Wings', quantity: 500, unit: 'g', available: true },
      { name: 'Hot Sauce', quantity: 100, unit: 'ml', available: true },
      { name: 'Butter', quantity: 50, unit: 'g', available: true },
      { name: 'Blue Cheese', quantity: 60, unit: 'g', available: false },
      { name: 'Celery Sticks', quantity: 4, unit: 'pcs', available: true },
    ],
    instructions: 'Deep fry wings 12 min, toss in hot sauce butter mix, serve with dip',
  },
];

const YIELD_CATEGORIES = ['glass', 'glasses', 'servings'];

export const CardEvRecipeManager = createPreset<EvRecipeManagerProps>({
  name: 'EvRecipeManager.Card',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvRecipeManagerProps>) => {
    const { Box, Text } = primitives;
    const { recipes = MOCK, onRecipeClick, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const categories = useMemo(() => [...new Set(recipes.map(r => r.yieldUnit))], [recipes]);

    const filtered = useMemo(() => {
      return recipes.filter(r => {
        if (searchTerm && !r.name.toLowerCase().includes(searchTerm.toLowerCase()) && !(r.description || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (categoryFilter && r.yieldUnit !== categoryFilter) return false;
        return true;
      });
    }, [recipes, searchTerm, categoryFilter]);

    const readyCount = recipes.filter(r => r.ingredients.every(i => i.available)).length;
    const missingCount = recipes.length - readyCount;
    const avgCost = recipes.length > 0 ? (recipes.reduce((s, r) => s + r.costPerUnit, 0) / recipes.length) : 0;
    const totalIngredients = recipes.reduce((s, r) => s + r.ingredients.length, 0);
    const unavailableIngredients = recipes.reduce((s, r) => s + r.ingredients.filter(i => !i.available).length, 0);
    const maxCost = Math.max(...recipes.map(r => r.costPerUnit), 1);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Recipe Collection</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filtered.length} of {recipes.length} recipes | {readyCount} ready to make</Text>
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Total Recipes', value: recipes.length.toString(), color: tokens.colors.primaryScale[600] },
            { label: 'Ready', value: readyCount.toString(), color: tokens.colors.successScale[600] },
            { label: 'Missing Stock', value: missingCount.toString(), color: tokens.colors.warningScale[600] },
            { label: 'Avg Cost', value: `$${avgCost.toFixed(2)}`, color: tokens.colors.infoScale[600] },
          ].map(kpi => (
            <div key={kpi.label} style={{ ...cardBase, padding: tokens.spacing[4], borderTop: `3px solid ${kpi.color}`, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: kpi.color, display: 'block' }}>{kpi.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{kpi.label}</Text>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <input type="text" placeholder="Search recipes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              <div onClick={() => setCategoryFilter(null)} style={createFilterPillStyle(tokens, { active: categoryFilter === null })}>All</div>
              {categories.map(cat => (
                <div key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)} style={createFilterPillStyle(tokens, { active: categoryFilter === cat })}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recipe Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {filtered.map(recipe => {
            const allAvailable = recipe.ingredients.every(i => i.available);
            const unavailable = recipe.ingredients.filter(i => !i.available);
            const isHovered = hoveredId === recipe.id;
            const costPct = Math.round((recipe.costPerUnit / maxCost) * 100);
            const costBar = createProgressBarStyle(tokens, { percent: costPct, color: tokens.colors.primaryScale[400] });
            return (
              <div key={recipe.id} onClick={() => onRecipeClick?.(recipe.id)} onMouseEnter={() => setHoveredId(recipe.id)} onMouseLeave={() => setHoveredId(null)} style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, cursor: 'pointer', ...(isHovered ? getHoverTransform(tokens) : {}), transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}>
                {/* Card Header */}
                <div style={{ padding: tokens.spacing[4], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[2] }}>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{recipe.name}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{recipe.description}</Text>
                    </div>
                    <span style={allAvailable ? createBadgeStyle(tokens, 'success') : createBadgeStyle(tokens, 'warning')}>
                      {allAvailable ? 'Ready' : 'Missing'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
                    <div style={{ textAlign: 'center' as const }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], display: 'block' }}>${recipe.costPerUnit.toFixed(2)}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>per {recipe.yieldUnit}</Text>
                    </div>
                    <div style={{ textAlign: 'center' as const }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700], display: 'block' }}>{recipe.yield}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{recipe.yieldUnit}</Text>
                    </div>
                    <div style={{ textAlign: 'center' as const }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.infoScale[600], display: 'block' }}>{recipe.ingredients.length}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>ingredients</Text>
                    </div>
                  </div>
                </div>

                {/* Cost bar */}
                <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Cost (relative)</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>{costPct}%</Text>
                  </div>
                  <div style={costBar.track}><div style={costBar.fill} /></div>
                </div>

                {/* Ingredients */}
                <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px ${tokens.spacing[3]}px` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, marginBottom: tokens.spacing[1], display: 'block', letterSpacing: '0.05em' }}>Ingredients</Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
                    {recipe.ingredients.map((ing, i) => (
                      <span key={i} style={{ ...createBadgeStyle(tokens, ing.available ? 'info' : 'error'), fontSize: 10 }}>
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stock Warning */}
                {unavailable.length > 0 && (
                  <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.warningScale[50], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700] }}>
                      Missing: {unavailable.map(i => i.name).join(', ')}
                    </Text>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCD6'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No recipes match your search</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your filters</Text>
          </div>
        )}

        {/* Summary Bar */}
        <div style={{ ...cardBase, display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Ingredients', value: totalIngredients.toString() },
            { label: 'Unavailable', value: unavailableIngredients.toString() },
            { label: 'Cheapest', value: `$${Math.min(...recipes.map(r => r.costPerUnit)).toFixed(2)}` },
            { label: 'Most Expensive', value: `$${Math.max(...recipes.map(r => r.costPerUnit)).toFixed(2)}` },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
