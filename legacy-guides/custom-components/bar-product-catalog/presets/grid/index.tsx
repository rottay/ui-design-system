'use client';

/**
 * BarProductCatalog - Grid Preset
 * Visual product grid with cards
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, createFilterPillStyle, getHoverTransform } from '../../../helpers';
import type { BarProductCatalogProps, CatalogProduct } from '../../core';

const MOCK_PRODUCTS: CatalogProduct[] = [
  { id: 'p1', name: 'Margarita', category: 'Cocktails', price: 14.00, cost: 4.50, currency: 'USD', isAvailable: true, stockLevel: 100, description: 'Classic lime margarita' },
  { id: 'p2', name: 'Mojito', category: 'Cocktails', price: 13.00, cost: 4.00, currency: 'USD', isAvailable: true, stockLevel: 80 },
  { id: 'p3', name: 'Old Fashioned', category: 'Cocktails', price: 15.00, cost: 5.00, currency: 'USD', isAvailable: true, stockLevel: 60 },
  { id: 'p4', name: 'Corona Extra', category: 'Beer', price: 7.00, cost: 2.50, currency: 'USD', isAvailable: true, stockLevel: 200 },
  { id: 'p5', name: 'Heineken', category: 'Beer', price: 7.50, cost: 2.80, currency: 'USD', isAvailable: true, stockLevel: 150 },
  { id: 'p6', name: 'Craft IPA', category: 'Beer', price: 9.00, cost: 3.50, currency: 'USD', isAvailable: false, stockLevel: 0 },
  { id: 'p7', name: 'Water Bottle', category: 'Non-Alcoholic', price: 3.00, cost: 0.50, currency: 'USD', isAvailable: true, stockLevel: 500 },
  { id: 'p8', name: 'Nachos', category: 'Food', price: 10.00, cost: 3.00, currency: 'USD', isAvailable: true, stockLevel: 40 },
];

export const GridBarProductCatalog = createPreset<BarProductCatalogProps>({
  name: 'BarProductCatalog.Grid',
  render: ({ primitives, props, tokens }: PresetContext<BarProductCatalogProps>) => {
    const { Box, Text } = primitives;
    const { products: propProducts, onProductSelect, onProductCreate, onToggleAvailability, className, style } = props;

    const products = propProducts && propProducts.length > 0 ? propProducts : MOCK_PRODUCTS;
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);
    const filtered = useMemo(() => products.filter(p => !activeCategory || p.category === activeCategory), [products, activeCategory]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Product Catalog</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{products.length} products across {categories.length} categories</Text>
          </div>
          <button onClick={onProductCreate} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Product</button>
        </div>

        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[4], flexWrap: 'wrap' as const }}>
          <div onClick={() => setActiveCategory(null)} style={createFilterPillStyle(tokens, { active: activeCategory === null })}>All</div>
          {categories.map(cat => (
            <div key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} style={createFilterPillStyle(tokens, { active: activeCategory === cat })}>{cat}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4] }}>
          {filtered.map(product => {
            const margin = ((product.price - product.cost) / product.price * 100).toFixed(0);
            return (
              <div key={product.id} onClick={() => onProductSelect?.(product.id)}
                onMouseEnter={() => setHoveredProduct(product.id)} onMouseLeave={() => setHoveredProduct(null)}
                style={{ ...cardBase, padding: tokens.spacing[4], cursor: 'pointer', ...hoverStyle, ...(hoveredProduct === product.id ? getHoverTransform(tokens) : {}), opacity: product.isAvailable ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                  <span style={createBadgeStyle(tokens, product.isAvailable ? 'success' : 'error')}>{product.isAvailable ? 'Available' : 'Unavailable'}</span>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{product.category}</Text>
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{product.name}</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>${product.price.toFixed(2)}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Cost: ${product.cost.toFixed(2)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600] }}>Margin: {margin}%</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: product.stockLevel < 20 ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>Stock: {product.stockLevel}</Text>
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
