'use client';

/**
 * BarStockDashboard - Compact Preset
 * Compact stock overview with key metrics
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarStockDashboardProps, StockItem } from '../../core';

const MOCK_ITEMS: StockItem[] = [
  { id: 's1', name: 'Tequila Patron', category: 'Spirits', currentLevel: 8, minLevel: 5, maxLevel: 30, unit: 'bottles', lastRestocked: '2024-01-10', costPerUnit: 45.00, status: 'ok' },
  { id: 's2', name: 'Bourbon Jim Beam', category: 'Spirits', currentLevel: 3, minLevel: 5, maxLevel: 20, unit: 'bottles', lastRestocked: '2024-01-08', costPerUnit: 28.00, status: 'low' },
  { id: 's3', name: 'Lime Juice', category: 'Mixers', currentLevel: 1, minLevel: 3, maxLevel: 10, unit: 'liters', lastRestocked: '2024-01-05', costPerUnit: 8.00, status: 'critical' },
];

const STATUS_COLORS: Record<string, string> = { ok: 'success', low: 'warning', critical: 'error', overstocked: 'info' };

export const CompactBarStockDashboard = createPreset<BarStockDashboardProps>({
  name: 'BarStockDashboard.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BarStockDashboardProps>) => {
    const { Box, Text } = primitives;
    const { items: propItems, onItemSelect, className, style } = props;
    const items = propItems && propItems.length > 0 ? propItems : MOCK_ITEMS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Stock Overview</Text>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
          {items.map(item => (
            <div key={item.id} onClick={() => onItemSelect?.(item.id)} style={{ ...cardBase, padding: tokens.spacing[3], cursor: 'pointer', ...hoverStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{item.name}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{item.currentLevel} {item.unit}</Text>
              </div>
              <span style={createBadgeStyle(tokens, STATUS_COLORS[item.status] as any)}>{item.status}</span>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
