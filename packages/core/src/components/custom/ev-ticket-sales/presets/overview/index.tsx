'use client';

/**
 * EvTicketSales - Overview Preset
 * KPI dashboard with capacity gauge, sparkline, and ticket type breakdown cards
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
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
  render: ({ primitives, props, tokens, engine }: PresetContext<EvTicketSalesProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const kpis = props.kpis ?? MOCK_KPIS;
    const breakdown = props.breakdown ?? MOCK_BREAKDOWN;
    const trends = props.trends ?? MOCK_TRENDS;
    const capacityPercent = props.capacityPercent ?? 64;

    const formatValue = (kpi: SalesKpi) => {
      if (kpi.currency) return `${kpi.currency}${kpi.value.toLocaleString()}`;
      if (kpi.label === 'Conversion') return `${kpi.value}%`;
      return kpi.value.toLocaleString();
    };

    const trendColor = (trend: string) =>
      trend === 'up' ? tokens.colors.successScale[600] : trend === 'down' ? tokens.colors.errorScale[600] : tokens.colors.neutral[500];
    const trendIcon = (trend: string) => trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192';

    // Sparkline
    const maxTrend = Math.max(...trends.map(t => t.count));
    const sparkPts = trends.map((t, i) => {
      const x = (i / (trends.length - 1)) * 200;
      const y = 40 - (t.count / maxTrend) * 36;
      return `${x},${y}`;
    }).join(' ');

    // Capacity gauge
    const gaugeR = 52;
    const gaugeC = 2 * Math.PI * gaugeR;
    const gaugeOff = gaugeC - (capacityPercent / 100) * gaugeC;
    const gaugeClr = capacityPercent > 85 ? tokens.colors.errorScale[500]
      : capacityPercent > 60 ? tokens.colors.warningScale[500]
        : tokens.colors.successScale[500];

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
              Ticket Sales
            </h2>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              Real-time overview for Neon Nights Festival
            </span>
          </div>
          {props.onExport && (
            <button onClick={props.onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>
              Export Report
            </button>
          )}
        </Box>

        {/* KPI Row */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
          {kpis.map((kpi, idx) => (
            <Box key={idx} style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}>
                {kpi.label}
              </span>
              <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                {formatValue(kpi)}
              </span>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: trendColor(kpi.trend) }}>
                  {trendIcon(kpi.trend)} {kpi.trendValue}%
                </span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>vs last week</span>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Middle row: Capacity Gauge + Sparkline */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: tokens.spacing[3] }}>
          {/* Capacity Gauge */}
          <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={sectionHeader}>Venue Capacity</span>
            <Box style={{ position: 'relative', width: 130, height: 130 }}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r={gaugeR} fill="none" stroke={tokens.colors.neutral[100]} strokeWidth="10" />
                <circle cx="65" cy="65" r={gaugeR} fill="none" stroke={gaugeClr} strokeWidth="10"
                  strokeDasharray={gaugeC} strokeDashoffset={gaugeOff} strokeLinecap="round"
                  transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
              </svg>
              <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{capacityPercent}%</div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>filled</div>
              </Box>
            </Box>
            <Box style={{ display: 'flex', gap: tokens.spacing[3], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              <span>3,200 / 5,000</span>
              <span style={{ color: gaugeClr, fontWeight: tokens.typography.fontWeight.semibold }}>
                {capacityPercent > 85 ? 'Near Full' : capacityPercent > 60 ? 'Filling Up' : 'Available'}
              </span>
            </Box>
          </Box>

          {/* Sales Trend Sparkline */}
          <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={sectionHeader}>Sales Trend</span>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Last 7 days</span>
            </Box>
            <Box style={{ flex: 1, minHeight: 60 }}>
              <svg width="100%" height="50" viewBox="0 0 200 44" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="evts-sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tokens.colors.primaryScale[400]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={tokens.colors.primaryScale[400]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <polygon points={`0,44 ${sparkPts} 200,44`} fill="url(#evts-sparkFill)" />
                <polyline points={sparkPts} fill="none" stroke={tokens.colors.primaryScale[500]} strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </Box>
            <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${trends.length}, 1fr)`, gap: tokens.spacing[1] }}>
              {trends.map((t, i) => (
                <Box key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{t.date}</div>
                  <div style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{t.count}</div>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Ticket Type Breakdown Cards */}
        <Box>
          <span style={{ ...sectionHeader, display: 'block', marginBottom: tokens.spacing[3] }}>Ticket Type Breakdown</span>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3] }}>
            {breakdown.map((ticket, idx) => {
              const percent = Math.round((ticket.sold / ticket.total) * 100);
              const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'> = { primary: 'primary', secondary: 'secondary', warning: 'warning', success: 'success', error: 'error', info: 'info' };
              const badgeColor = colorMap[ticket.color] ?? 'primary';
              const scaleKey = `${badgeColor}Scale` as keyof typeof tokens.colors;
              const scale = (tokens.colors as any)[scaleKey] ?? tokens.colors.primaryScale;
              const pbar = createProgressBarStyle(tokens, { color: scale[500], percent });

              return (
                <Box key={idx} style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: scale[500], display: 'inline-block' }} />
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{ticket.type}</span>
                    </Box>
                    <span style={createBadgeStyle(tokens, badgeColor)}>${ticket.price}</span>
                  </Box>
                  <Box style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.fontSize.sm }}>
                    <span style={{ color: tokens.colors.neutral[600] }}>{ticket.sold.toLocaleString()} / {ticket.total.toLocaleString()} sold</span>
                    <span style={{ color: tokens.colors.neutral[900], fontWeight: tokens.typography.fontWeight.semibold }}>${ticket.revenue.toLocaleString()}</span>
                  </Box>
                  <Box style={pbar.track}><Box style={pbar.fill} /></Box>
                  <Box style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                    <span>{percent}% sold</span>
                    <span>{ticket.total - ticket.sold} remaining</span>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
