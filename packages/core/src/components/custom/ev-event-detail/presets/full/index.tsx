'use client';

/**
 * EvEventDetail - Full Preset
 * Comprehensive event detail view with header, KPI row, ticket breakdown, check-in gauge, timeline
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import type { EvEventDetailProps } from '../../core';

const MOCK_EVENT = {
  id: 'evt-001',
  name: 'Neon Nights Festival',
  description: 'An immersive electronic music experience featuring world-class DJs, stunning light shows, and interactive art installations across three stages.',
  venue: 'Arena Complex',
  dates: [{ date: new Date('2026-03-15'), startTime: '18:00', endTime: '03:00' }, { date: new Date('2026-03-16'), startTime: '16:00', endTime: '02:00' }],
  status: 'live' as const,
  organizer: 'Evnto Productions',
};

const MOCK_TICKETS = {
  totalSold: 3200,
  totalCapacity: 5000,
  revenue: 96000,
  byType: [
    { type: 'General Admission', sold: 2400, total: 3500, price: 25 },
    { type: 'VIP', sold: 650, total: 1000, price: 75 },
    { type: 'Backstage Pass', sold: 150, total: 500, price: 150 },
  ],
};

const MOCK_CHECKIN = { checkedIn: 1840, total: 3200, rate: 57.5 };

const STATUS_CONFIG: Record<string, { color: 'primary' | 'success' | 'warning' | 'error' | 'info'; emoji: string; label: string }> = {
  draft: { color: 'warning', emoji: '\u270F\uFE0F', label: 'Draft' },
  published: { color: 'info', emoji: '\uD83D\uDCE2', label: 'Published' },
  live: { color: 'success', emoji: '\uD83D\uDD34', label: 'Live Now' },
  completed: { color: 'primary', emoji: '\u2705', label: 'Completed' },
};

const TIMELINE_EVENTS = [
  { time: '2 hours ago', label: 'Gate opened - check-ins started', emoji: '\uD83D\uDEAA' },
  { time: '1 hour ago', label: 'DJ Nova started set on Main Stage', emoji: '\uD83C\uDFB5' },
  { time: '30 min ago', label: '1,500 check-ins milestone reached', emoji: '\uD83C\uDF89' },
  { time: '15 min ago', label: 'VIP lounge capacity at 80%', emoji: '\u26A0\uFE0F' },
  { time: 'Just now', label: 'Side Stage lineup starting on time', emoji: '\u2705' },
];

export const FullEvEventDetail = createPreset<EvEventDetailProps>({
  name: 'EvEventDetail.Full',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvEventDetailProps>) => {
    const { Box, Text } = primitives;
    const { event: propEvent, ticketSales: propTickets, checkInProgress: propCheckIn, onEdit, onManageTickets, className, style } = props;

    const event = propEvent && propEvent.name ? propEvent : MOCK_EVENT;
    const tickets = propTickets && propTickets.totalCapacity > 0 ? propTickets : MOCK_TICKETS;
    const checkIn = propCheckIn && propCheckIn.total > 0 ? propCheckIn : MOCK_CHECKIN;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const ticketPct = Math.round((tickets.totalSold / tickets.totalCapacity) * 100);
    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;
    const checkInPct = Math.round(checkIn.rate);
    const formatCurrency = (n: number) => `$${n.toLocaleString()}`;
    const gaugeRadius = 60;
    const gaugeCirc = Math.PI * gaugeRadius;
    const gaugeFill = (checkInPct / 100) * gaugeCirc;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Event Header */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const, marginBottom: tokens.spacing[5] }}>
          <div style={{ height: 140, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative' as const, display: 'flex', alignItems: 'flex-end', padding: tokens.spacing[5] }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                <span style={{ ...createBadgeStyle(tokens, statusCfg.color), backgroundColor: 'rgba(255,255,255,0.2)', color: tokens.colors.common.white, border: '1px solid rgba(255,255,255,0.3)' }}>
                  {statusCfg.emoji} {statusCfg.label}
                </span>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white, display: 'block' }}>{event.name}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: tokens.spacing[1] }}>
                {'\uD83D\uDCCD'} {event.venue} | {'\uD83D\uDCC5'} {(event.dates || []).length} day(s) | {'\uD83C\uDFAC'} {event.organizer}
              </Text>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <div onClick={onEdit} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: 'rgba(255,255,255,0.2)', color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.3)', ...hoverStyle }}>
                {'\u270F\uFE0F'} Edit
              </div>
              <div onClick={onManageTickets} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.common.white, color: tokens.colors.primaryScale[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
                {'\uD83C\uDFAB'} Manage Tickets
              </div>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Tickets Sold', value: tickets.totalSold.toLocaleString(), sub: `of ${tickets.totalCapacity.toLocaleString()}`, emoji: '\uD83C\uDFAB', color: tokens.colors.primaryScale[600] },
            { label: 'Revenue', value: formatCurrency(tickets.revenue), sub: `avg $${Math.round(tickets.revenue / (tickets.totalSold || 1))} per ticket`, emoji: '\uD83D\uDCB0', color: tokens.colors.successScale[600] },
            { label: 'Check-ins', value: checkIn.checkedIn.toLocaleString(), sub: `${checkInPct}% checked in`, emoji: '\uD83D\uDEAA', color: tokens.colors.infoScale[600] },
            { label: 'Capacity Used', value: `${ticketPct}%`, sub: `${(tickets.totalCapacity - tickets.totalSold).toLocaleString()} remaining`, emoji: '\uD83D\uDCC8', color: tickets.totalSold > tickets.totalCapacity * 0.9 ? tokens.colors.warningScale[600] : tokens.colors.primaryScale[600] },
          ].map((kpi, i) => (
            <div key={i} style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{kpi.label}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg }}>{kpi.emoji}</Text>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: kpi.color, display: 'block', marginBottom: tokens.spacing[1] }}>{kpi.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{kpi.sub}</Text>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: tokens.spacing[5], marginBottom: tokens.spacing[5] }}>
          {/* Ticket Breakdown */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{'\uD83C\uDFAB'} Ticket Breakdown</Text>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr>
                  {['Type', 'Price', 'Sold', 'Available', 'Progress', 'Revenue'].map(h => (
                    <th key={h} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.byType.map((t, i) => {
                  const pct = Math.round((t.sold / t.total) * 100);
                  const bar = createProgressBarStyle(tokens, { percent: pct, color: pct >= 90 ? tokens.colors.successScale[500] : pct >= 50 ? tokens.colors.warningScale[500] : tokens.colors.primaryScale[500] });
                  return (
                    <tr key={i}>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{t.type}</Text>
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>${t.price}</Text>
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{t.sold.toLocaleString()}</Text>
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{(t.total - t.sold).toLocaleString()}</Text>
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <div style={{ flex: 1, ...bar.track }}><div style={bar.fill} /></div>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 28 }}>{pct}%</Text>
                        </div>
                      </td>
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700] }}>${(t.sold * t.price).toLocaleString()}</Text>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Check-in Gauge */}
          <div style={{ ...cardBase }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>{'\uD83D\uDEAA'} Check-in Progress</Text>
            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: tokens.spacing[3] }}>
              <div style={{ position: 'relative' as const, width: 140, height: 80 }}>
                <svg width="140" height="80" viewBox="0 0 140 80">
                  <path d={`M 10 75 A ${gaugeRadius} ${gaugeRadius} 0 0 1 130 75`} fill="none" stroke={tokens.colors.neutral[100]} strokeWidth="10" strokeLinecap="round" />
                  <path d={`M 10 75 A ${gaugeRadius} ${gaugeRadius} 0 0 1 130 75`} fill="none" stroke={tokens.colors.primaryScale[500]} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${gaugeFill} ${gaugeCirc}`} />
                </svg>
                <div style={{ position: 'absolute' as const, bottom: 0, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>{checkInPct}%</Text>
                </div>
              </div>
              <div style={{ textAlign: 'center' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{checkIn.checkedIn.toLocaleString()} / {checkIn.total.toLocaleString()}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>attendees checked in</Text>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {[
                  { label: 'Pending', value: (checkIn.total - checkIn.checkedIn).toLocaleString(), color: tokens.colors.warningScale[600] },
                  { label: 'No-shows (est.)', value: Math.round(checkIn.total * 0.05).toLocaleString(), color: tokens.colors.errorScale[600] },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[50] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{item.label}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: item.color }}>{item.value}</Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div style={{ ...cardBase }}>
          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>{'\uD83D\uDCCB'} Live Activity</Text>
          <div style={{ display: 'flex', flexDirection: 'column' as const }}>
            {TIMELINE_EVENTS.map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px 0` }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', width: 24 }}>
                  <div style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: i === TIMELINE_EVENTS.length - 1 ? tokens.colors.primaryScale[100] : tokens.colors.neutral[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, flexShrink: 0, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${i === TIMELINE_EVENTS.length - 1 ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}` }}>
                    {ev.emoji}
                  </div>
                  {i < TIMELINE_EVENTS.length - 1 && <div style={{ width: 2, flex: 1, backgroundColor: tokens.colors.neutral[200], minHeight: 16 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], display: 'block' }}>{ev.label}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{ev.time}</Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Box>
    );
  },
});
