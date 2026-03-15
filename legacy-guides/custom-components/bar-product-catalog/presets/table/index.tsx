'use client';

/**
 * BarProductCatalog - Table Preset
 * Tabular product listing with inline actions
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarProductCatalogProps, CatalogProduct } from '../../core';

const MOCK_PRODUCTS: CatalogProduct[] = [
  { id: 'p1', name: 'Margarita', category: 'Cocktails', price: 14.00, cost: 4.50, currency: 'USD', isAvailable: true, stockLevel: 100, sku: 'COC-001' },
  { id: 'p2', name: 'Mojito', category: 'Cocktails', price: 13.00, cost: 4.00, currency: 'USD', isAvailable: true, stockLevel: 80, sku: 'COC-002' },
  { id: 'p3', name: 'Corona Extra', category: 'Beer', price: 7.00, cost: 2.50, currency: 'USD', isAvailable: true, stockLevel: 200, sku: 'BER-001' },
  { id: 'p4', name: 'Craft IPA', category: 'Beer', price: 9.00, cost: 3.50, currency: 'USD', isAvailable: false, stockLevel: 0, sku: 'BER-002' },
  { id: 'p5', name: 'Water Bottle', category: 'Non-Alcoholic', price: 3.00, cost: 0.50, currency: 'USD', isAvailable: true, stockLevel: 500, sku: 'NAL-001' },
];

export const TableBarProductCatalog = createPreset<BarProductCatalogProps>({
  name: 'BarProductCatalog.Table',
  render: ({ primitives, props, tokens }: PresetContext<BarProductCatalogProps>) => {
    const { Box, Text } = primitives;
    const { products: propProducts, onProductSelect, onProductCreate, onProductEdit, onProductDelete, onToggleAvailability, className, style } = props;

    const products = propProducts && propProducts.length > 0 ? propProducts : MOCK_PRODUCTS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Product Catalog</Text>
          <button onClick={onProductCreate} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Product</button>
        </div>

        <div style={{ ...cardBase, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[100] }}>
                {['SKU', 'Name', 'Category', 'Price', 'Cost', 'Margin', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => {
                const margin = ((p.price - p.cost) / p.price * 100).toFixed(0);
                return (
                  <tr key={p.id} onClick={() => onProductSelect?.(p.id)} style={{ cursor: 'pointer', borderBottom: idx < products.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', ...hoverStyle }}>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontFamily: 'monospace' }}>{p.sku || '-'}</Text></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{p.name}</Text></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{p.category}</Text></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${p.price.toFixed(2)}</Text></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>${p.cost.toFixed(2)}</Text></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600] }}>{margin}%</Text></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: p.stockLevel < 20 ? tokens.colors.errorScale[600] : tokens.colors.neutral[600] }}>{p.stockLevel}</Text></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><span style={createBadgeStyle(tokens, p.isAvailable ? 'success' : 'error')}>{p.isAvailable ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                      <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                        <button onClick={(e) => { e.stopPropagation(); onProductEdit?.(p.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: 'none', borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); onToggleAvailability?.(p.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.warningScale[100], color: tokens.colors.warningScale[700], border: 'none', borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>{p.isAvailable ? 'Disable' : 'Enable'}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
