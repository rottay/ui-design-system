'use client';

/**
 * EvRevenueMonitor - Realtime Preset
 * Live revenue counter, source breakdown bars, hourly trend chart,
 * live transaction feed, source percentage cards, and KPI stats
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
import type { EvRevenueMonitorProps, RevenueStream, RevenueTrend } from '../../core';

const MOCK_STREAMS: RevenueStream[] = [
  { source: 'Ticket Sales', amount: 98500, percentage: 53, trend: 'up', color: '#6366f1' },
  { source: 'Bar Revenue', amount: 42300, percentage: 23, trend: 'up', color: '#10b981' },
  { source: 'Tips', amount: 18200, percentage: 10, trend: 'flat', color: '#f59e0b' },
  { source: 'Merchandise', amount: 15800, percentage: 9, trend: 'down', color: '#ec4899' },
  { source: 'VIP Packages', amount: 10200, percentage: 5, trend: 'up', color: '#8b5cf6' },
];

const MOCK_TRENDS: RevenueTrend[] = [
  { date: '18:00', tickets: 12000, bar: 2100, tips: 800, merchandise: 1200, total: 16100 },
  { date: '19:00', tickets: 18500, bar: 5200, tips: 1800, merchandise: 2100, total: 27600 },
  { date: '20:00', tickets: 22000, bar: 8400, tips: 3200, merchandise: 3400, total: 37000 },
  { date: '21:00', tickets: 19800, bar: 9800, tips: 4100, merchandise: 3800, total: 37500 },
  { date: '22:00', tickets: 14200, bar: 8900, tips: 4500, merchandise: 2800, total: 30400 },
  { date: '23:00', tickets: 8000, bar: 5600, tips: 2800, merchandise: 1700, total: 18100 },
  { date: '00:00', tickets: 4000, bar: 2300, tips: 1000, merchandise: 800, total: 8100 },
];

const MOCK_TRANSACTIONS = [
  { id: 't1', type: 'Ticket', amount: 55, time: '11:42 PM', method: 'Card' },
  { id: 't2', type: 'Bar', amount: 28, time: '11:40 PM', method: 'Cash' },
  { id: 't3', type: 'VIP', amount: 120, time: '11:38 PM', method: 'Card' },
  { id: 't4', type: 'Merch', amount: 35, time: '11:35 PM', method: 'Card' },
  { id: 't5', type: 'Bar', amount: 42, time: '11:33 PM', method: 'Card' },
  { id: 't6', type: 'Tip', amount: 15, time: '11:31 PM', method: 'Cash' },
  { id: 't7', type: 'Ticket', amount: 55, time: '11:28 PM', method: 'Card' },
  { id: 't8', type: 'Bar', amount: 18, time: '11:25 PM', method: 'Cash' },
];

export const RealtimeEvRevenueMonitor = createPreset<EvRevenueMonitorProps>({
  name: 'EvRevenueMonitor.Realtime',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvRevenueMonitorProps>) => {
    const { Box, Text } = primitives;
    const { streams, trends, totalRevenue, currency = 'USD', onExport, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const sourceData = streams?.length ? streams : MOCK_STREAMS;
    const trendData = trends?.length ? trends : MOCK_TRENDS;
    const total = totalRevenue || sourceData.reduce((s, r) => s + r.amount, 0);
    const maxHour = Math.max(...trendData.map(t => t.total), 1);
    const [selectedSource, setSelectedSource] = useState<string | null>(null);
    const [hoveredTx, setHoveredTx] = useState<string | null>(null);
    const trendIcon = (t: string) => t === 'up' ? '\u2191' : t === 'down' ? '\u2193' : '\u2192';
    const trendColor = (t: string) => t === 'up' ? tokens.colors.successScale[600] : t === 'down' ? tokens.colors.errorScale[600] : tokens.colors.neutral[500];

    // Hourly growth
    const growth = trendData.length >= 2 ? ((trendData[trendData.length - 1].total - trendData[0].total) / Math.max(trendData[0].total, 1) * 100).toFixed(1) : '0';
    const peakHour = trendData.reduce((max, t) => t.total > max.total ? t : max, trendData[0]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              Live Revenue Monitor
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[500], animation: 'pulse 2s infinite' }} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.successScale[600] }}>Live</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Event: Neon Nights 2026</Text>
            </div>
          </div>
          <button onClick={onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>
            Export Report
          </button>
        </div>

        {/* Big Revenue Counter */}
        <div style={{ ...cardBase, padding: tokens.spacing[6], marginBottom: tokens.spacing[5], textAlign: 'center' as const, background: `linear-gradient(135deg, ${tokens.colors.primaryScale[600]}, ${tokens.colors.primaryScale[800]})` }}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.primaryScale[200], display: 'block', marginBottom: tokens.spacing[2] }}>TOTAL REVENUE</Text>
          <Text style={{ fontSize: 48, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white, display: 'block', letterSpacing: -1 }}>${total.toLocaleString()}</Text>
          <div style={{ display: 'flex', justifyContent: 'center', gap: tokens.spacing[6], marginTop: tokens.spacing[3] }}>
            <div><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[200] }}>Peak Hour</Text><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white, display: 'block' }}>{peakHour?.date} (${(peakHour?.total / 1000).toFixed(0)}K)</Text></div>
            <div><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[200] }}>Sources</Text><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white, display: 'block' }}>{sourceData.length} active</Text></div>
            <div><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[200] }}>Trend</Text><Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white, display: 'block' }}>{growth}%</Text></div>
          </div>
        </div>

        {/* Source Breakdown + Hourly Trend */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {/* Source Breakdown */}
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Revenue by Source</Text>
            {sourceData.map(src => {
              const bar = createProgressBarStyle(tokens, { percent: src.percentage, color: src.color });
              const isSelected = selectedSource === src.source;
              return (
                <div key={src.source} onClick={() => setSelectedSource(isSelected ? null : src.source)} style={{ marginBottom: tokens.spacing[3], cursor: 'pointer', opacity: selectedSource && !isSelected ? 0.5 : 1, transition: 'opacity 0.15s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <div style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: src.color }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{src.source}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${src.amount.toLocaleString()}</Text>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: trendColor(src.trend), fontWeight: tokens.typography.fontWeight.bold }}>{trendIcon(src.trend)}</span>
                    </div>
                  </div>
                  <div style={bar.track}><div style={bar.fill} /></div>
                </div>
              );
            })}
          </div>

          {/* Hourly Trend */}
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Hourly Revenue</Text>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[1], height: 160 }}>
              {trendData.map(t => {
                const h = Math.round((t.total / maxHour) * 140);
                const isPeak = t.total === maxHour;
                return (
                  <div key={t.date} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Text style={{ fontSize: 9, color: tokens.colors.neutral[500], whiteSpace: 'nowrap' as const }}>${(t.total / 1000).toFixed(0)}K</Text>
                    <div style={{ width: '100%', height: h, borderRadius: `${tokens.borderRadius.sm}px ${tokens.borderRadius.sm}px 0 0`, backgroundColor: isPeak ? tokens.colors.primaryScale[600] : tokens.colors.primaryScale[300], transition: 'height 0.3s ease' }} />
                    <Text style={{ fontSize: 9, color: tokens.colors.neutral[500] }}>{t.date}</Text>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Source Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${sourceData.length}, 1fr)`, gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {sourceData.map(src => (
            <div key={src.source} style={{ ...cardBase, padding: tokens.spacing[3], borderTop: `3px solid ${src.color}`, textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{src.source}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{src.percentage}%</Text>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: trendColor(src.trend), fontWeight: tokens.typography.fontWeight.semibold }}>{trendIcon(src.trend)} {src.trend}</span>
            </div>
          ))}
        </div>

        {/* Live Transaction Feed */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[500] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Live Transactions</Text>
            </div>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{MOCK_TRANSACTIONS.length} recent</Text>
          </div>
          {MOCK_TRANSACTIONS.map((tx, i) => (
            <div key={tx.id} onMouseEnter={() => setHoveredTx(tx.id)} onMouseLeave={() => setHoveredTx(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderBottom: i < MOCK_TRANSACTIONS.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none', backgroundColor: hoveredTx === tx.id ? tokens.colors.neutral[50] : 'transparent', transition: 'background-color 0.15s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <span style={createBadgeStyle(tokens, tx.type === 'Bar' ? 'success' : tx.type === 'VIP' ? 'primary' : tx.type === 'Tip' ? 'warning' : 'info')}>{tx.type}</span>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{tx.method}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>+${tx.amount}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{tx.time}</Text>
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
