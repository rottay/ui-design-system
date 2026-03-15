'use client';

/**
 * BarSalesDashboard - Dashboard Preset
 * Full analytics dashboard with stats, charts, top products
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, createProgressBarStyle } from '../../../helpers';
import type { BarSalesDashboardProps, SalesStat, SalesByCategory, TopProduct } from '../../core';

const MOCK_STATS: SalesStat[] = [
  { label: 'Total Revenue', value: '$12,450', change: 12.5, changeLabel: 'vs last week', trend: 'up' },
  { label: 'Orders', value: '342', change: 8.2, changeLabel: 'vs last week', trend: 'up' },
  { label: 'Avg Order Value', value: '$36.40', change: -2.1, changeLabel: 'vs last week', trend: 'down' },
  { label: 'Items Sold', value: '1,284', change: 15.3, changeLabel: 'vs last week', trend: 'up' },
];

const MOCK_BY_CATEGORY: SalesByCategory[] = [
  { category: 'Cocktails', amount: 5200, percentage: 41.8, orderCount: 148 },
  { category: 'Beer', amount: 3100, percentage: 24.9, orderCount: 210 },
  { category: 'Spirits', amount: 2000, percentage: 16.1, orderCount: 68 },
  { category: 'Non-Alcoholic', amount: 850, percentage: 6.8, orderCount: 95 },
  { category: 'Food', amount: 1300, percentage: 10.4, orderCount: 72 },
];

const MOCK_TOP_PRODUCTS: TopProduct[] = [
  { name: 'Margarita', category: 'Cocktails', revenue: 1680, quantity: 120 },
  { name: 'Old Fashioned', category: 'Cocktails', revenue: 1350, quantity: 90 },
  { name: 'Corona Extra', category: 'Beer', revenue: 1050, quantity: 150 },
  { name: 'Mojito', category: 'Cocktails', revenue: 910, quantity: 70 },
  { name: 'Red Bull Vodka', category: 'Spirits', revenue: 840, quantity: 70 },
  { name: 'Nachos', category: 'Food', revenue: 600, quantity: 60 },
  { name: 'Heineken', category: 'Beer', revenue: 525, quantity: 70 },
  { name: 'Whiskey Sour', category: 'Cocktails', revenue: 490, quantity: 35 },
];

export const DashboardBarSalesDashboard = createPreset<BarSalesDashboardProps>({
  name: 'BarSalesDashboard.Dashboard',
  render: ({ primitives, props, tokens }: PresetContext<BarSalesDashboardProps>) => {
    const { Box, Text } = primitives;
    const { stats: propStats, salesByCategory: propByCategory, topProducts: propTopProducts, onExport, className, style } = props;

    const stats = propStats && propStats.length > 0 ? propStats : MOCK_STATS;
    const byCategory = propByCategory && propByCategory.length > 0 ? propByCategory : MOCK_BY_CATEGORY;
    const topProducts = propTopProducts && propTopProducts.length > 0 ? propTopProducts : MOCK_TOP_PRODUCTS;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const maxRevenue = Math.max(...topProducts.map(p => p.revenue));

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Sales Dashboard</Text>
          <button onClick={onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>Export Report</button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ ...cardBase, padding: tokens.spacing[5] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, display: 'block', marginBottom: tokens.spacing[1] }}>{stat.label}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{stat.value}</Text>
              {stat.change !== undefined && (
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: stat.trend === 'up' ? tokens.colors.successScale[600] : stat.trend === 'down' ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>
                  {stat.trend === 'up' ? '\u2191' : stat.trend === 'down' ? '\u2193' : '\u2192'} {Math.abs(stat.change)}% {stat.changeLabel}
                </Text>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[5] }}>
          {/* Sales by Category */}
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800], display: 'block', marginBottom: tokens.spacing[4] }}>Sales by Category</Text>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              {byCategory.map((cat, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{cat.category}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${cat.amount.toLocaleString()}</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <div style={{ flex: 1, ...createProgressBarStyle(tokens, { percent: cat.percentage }).track }}><div style={createProgressBarStyle(tokens, { percent: cat.percentage }).fill} /></div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 40 }}>{cat.percentage}%</Text>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{cat.orderCount} orders</Text>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800], display: 'block', marginBottom: tokens.spacing[4] }}>Top Products</Text>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
              {topProducts.map((product, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px 0`, borderBottom: i < topProducts.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none' }}>
                  <div style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: i < 3 ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100], color: i < 3 ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{product.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{product.category} - {product.quantity} sold</Text>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>${product.revenue.toLocaleString()}</Text>
                    <div style={{ width: 60, height: 4, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200], marginTop: 4 }}>
                      <div style={{ width: `${(product.revenue / maxRevenue) * 100}%`, height: '100%', borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[500] }} />
                    </div>
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
