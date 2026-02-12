'use client';

/**
 * PmRevenueDashboard - Dashboard Preset
 * Compose PatternStatsGrid + BarChart + LineChart + PieChart
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PmRevenueDashboardProps, MetricCard, ChartDataPoint } from '../../core';
import {
  PatternStatsGrid,
  PatternPageShell,
  PatternEmptyState,
  BarChart,
  LineChart,
  PieChart,
} from '../../../../patterns';
import type { StatDef } from '../../../../patterns';

export const DashboardPmRevenueDashboard = createPreset<PmRevenueDashboardProps>({
  name: 'PmRevenueDashboard.Dashboard',
  render: ({ primitives, props, tokens, engine }: PresetContext<PmRevenueDashboardProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, metrics = [], chartData = [], timeRange, onTimeRangeChange } = props;

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    const stats: StatDef[] = metrics.map((m, idx) => ({
      key: `metric-${idx}`,
      label: m.label,
      value: m.value,
      change: m.change,
      changeType: m.trend === 'up' ? 'increase' : m.trend === 'down' ? 'decrease' : 'neutral',
    }));

    const lineSeries = [{
      name: 'Revenue',
      data: chartData.map((d) => ({ x: d.date, y: d.value })),
    }];

    const barData = chartData.map((d) => ({
      label: d.date,
      value: d.value,
    }));

    const hasData = metrics.length > 0 || chartData.length > 0;

    if (!hasData) {
      return (
        <PatternPageShell
          title="Revenue Dashboard"
          subtitle="Track revenue metrics with MRR, ARR, churn, and growth rate dashboards"
          className={className}
          style={style}
          engine={engine}
        >
          <PatternEmptyState
            title="No revenue data"
            description="Revenue metrics will appear here once payments are processed."
            engine={engine}
          />
        </PatternPageShell>
      );
    }

    return (
      <PatternPageShell
        title="Revenue Dashboard"
        subtitle="Track revenue metrics with MRR, ARR, churn, and growth rate dashboards"
        actions={onTimeRangeChange ? (
          <select
            value={timeRange ?? '30d'}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd' }}
          >
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
            <option value="90d">90d</option>
          </select>
        ) : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        {stats.length > 0 && (
          <PatternStatsGrid
            stats={stats}
            columns={Math.min(stats.length, 4)}
            variant="outlined"
            engine={engine}
          />
        )}

        {chartData.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
            <div>
              <LineChart
                series={lineSeries}
                width={500}
                height={300}
                xAxisLabel="Date"
                yAxisLabel="Revenue"
              />
            </div>
            <div>
              <BarChart
                data={barData}
                width={500}
                height={300}
                xAxisLabel="Date"
                yAxisLabel="Revenue"
              />
            </div>
          </div>
        )}
      </PatternPageShell>
    );
  },
});
