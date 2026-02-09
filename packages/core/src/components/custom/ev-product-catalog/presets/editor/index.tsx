'use client';

/**
 * EvProductCatalog - Editor Preset
 * Table-based product editor with category tree, inline editing, availability toggles, pricing management
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
  { id: 'p1', name: 'Classic Margarita', sku: 'CKT-001', category: 'Cocktails', price: 14.00, currency: 'USD', isAvailable: true, stockLevel: 50, description: 'Tequila, lime, triple sec' },
  { id: 'p2', name: 'Mojito', sku: 'CKT-002', category: 'Cocktails', price: 13.00, currency: 'USD', isAvailable: true, stockLevel: 45, description: 'Rum, mint, lime, sugar' },
  { id: 'p3', name: 'Old Fashioned', sku: 'CKT-003', category: 'Cocktails', price: 15.00, currency: 'USD', isAvailable: true, stockLevel: 30 },
  { id: 'p4', name: 'Espresso Martini', sku: 'CKT-004', category: 'Cocktails', price: 16.00, currency: 'USD', isAvailable: true, stockLevel: 25 },
  { id: 'p5', name: 'Corona Extra', sku: 'BER-001', category: 'Beer', price: 7.00, currency: 'USD', isAvailable: true, stockLevel: 120 },
  { id: 'p6', name: 'Heineken', sku: 'BER-002', category: 'Beer', price: 7.50, currency: 'USD', isAvailable: true, stockLevel: 95 },
  { id: 'p7', name: 'Craft IPA', sku: 'BER-003', category: 'Beer', price: 9.00, currency: 'USD', isAvailable: false, stockLevel: 0 },
  { id: 'p8', name: 'Red Bull Vodka', sku: 'SPR-001', category: 'Spirits', price: 12.00, currency: 'USD', isAvailable: true, stockLevel: 60 },
  { id: 'p9', name: 'Water Bottle', sku: 'NAL-001', category: 'Non-Alcoholic', price: 3.00, currency: 'USD', isAvailable: true, stockLevel: 200 },
  { id: 'p10', name: 'Nachos Grande', sku: 'FOD-001', category: 'Food', price: 10.00, currency: 'USD', isAvailable: true, stockLevel: 30 },
];

const MOCK_CATEGORIES: ProductCategory[] = [
  { id: 'cat1', name: 'Cocktails', icon: '\uD83C\uDF78', productCount: 4, isVisible: true },
  { id: 'cat2', name: 'Beer', icon: '\uD83C\uDF7A', productCount: 3, isVisible: true },
  { id: 'cat3', name: 'Spirits', icon: '\uD83E\uDD43', productCount: 1, isVisible: true },
  { id: 'cat4', name: 'Non-Alcoholic', icon: '\uD83E\uDDC3', productCount: 1, isVisible: true },
  { id: 'cat5', name: 'Food', icon: '\uD83C\uDF54', productCount: 1, isVisible: false },
];

const MOCK_COMBOS: ComboItem[] = [
  { id: 'cb1', name: 'Party Starter', products: [{ name: 'Margarita', quantity: 2 }, { name: 'Nachos Grande', quantity: 1 }], comboPrice: 32.00, savings: 6.00 },
  { id: 'cb2', name: 'Beer Night', products: [{ name: 'Corona Extra', quantity: 4 }, { name: 'Wings Basket', quantity: 1 }], comboPrice: 36.00, savings: 4.00 },
];

export const EditorEvProductCatalog = createPreset<EvProductCatalogProps>({
  name: 'EvProductCatalog.Editor',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvProductCatalogProps>) => {
    const { Box, Text } = primitives;
    const { products: propProducts, categories: propCats, combos: propCombos, onProductClick, onCategoryClick, onToggleAvailability, className, style } = props;

    const products = propProducts && propProducts.length > 0 ? propProducts : MOCK_PRODUCTS;
    const categories = propCats && propCats.length > 0 ? propCats : MOCK_CATEGORIES;
    const combos = propCombos && propCombos.length > 0 ? propCombos : MOCK_COMBOS;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

    const totalValue = products.reduce((s, p) => s + (p.price * p.stockLevel), 0);
    const avgPrice = products.length > 0 ? products.reduce((s, p) => s + p.price, 0) / products.length : 0;

    const thStyle = { padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], borderBottom: `1px solid ${tokens.colors.neutral[200]}`, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
    const tdStyle = { padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], borderBottom: `1px solid ${tokens.colors.neutral[100]}` };

    const toggleSelect = (id: string) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {'\u270F\uFE0F'} Catalog Editor
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filteredProducts.length} products - {selectedIds.length} selected
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            {selectedIds.length > 0 && (
              <button style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.errorScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>
                {'\uD83D\uDDD1'} Bulk Remove ({selectedIds.length})
              </button>
            )}
            <button style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit', ...hoverStyle }}>
              + Add Product
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Total Products', value: products.length.toString(), emoji: '\uD83D\uDCE6', color: 'primary' as const },
            { label: 'Avg Price', value: `$${avgPrice.toFixed(2)}`, emoji: '\uD83D\uDCB2', color: 'info' as const },
            { label: 'Inventory Value', value: `$${totalValue.toLocaleString()}`, emoji: '\uD83D\uDCB0', color: 'success' as const },
            { label: 'Categories', value: categories.length.toString(), emoji: '\uD83D\uDCC1', color: 'warning' as const },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, textAlign: 'center' as const, padding: tokens.spacing[3] }}>
              <span style={{ fontSize: 20 }}>{stat.emoji}</span>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors[`${stat.color}Scale`][600], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: tokens.spacing[5] }}>
          {/* Category Tree */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>{'\uD83D\uDCC1'} Categories</Text>
            </div>
            <div onClick={() => setActiveCategory(null)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, cursor: 'pointer', backgroundColor: activeCategory === null ? tokens.colors.primaryScale[50] : 'transparent', borderLeft: activeCategory === null ? `3px solid ${tokens.colors.primaryScale[600]}` : '3px solid transparent', ...hoverStyle }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: activeCategory === null ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600], fontWeight: activeCategory === null ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal }}>All Products ({products.length})</Text>
            </div>
            {categories.map(cat => (
              <div key={cat.id} onClick={() => { setActiveCategory(activeCategory === cat.name ? null : cat.name); onCategoryClick?.(cat.id); }}
                style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, cursor: 'pointer', backgroundColor: activeCategory === cat.name ? tokens.colors.primaryScale[50] : 'transparent', borderLeft: activeCategory === cat.name ? `3px solid ${tokens.colors.primaryScale[600]}` : '3px solid transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...hoverStyle }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: activeCategory === cat.name ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600], fontWeight: activeCategory === cat.name ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal }}>
                  {cat.icon} {cat.name}
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{cat.productCount}</Text>
                  {!cat.isVisible && <span style={{ fontSize: 10 }}>{'\uD83D\uDC41\u200D\uD83D\uDDE8'}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Product Table */}
          <div>
            {/* Search */}
            <div style={{ marginBottom: tokens.spacing[4], position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search by name or SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }}
              />
            </div>

            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 30 }}></th>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>SKU</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Price</th>
                    <th style={thStyle}>Stock</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const isSelected = selectedIds.includes(product.id);
                    const isHovered = hoveredRow === product.id;
                    const stockPct = Math.min(100, Math.round((product.stockLevel / 100) * 100));
                    const stockBar = createProgressBarStyle(tokens, { percent: stockPct, color: product.stockLevel === 0 ? tokens.colors.errorScale[500] : product.stockLevel < 20 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500] });

                    return (
                      <tr key={product.id}
                        onMouseEnter={() => setHoveredRow(product.id)} onMouseLeave={() => setHoveredRow(null)}
                        style={{ backgroundColor: isSelected ? tokens.colors.primaryScale[50] : isHovered ? tokens.colors.neutral[50] : 'transparent', ...hoverStyle }}>
                        <td style={tdStyle}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(product.id)} style={{ cursor: 'pointer' }} />
                        </td>
                        <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.medium }}>{product.name}</td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{product.sku}</td>
                        <td style={tdStyle}><span style={createBadgeStyle(tokens, 'info')}>{product.category}</span></td>
                        <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>${product.price.toFixed(2)}</td>
                        <td style={{ ...tdStyle, minWidth: 100 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], minWidth: 24 }}>{product.stockLevel}</Text>
                            <div style={{ flex: 1 }}>
                              <div style={stockBar.track}><div style={stockBar.fill} /></div>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => onToggleAvailability?.(product.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: product.isAvailable ? tokens.colors.successScale[100] : tokens.colors.errorScale[100], color: product.isAvailable ? tokens.colors.successScale[700] : tokens.colors.errorScale[700], border: `1px solid ${product.isAvailable ? tokens.colors.successScale[300] : tokens.colors.errorScale[300]}`, borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>
                            {product.isAvailable ? '\u2705 Active' : '\u274C Off'}
                          </button>
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => onProductClick?.(product.id)} style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{'\u270F\uFE0F'}</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCE6'}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No products found</Text>
              </div>
            )}

            {/* Combo Builder Section */}
            <div style={{ ...cardBase, marginTop: tokens.spacing[5], padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.warningScale[50], borderBottom: `1px solid ${tokens.colors.warningScale[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.warningScale[800] }}>{'\uD83C\uDF89'} Combo Deals ({combos.length})</Text>
                <button style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.warningScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>+ New Combo</button>
              </div>
              {combos.map((combo, idx) => (
                <div key={combo.id} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: idx < combos.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...hoverStyle }}>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{combo.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {combo.products.map(p => `${p.quantity}x ${p.name}`).join(' + ')}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>${combo.comboPrice.toFixed(2)}</Text>
                    <span style={createBadgeStyle(tokens, 'success')}>-${combo.savings.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
