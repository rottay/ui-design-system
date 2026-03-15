'use client';

/**
 * EvEventDetail - Full Preset
 * Composes PatternDetailPanel + PatternStatsGrid + PatternDataTable + PatternTimeline
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  PatternDetailPanel,
  PatternStatsGrid,
  PatternDataTable,
  PatternTimeline,
  column,
  columns,
} from '../../../../patterns';
import type { StatDef, DetailTab, DetailAction, TimelineItem, ColumnDef } from '../../../../patterns';
import { createBadgeStyle, createProgressBarStyle } from '../../../helpers';
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

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  draft: { color: 'warning', label: 'Draft' },
  published: { color: 'info', label: 'Published' },
  live: { color: 'success', label: 'Live Now' },
  completed: { color: 'primary', label: 'Completed' },
};

const TIMELINE_EVENTS: TimelineItem[] = [
  { key: 't1', timestamp: new Date(Date.now() - 7200000), title: 'Gate opened - check-ins started', type: 'info' },
  { key: 't2', timestamp: new Date(Date.now() - 3600000), title: 'DJ Nova started set on Main Stage', type: 'success' },
  { key: 't3', timestamp: new Date(Date.now() - 1800000), title: '1,500 check-ins milestone reached', type: 'success' },
  { key: 't4', timestamp: new Date(Date.now() - 900000), title: 'VIP lounge capacity at 80%', type: 'warning' },
  { key: 't5', timestamp: new Date(), title: 'Side Stage lineup starting on time', type: 'info' },
];

const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

type TicketRow = { type: string; sold: number; total: number; price: number };

export const FullEvEventDetail = createPreset<EvEventDetailProps>({
  name: 'EvEventDetail.Full',
  render: ({ primitives, props, tokens }: PresetContext<EvEventDetailProps>) => {
    const { Box, Text } = primitives;
    const { event: propEvent, ticketSales: propTickets, checkInProgress: propCheckIn, onEdit, onManageTickets, className, style } = props;

    const event = propEvent && propEvent.name ? propEvent : MOCK_EVENT;
    const tickets = propTickets && propTickets.totalCapacity > 0 ? propTickets : MOCK_TICKETS;
    const checkIn = propCheckIn && propCheckIn.total > 0 ? propCheckIn : MOCK_CHECKIN;

    const ticketPct = Math.round((tickets.totalSold / tickets.totalCapacity) * 100);
    const checkInPct = Math.round(checkIn.rate);
    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;

    const kpiStats = useMemo((): StatDef[] => [
      { key: 'tickets', label: 'Tickets Sold', value: tickets.totalSold.toLocaleString(), description: `of ${tickets.totalCapacity.toLocaleString()}`, color: tokens.colors.primaryScale[600] },
      { key: 'revenue', label: 'Revenue', value: formatCurrency(tickets.revenue), description: `avg $${Math.round(tickets.revenue / (tickets.totalSold || 1))} per ticket`, color: tokens.colors.successScale[600] },
      { key: 'checkins', label: 'Check-ins', value: checkIn.checkedIn.toLocaleString(), description: `${checkInPct}% checked in`, color: tokens.colors.infoScale[600] },
      { key: 'capacity', label: 'Capacity Used', value: `${ticketPct}%`, description: `${(tickets.totalCapacity - tickets.totalSold).toLocaleString()} remaining`, color: tokens.colors.warningScale[600] },
    ], [tickets, checkIn, checkInPct, ticketPct, tokens]);

    const ticketColumns = useMemo(() => columns<TicketRow>([
      column<TicketRow, 'type'>('type', { header: 'Type', sortable: true }),
      column<TicketRow, 'price'>('price', {
        header: 'Price',
        render: (_v, row) => <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>${row.price}</Text>,
      }),
      column<TicketRow, 'sold'>('sold', {
        header: 'Sold',
        render: (_v, row) => <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{row.sold.toLocaleString()}</Text>,
      }),
      {
        key: 'available',
        header: 'Available',
        accessorFn: (row: TicketRow) => row.total - row.sold,
        render: (_v: unknown, row: TicketRow) => <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{(row.total - row.sold).toLocaleString()}</Text>,
      } as ColumnDef<TicketRow>,
      {
        key: 'progress',
        header: 'Progress',
        minWidth: 120,
        accessorFn: (row: TicketRow) => Math.round((row.sold / row.total) * 100),
        render: (_v: unknown, row: TicketRow) => {
          const pct = Math.round((row.sold / row.total) * 100);
          const bar = createProgressBarStyle(tokens, { percent: pct, color: pct >= 90 ? tokens.colors.successScale[500] : pct >= 50 ? tokens.colors.warningScale[500] : tokens.colors.primaryScale[500] });
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{ flex: 1, ...bar.track }}><div style={bar.fill} /></div>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 28 }}>{pct}%</Text>
            </div>
          );
        },
      } as ColumnDef<TicketRow>,
      {
        key: 'ticketRevenue',
        header: 'Revenue',
        accessorFn: (row: TicketRow) => row.sold * row.price,
        render: (_v: unknown, row: TicketRow) => (
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700] }}>${(row.sold * row.price).toLocaleString()}</Text>
        ),
      } as ColumnDef<TicketRow>,
    ]), [tokens]);

    const actions = useMemo((): DetailAction[] => [
      { key: 'edit', label: 'Edit', variant: 'default', onClick: () => onEdit?.() },
      { key: 'tickets', label: 'Manage Tickets', variant: 'primary', onClick: () => onManageTickets?.() },
    ], [onEdit, onManageTickets]);

    const tabs = useMemo((): DetailTab[] => [
      {
        key: 'tickets',
        label: 'Ticket Breakdown',
        content: (
          <PatternDataTable
            data={tickets.byType}
            columns={ticketColumns}
            rowKey="type"
            compact
          />
        ),
      },
      {
        key: 'checkin',
        label: 'Check-in Progress',
        content: (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3], padding: tokens.spacing[4] }}>
            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <Box style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>{checkInPct}%</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block' }}>{checkIn.checkedIn.toLocaleString()} / {checkIn.total.toLocaleString()} checked in</Text>
              </Box>
            </Box>
            <PatternStatsGrid
              stats={[
                { key: 'pending', label: 'Pending', value: (checkIn.total - checkIn.checkedIn).toLocaleString(), color: tokens.colors.warningScale[600] },
                { key: 'noshows', label: 'No-shows (est.)', value: Math.round(checkIn.total * 0.05).toLocaleString(), color: tokens.colors.errorScale[600] },
              ]}
              columns={2}
              variant="outlined"
            />
          </Box>
        ),
      },
      {
        key: 'activity',
        label: 'Live Activity',
        content: <PatternTimeline items={TIMELINE_EVENTS} showTimestamp />,
      },
    ], [tickets, ticketColumns, checkIn, checkInPct, tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', ...style }}>
        <PatternStatsGrid stats={kpiStats} columns={4} style={{ marginBottom: tokens.spacing[4] }} />
        <PatternDetailPanel
          data={event}
          title={event.name}
          subtitle={`${event.venue} | ${(event.dates || []).length} day(s) | ${event.organizer}`}
          status={{ label: statusCfg.label, color: statusCfg.color }}
          tabs={tabs}
          actions={actions}
        />
      </Box>
    );
  },
});
