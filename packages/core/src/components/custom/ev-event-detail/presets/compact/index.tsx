'use client';

/**
 * EvEventDetail - Compact Preset
 * Condensed event detail with key stats and quick actions
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { EvEventDetailProps } from '../../core';

const MOCK_EVENT = {
  id: 'evt-001', name: 'Neon Nights Festival',
  description: 'An immersive electronic music experience.',
  venue: 'Arena Complex',
  dates: [{ date: new Date('2026-03-15'), startTime: '18:00', endTime: '03:00' }, { date: new Date('2026-03-16'), startTime: '16:00', endTime: '02:00' }],
  status: 'live' as const, organizer: 'Evnto Productions',
};

const MOCK_TICKETS = {
  totalSold: 3200, totalCapacity: 5000, revenue: 96000,
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

export const CompactEvEventDetail = createPreset<EvEventDetailProps>({
  name: 'EvEventDetail.Compact',
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
    const checkInPct = Math.round(checkIn.rate);
    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;
    const ticketProgress = useMemo(() => createProgressBarStyle(tokens, { percent: ticketPct }), [tokens, ticketPct]);
    const checkInProgress = useMemo(() => createProgressBarStyle(tokens, { percent: checkInPct, color: tokens.colors.infoScale[500] }), [tokens, checkInPct]);
    const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{event.name}</Text>
                <span style={createBadgeStyle(tokens, statusCfg.color)}>{statusCfg.emoji} {statusCfg.label}</span>
              </div>
              <div style={{ display: 'flex', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{'\uD83D\uDCCD'} {event.venue}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{'\uD83D\uDCC5'} {(event.dates || []).length} day(s)</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{'\uD83C\uDFAC'} {event.organizer}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <div onClick={onEdit} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', ...hoverStyle }}>{'\u270F\uFE0F'} Edit</div>
              <div onClick={onManageTickets} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>{'\uD83C\uDFAB'} Tickets</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
            {[
              { label: 'Tickets Sold', value: `${tickets.totalSold.toLocaleString()}/${tickets.totalCapacity.toLocaleString()}`, emoji: '\uD83C\uDFAB', color: tokens.colors.primaryScale[600] },
              { label: 'Revenue', value: formatCurrency(tickets.revenue), emoji: '\uD83D\uDCB0', color: tokens.colors.successScale[600] },
              { label: 'Check-ins', value: `${checkIn.checkedIn.toLocaleString()} (${checkInPct}%)`, emoji: '\uD83D\uDEAA', color: tokens.colors.infoScale[600] },
              { label: 'Remaining', value: (tickets.totalCapacity - tickets.totalSold).toLocaleString(), emoji: '\uD83D\uDCCA', color: tokens.colors.warningScale[600] },
            ].map((stat, i) => (
              <div key={i} style={{ padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50], textAlign: 'center' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, display: 'block' }}>{stat.emoji}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: stat.color, display: 'block' }}>{stat.value}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          <div style={{ ...cardBase }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>{'\uD83C\uDFAB'} Ticket Sales</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{ticketPct}%</Text>
            </div>
            <div style={ticketProgress.track}><div style={ticketProgress.fill} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{tickets.totalSold.toLocaleString()} sold</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{tickets.totalCapacity.toLocaleString()} total</Text>
            </div>
          </div>
          <div style={{ ...cardBase }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600] }}>{'\uD83D\uDEAA'} Check-in Rate</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.infoScale[600] }}>{checkInPct}%</Text>
            </div>
            <div style={checkInProgress.track}><div style={checkInProgress.fill} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{checkIn.checkedIn.toLocaleString()} in</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{checkIn.total.toLocaleString()} total</Text>
            </div>
          </div>
        </div>

        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Ticket Types</Text>
          </div>
          {tickets.byType.map((t, i) => {
            const pct = Math.round((t.sold / t.total) * 100);
            const bar = createProgressBarStyle(tokens, { percent: pct });
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: i < tickets.byType.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], minWidth: 140 }}>{t.type}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 45 }}>${t.price}</Text>
                <div style={{ flex: 1, ...bar.track }}><div style={bar.fill} /></div>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], minWidth: 70, textAlign: 'right' as const }}>{t.sold}/{t.total}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700], minWidth: 60, textAlign: 'right' as const }}>${(t.sold * t.price).toLocaleString()}</Text>
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
