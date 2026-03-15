'use client';

/**
 * EvEventDetail - Compact Preset
 * Composes PatternStatsGrid + PatternDataTable for condensed event detail
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
import { createBadgeStyle, createProgressBarStyle, createCardStyle, createHoverStyle } from '../../../helpers';
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

const STATUS_CONFIG: Record<string, { color: 'primary' | 'success' | 'warning' | 'error' | 'info'; label: string }> = {
  draft: { color: 'warning', label: 'Draft' },
  published: { color: 'info', label: 'Published' },
  live: { color: 'success', label: 'Live Now' },
  completed: { color: 'primary', label: 'Completed' },
};

type TicketRow = { type: string; sold: number; total: number; price: number };

const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

export const CompactEvEventDetail = createPreset<EvEventDetailProps>({
  name: 'EvEventDetail.Compact',
  render: ({ primitives, props, tokens }: PresetContext<EvEventDetailProps>) => {
    const { Box, Text } = primitives;
    const { event: propEvent, ticketSales: propTickets, checkInProgress: propCheckIn, onEdit, onManageTickets, className, style } = props;

    const event = propEvent && propEvent.name ? propEvent : MOCK_EVENT;
    const tickets = propTickets && propTickets.totalCapacity > 0 ? propTickets : MOCK_TICKETS;
    const checkIn = propCheckIn && propCheckIn.total > 0 ? propCheckIn : MOCK_CHECKIN;

    const ticketPct = Math.round((tickets.totalSold / tickets.totalCapacity) * 100);
    const checkInPct = Math.round(checkIn.rate);
    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const kpiStats = useMemo((): StatDef[] => [
      { key: 'tickets', label: 'Tickets Sold', value: `${tickets.totalSold.toLocaleString()}/${tickets.totalCapacity.toLocaleString()}`, color: tokens.colors.primaryScale[600] },
      { key: 'revenue', label: 'Revenue', value: formatCurrency(tickets.revenue), color: tokens.colors.successScale[600] },
      { key: 'checkins', label: 'Check-ins', value: `${checkIn.checkedIn.toLocaleString()} (${checkInPct}%)`, color: tokens.colors.infoScale[600] },
      { key: 'remaining', label: 'Remaining', value: (tickets.totalCapacity - tickets.totalSold).toLocaleString(), color: tokens.colors.warningScale[600] },
    ], [tickets, checkIn, checkInPct, tokens]);

    const ticketColumns = useMemo(() => columns<TicketRow>([
      column<TicketRow, 'type'>('type', { header: 'Type' }),
      column<TicketRow, 'price'>('price', {
        header: 'Price',
        render: (_v, row) => <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>${row.price}</Text>,
      }),
      {
        key: 'progress',
        header: 'Progress',
        accessorFn: (row: TicketRow) => Math.round((row.sold / row.total) * 100),
        render: (_v: unknown, row: TicketRow) => {
          const pct = Math.round((row.sold / row.total) * 100);
          const bar = createProgressBarStyle(tokens, { percent: pct });
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{ flex: 1, ...bar.track }}><div style={bar.fill} /></div>
            </div>
          );
        },
      } as ColumnDef<TicketRow>,
      {
        key: 'soldTotal',
        header: 'Sold/Total',
        accessorFn: (row: TicketRow) => row.sold,
        render: (_v: unknown, row: TicketRow) => (
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{row.sold}/{row.total}</Text>
        ),
      } as ColumnDef<TicketRow>,
      {
        key: 'ticketRevenue',
        header: 'Revenue',
        accessorFn: (row: TicketRow) => row.sold * row.price,
        render: (_v: unknown, row: TicketRow) => (
          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700] }}>${(row.sold * row.price).toLocaleString()}</Text>
        ),
      } as ColumnDef<TicketRow>,
    ]), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], ...style }}>
        {/* Header */}
        <div style={{ ...cardBase }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{event.name}</Text>
                <span style={createBadgeStyle(tokens, statusCfg.color)}>{statusCfg.label}</span>
              </div>
              <div style={{ display: 'flex', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{event.venue}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{(event.dates || []).length} day(s)</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{event.organizer}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <div onClick={onEdit} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', ...hoverStyle }}>Edit</div>
              <div onClick={onManageTickets} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>Tickets</div>
            </div>
          </div>
          <PatternStatsGrid stats={kpiStats} columns={4} variant="filled" />
        </div>

        {/* Ticket Types Table */}
        <PatternDataTable
          data={tickets.byType}
          columns={ticketColumns}
          rowKey="type"
          compact
        />
      </Box>
    );
  },
});
