'use client';

/**
 * EvEventBoard - Table Preset
 * Full data table with search, filter pills, sortable columns, status badges, revenue
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';
import type { EvEventBoardProps, EventCard } from '../../core';

const MOCK_EVENTS: EventCard[] = [
  { id: '1', name: 'Neon Nights Festival', date: new Date('2026-03-15'), endDate: new Date('2026-03-16'), venue: 'Arena Complex', status: 'live', ticketsSold: 4200, capacity: 5000, revenue: 126000 },
  { id: '2', name: 'Summer Beats Open Air', date: new Date('2026-04-20'), venue: 'Garden Stage', status: 'published', ticketsSold: 800, capacity: 2000, revenue: 32000 },
  { id: '3', name: 'Acoustic Sunset Sessions', date: new Date('2026-05-10'), venue: 'Beach Club', status: 'draft', ticketsSold: 0, capacity: 500, revenue: 0 },
  { id: '4', name: 'Underground Bass Night', date: new Date('2026-02-28'), venue: 'The Loft', status: 'completed', ticketsSold: 450, capacity: 450, revenue: 18000 },
  { id: '5', name: 'Jazz & Wine Evening', date: new Date('2026-06-05'), venue: 'Garden Stage', status: 'published', ticketsSold: 320, capacity: 600, revenue: 19200 },
  { id: '6', name: 'Electronic Wonderland', date: new Date('2026-07-12'), venue: 'Arena Complex', status: 'draft', ticketsSold: 0, capacity: 8000, revenue: 0 },
];

const STATUS_CONFIG: Record<string, { color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'; emoji: string; label: string }> = {
  draft: { color: 'secondary', emoji: '\u270F\uFE0F', label: 'Draft' },
  published: { color: 'info', emoji: '\uD83D\uDCE2', label: 'Published' },
  live: { color: 'success', emoji: '\uD83D\uDD34', label: 'Live' },
  completed: { color: 'primary', emoji: '\u2705', label: 'Completed' },
  cancelled: { color: 'error', emoji: '\u274C', label: 'Cancelled' },
};

type SortKey = 'name' | 'date' | 'venue' | 'tickets' | 'revenue' | 'status';

export const TableEvEventBoard = createPreset<EvEventBoardProps>({
  name: 'EvEventBoard.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvEventBoardProps>) => {
    const { Box, Text } = primitives;
    const { events: propEvents, onEventClick, onCreateEvent, className, style } = props;

    const events = propEvents && propEvents.length > 0 ? propEvents : MOCK_EVENTS;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortAsc, setSortAsc] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const panelHeader = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);

    const formatDate = (d: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

    const filteredAndSorted = useMemo(() => {
      let list = events.filter(ev => {
        if (searchTerm && !ev.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (activeStatus && ev.status !== activeStatus) return false;
        return true;
      });
      list = [...list].sort((a, b) => {
        let cmp = 0;
        switch (sortKey) {
          case 'name': cmp = a.name.localeCompare(b.name); break;
          case 'date': cmp = a.date.getTime() - b.date.getTime(); break;
          case 'venue': cmp = a.venue.localeCompare(b.venue); break;
          case 'tickets': cmp = a.ticketsSold - b.ticketsSold; break;
          case 'revenue': cmp = a.revenue - b.revenue; break;
          case 'status': cmp = a.status.localeCompare(b.status); break;
        }
        return sortAsc ? cmp : -cmp;
      });
      return list;
    }, [events, searchTerm, activeStatus, sortKey, sortAsc]);

    const handleSort = (key: SortKey) => {
      if (sortKey === key) setSortAsc(!sortAsc);
      else { setSortKey(key); setSortAsc(true); }
    };

    const statuses = ['draft', 'published', 'live', 'completed'];

    const thStyle = (key: SortKey) => ({
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      textAlign: 'left' as const,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: sortKey === key ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      cursor: 'pointer',
      userSelect: 'none' as const,
      backgroundColor: tokens.colors.neutral[50],
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
    });

    const sortArrow = (key: SortKey) => sortKey === key ? (sortAsc ? ' \u2191' : ' \u2193') : '';

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {'\uD83D\uDCCB'} Events Table
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filteredAndSorted.length} of {events.length} events
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', ...hoverStyle }}>
              {'\uD83D\uDCE5'} Export
            </div>
            <div onClick={onCreateEvent} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
              + Create Event
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{'\uD83D\uDD0D'}</div>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
              <div onClick={() => setActiveStatus(null)} style={createFilterPillStyle(tokens, { active: activeStatus === null })}>All</div>
              {statuses.map(st => (
                <div key={st} onClick={() => setActiveStatus(activeStatus === st ? null : st)} style={createFilterPillStyle(tokens, { active: activeStatus === st })}>
                  {STATUS_CONFIG[st].emoji} {STATUS_CONFIG[st].label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={thStyle('name')}>Event{sortArrow('name')}</th>
                <th onClick={() => handleSort('date')} style={thStyle('date')}>Date{sortArrow('date')}</th>
                <th onClick={() => handleSort('venue')} style={thStyle('venue')}>Venue{sortArrow('venue')}</th>
                <th onClick={() => handleSort('tickets')} style={thStyle('tickets')}>Tickets{sortArrow('tickets')}</th>
                <th onClick={() => handleSort('revenue')} style={thStyle('revenue')}>Revenue{sortArrow('revenue')}</th>
                <th onClick={() => handleSort('status')} style={thStyle('status')}>Status{sortArrow('status')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map(ev => {
                const ticketPct = ev.capacity > 0 ? Math.round((ev.ticketsSold / ev.capacity) * 100) : 0;
                const progressColor = ticketPct >= 90 ? tokens.colors.successScale[500] : ticketPct >= 50 ? tokens.colors.warningScale[500] : tokens.colors.primaryScale[500];
                const progressBar = createProgressBarStyle(tokens, { percent: ticketPct, color: progressColor });
                const statusCfg = STATUS_CONFIG[ev.status] || STATUS_CONFIG.draft;
                const isHov = hoveredRow === ev.id;

                return (
                  <tr
                    key={ev.id}
                    onClick={() => onEventClick?.(ev.id)}
                    onMouseEnter={() => setHoveredRow(ev.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ cursor: 'pointer', backgroundColor: isHov ? tokens.colors.primaryScale[50] : tokens.colors.common.white, ...hoverStyle }}
                  >
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{ev.name}</Text>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{'\uD83D\uDCC5'} {formatDate(ev.date)}</Text>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{'\uD83D\uDCCD'} {ev.venue}</Text>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], minWidth: 60 }}>
                          {ev.ticketsSold.toLocaleString()}/{ev.capacity.toLocaleString()}
                        </Text>
                        <div style={{ flex: 1, ...progressBar.track }}>
                          <div style={progressBar.fill} />
                        </div>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 32, textAlign: 'right' as const }}>{ticketPct}%</Text>
                      </div>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: ev.revenue > 0 ? tokens.colors.successScale[700] : tokens.colors.neutral[400] }}>
                        {ev.revenue > 0 ? formatCurrency(ev.revenue) : '\u2014'}
                      </Text>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <span style={createBadgeStyle(tokens, statusCfg.color)}>
                        {statusCfg.emoji} {statusCfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAndSorted.length === 0 && (
            <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83C\uDFAD'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>No events found</Text>
            </div>
          )}
        </div>

        {/* Summary footer */}
        <div style={{ display: 'flex', gap: tokens.spacing[4], marginTop: tokens.spacing[4] }}>
          {[
            { label: 'Total Revenue', value: formatCurrency(events.reduce((s, e) => s + e.revenue, 0)), emoji: '\uD83D\uDCB0', color: tokens.colors.successScale[600] },
            { label: 'Avg Ticket Price', value: `$${events.filter(e => e.ticketsSold > 0).length > 0 ? Math.round(events.reduce((s, e) => s + e.revenue, 0) / events.reduce((s, e) => s + e.ticketsSold, 0)) : 0}`, emoji: '\uD83C\uDFAB', color: tokens.colors.primaryScale[600] },
            { label: 'Sell-Through Rate', value: `${Math.round((events.reduce((s, e) => s + e.ticketsSold, 0) / events.reduce((s, e) => s + e.capacity, 0)) * 100)}%`, emoji: '\uD83D\uDCC8', color: tokens.colors.infoScale[600] },
            { label: 'Events Live', value: events.filter(e => e.status === 'live').length.toString(), emoji: '\uD83D\uDD34', color: tokens.colors.errorScale[600] },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, flex: 1, textAlign: 'center' as const, padding: tokens.spacing[3] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: stat.color, display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
