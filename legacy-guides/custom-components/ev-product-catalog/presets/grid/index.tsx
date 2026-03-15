'use client';

/**
 * EvProductCatalog - Grid Preset
 * Product card grid with category sidebar, search, stock badges, combo highlights, pricing
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvProductCatalogProps, CatalogProduct, ProductCategory, ComboItem } from '../../core';

const MOCK_PRODUCTS: CatalogProduct[] = [
  { id: 'p1', name: 'Classic Margarita', sku: 'CKT-001', category: 'Cocktails', price: 14.00, currency: 'USD', isAvailable: true, stockLevel: 50, description: 'Tequila, lime, triple sec, salt rim' },
  { id: 'p2', name: 'Mojito', sku: 'CKT-002', category: 'Cocktails', price: 13.00, currency: 'USD', isAvailable: true, stockLevel: 45, description: 'Rum, mint, lime, sugar, soda' },
  { id: 'p3', name: 'Old Fashioned', sku: 'CKT-003', category: 'Cocktails', price: 15.00, currency: 'USD', isAvailable: true, stockLevel: 30 },
  { id: 'p4', name: 'Espresso Martini', sku: 'CKT-004', category: 'Cocktails', price: 16.00, currency: 'USD', isAvailable: true, stockLevel: 25 },
  { id: 'p5', name: 'Corona Extra', sku: 'BER-001', category: 'Beer', price: 7.00, currency: 'USD', isAvailable: true, stockLevel: 120 },
  { id: 'p6', name: 'Heineken', sku: 'BER-002', category: 'Beer', price: 7.50, currency: 'USD', isAvailable: true, stockLevel: 95 },
  { id: 'p7', name: 'Craft IPA', sku: 'BER-003', category: 'Beer', price: 9.00, currency: 'USD', isAvailable: false, stockLevel: 0 },
  { id: 'p8', name: 'Red Bull Vodka', sku: 'SPR-001', category: 'Spirits', price: 12.00, currency: 'USD', isAvailable: true, stockLevel: 60 },
  { id: 'p9', name: 'Water Bottle', sku: 'NAL-001', category: 'Non-Alcoholic', price: 3.00, currency: 'USD', isAvailable: true, stockLevel: 200 },
  { id: 'p10', name: 'Red Bull', sku: 'NAL-002', category: 'Non-Alcoholic', price: 5.00, currency: 'USD', isAvailable: true, stockLevel: 80 },
  { id: 'p11', name: 'Nachos Grande', sku: 'FOD-001', category: 'Food', price: 10.00, currency: 'USD', isAvailable: true, stockLevel: 30 },
  { id: 'p12', name: 'Wings Basket', sku: 'FOD-002', category: 'Food', price: 12.00, currency: 'USD', isAvailable: true, stockLevel: 20 },
];

const MOCK_CATEGORIES: ProductCategory[] = [
  { id: 'cat1', name: 'Cocktails', icon: '\uD83C\uDF78', productCount: 4, isVisible: true },
  { id: 'cat2', name: 'Beer', icon: '\uD83C\uDF7A', productCount: 3, isVisible: true },
  { id: 'cat3', name: 'Spirits', icon: '\uD83E\uDD43', productCount: 1, isVisible: true },
  { id: 'cat4', name: 'Non-Alcoholic', icon: '\uD83E\uDDC3', productCount: 2, isVisible: true },
  { id: 'cat5', name: 'Food', icon: '\uD83C\uDF54', productCount: 2, isVisible: true },
];

const MOCK_COMBOS: ComboItem[] = [
  { id: 'cb1', name: 'Party Starter', products: [{ name: 'Margarita', quantity: 2 }, { name: 'Nachos Grande', quantity: 1 }], comboPrice: 32.00, savings: 6.00 },
  { id: 'cb2', name: 'Beer Night', products: [{ name: 'Corona Extra', quantity: 4 }, { name: 'Wings Basket', quantity: 1 }], comboPrice: 36.00, savings: 4.00 },
  { id: 'cb3', name: 'VIP Package', products: [{ name: 'Espresso Martini', quantity: 4 }, { name: 'Nachos Grande', quantity: 2 }], comboPrice: 78.00, savings: 6.00 },
];

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

export const GridEvProductCatalog = createPreset<EvProductCatalogProps>({
  name: 'EvProductCatalog.Grid',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvProductCatalogProps>) => {
    const { Box, Text } = primitives;
    const { products: propProducts, categories: propCats, combos: propCombos, onProductClick, onCategoryClick, onToggleAvailability, className, style } = props;

    const products = propProducts && propProducts.length > 0 ? propProducts : MOCK_PRODUCTS;
    const categories = propCats && propCats.length > 0 ? propCats : MOCK_CATEGORIES;
    const combos = propCombos && propCombos.length > 0 ? propCombos : MOCK_COMBOS;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredProducts = useMemo(() => {
      return products.filter(p => {
        if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.sku.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (activeCategory && p.category !== activeCategory) return false;
        return true;
      });
    }, [products, searchTerm, activeCategory]);

    const totalRevenuePotential = products.filter(p => p.isAvailable).reduce((s, p) => s + (p.price * p.stockLevel), 0);
    const outOfStock = products.filter(p => !p.isAvailable).length;

    const getStockColor = (level: number) => {
      if (level === 0) return tokens.colors.errorScale[500];
      if (level < 20) return tokens.colors.warningScale[500];
      return tokens.colors.successScale[500];
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {'\uD83D\uDCE6'} Product Catalog
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filteredProducts.length} products - {outOfStock} out of stock
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
            <div style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], display: 'block' }}>{products.filter(p => p.isAvailable).length}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Available</Text>
            </div>
            <div style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], display: 'block' }}>{combos.length}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Combos</Text>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search products or SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
              <div onClick={() => setActiveCategory(null)} style={createFilterPillStyle(tokens, { active: activeCategory === null })}>All</div>
              {categories.map(cat => (
                <div key={cat.id} onClick={() => { setActiveCategory(activeCategory === cat.name ? null : cat.name); onCategoryClick?.(cat.id); }} style={createFilterPillStyle(tokens, { active: activeCategory === cat.name })}>
                  {cat.icon} {cat.name} ({cat.productCount})
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: tokens.spacing[5] }}>
          {/* Product Grid */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4] }}>
              {filteredProducts.map((product, idx) => {
                const isHovered = hoveredProduct === product.id;
                const stockPct = Math.min(100, Math.round((product.stockLevel / 100) * 100));
                const stockBar = createProgressBarStyle(tokens, { percent: stockPct, color: getStockColor(product.stockLevel) });

                return (
                  <div key={product.id} onClick={() => onProductClick?.(product.id)}
                    onMouseEnter={() => setHoveredProduct(product.id)} onMouseLeave={() => setHoveredProduct(null)}
                    style={{ ...cardBase, padding: 0, overflow: 'hidden', cursor: 'pointer', ...hoverStyle, ...(isHovered ? getHoverTransform(tokens) : {}), opacity: product.isAvailable ? 1 : 0.6 }}>
                    {/* Color header */}
                    <div style={{ height: 60, background: GRADIENTS[idx % GRADIENTS.length], position: 'relative' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 28 }}>{categories.find(c => c.name === product.category)?.icon || '\uD83C\uDF79'}</span>
                      <div style={{ position: 'absolute' as const, top: tokens.spacing[1], right: tokens.spacing[1] }}>
                        <span style={createBadgeStyle(tokens, product.isAvailable ? 'success' : 'error')}>
                          {product.isAvailable ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: tokens.spacing[3] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: 2 }}>{product.name}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'block', marginBottom: tokens.spacing[2] }}>SKU: {product.sku}</Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>${product.price.toFixed(2)}</Text>
                        <span style={createBadgeStyle(tokens, 'info')}>{product.category}</span>
                      </div>
                      {/* Stock bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Stock</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{product.stockLevel}</Text>
                        </div>
                        <div style={stockBar.track}><div style={stockBar.fill} /></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCE6'}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No products match your search</Text>
              </div>
            )}
          </div>

          {/* Right: Combos Panel */}
          <div>
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.warningScale[50], borderBottom: `1px solid ${tokens.colors.warningScale[200]}` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.warningScale[800] }}>{'\uD83C\uDF89'} Combo Deals</Text>
              </div>
              {combos.map((combo, idx) => (
                <div key={combo.id} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: idx < combos.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', ...hoverStyle }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{combo.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>${combo.comboPrice.toFixed(2)}</Text>
                  </div>
                  <div style={{ marginBottom: tokens.spacing[1] }}>
                    {combo.products.map((p, pi) => (
                      <Text key={pi} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{p.quantity}x {p.name}</Text>
                    ))}
                  </div>
                  <span style={createBadgeStyle(tokens, 'success')}>Save ${combo.savings.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Products', value: products.length.toString(), emoji: '\uD83D\uDCE6' },
            { label: 'Available', value: products.filter(p => p.isAvailable).length.toString(), emoji: '\u2705' },
            { label: 'Out of Stock', value: outOfStock.toString(), emoji: '\u274C' },
            { label: 'Combo Deals', value: combos.length.toString(), emoji: '\uD83C\uDF89' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
