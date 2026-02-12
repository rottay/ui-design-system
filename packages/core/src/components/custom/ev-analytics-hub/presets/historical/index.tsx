'use client';

/**
 * EvAnalyticsHub - Historical Preset
 * Composes PatternStatsGrid + PatternDataTable for period comparisons and benchmarks
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  PatternStatsGrid,
  PatternDataTable,
  column,
  columns,
} from '../../../../patterns';
import type { StatDef, ColumnDef } from '../../../../patterns';
import { createCardStyle, createBadgeStyle, createFilterPillStyle } from '../../../helpers';
import type { EvAnalyticsHubProps } from '../../core';

type PeriodRow = { period: string; events: number; attendance: number; revenue: number; ticketsSold: number; avgSatisfaction: number };

const MOCK_PERIODS: PeriodRow[] = [
  { period: 'Feb 2026', events: 8, attendance: 18400, revenue: 184000, ticketsSold: 12800, avgSatisfaction: 4.6 },
  { period: 'Jan 2026', events: 6, attendance: 14200, revenue: 142000, ticketsSold: 9800, avgSatisfaction: 4.5 },
  { period: 'Dec 2025', events: 10, attendance: 22000, revenue: 264000, ticketsSold: 16400, avgSatisfaction: 4.7 },
  { period: 'Nov 2025', events: 7, attendance: 15800, revenue: 158000, ticketsSold: 11200, avgSatisfaction: 4.4 },
  { period: 'Oct 2025', events: 5, attendance: 11000, revenue: 110000, ticketsSold: 7800, avgSatisfaction: 4.3 },
  { period: 'Sep 2025', events: 4, attendance: 8600, revenue: 86000, ticketsSold: 6200, avgSatisfaction: 4.5 },
];

const MOCK_BENCHMARKS = [
  { metric: 'Revenue per Event', current: 23000, benchmark: 18500, percentile: 82 },
  { metric: 'Ticket Sell-Through', current: 86, benchmark: 72, percentile: 91 },
  { metric: 'Check-in Rate', current: 92, benchmark: 85, percentile: 78 },
  { metric: 'F&B per Head', current: 28, benchmark: 22, percentile: 85 },
  { metric: 'Customer Satisfaction', current: 4.6, benchmark: 4.1, percentile: 88 },
  { metric: 'Repeat Attendance', current: 34, benchmark: 25, percentile: 76 },
];

const formatCurrency = (n: number) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n}`;
};

export const HistoricalEvAnalyticsHub = createPreset<EvAnalyticsHubProps>({
  name: 'EvAnalyticsHub.Historical',
  render: ({ primitives, props, tokens }: PresetContext<EvAnalyticsHubProps>) => {
    const { Box, Text } = primitives;
    const { benchmarks: propBenchmarks, className, style } = props;

    const [selectedRange, setSelectedRange] = useState('6mo');

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const benchmarks = propBenchmarks?.length ? propBenchmarks : MOCK_BENCHMARKS;
    const ranges = ['3mo', '6mo', '12mo', 'YTD'];

    const totalRevenue = MOCK_PERIODS.reduce((s, p) => s + p.revenue, 0);
    const totalAttendance = MOCK_PERIODS.reduce((s, p) => s + p.attendance, 0);
    const totalEvents = MOCK_PERIODS.reduce((s, p) => s + p.events, 0);

    const summaryStats = useMemo((): StatDef[] => [
      { key: 'revenue', label: 'Total Revenue', value: formatCurrency(totalRevenue), sparklineData: MOCK_PERIODS.map(p => p.revenue).reverse() },
      { key: 'attendance', label: 'Total Attendance', value: `${(totalAttendance / 1000).toFixed(1)}K`, sparklineData: MOCK_PERIODS.map(p => p.attendance).reverse() },
      { key: 'events', label: 'Events Held', value: totalEvents },
      { key: 'satisfaction', label: 'Avg Satisfaction', value: '4.5/5' },
    ], [totalRevenue, totalAttendance, totalEvents]);

    const periodColumns = useMemo(() => columns<PeriodRow>([
      column<PeriodRow, 'period'>('period', { header: 'Period', sortable: true }),
      column<PeriodRow, 'events'>('events', { header: 'Events', sortable: true }),
      column<PeriodRow, 'attendance'>('attendance', {
        header: 'Attendance',
        sortable: true,
        render: (_v, row) => <span>{(row.attendance / 1000).toFixed(1)}K</span>,
      }),
      column<PeriodRow, 'revenue'>('revenue', {
        header: 'Revenue',
        sortable: true,
        render: (_v, row) => <Text style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700] }}>{formatCurrency(row.revenue)}</Text>,
      }),
      column<PeriodRow, 'ticketsSold'>('ticketsSold', {
        header: 'Tickets',
        sortable: true,
        render: (_v, row) => <span>{(row.ticketsSold / 1000).toFixed(1)}K</span>,
      }),
      column<PeriodRow, 'avgSatisfaction'>('avgSatisfaction', {
        header: 'Rating',
        sortable: true,
        render: (_v, row) => <span>{row.avgSatisfaction}</span>,
      }),
    ]), [tokens]);

    const benchmarkStats = useMemo((): StatDef[] => benchmarks.map(b => ({
      key: b.metric,
      label: b.metric,
      value: `Top ${b.percentile}%`,
      color: b.percentile >= 80 ? tokens.colors.successScale[500] : b.percentile >= 60 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500],
    })), [benchmarks, tokens]);

    const footerStats = useMemo((): StatDef[] => [
      { key: 'avg-rev', label: 'Avg Revenue/Event', value: formatCurrency(Math.round(totalRevenue / totalEvents)) },
      { key: 'avg-att', label: 'Avg Attendance/Event', value: Math.round(totalAttendance / totalEvents).toLocaleString() },
      { key: 'growth', label: 'Revenue Growth', value: '+29%', changeType: 'increase' },
      { key: 'best', label: 'Best Month', value: 'Dec 2025' },
    ], [totalRevenue, totalAttendance, totalEvents]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              Historical Analytics
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Period comparisons, trends, and benchmarks
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            {ranges.map(r => (
              <div key={r} onClick={() => setSelectedRange(r)} style={createFilterPillStyle(tokens, { active: selectedRange === r })}>
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Summary KPIs */}
        <PatternStatsGrid stats={summaryStats} columns={4} sparkline style={{ marginBottom: tokens.spacing[6] }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: tokens.spacing[6] }}>
          {/* Period Comparison Table */}
          <div style={cardBase}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Period Comparison</Text>
              <span style={{ ...createBadgeStyle(tokens, 'info'), fontSize: tokens.typography.fontSize.xs }}>Last {selectedRange}</span>
            </div>
            <PatternDataTable
              data={MOCK_PERIODS}
              columns={periodColumns}
              rowKey="period"
              hoverable
              compact
            />
          </div>

          {/* Benchmark Rankings */}
          <div style={cardBase}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
              Industry Benchmarks
            </Text>
            <PatternStatsGrid stats={benchmarkStats} columns={1} variant="outlined" />
          </div>
        </div>

        {/* Summary Footer */}
        <PatternStatsGrid stats={footerStats} columns={4} style={{ marginTop: tokens.spacing[5] }} />
      </Box>
    );
  },
});
