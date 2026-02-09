'use client';

/**
 * EvDjDashboard - Standard Preset
 * Artist greeting header, upcoming gigs, session stats, tip summary, recent song requests
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvDjDashboardProps } from '../../core';

export const StandardEvDjDashboard = createPreset<EvDjDashboardProps>({
  name: 'EvDjDashboard.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvDjDashboardProps>) => {
    const { Box, Text } = primitives;

    const {
      artistName = 'DJ Nova',
      upcomingGigs,
      sessionStats,
      tipSummary,
      recentRequests,
      onGigClick,
      className,
      style,
    } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(
      () => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }),
      [tokens, isGlass]
    );
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const mockGigs = upcomingGigs?.length ? upcomingGigs : [
      { id: 'g1', eventName: 'Neon Nights Festival', venue: 'Arena Complex', date: new Date('2026-02-14'), startTime: new Date('2026-02-14T22:00:00'), endTime: new Date('2026-02-15T02:00:00'), status: 'upcoming' as const, fee: 3500 },
      { id: 'g2', eventName: 'Jazz & Soul Lounge', venue: 'The Blue Note', date: new Date('2026-02-20'), startTime: new Date('2026-02-20T20:00:00'), endTime: new Date('2026-02-20T23:30:00'), status: 'upcoming' as const, fee: 1800 },
      { id: 'g3', eventName: 'Beach Sunset Sessions', venue: 'Shoreline Club', date: new Date('2026-02-28'), startTime: new Date('2026-02-28T17:00:00'), endTime: new Date('2026-02-28T21:00:00'), status: 'upcoming' as const, fee: 2200 },
      { id: 'g4', eventName: 'Underground Bass Night', venue: 'Warehouse 42', date: new Date('2026-03-05'), startTime: new Date('2026-03-05T23:00:00'), endTime: new Date('2026-03-06T04:00:00'), status: 'upcoming' as const, fee: 2800 },
    ];

    const mockStats = sessionStats?.length ? sessionStats : [
      { label: 'Total Plays', value: '1,247' },
      { label: 'Avg Rating', value: '4.8' },
      { label: 'Fan Count', value: '12.4K' },
      { label: 'Sessions', value: '86' },
    ];

    const mockTips = tipSummary || {
      totalAmount: 2450,
      currency: 'USD',
      topTipper: 'Sarah M.',
      sessionCount: 42,
    };

    const mockRequests = recentRequests?.length ? recentRequests : [
      { id: 'r1', songTitle: 'Blinding Lights', artist: 'The Weeknd', status: 'played' as const, requestedAt: new Date(Date.now() - 15 * 60000) },
      { id: 'r2', songTitle: 'Midnight City', artist: 'M83', status: 'accepted' as const, requestedAt: new Date(Date.now() - 25 * 60000) },
      { id: 'r3', songTitle: 'Strobe', artist: 'Deadmau5', status: 'pending' as const, requestedAt: new Date(Date.now() - 5 * 60000) },
      { id: 'r4', songTitle: 'Get Lucky', artist: 'Daft Punk', status: 'played' as const, requestedAt: new Date(Date.now() - 45 * 60000) },
      { id: 'r5', songTitle: 'Levels', artist: 'Avicii', status: 'rejected' as const, requestedAt: new Date(Date.now() - 60 * 60000) },
      { id: 'r6', songTitle: 'Sandstorm', artist: 'Darude', status: 'pending' as const, requestedAt: new Date(Date.now() - 8 * 60000) },
    ];

    const statIcons = ['🎵', '⭐', '👥', '🎧'];

    const requestStatusColors: Record<string, { bg: string; text: string }> = {
      pending: { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700] },
      accepted: { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700] },
      played: { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] },
      rejected: { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700] },
    };

    const gigStatusColors: Record<string, { bg: string; text: string }> = {
      upcoming: { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700] },
      live: { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] },
      completed: { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[600] },
    };

    const topTipBreakdown = [
      { name: 'Sarah M.', amount: 450, sessions: 8 },
      { name: 'Jake R.', amount: 320, sessions: 5 },
      { name: 'Luna K.', amount: 280, sessions: 12 },
    ];

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[6],
          ...style,
        }}
      >
        {/* Artist Greeting Header */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[6], display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
            <div style={{ width: 64, height: 64, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🎧</div>
            <div>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Welcome back</Text>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>{artistName}</Text>
              <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                <span style={{ ...createBadgeStyle(tokens, 'success'), fontSize: tokens.typography.fontSize.xs }}>Verified Artist</span>
                <span style={{ ...createBadgeStyle(tokens, 'primary'), fontSize: tokens.typography.fontSize.xs }}>Pro Member</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[4], alignItems: 'center' }}>
            <div style={{ textAlign: 'center' as const }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', textTransform: 'uppercase' as const, fontWeight: tokens.typography.fontWeight.medium, letterSpacing: '0.04em', marginBottom: tokens.spacing[1] }}>Next Gig</span>
              <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>Feb 14</span>
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', textTransform: 'uppercase' as const, fontWeight: tokens.typography.fontWeight.medium, letterSpacing: '0.04em', marginBottom: tokens.spacing[1] }}>Earnings MTD</span>
              <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>$8,300</span>
            </div>
          </div>
        </div>

        {/* Session Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[6] }}>
          {mockStats.map((stat, idx) => (
            <div key={idx} style={{ ...cardBase, display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <div style={{ width: 44, height: 44, borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xl, flexShrink: 0 }}>{statIcons[idx]}</div>
              <div>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, fontWeight: tokens.typography.fontWeight.medium, letterSpacing: '0.04em', display: 'block', marginBottom: 2 }}>{stat.label}</span>
                <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: tokens.spacing[6] }}>
          {/* Left: Gigs + Requests */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* Upcoming Gigs */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Upcoming Gigs</Text>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{mockGigs.length} upcoming</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {mockGigs.map((gig) => {
                  const sc = gigStatusColors[gig.status];
                  return (
                    <div key={gig.id} onClick={() => onGigClick?.(gig.id)} style={{
                      display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                      padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50], cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}>
                      <div style={{ width: 48, height: 48, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{gig.date.toLocaleDateString([], { month: 'short' }).toUpperCase()}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>{gig.date.getDate()}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: 2 }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{gig.eventName}</span>
                          <span style={{ fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, padding: '1px 6px', borderRadius: tokens.borderRadius.sm, backgroundColor: sc.bg, color: sc.text, textTransform: 'uppercase' as const }}>{gig.status}</span>
                        </div>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>📍 {gig.venue} - {gig.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to {gig.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], flexShrink: 0 }}>${gig.fee.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Song Requests */}
            <div style={cardBase}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Song Requests</Text>
                <span style={{ ...createBadgeStyle(tokens, 'warning'), fontSize: tokens.typography.fontSize.xs }}>
                  {mockRequests.filter(r => r.status === 'pending').length} pending
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {mockRequests.map((req) => {
                  const sc = requestStatusColors[req.status];
                  const minutesAgo = Math.round((Date.now() - req.requestedAt.getTime()) / 60000);
                  return (
                    <div key={req.id} style={{
                      display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50],
                    }}>
                      <span style={{ fontSize: tokens.typography.fontSize.lg }}>🎵</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{req.songTitle}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{req.artist} - {minutesAgo}m ago</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, padding: '1px 8px', borderRadius: tokens.borderRadius.sm, backgroundColor: sc.bg, color: sc.text, textTransform: 'uppercase' as const }}>{req.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Tips Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Tip Summary</Text>
              <div style={{ textAlign: 'center' as const, marginBottom: tokens.spacing[4] }}>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Total Tips Earned</span>
                <span style={{ fontSize: '32px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], display: 'block' }}>${mockTips.totalAmount.toLocaleString()}</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>across {mockTips.sessionCount} sessions</span>
              </div>
              <div style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[50], marginBottom: tokens.spacing[4] }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[600], display: 'block' }}>Top Tipper</span>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>🏆 {mockTips.topTipper}</span>
                  </div>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>$450</span>
                </div>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Top Supporters</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {topTipBreakdown.map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px 0`, borderBottom: idx < topTipBreakdown.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.secondaryScale ? tokens.colors.secondaryScale[100] : tokens.colors.primaryScale[100], color: tokens.colors.secondaryScale ? tokens.colors.secondaryScale[600] : tokens.colors.primaryScale[600], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: tokens.typography.fontWeight.bold }}>{idx + 1}</span>
                      <div>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{t.name}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{t.sessions} sessions</span>
                      </div>
                    </div>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>${t.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div style={cardBase}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Performance</Text>
              {[
                { label: 'Avg Set Duration', value: '3.5 hrs', icon: '⏱️' },
                { label: 'Crowd Energy Score', value: '92/100', icon: '🔥' },
                { label: 'Repeat Bookings', value: '78%', icon: '🔁' },
                { label: 'Response Rate', value: '96%', icon: '💬' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px 0`,
                  borderBottom: idx < 3 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span>{item.icon}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
