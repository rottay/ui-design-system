'use client';

/**
 * EvRevenueMonitor - Historical Preset
 * Period selector, event comparison bars, source breakdown table,
 * KPI summary cards, growth analysis, and export functionality
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
  { source: 'Ticket Sales', amount: 245000, percentage: 52, trend: 'up', color: '#6366f1' },
  { source: 'Bar Revenue', amount: 112000, percentage: 24, trend: 'up', color: '#10b981' },
  { source: 'Tips', amount: 42000, percentage: 9, trend: 'flat', color: '#f59e0b' },
  { source: 'Merchandise', amount: 38000, percentage: 8, trend: 'down', color: '#ec4899' },
  { source: 'VIP Packages', amount: 33000, percentage: 7, trend: 'up', color: '#8b5cf6' },
];

const MOCK_EVENTS = [
  { name: 'Neon Nights', date: 'Feb 8', total: 185000, tickets: 98500, bar: 42300, tips: 18200, merch: 15800, vip: 10200 },
  { name: 'Sunset Festival', date: 'Jan 25', total: 142000, tickets: 72000, bar: 35000, tips: 14000, merch: 12000, vip: 9000 },
  { name: 'Bass Drop', date: 'Jan 18', total: 96000, tickets: 48000, bar: 24000, tips: 9500, merch: 8500, vip: 6000 },
  { name: 'Rooftop Vibes', date: 'Jan 11', total: 47000, tickets: 26500, bar: 10700, tips: 3800, merch: 3500, vip: 2500 },
  { name: 'NYE Bash', date: 'Dec 31', total: 210000, tickets: 112000, bar: 48000, tips: 22000, merch: 16000, vip: 12000 },
  { name: 'Winter Glow', date: 'Dec 20', total: 78000, tickets: 42000, bar: 18000, tips: 7500, merch: 6500, vip: 4000 },
];

export const HistoricalEvRevenueMonitor = createPreset<EvRevenueMonitorProps>({
  name: 'EvRevenueMonitor.Historical',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvRevenueMonitorProps>) => {
    const { Box, Text } = primitives;
    const { streams, totalRevenue, onExport, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const sourceData = streams?.length ? streams : MOCK_STREAMS;
    const total = totalRevenue || sourceData.reduce((s, r) => s + r.amount, 0);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const periods = ['week', 'month', 'quarter', 'year'];
    const maxEvent = Math.max(...MOCK_EVENTS.map(e => e.total), 1);

    // Growth calculation
    const avgRevenue = Math.round(MOCK_EVENTS.reduce((s, e) => s + e.total, 0) / MOCK_EVENTS.length);
    const bestEvent = MOCK_EVENTS.reduce((best, e) => e.total > best.total ? e : best, MOCK_EVENTS[0]);
    const trendIcon = (t: string) => t === 'up' ? '\u2191' : t === 'down' ? '\u2193' : '\u2192';
    const trendColor = (t: string) => t === 'up' ? tokens.colors.successScale[600] : t === 'down' ? tokens.colors.errorScale[600] : tokens.colors.neutral[500];

    // Source aggregation from events
    const sourceAggregates = useMemo(() => {
      const totals = { tickets: 0, bar: 0, tips: 0, merch: 0, vip: 0 };
      MOCK_EVENTS.forEach(e => { totals.tickets += e.tickets; totals.bar += e.bar; totals.tips += e.tips; totals.merch += e.merch; totals.vip += e.vip; });
      const grand = Object.values(totals).reduce((s, v) => s + v, 0);
      return [
        { name: 'Tickets', value: totals.tickets, pct: Math.round((totals.tickets / grand) * 100), color: '#6366f1' },
        { name: 'Bar', value: totals.bar, pct: Math.round((totals.bar / grand) * 100), color: '#10b981' },
        { name: 'Tips', value: totals.tips, pct: Math.round((totals.tips / grand) * 100), color: '#f59e0b' },
        { name: 'Merch', value: totals.merch, pct: Math.round((totals.merch / grand) * 100), color: '#ec4899' },
        { name: 'VIP', value: totals.vip, pct: Math.round((totals.vip / grand) * 100), color: '#8b5cf6' },
      ];
    }, []);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              Revenue History
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Performance across {MOCK_EVENTS.length} events</Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
            {periods.map(p => (
              <div key={p} onClick={() => setSelectedPeriod(p)} style={createFilterPillStyle(tokens, { active: selectedPeriod === p })}>{p.charAt(0).toUpperCase() + p.slice(1)}</div>
            ))}
            <button onClick={onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', marginLeft: tokens.spacing[2] }}>Export CSV</button>
          </div>
        </div>

        {/* Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Total Revenue', value: `$${total.toLocaleString()}`, sub: `${MOCK_EVENTS.length} events`, color: tokens.colors.primaryScale[600] },
            { label: 'Avg per Event', value: `$${avgRevenue.toLocaleString()}`, sub: 'this period', color: tokens.colors.infoScale[600] },
            { label: 'Best Event', value: bestEvent.name, sub: `$${bestEvent.total.toLocaleString()}`, color: tokens.colors.successScale[600] },
            { label: 'Growth', value: '+18.2%', sub: 'vs last period', color: tokens.colors.successScale[600] },
          ].map(kpi => (
            <div key={kpi.label} style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{kpi.label}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: kpi.color, display: 'block' }}>{kpi.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{kpi.sub}</Text>
            </div>
          ))}
        </div>

        {/* Event Comparison Chart + Source Mix */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          {/* Event Comparison */}
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Event Revenue Comparison</Text>
            {MOCK_EVENTS.map((evt, i) => {
              const pct = Math.round((evt.total / maxEvent) * 100);
              const bar = createProgressBarStyle(tokens, { percent: pct, color: tokens.colors.primaryScale[500] });
              const isHovered = hoveredEvent === evt.name;
              const isSelected = selectedEvent === evt.name;
              return (
                <div key={i} onClick={() => setSelectedEvent(isSelected ? null : evt.name)} onMouseEnter={() => setHoveredEvent(evt.name)} onMouseLeave={() => setHoveredEvent(null)} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3], cursor: 'pointer', opacity: selectedEvent && !isSelected ? 0.5 : 1, padding: `${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: isHovered ? tokens.colors.primaryScale[50] : 'transparent' }}>
                  <div style={{ width: 120, flexShrink: 0 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{evt.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{evt.date}</Text>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...bar.track, height: 24 }}><div style={{ ...bar.fill, height: '100%' }} /></div>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], width: 80, textAlign: 'right' as const }}>${(evt.total / 1000).toFixed(0)}K</Text>
                </div>
              );
            })}
          </div>

          {/* Source Mix */}
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Revenue Mix</Text>
            {sourceAggregates.map(src => {
              const bar = createProgressBarStyle(tokens, { percent: src.pct, color: src.color });
              return (
                <div key={src.name} style={{ marginBottom: tokens.spacing[3] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: src.color }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{src.name}</Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{src.pct}%</Text>
                  </div>
                  <div style={bar.track}><div style={bar.fill} /></div>
                  <Text style={{ fontSize: 10, color: tokens.colors.neutral[400], marginTop: 2 }}>${(src.value / 1000).toFixed(0)}K total</Text>
                </div>
              );
            })}
            {/* Source trend badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1], marginTop: tokens.spacing[3], paddingTop: tokens.spacing[3], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
              {sourceData.map(s => (
                <span key={s.source} style={{ fontSize: tokens.typography.fontSize.xs, color: trendColor(s.trend), fontWeight: tokens.typography.fontWeight.semibold, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: s.trend === 'up' ? tokens.colors.successScale[50] : s.trend === 'down' ? tokens.colors.errorScale[50] : tokens.colors.neutral[100] }}>
                  {trendIcon(s.trend)} {s.source}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Source Comparison Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Revenue by Source per Event</Text>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr>
                {['Event', 'Tickets', 'Bar', 'Tips', 'Merch', 'VIP', 'Total'].map(h => (
                  <th key={h} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: h === 'Event' ? 'left' as const : 'right' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_EVENTS.map((evt, i) => {
                const isRowHovered = hoveredEvent === evt.name;
                return (
                  <tr key={i} onMouseEnter={() => setHoveredEvent(evt.name)} onMouseLeave={() => setHoveredEvent(null)} style={{ backgroundColor: isRowHovered ? tokens.colors.primaryScale[50] : 'transparent', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>{evt.name}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, textAlign: 'right' as const }}>${evt.tickets.toLocaleString()}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, textAlign: 'right' as const }}>${evt.bar.toLocaleString()}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, textAlign: 'right' as const }}>${evt.tips.toLocaleString()}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, textAlign: 'right' as const }}>${evt.merch.toLocaleString()}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, textAlign: 'right' as const }}>${evt.vip.toLocaleString()}</td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, textAlign: 'right' as const }}>${evt.total.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
