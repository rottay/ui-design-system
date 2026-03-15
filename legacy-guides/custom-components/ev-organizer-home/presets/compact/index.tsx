'use client';

/**
 * EvOrganizerHome - Compact Preset
 * Event organizer dashboard - Compact layout
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvOrganizerHomeProps } from '../../core';

export const CompactEvOrganizerHome = createPreset<EvOrganizerHomeProps>({
  name: 'EvOrganizerHome.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvOrganizerHomeProps>) => {
    const { Box, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);


    const { organizerName = 'Organizer', kpis: rawKpis = [], upcomingEvents: rawUpcomingEvents = [], onEventClick, className, style } = props;

    const kpis = Array.isArray(rawKpis) ? rawKpis : [];
    const upcomingEvents = Array.isArray(rawUpcomingEvents) ? rawUpcomingEvents : [];

    const mockKpis = kpis.length ? kpis : [
      { label: 'Events', value: '12', trend: 'up', trendValue: 8, icon: '📅' },
      { label: 'Sold', value: '4,832', trend: 'up', trendValue: 23, icon: '🎫' },
      { label: 'Revenue', value: '$148K', trend: 'up', trendValue: 15, icon: '💰' },
      { label: 'Rating', value: '4.8', trend: 'up', trendValue: 3, icon: '⭐' },
    ];

    const mockEvents = upcomingEvents.length ? upcomingEvents : [
      { id: '1', name: 'Neon Nights Festival', date: new Date('2026-03-15'), venue: 'Arena Complex', ticketsSold: 3200, capacity: 5000, status: 'published' },
      { id: '2', name: 'Jazz & Blues Weekend', date: new Date('2026-03-22'), venue: 'Garden Stage', ticketsSold: 450, capacity: 800, status: 'live' },
      { id: '3', name: 'EDM Sunrise Party', date: new Date('2026-04-01'), venue: 'Beach Club', ticketsSold: 120, capacity: 2000, status: 'draft' },
    ];

    const statusColor = (s: string) => { switch(s) { case 'live': return tokens.colors.successScale[500]; case 'published': return tokens.colors.primaryScale[500]; default: return tokens.colors.warningScale[500]; } };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Hi, {organizerName}</Text>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[5] }}>
          {mockKpis.map((s: any, i: number) => (
            <div key={i} style={{ ...cardBase, padding: tokens.spacing[3], display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xl }}>{s.icon}</span>
              <div>
                <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{s.value}</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={cardBase}>
          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Next Events</Text>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {['Event', 'Venue', 'Date', 'Tickets', 'Status'].map((h: string) => (
                  <th key={h} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textAlign: 'left' as const, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockEvents.map((ev: any) => (
                <tr key={ev.id} onClick={() => onEventClick?.(ev.id)} style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], borderBottom: `1px solid ${tokens.colors.neutral[50]}` }}>{ev.name}</td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `1px solid ${tokens.colors.neutral[50]}` }}>{ev.venue}</td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `1px solid ${tokens.colors.neutral[50]}` }}>{ev.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `1px solid ${tokens.colors.neutral[50]}` }}>{ev.ticketsSold}/{ev.capacity}</td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[50]}` }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: statusColor(ev.status) }} />
                      <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[600], textTransform: 'capitalize' as const }}>{ev.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
