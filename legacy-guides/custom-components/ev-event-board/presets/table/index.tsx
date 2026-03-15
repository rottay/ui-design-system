'use client';

/**
 * EvEventBoard - Table Preset
 * Composes PatternDataTable<EventCard> with PatternStatsGrid for summary
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  PatternDataTable,
  PatternStatsGrid,
  PatternEmptyState,
  column,
  columns,
} from '../../../../patterns';
import type { ColumnDef, StatDef } from '../../../../patterns';
import { createBadgeStyle, createProgressBarStyle } from '../../../helpers';
import type { EvEventBoardProps, EventCard } from '../../core';

const MOCK_EVENTS: EventCard[] = [
  { id: '1', name: 'Neon Nights Festival', date: new Date('2026-03-15'), endDate: new Date('2026-03-16'), venue: 'Arena Complex', status: 'live', ticketsSold: 4200, capacity: 5000, revenue: 126000 },
  { id: '2', name: 'Summer Beats Open Air', date: new Date('2026-04-20'), venue: 'Garden Stage', status: 'published', ticketsSold: 800, capacity: 2000, revenue: 32000 },
  { id: '3', name: 'Acoustic Sunset Sessions', date: new Date('2026-05-10'), venue: 'Beach Club', status: 'draft', ticketsSold: 0, capacity: 500, revenue: 0 },
  { id: '4', name: 'Underground Bass Night', date: new Date('2026-02-28'), venue: 'The Loft', status: 'completed', ticketsSold: 450, capacity: 450, revenue: 18000 },
  { id: '5', name: 'Jazz & Wine Evening', date: new Date('2026-06-05'), venue: 'Garden Stage', status: 'published', ticketsSold: 320, capacity: 600, revenue: 19200 },
  { id: '6', name: 'Electronic Wonderland', date: new Date('2026-07-12'), venue: 'Arena Complex', status: 'draft', ticketsSold: 0, capacity: 8000, revenue: 0 },
];

const STATUS_CONFIG: Record<string, { color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'; label: string }> = {
  draft: { color: 'secondary', label: 'Draft' },
  published: { color: 'info', label: 'Published' },
  live: { color: 'success', label: 'Live' },
  completed: { color: 'primary', label: 'Completed' },
  cancelled: { color: 'error', label: 'Cancelled' },
};

const formatDate = (d: Date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

export const TableEvEventBoard = createPreset<EvEventBoardProps>({
  name: 'EvEventBoard.Table',
  render: ({ primitives, props, tokens }: PresetContext<EvEventBoardProps>) => {
    const { Box, Text } = primitives;
    const { events: propEvents, onEventClick, onCreateEvent, className, style } = props;

    const events = propEvents && propEvents.length > 0 ? propEvents : MOCK_EVENTS;

    const eventColumns = useMemo(() => columns<EventCard>([
      column<EventCard, 'name'>('name', {
        header: 'Event',
        sortable: true,
        render: (_v, row) => (
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{row.name}</Text>
        ),
      }),
      column<EventCard, 'date'>('date', {
        header: 'Date',
        sortable: true,
        render: (_v, row) => (
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{formatDate(row.date)}</Text>
        ),
      }),
      column<EventCard, 'venue'>('venue', {
        header: 'Venue',
        sortable: true,
        render: (_v, row) => (
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{row.venue}</Text>
        ),
      }),
      {
        key: 'tickets',
        header: 'Tickets',
        sortable: true,
        accessorFn: (row: EventCard) => row.ticketsSold,
        minWidth: 160,
        render: (_v: unknown, row: EventCard) => {
          const ticketPct = row.capacity > 0 ? Math.round((row.ticketsSold / row.capacity) * 100) : 0;
          const progressColor = ticketPct >= 90 ? tokens.colors.successScale[500] : ticketPct >= 50 ? tokens.colors.warningScale[500] : tokens.colors.primaryScale[500];
          const progressBar = createProgressBarStyle(tokens, { percent: ticketPct, color: progressColor });
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], minWidth: 60 }}>
                {row.ticketsSold.toLocaleString()}/{row.capacity.toLocaleString()}
              </Text>
              <div style={{ flex: 1, ...progressBar.track }}>
                <div style={progressBar.fill} />
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 32, textAlign: 'right' as const }}>{ticketPct}%</Text>
            </div>
          );
        },
      } as ColumnDef<EventCard>,
      column<EventCard, 'revenue'>('revenue', {
        header: 'Revenue',
        sortable: true,
        align: 'right',
        render: (_v, row) => (
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: row.revenue > 0 ? tokens.colors.successScale[700] : tokens.colors.neutral[400] }}>
            {row.revenue > 0 ? formatCurrency(row.revenue) : '\u2014'}
          </Text>
        ),
      }),
      column<EventCard, 'status'>('status', {
        header: 'Status',
        sortable: true,
        render: (_v, row) => {
          const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.draft;
          return <span style={createBadgeStyle(tokens, cfg.color)}>{cfg.label}</span>;
        },
      }),
    ]), [tokens]);

    const summaryStats = useMemo((): StatDef[] => [
      { key: 'revenue', label: 'Total Revenue', value: formatCurrency(events.reduce((s, e) => s + e.revenue, 0)), icon: <span>$</span>, color: tokens.colors.successScale[600] },
      { key: 'avg-price', label: 'Avg Ticket Price', value: `$${events.filter(e => e.ticketsSold > 0).length > 0 ? Math.round(events.reduce((s, e) => s + e.revenue, 0) / events.reduce((s, e) => s + e.ticketsSold, 0)) : 0}`, color: tokens.colors.primaryScale[600] },
      { key: 'sell-through', label: 'Sell-Through Rate', value: `${Math.round((events.reduce((s, e) => s + e.ticketsSold, 0) / events.reduce((s, e) => s + e.capacity, 0)) * 100)}%`, color: tokens.colors.infoScale[600] },
      { key: 'live', label: 'Events Live', value: events.filter(e => e.status === 'live').length, color: tokens.colors.errorScale[600] },
    ], [events, tokens]);

    const toolbar = (
      <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
        <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>
          Export
        </div>
        <div onClick={onCreateEvent} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>
          + Create Event
        </div>
      </Box>
    );

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], ...style }}>
        <PatternDataTable
          data={events}
          columns={eventColumns}
          rowKey="id"
          toolbar={toolbar}
          hoverable
          onRowClick={(row) => onEventClick?.(row.id)}
          emptyState={
            <PatternEmptyState
              title="No events found"
              description="Try adjusting your search or filter criteria"
              size="sm"
            />
          }
        />
        <PatternStatsGrid
          stats={summaryStats}
          columns={4}
          variant="outlined"
        />
      </Box>
    );
  },
});
