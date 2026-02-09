'use client';

/**
 * EvAnalyticsHub - Historical Preset
 * Period-over-period comparison tables, trend sparklines, benchmark rankings, data export controls
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
import type { EvAnalyticsHubProps } from '../../core';

const MOCK_PERIODS = [
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

const MOCK_TRENDS = [
  { label: 'Revenue', data: [86, 110, 158, 264, 142, 184], unit: 'K', trend: 'up' as const },
  { label: 'Attendance', data: [8.6, 11, 15.8, 22, 14.2, 18.4], unit: 'K', trend: 'up' as const },
  { label: 'Avg Ticket Price', data: [13.8, 14.1, 14.1, 16.1, 14.5, 14.4], unit: '$', trend: 'flat' as const },
  { label: 'Satisfaction', data: [4.5, 4.3, 4.4, 4.7, 4.5, 4.6], unit: '/5', trend: 'up' as const },
];

const MOCK_TOP_EVENTS = [
  { name: 'Neon Nights Festival', date: 'Dec 2025', revenue: 68000, attendance: 4800, rating: 4.9 },
  { name: 'Summer Beats Open Air', date: 'Jan 2026', revenue: 52000, attendance: 3600, rating: 4.7 },
  { name: 'Underground Bass Night', date: 'Feb 2026', revenue: 42000, attendance: 2800, rating: 4.8 },
  { name: 'Jazz & Wine Evening', date: 'Nov 2025', revenue: 38000, attendance: 2400, rating: 4.6 },
  { name: 'Electronic Wonderland', date: 'Dec 2025', revenue: 35000, attendance: 3200, rating: 4.5 },
];

export const HistoricalEvAnalyticsHub = createPreset<EvAnalyticsHubProps>({
  name: 'EvAnalyticsHub.Historical',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvAnalyticsHubProps>) => {
    const { Box, Text } = primitives;
    const { benchmarks: propBenchmarks, onChartClick, className, style } = props;

    const [selectedRange, setSelectedRange] = useState('6mo');
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const benchmarks = propBenchmarks?.length ? propBenchmarks : MOCK_BENCHMARKS;

    const ranges = ['3mo', '6mo', '12mo', 'YTD'];

    const formatCurrency = (n: number) => {
      if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
      return `$${n}`;
    };

    const totalRevenue = MOCK_PERIODS.reduce((s, p) => s + p.revenue, 0);
    const totalAttendance = MOCK_PERIODS.reduce((s, p) => s + p.attendance, 0);
    const totalEvents = MOCK_PERIODS.reduce((s, p) => s + p.events, 0);

    const renderSparkline = (data: number[], color: string) => {
      const max = Math.max(...data);
      const min = Math.min(...data);
      const range = max - min || 1;
      const w = 80;
      const h = 28;
      const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
      }).join(' ');
      return (
        <svg width={w} height={h} style={{ display: 'block' }}>
          <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>
      );
    };

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: '💰', color: tokens.colors.successScale },
            { label: 'Total Attendance', value: `${(totalAttendance / 1000).toFixed(1)}K`, icon: '👥', color: tokens.colors.primaryScale },
            { label: 'Events Held', value: totalEvents.toString(), icon: '🎪', color: tokens.colors.infoScale },
            { label: 'Avg Satisfaction', value: '4.5/5', icon: '⭐', color: tokens.colors.warningScale },
          ].map((kpi, idx) => (
            <div key={idx} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <div style={{ width: 44, height: 44, borderRadius: tokens.borderRadius.lg, backgroundColor: kpi.color[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xl, flexShrink: 0 }}>{kpi.icon}</div>
              <div>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, fontWeight: tokens.typography.fontWeight.medium, letterSpacing: '0.04em', display: 'block', marginBottom: 2 }}>{kpi.label}</span>
                <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{kpi.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trend Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          {MOCK_TRENDS.map((t, idx) => {
            const colors = [tokens.colors.successScale, tokens.colors.primaryScale, tokens.colors.warningScale, tokens.colors.infoScale];
            const scale = colors[idx];
            const latest = t.data[t.data.length - 1];
            const prev = t.data[t.data.length - 2];
            const change = prev > 0 ? Math.round(((latest - prev) / prev) * 100) : 0;
            return (
              <div key={idx} style={{ ...cardBase }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[2] }}>
                  <div>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, display: 'block', marginBottom: tokens.spacing[1] }}>{t.label}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{t.unit === '$' ? `$${latest}` : `${latest}${t.unit}`}</span>
                  </div>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: change >= 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600] }}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                  </span>
                </div>
                {renderSparkline(t.data, scale[400])}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: tokens.spacing[6] }}>
          {/* Left: Period Comparison Table */}
          <div style={cardBase}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Period Comparison</Text>
              <span style={{ ...createBadgeStyle(tokens, 'info'), fontSize: tokens.typography.fontSize.xs }}>Last {selectedRange}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 60px 80px 90px 80px 70px', gap: tokens.spacing[2], padding: `${tokens.spacing[1]}px 0`, marginBottom: tokens.spacing[1] }}>
              {['Period', 'Events', 'Attend.', 'Revenue', 'Tickets', 'Rating'].map(h => (
                <span key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
              ))}
            </div>
            {MOCK_PERIODS.map((p, idx) => (
              <div key={idx} onMouseEnter={() => setHoveredRow(idx)} onMouseLeave={() => setHoveredRow(null)} style={{
                display: 'grid', gridTemplateColumns: '100px 60px 80px 90px 80px 70px', gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px 0`,
                borderBottom: idx < MOCK_PERIODS.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                backgroundColor: hoveredRow === idx ? tokens.colors.primaryScale[50] : 'transparent',
                alignItems: 'center', cursor: 'pointer', transition: `background ${tokens.motion.hover}`,
              }}>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{p.period}</span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{p.events}</span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{(p.attendance / 1000).toFixed(1)}K</span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700] }}>{formatCurrency(p.revenue)}</span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{(p.ticketsSold / 1000).toFixed(1)}K</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.warningScale[500] }}>{'★'}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{p.avgSatisfaction}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* Benchmark Rankings */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
                Industry Benchmarks
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {benchmarks.map((b, idx) => {
                  const pct = b.percentile;
                  const barColor = pct >= 80 ? tokens.colors.successScale[500] : pct >= 60 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500];
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{b.metric}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Top</span>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: barColor }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: 6, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: tokens.borderRadius.full, transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Events */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>
                Top Performing Events
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {MOCK_TOP_EVENTS.map((ev, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50],
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: tokens.borderRadius.full,
                      backgroundColor: idx === 0 ? tokens.colors.warningScale[100] : tokens.colors.neutral[100],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                      color: idx === 0 ? tokens.colors.warningScale[700] : tokens.colors.neutral[600], flexShrink: 0,
                    }}>{idx === 0 ? '🏆' : `#${idx + 1}`}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{ev.date} | {ev.attendance.toLocaleString()} attended</span>
                    </div>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], flexShrink: 0 }}>{formatCurrency(ev.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Avg Revenue/Event', value: formatCurrency(Math.round(totalRevenue / totalEvents)), icon: '📊' },
            { label: 'Avg Attendance/Event', value: Math.round(totalAttendance / totalEvents).toLocaleString(), icon: '👥' },
            { label: 'Revenue Growth', value: '+29%', icon: '📈' },
            { label: 'Best Month', value: 'Dec 2025', icon: '🏆' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.icon}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
