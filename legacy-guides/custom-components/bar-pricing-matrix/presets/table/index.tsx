'use client';

/**
 * BarPricingMatrix - Table Preset
 * Simplified pricing list without zone matrix
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarPricingMatrixProps, PriceConfig } from '../../core';

const MOCK_CONFIGS: PriceConfig[] = [
  { id: 'c1', productName: 'Margarita', productCategory: 'Cocktails', basePrice: 14.00, currency: 'USD', zonePrices: {}, eventMultiplier: 1.2, happyHourPrice: 10.00, isActive: true },
  { id: 'c2', productName: 'Old Fashioned', productCategory: 'Cocktails', basePrice: 15.00, currency: 'USD', zonePrices: {}, eventMultiplier: 1.2, happyHourPrice: 11.00, isActive: true },
  { id: 'c3', productName: 'Corona Extra', productCategory: 'Beer', basePrice: 7.00, currency: 'USD', zonePrices: {}, happyHourPrice: 5.00, isActive: true },
  { id: 'c4', productName: 'Water', productCategory: 'Non-Alcoholic', basePrice: 3.00, currency: 'USD', zonePrices: {}, isActive: true },
];

export const TableBarPricingMatrix = createPreset<BarPricingMatrixProps>({
  name: 'BarPricingMatrix.Table',
  render: ({ primitives, props, tokens }: PresetContext<BarPricingMatrixProps>) => {
    const { Box, Text } = primitives;
    const { configs: propConfigs, onConfigSelect, className, style } = props;
    const configs = propConfigs && propConfigs.length > 0 ? propConfigs : MOCK_CONFIGS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Pricing</Text>
        <div style={{ ...cardBase, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[100] }}>
                {['Product', 'Category', 'Base Price', 'Event Price', 'Happy Hour', 'Status'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {configs.map((c, idx) => (
                <tr key={c.id} onClick={() => onConfigSelect?.(c.id)} style={{ cursor: 'pointer', borderBottom: idx < configs.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', ...hoverStyle }}>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{c.productName}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{c.productCategory}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${c.basePrice.toFixed(2)}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.warningScale[600] }}>{c.eventMultiplier ? `$${(c.basePrice * c.eventMultiplier).toFixed(2)}` : '-'}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.successScale[600] }}>{c.happyHourPrice ? `$${c.happyHourPrice.toFixed(2)}` : '-'}</Text></td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}><span style={createBadgeStyle(tokens, c.isActive ? 'success' : 'error')}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
