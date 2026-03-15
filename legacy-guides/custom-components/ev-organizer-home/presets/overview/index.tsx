'use client';

/**
 * EvOrganizerHome - Overview Preset
 * Event organizer dashboard - Overview layout
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

export const OverviewEvOrganizerHome = createPreset<EvOrganizerHomeProps>({
  name: 'EvOrganizerHome.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvOrganizerHomeProps>) => {
    const { Box, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);


    const {
      organizerName = 'Organizer',
      kpis: rawKpis = [],
      upcomingEvents: rawUpcomingEvents = [],
      revenueSources: rawRevenueSources = [],
      lineupSlots: rawLineupSlots = [],
      quickActions: rawQuickActions = [],
      dateRangeLabel = 'Last 30 days',
      onEventClick,
      onActionClick,
      className,
      style,
    } = props;

    const kpis = Array.isArray(rawKpis) ? rawKpis : [];
    const upcomingEvents = Array.isArray(rawUpcomingEvents) ? rawUpcomingEvents : [];
    const revenueSources = Array.isArray(rawRevenueSources) ? rawRevenueSources : [];
    const lineupSlots = Array.isArray(rawLineupSlots) ? rawLineupSlots : [];
    const quickActions = Array.isArray(rawQuickActions) ? rawQuickActions : [];

    const [selectedRange, setSelectedRange] = useState(dateRangeLabel);

    const mockKpis = kpis.length ? kpis : [
      { label: 'Active Events', value: '12', trend: 'up', trendValue: 8, icon: '📅' },
      { label: 'Tickets Sold', value: '4,832', trend: 'up', trendValue: 23, icon: '🎫' },
      { label: 'Revenue', value: '$148.5K', trend: 'up', trendValue: 15, icon: '💰' },
      { label: 'Avg Attendance', value: '87%', trend: 'up', trendValue: 5, icon: '👥' },
    ];

    const mockEvents = upcomingEvents.length ? upcomingEvents : [
      { id: '1', name: 'Neon Nights Festival', date: new Date('2026-03-15'), venue: 'Arena Complex', ticketsSold: 3200, capacity: 5000, status: 'published' },
      { id: '2', name: 'Jazz & Blues Weekend', date: new Date('2026-03-22'), venue: 'Garden Stage', ticketsSold: 450, capacity: 800, status: 'published' },
      { id: '3', name: 'EDM Sunrise Party', date: new Date('2026-04-01'), venue: 'Beach Club', ticketsSold: 120, capacity: 2000, status: 'draft' },
      { id: '4', name: 'Acoustic Sessions Vol.3', date: new Date('2026-04-10'), venue: 'The Loft', ticketsSold: 180, capacity: 200, status: 'live' },
    ];

    const mockRevenue = revenueSources.length ? revenueSources : [
      { source: 'Ticket Sales', amount: 98500, percentage: 66 },
      { source: 'Bar & F&B', amount: 32000, percentage: 22 },
      { source: 'VIP Packages', amount: 12000, percentage: 8 },
      { source: 'Merch & Tips', amount: 6000, percentage: 4 },
    ];

    const statusColor = (s: string) => {
      switch(s) { case 'live': return 'successScale'; case 'published': return 'primaryScale'; case 'draft': return 'warningScale'; default: return 'neutral'; }
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>Welcome back, {organizerName}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Here is your event operations overview.</Text>
          </div>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], cursor: 'pointer' }}>{selectedRange} ▾</button>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          {mockKpis.map((stat: any, idx: number) => (
            <div key={idx} style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block', marginBottom: tokens.spacing[1] }}>{stat.label}</span>
                  <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</span>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.lg }}>{stat.icon}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: stat.trend === 'up' ? tokens.colors.successScale[600] : tokens.colors.errorScale[600] }}>{stat.trend === 'up' ? '↑' : '↓'} {stat.trendValue}%</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>vs prev period</span>
              </div>
            </div>
          ))}
        </div>

        {/* Two column: Events + Revenue */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: tokens.spacing[6] }}>
          {/* Upcoming Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Upcoming Events</Text>
                <button style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.primaryScale[200]}`, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ New Event</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {mockEvents.map((ev: any) => {
                  const pct = Math.round((ev.ticketsSold / ev.capacity) * 100);
                  const sc = statusColor(ev.status);
                  return (
                    <div key={ev.id} onClick={() => onEventClick?.(ev.id)} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50], cursor: 'pointer', transition: 'all 0.15s ease' }}>
                      <div style={{ width: 48, height: 48, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.lg, flexShrink: 0 }}>📅</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{ev.name}</span>
                          <span style={{ fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, color: (tokens.colors as any)[sc]?.[700] ?? tokens.colors.neutral[700], backgroundColor: (tokens.colors as any)[sc]?.[100] ?? tokens.colors.neutral[100], padding: '1px 6px', borderRadius: tokens.borderRadius.sm, textTransform: 'uppercase' as const }}>{ev.status}</span>
                        </div>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{ev.venue} · {ev.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: tokens.spacing[1], flexShrink: 0 }}>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{ev.ticketsSold}/{ev.capacity}</span>
                        <div style={{ width: 60, height: 6, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pct > 80 ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500], borderRadius: tokens.borderRadius.full }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Quick Actions</Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
                {[{ icon: '🎫', label: 'Manage Tickets', desc: 'Sales & pricing' }, { icon: '🎤', label: 'Edit Lineup', desc: 'Artists & schedule' }, { icon: '📊', label: 'View Analytics', desc: 'Performance data' }, { icon: '👥', label: 'Staff Roster', desc: 'Assign crew' }, { icon: '📋', label: 'Check-in Setup', desc: 'Scanner config' }, { icon: '💳', label: 'Payouts', desc: 'Revenue distribution' }].map((a: any, i: number) => (
                  <div key={i} onClick={() => onActionClick?.(a.label)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' as const, padding: tokens.spacing[4], borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    <div style={{ width: 40, height: 40, borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: tokens.spacing[2], fontSize: tokens.typography.fontSize.xl }}>{a.icon}</div>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: 2 }}>{a.label}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{a.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Revenue + Lineup */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* Revenue Breakdown */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Revenue Breakdown</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {mockRevenue.map((r: any, i: number) => {
                  const colors = ['primaryScale', 'successScale', 'warningScale', 'infoScale'];
                  const c = colors[i % colors.length];
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium }}>{r.source}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{r.amount.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 8, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${r.percentage}%`, backgroundColor: (tokens.colors as any)[c]?.[500] ?? tokens.colors.primaryScale[500], borderRadius: tokens.borderRadius.full, transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[4], paddingTop: tokens.spacing[3], borderTop: `1px solid ${tokens.colors.neutral[100]}` }}>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Total Revenue</span>
                <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>$148,500</span>
              </div>
            </div>

            {/* Today's Lineup */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Today{"'"}s Lineup</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {[{ time: '18:00', artist: 'DJ Nova', stage: 'Main Stage', status: 'confirmed' }, { time: '20:00', artist: 'The Velvet Band', stage: 'Main Stage', status: 'confirmed' }, { time: '21:30', artist: 'MC Flux', stage: 'Side Stage', status: 'pending' }, { time: '23:00', artist: 'Aurora Beats', stage: 'Main Stage', status: 'confirmed' }].map((slot: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, borderLeft: `3px solid ${slot.status === 'confirmed' ? tokens.colors.successScale[500] : tokens.colors.warningScale[500]}`, backgroundColor: tokens.colors.neutral[50] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700], minWidth: 45 }}>{slot.time}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{slot.artist}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{slot.stage}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, color: slot.status === 'confirmed' ? tokens.colors.successScale[700] : tokens.colors.warningScale[700], backgroundColor: slot.status === 'confirmed' ? tokens.colors.successScale[100] : tokens.colors.warningScale[100], padding: '1px 6px', borderRadius: tokens.borderRadius.sm, textTransform: 'uppercase' as const }}>{slot.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
