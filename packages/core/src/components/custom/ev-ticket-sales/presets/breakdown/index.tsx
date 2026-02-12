'use client';

/**
 * EvTicketSales - Breakdown Preset
 * Composes PatternStatsGrid + PatternDataTable for per-type detailed analysis
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  PatternStatsGrid,
  PatternDataTable,
  column,
  columns,
} from '../../../../patterns';
import type { StatDef, ColumnDef } from '../../../../patterns';
import { createBadgeStyle, createProgressBarStyle } from '../../../helpers';
import type { EvTicketSalesProps, TicketTypeBreakdown } from '../../core';

const MOCK_BREAKDOWN: TicketTypeBreakdown[] = [
  { type: 'General Admission', sold: 1800, total: 2500, price: 45, revenue: 81000, color: 'primary' },
  { type: 'VIP', sold: 620, total: 800, price: 120, revenue: 74400, color: 'secondary' },
  { type: 'Backstage', sold: 180, total: 200, price: 250, revenue: 45000, color: 'warning' },
  { type: 'Early Bird', sold: 600, total: 600, price: 35, revenue: 21000, color: 'success' },
];

export const BreakdownEvTicketSales = createPreset<EvTicketSalesProps>({
  name: 'EvTicketSales.Breakdown',
  render: ({ primitives, props, tokens }: PresetContext<EvTicketSalesProps>) => {
    const { Box, Text } = primitives;
    const breakdown = props.breakdown ?? MOCK_BREAKDOWN;

    const totalSold = breakdown.reduce((s, t) => s + t.sold, 0);
    const totalCapacity = breakdown.reduce((s, t) => s + t.total, 0);
    const totalRevenue = breakdown.reduce((s, t) => s + t.revenue, 0);
    const avgPrice = Math.round(totalRevenue / totalSold);

    const summaryStats = useMemo((): StatDef[] => [
      { key: 'sold', label: 'Total Sold', value: totalSold.toLocaleString() },
      { key: 'revenue', label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
      { key: 'avg', label: 'Avg Price', value: `$${avgPrice}` },
      { key: 'capacity', label: 'Capacity', value: `${Math.round((totalSold / totalCapacity) * 100)}%` },
    ], [totalSold, totalRevenue, avgPrice, totalCapacity]);

    const ticketColumns = useMemo(() => columns<TicketTypeBreakdown>([
      column<TicketTypeBreakdown, 'type'>('type', { header: 'Type', sortable: true }),
      column<TicketTypeBreakdown, 'price'>('price', {
        header: 'Price',
        align: 'right',
        sortable: true,
        render: (_v, row) => <span style={createBadgeStyle(tokens, (row.color as any) || 'primary')}>${row.price}</span>,
      }),
      {
        key: 'soldTotal',
        header: 'Sold',
        sortable: true,
        accessorFn: (row: TicketTypeBreakdown) => row.sold,
        align: 'right' as const,
        render: (_v: unknown, row: TicketTypeBreakdown) => (
          <Text style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{row.sold.toLocaleString()} / {row.total.toLocaleString()}</Text>
        ),
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
        sortable: true,
        align: 'right',
        render: (_v, row) => <Text style={{ fontWeight: tokens.typography.fontWeight.bold }}>${row.revenue.toLocaleString()}</Text>,
      }),
      {
        key: 'remaining',
        header: 'Remaining',
        align: 'right' as const,
        accessorFn: (row: TicketTypeBreakdown) => row.total - row.sold,
        render: (_v: unknown, row: TicketTypeBreakdown) => {
          const pct = Math.round((row.sold / row.total) * 100);
          return <Text style={{ color: pct >= 100 ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>{pct >= 100 ? 'Sold Out' : `${(row.total - row.sold).toLocaleString()} left`}</Text>;
        },
      } as ColumnDef<TicketTypeBreakdown>,
    ]), [tokens]);

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        {/* Header */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Ticket Breakdown</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Detailed per-type sales analysis</Text>
          </div>
          {props.onExport && (
            <div onClick={props.onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>
              Export CSV
            </div>
          )}
        </Box>

        {/* Summary KPIs */}
        <PatternStatsGrid stats={summaryStats} columns={4} />

        {/* Detailed Table */}
        <PatternDataTable
          data={breakdown}
          columns={ticketColumns}
          rowKey="type"
          hoverable
        />
      </Box>
    );
  },
});
