'use client';

/**
 * BarSalesDashboard - Compact Preset
 * Compact sales summary with key metrics
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { BarSalesDashboardProps, SalesStat } from '../../core';

const MOCK_STATS: SalesStat[] = [
  { label: 'Revenue', value: '$12,450', change: 12.5, trend: 'up' },
  { label: 'Orders', value: '342', change: 8.2, trend: 'up' },
  { label: 'Avg Order', value: '$36.40', change: -2.1, trend: 'down' },
  { label: 'Items Sold', value: '1,284', change: 15.3, trend: 'up' },
];

export const CompactBarSalesDashboard = createPreset<BarSalesDashboardProps>({
  name: 'BarSalesDashboard.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BarSalesDashboardProps>) => {
    const { Box, Text } = primitives;
    const { stats: propStats, className, style } = props;
    const stats = propStats && propStats.length > 0 ? propStats : MOCK_STATS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Sales Summary</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3] }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ ...cardBase, padding: tokens.spacing[4], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, display: 'block', marginBottom: tokens.spacing[1] }}>{stat.label}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              {stat.change !== undefined && (
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: stat.trend === 'up' ? tokens.colors.successScale[600] : tokens.colors.errorScale[600] }}>
                  {stat.trend === 'up' ? '\u2191' : '\u2193'} {Math.abs(stat.change)}%
                </Text>
              )}
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
