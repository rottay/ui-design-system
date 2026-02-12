'use client';

/**
 * EvTicketSales - Overview Preset
 * Composes PatternStatsGrid + PatternDataTable + AreaChart
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  PatternStatsGrid,
  PatternDataTable,
  AreaChart,
  column,
  columns,
} from '../../../../patterns';
import type { StatDef, ColumnDef } from '../../../../patterns';
import { createCardStyle, createBadgeStyle, createProgressBarStyle, createSectionHeaderStyle } from '../../../helpers';
import type { EvTicketSalesProps, SalesKpi, TicketTypeBreakdown, SalesTrend } from '../../core';

const MOCK_KPIS: SalesKpi[] = [
  { label: 'Total Sold', value: 3200, trend: 'up', trendValue: 12.5 },
  { label: 'Revenue', value: 96000, currency: '$', trend: 'up', trendValue: 8.3 },
  { label: 'Avg Price', value: 30, currency: '$', trend: 'down', trendValue: 2.1 },
  { label: 'Conversion', value: 68, trend: 'up', trendValue: 4.7 },
];

const MOCK_BREAKDOWN: TicketTypeBreakdown[] = [
  { type: 'General Admission', sold: 1800, total: 2500, price: 45, revenue: 81000, color: 'primary' },
  { type: 'VIP', sold: 620, total: 800, price: 120, revenue: 74400, color: 'secondary' },
  { type: 'Backstage', sold: 180, total: 200, price: 250, revenue: 45000, color: 'warning' },
  { type: 'Early Bird', sold: 600, total: 600, price: 35, revenue: 21000, color: 'success' },
];

const MOCK_TRENDS: SalesTrend[] = [
  { date: 'Mon', amount: 8400, count: 280 },
  { date: 'Tue', amount: 12600, count: 420 },
  { date: 'Wed', amount: 9800, count: 327 },
  { date: 'Thu', amount: 15200, count: 507 },
  { date: 'Fri', amount: 18900, count: 630 },
  { date: 'Sat', amount: 22400, count: 747 },
  { date: 'Sun', amount: 8700, count: 289 },
];

export const OverviewEvTicketSales = createPreset<EvTicketSalesProps>({
  name: 'EvTicketSales.Overview',
  render: ({ primitives, props, tokens }: PresetContext<EvTicketSalesProps>) => {
    const { Box, Text } = primitives;

    const kpis = props.kpis ?? MOCK_KPIS;
    const breakdown = props.breakdown ?? MOCK_BREAKDOWN;
    const trends = props.trends ?? MOCK_TRENDS;

    const kpiStats = useMemo((): StatDef[] => kpis.map((kpi, idx) => ({
      key: `kpi-${idx}`,
      label: kpi.label,
      value: kpi.currency ? `${kpi.currency}${kpi.value.toLocaleString()}` : kpi.label === 'Conversion' ? `${kpi.value}%` : kpi.value.toLocaleString(),
      change: kpi.trendValue,
      changeType: kpi.trend === 'up' ? 'increase' as const : kpi.trend === 'down' ? 'decrease' as const : 'neutral' as const,
      description: 'vs last week',
    })), [kpis]);

    const ticketColumns = useMemo(() => columns<TicketTypeBreakdown>([
      column<TicketTypeBreakdown, 'type'>('type', { header: 'Type', sortable: true }),
      column<TicketTypeBreakdown, 'price'>('price', {
        header: 'Price',
        render: (_v, row) => <span style={createBadgeStyle(tokens, (row.color as any) || 'primary')}>${row.price}</span>,
      }),
      {
        key: 'soldTotal',
        header: 'Sold',
        accessorFn: (row: TicketTypeBreakdown) => row.sold,
        render: (_v: unknown, row: TicketTypeBreakdown) => <span>{row.sold.toLocaleString()} / {row.total.toLocaleString()}</span>,
      } as ColumnDef<TicketTypeBreakdown>,
      {
        key: 'progress',
        header: 'Progress',
        minWidth: 120,
        accessorFn: (row: TicketTypeBreakdown) => Math.round((row.sold / row.total) * 100),
        render: (_v: unknown, row: TicketTypeBreakdown) => {
          const pct = Math.round((row.sold / row.total) * 100);
          const bar = createProgressBarStyle(tokens, { percent: pct });
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{ flex: 1, ...bar.track }}><div style={bar.fill} /></div>
              <span style={{ fontSize: tokens.typography.fontSize.xs }}>{pct}%</span>
            </div>
          );
        },
      } as ColumnDef<TicketTypeBreakdown>,
      column<TicketTypeBreakdown, 'revenue'>('revenue', {
        header: 'Revenue',
        align: 'right',
        render: (_v, row) => <Text style={{ fontWeight: tokens.typography.fontWeight.semibold }}>${row.revenue.toLocaleString()}</Text>,
      }),
    ]), [tokens]);

    const trendSeries = useMemo(() => [{
      name: 'Sales',
      data: trends.map(t => ({ x: t.date, y: t.count })),
      color: tokens.colors.primaryScale[500],
    }], [trends, tokens]);

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Ticket Sales</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Real-time overview for Neon Nights Festival</Text>
          </div>
          {props.onExport && (
            <div onClick={props.onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>
              Export Report
            </div>
          )}
        </Box>

        {/* KPIs */}
        <PatternStatsGrid stats={kpiStats} columns={4} />

        {/* Sales Trend Chart */}
        <AreaChart
          series={trendSeries}
          height={120}
        />

        {/* Ticket Type Breakdown */}
        <PatternDataTable
          data={breakdown}
          columns={ticketColumns}
          rowKey="type"
          compact
        />
      </Box>
    );
  },
});
