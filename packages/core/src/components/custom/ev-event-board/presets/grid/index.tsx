'use client';

/**
 * EvEventBoard - Grid Preset
 * Rich event card grid with search, filter pills, status badges, ticket progress bars
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  createSurfaceStyle,
  getHoverTransform,
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

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

export const GridEvEventBoard = createPreset<EvEventBoardProps>({
  name: 'EvEventBoard.Grid',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvEventBoardProps>) => {
    const { Box, Text } = primitives;
    const { events: propEvents, onEventClick, onCreateEvent, onFilterChange, className, style } = props;

    const events = propEvents && propEvents.length > 0 ? propEvents : MOCK_EVENTS;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredEvents = useMemo(() => {
      return events.filter(ev => {
        if (searchTerm && !ev.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (activeStatus && ev.status !== activeStatus) return false;
        return true;
      });
    }, [events, searchTerm, activeStatus]);

    const statuses = ['draft', 'published', 'live', 'completed'];

    const formatDate = (d: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    const formatCurrency = (n: number) => {
      if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
      return `$${n}`;
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {'\uD83C\uDFAA'} Events
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </Text>
          </div>
          <div
            onClick={onCreateEvent}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer',
              ...hoverStyle,
            }}
          >
            + Create Event
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[5], padding: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                {'\uD83D\uDD0D'}
              </div>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900],
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                }}
              />
            </div>
            {/* Status filter pills */}
            <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
              <div
                onClick={() => setActiveStatus(null)}
                style={createFilterPillStyle(tokens, { active: activeStatus === null })}
              >
                All
              </div>
              {statuses.map(st => (
                <div
                  key={st}
                  onClick={() => setActiveStatus(activeStatus === st ? null : st)}
                  style={createFilterPillStyle(tokens, { active: activeStatus === st })}
                >
                  {STATUS_CONFIG[st].emoji} {STATUS_CONFIG[st].label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[5] }}>
          {filteredEvents.map((ev, idx) => {
            const ticketPct = ev.capacity > 0 ? Math.round((ev.ticketsSold / ev.capacity) * 100) : 0;
            const progressColor = ticketPct >= 90 ? tokens.colors.successScale[500] : ticketPct >= 50 ? tokens.colors.warningScale[500] : tokens.colors.primaryScale[500];
            const progressBar = createProgressBarStyle(tokens, { percent: ticketPct, color: progressColor });
            const statusCfg = STATUS_CONFIG[ev.status] || STATUS_CONFIG.draft;
            const isHovered = hoveredCard === ev.id;

            return (
              <div
                key={ev.id}
                onClick={() => onEventClick?.(ev.id)}
                onMouseEnter={() => setHoveredCard(ev.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  ...cardBase,
                  padding: 0,
                  overflow: 'hidden' as const,
                  cursor: 'pointer',
                  ...hoverStyle,
                  ...(isHovered ? getHoverTransform(tokens) : {}),
                }}
              >
                {/* Cover gradient */}
                <div style={{ height: 100, background: COVER_GRADIENTS[idx % COVER_GRADIENTS.length], position: 'relative' as const }}>
                  {/* Status badge on cover */}
                  <div style={{ position: 'absolute' as const, top: tokens.spacing[2], right: tokens.spacing[2] }}>
                    <span style={createBadgeStyle(tokens, statusCfg.color)}>
                      {statusCfg.emoji} {statusCfg.label}
                    </span>
                  </div>
                  {/* Revenue badge */}
                  {ev.revenue > 0 && (
                    <div style={{ position: 'absolute' as const, bottom: tokens.spacing[2], left: tokens.spacing[2] }}>
                      <span style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}>
                        {'\uD83D\uDCB0'} {formatCurrency(ev.revenue)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div style={{ padding: tokens.spacing[4] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
                    {ev.name}
                  </Text>

                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {'\uD83D\uDCC5'} {formatDate(ev.date)}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>|</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {'\uD83D\uDCCD'} {ev.venue}
                    </Text>
                  </div>

                  {/* Ticket progress */}
                  <div style={{ marginBottom: tokens.spacing[2] }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {'\uD83C\uDFAB'} Tickets
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                        {ev.ticketsSold.toLocaleString()} / {ev.capacity.toLocaleString()}
                      </Text>
                    </div>
                    <div style={progressBar.track}>
                      <div style={progressBar.fill} />
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: 2 }}>
                      {ticketPct}% sold
                    </Text>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredEvents.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: tokens.spacing[10], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83C\uDFAD'}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No events match your filters</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Try adjusting your search or filter criteria</Text>
          </div>
        )}

        {/* Summary bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[5], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Events', value: events.length.toString(), emoji: '\uD83C\uDFAA' },
            { label: 'Total Tickets Sold', value: events.reduce((s, e) => s + e.ticketsSold, 0).toLocaleString(), emoji: '\uD83C\uDFAB' },
            { label: 'Total Revenue', value: formatCurrency(events.reduce((s, e) => s + e.revenue, 0)), emoji: '\uD83D\uDCB0' },
            { label: 'Live Now', value: events.filter(e => e.status === 'live').length.toString(), emoji: '\uD83D\uDD34' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
