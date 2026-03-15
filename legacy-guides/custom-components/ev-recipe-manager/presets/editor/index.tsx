'use client';

/**
 * EvRecipeManager - Editor Preset
 * Recipe form with ingredient list (name/qty/unit/available badge), instructions, cost calculation,
 * sidebar search, nutrition info, allergen tags, margin calculator
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createPanelHeaderStyle, createHoverStyle, createFilterPillStyle, createProgressBarStyle } from '../../../helpers';
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
    instructions: '1. Muddle mint and lime juice\n2. Add rum and simple syrup\n3. Fill glass with ice\n4. Top with soda water\n5. Garnish with mint sprig',
  },
  {
    id: 'r2', name: 'Margarita', description: 'Classic tequila cocktail with salt rim', yield: 1, yieldUnit: 'glass', costPerUnit: 4.20,
    ingredients: [
      { name: 'Tequila Silver', quantity: 60, unit: 'ml', available: true },
      { name: 'Triple Sec', quantity: 30, unit: 'ml', available: true },
      { name: 'Fresh Lime Juice', quantity: 30, unit: 'ml', available: true },
      { name: 'Salt', quantity: 1, unit: 'pinch', available: true },
    ],
    instructions: '1. Rim glass with salt\n2. Shake tequila, triple sec, lime juice with ice\n3. Strain into glass\n4. Garnish with lime wheel',
  },
  {
    id: 'r3', name: 'Loaded Nachos', description: 'Crispy tortilla chips with cheese and toppings', yield: 2, yieldUnit: 'servings', costPerUnit: 2.80,
    ingredients: [
      { name: 'Tortilla Chips', quantity: 200, unit: 'g', available: true },
      { name: 'Cheddar Cheese', quantity: 100, unit: 'g', available: true },
      { name: 'Jalapenos', quantity: 30, unit: 'g', available: true },
      { name: 'Sour Cream', quantity: 50, unit: 'g', available: false },
      { name: 'Salsa', quantity: 60, unit: 'g', available: true },
    ],
    instructions: '1. Layer chips on baking sheet\n2. Add cheese and jalapenos\n3. Bake at 180C for 8 minutes\n4. Top with sour cream and salsa',
  },
  {
    id: 'r4', name: 'Old Fashioned', description: 'Timeless whiskey cocktail with bitters', yield: 1, yieldUnit: 'glass', costPerUnit: 5.10,
    ingredients: [
      { name: 'Bourbon Whiskey', quantity: 60, unit: 'ml', available: true },
      { name: 'Angostura Bitters', quantity: 3, unit: 'dashes', available: true },
      { name: 'Sugar Cube', quantity: 1, unit: 'pcs', available: true },
      { name: 'Orange Peel', quantity: 1, unit: 'pcs', available: true },
    ],
    instructions: '1. Muddle sugar with bitters and water\n2. Add bourbon and ice\n3. Stir gently\n4. Garnish with orange peel',
  },
  {
    id: 'r5', name: 'Caesar Salad', description: 'Crisp romaine with parmesan dressing', yield: 1, yieldUnit: 'serving', costPerUnit: 3.90,
    ingredients: [
      { name: 'Romaine Lettuce', quantity: 150, unit: 'g', available: true },
      { name: 'Parmesan', quantity: 30, unit: 'g', available: true },
      { name: 'Caesar Dressing', quantity: 40, unit: 'ml', available: false },
      { name: 'Croutons', quantity: 30, unit: 'g', available: true },
      { name: 'Anchovy', quantity: 2, unit: 'pcs', available: true },
    ],
    instructions: '1. Wash and chop romaine\n2. Toss with dressing\n3. Add croutons and parmesan\n4. Top with anchovy fillets',
  },
];

const ALLERGEN_TAGS: Record<string, string[]> = {
  'r1': ['None'],
  'r2': ['None'],
  'r3': ['Dairy', 'Gluten'],
  'r4': ['None'],
  'r5': ['Dairy', 'Gluten', 'Fish'],
};

const SELL_PRICES: Record<string, number> = { 'r1': 12, 'r2': 14, 'r3': 8, 'r4': 16, 'r5': 11 };

export const EditorEvRecipeManager = createPreset<EvRecipeManagerProps>({
  name: 'EvRecipeManager.Editor',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvRecipeManagerProps>) => {
    const { Box, Text } = primitives;
    const { recipes = MOCK, onRecipeClick, onSave, onDelete, className, style } = props;

    const [selectedId, setSelectedId] = useState<string>(recipes[0]?.id || '');
    const [sidebarSearch, setSidebarSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'info'>('ingredients');

    const selected = recipes.find(r => r.id === selectedId) || recipes[0];

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const panelHeader = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredRecipes = useMemo(() => {
      if (!sidebarSearch) return recipes;
      const q = sidebarSearch.toLowerCase();
      return recipes.filter(r => r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q));
    }, [recipes, sidebarSearch]);

    const inputStyle = { width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, fontFamily: 'inherit' };
    const labelStyle = { fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], display: 'block' as const, marginBottom: tokens.spacing[1] };

    const allAvailable = selected ? selected.ingredients.every(i => i.available) : false;
    const unavailableCount = selected ? selected.ingredients.filter(i => !i.available).length : 0;
    const sellPrice = selected ? (SELL_PRICES[selected.id] || selected.costPerUnit * 3) : 0;
    const margin = selected ? ((sellPrice - selected.costPerUnit) / sellPrice * 100) : 0;
    const allergens = selected ? (ALLERGEN_TAGS[selected.id] || ['Unknown']) : [];
    const maxCost = Math.max(...recipes.map(r => r.costPerUnit), 1);

    const totalRecipeCost = useMemo(() => recipes.reduce((s, r) => s + r.costPerUnit, 0), [recipes]);
    const avgCost = recipes.length > 0 ? totalRecipeCost / recipes.length : 0;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Recipe Editor</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{recipes.length} recipes - Avg cost ${avgCost.toFixed(2)}/unit</Text>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: tokens.spacing[5] }}>
          {/* Recipe Sidebar */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
            <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Recipes</Text></div>
            <div style={{ padding: tokens.spacing[2] }}>
              <input type="text" placeholder="Search recipes..." value={sidebarSearch} onChange={(e) => setSidebarSearch(e.target.value)} style={{ ...inputStyle, fontSize: tokens.typography.fontSize.xs }} />
            </div>
            {filteredRecipes.length === 0 ? (
              <div style={{ padding: tokens.spacing[4], textAlign: 'center' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>No recipes found</Text>
              </div>
            ) : (
              filteredRecipes.map((r, idx) => {
                const hasUnavail = r.ingredients.some(i => !i.available);
                const costRatio = r.costPerUnit / maxCost;
                return (
                  <div key={r.id} onClick={() => { setSelectedId(r.id); onRecipeClick?.(r.id); }} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, cursor: 'pointer', backgroundColor: selectedId === r.id ? tokens.colors.primaryScale[50] : 'transparent', borderLeft: selectedId === r.id ? `3px solid ${tokens.colors.primaryScale[500]}` : '3px solid transparent', borderBottom: idx < filteredRecipes.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', ...hoverStyle }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{r.name}</Text>
                      {hasUnavail ? <span style={createBadgeStyle(tokens, 'warning')}>!</span> : <span style={createBadgeStyle(tokens, 'success')}>OK</span>}
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'block', marginBottom: tokens.spacing[1] }}>${r.costPerUnit.toFixed(2)}/{r.yieldUnit} - {r.ingredients.length} ingredients</Text>
                    {(() => { const pb = createProgressBarStyle(tokens, { percent: Math.round(costRatio * 100), color: costRatio > 0.7 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500] }); return <div style={pb.track}><div style={pb.fill} /></div>; })()}
                  </div>
                );
              })
            )}
          </div>

          {/* Editor Area */}
          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5] }}>
              {/* Recipe Header Form */}
              <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
                <div style={{ ...panelHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{selected.name}</Text>
                  <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
                    {allergens.map(a => (
                      <span key={a} style={createBadgeStyle(tokens, a === 'None' ? 'success' : 'warning')}>{a}</span>
                    ))}
                    <span style={allAvailable ? createBadgeStyle(tokens, 'success') : createBadgeStyle(tokens, 'error')}>
                      {allAvailable ? 'All available' : `${unavailableCount} missing`}
                    </span>
                  </div>
                </div>
                <div style={{ padding: tokens.spacing[4] }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                    <div style={{ gridColumn: 'span 2' }}><Text style={labelStyle}>Name</Text><input type="text" defaultValue={selected.name} style={inputStyle} /></div>
                    <div><Text style={labelStyle}>Yield</Text><input type="number" defaultValue={selected.yield} style={inputStyle} /></div>
                    <div><Text style={labelStyle}>Unit</Text><input type="text" defaultValue={selected.yieldUnit} style={inputStyle} /></div>
                  </div>
                  <div><Text style={labelStyle}>Description</Text><input type="text" defaultValue={selected.description} style={inputStyle} /></div>
                </div>
              </div>

              {/* Tab Bar */}
              <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                {(['ingredients', 'instructions', 'info'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...createFilterPillStyle(tokens, { active: activeTab === tab }), cursor: 'pointer', border: 'none', fontFamily: 'inherit', textTransform: 'capitalize' as const }}>{tab}</button>
                ))}
              </div>

              {/* Ingredients Tab */}
              {activeTab === 'ingredients' && (
                <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
                  <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Ingredients ({selected.ingredients.length})</Text></div>
                  {selected.ingredients.map((ing, idx) => (
                    <div key={idx} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: idx < selected.ingredients.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      <div style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: ing.available ? tokens.colors.successScale[100] : tokens.colors.errorScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Text style={{ fontSize: 10, color: ing.available ? tokens.colors.successScale[700] : tokens.colors.errorScale[700] }}>{idx + 1}</Text>
                      </div>
                      <div style={{ flex: 2 }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{ing.name}</Text>
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{ing.quantity}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{ing.unit}</Text>
                      </div>
                      <span style={ing.available ? createBadgeStyle(tokens, 'success') : createBadgeStyle(tokens, 'error')}>
                        {ing.available ? 'In Stock' : 'Out'}
                      </span>
                    </div>
                  ))}
                  <div style={{ padding: tokens.spacing[3], borderTop: `1px solid ${tokens.colors.neutral[100]}`, textAlign: 'center' as const }}>
                    <button style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.common.white, color: tokens.colors.primaryScale[600], border: `1px dashed ${tokens.colors.primaryScale[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Ingredient</button>
                  </div>
                </div>
              )}

              {/* Instructions Tab */}
              {activeTab === 'instructions' && (
                <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
                  <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Instructions</Text></div>
                  <div style={{ padding: tokens.spacing[4] }}>
                    <textarea defaultValue={selected.instructions} rows={8} style={{ ...inputStyle, resize: 'vertical' as const }} />
                    <div style={{ marginTop: tokens.spacing[3], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.infoScale[50], border: `1px solid ${tokens.colors.infoScale[200]}` }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.infoScale[700], display: 'block' }}>
                        {selected.instructions.split('\n').length} steps - Prep time depends on staff experience
                      </Text>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Tab */}
              {activeTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
                  {/* Cost & Margin */}
                  <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
                    <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Cost & Margin</Text></div>
                    <div style={{ padding: tokens.spacing[4] }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
                        <div style={{ textAlign: 'center' as const }}>
                          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.warningScale[600], display: 'block' }}>${selected.costPerUnit.toFixed(2)}</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Cost / {selected.yieldUnit}</Text>
                        </div>
                        <div style={{ textAlign: 'center' as const }}>
                          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], display: 'block' }}>${sellPrice.toFixed(2)}</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Sell Price</Text>
                        </div>
                        <div style={{ textAlign: 'center' as const }}>
                          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: margin > 60 ? tokens.colors.successScale[600] : tokens.colors.warningScale[600], display: 'block' }}>{margin.toFixed(0)}%</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Margin</Text>
                        </div>
                      </div>
                      <div style={{ marginBottom: tokens.spacing[2] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Margin bar</Text>
                        {(() => { const pb = createProgressBarStyle(tokens, { percent: Math.round(margin), color: margin > 60 ? tokens.colors.successScale[500] : tokens.colors.warningScale[500] }); return <div style={pb.track}><div style={pb.fill} /></div>; })()}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px 0`, borderTop: `1px solid ${tokens.colors.neutral[100]}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Batch Cost ({selected.yield} {selected.yieldUnit})</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>${(selected.costPerUnit * selected.yield).toFixed(2)}</Text>
                      </div>
                    </div>
                  </div>

                  {/* Allergens & Tags */}
                  <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
                    <div style={{ ...panelHeader }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Allergens & Tags</Text></div>
                    <div style={{ padding: tokens.spacing[4] }}>
                      <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const, marginBottom: tokens.spacing[3] }}>
                        {allergens.map(a => (
                          <span key={a} style={{ ...createBadgeStyle(tokens, a === 'None' ? 'success' : 'error'), padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px` }}>{a}</span>
                        ))}
                      </div>
                      <div style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50], border: `1px solid ${tokens.colors.neutral[200]}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Category: {selected.ingredients.length > 3 ? 'Cocktail' : 'Food'} | Complexity: {selected.ingredients.length >= 5 ? 'High' : selected.ingredients.length >= 3 ? 'Medium' : 'Low'}</Text>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div style={{ ...cardBase, padding: tokens.spacing[3], display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.successScale[50]})` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  {selected.ingredients.length} ingredients | Cost ${selected.costPerUnit.toFixed(2)} | Margin {margin.toFixed(0)}%
                </Text>
                <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  <button onClick={() => onSave?.(selected)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, cursor: 'pointer', fontFamily: 'inherit' }}>Save Recipe</button>
                  <button onClick={() => onDelete?.(selected.id)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.errorScale[100], color: tokens.colors.errorScale[600], border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
