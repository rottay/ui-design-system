'use client';

/**
 * EvDjDashboard - Compact Preset
 * Condensed gig list + quick stats in a compact single-column layout
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvDjDashboardProps } from '../../core';

export const CompactEvDjDashboard = createPreset<EvDjDashboardProps>({
  name: 'EvDjDashboard.Compact',
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

    const mockTips = tipSummary || { totalAmount: 2450, currency: 'USD', topTipper: 'Sarah M.', sessionCount: 42 };

    const mockRequests = recentRequests?.length ? recentRequests : [
      { id: 'r1', songTitle: 'Blinding Lights', artist: 'The Weeknd', status: 'played' as const, requestedAt: new Date(Date.now() - 15 * 60000) },
      { id: 'r2', songTitle: 'Midnight City', artist: 'M83', status: 'accepted' as const, requestedAt: new Date(Date.now() - 25 * 60000) },
      { id: 'r3', songTitle: 'Strobe', artist: 'Deadmau5', status: 'pending' as const, requestedAt: new Date(Date.now() - 5 * 60000) },
      { id: 'r4', songTitle: 'Get Lucky', artist: 'Daft Punk', status: 'played' as const, requestedAt: new Date(Date.now() - 45 * 60000) },
    ];

    const requestStatusColors: Record<string, { bg: string; text: string }> = {
      pending: { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700] },
      accepted: { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700] },
      played: { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] },
      rejected: { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700] },
    };

    const quickStats = [
      { label: 'Plays', value: '1,247', icon: '🎵' },
      { label: 'Rating', value: '4.8', icon: '⭐' },
      { label: 'Fans', value: '12.4K', icon: '👥' },
      { label: 'Tips', value: `$${mockTips.totalAmount.toLocaleString()}`, icon: '💰' },
    ];

    const totalGigFees = mockGigs.reduce((sum, g) => sum + g.fee, 0);

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[4],
          ...style,
        }}
      >
        {/* Compact Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ width: 40, height: 40, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.lg }}>🎧</div>
          <div style={{ flex: 1 }}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{artistName}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Compact Dashboard</Text>
          </div>
          <span style={{ ...createBadgeStyle(tokens, 'success'), fontSize: tokens.typography.fontSize.xs }}>Online</span>
        </div>

        {/* Quick Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
          {quickStats.map((stat, idx) => (
            <div key={idx} style={{
              ...cardBase, padding: tokens.spacing[3],
              textAlign: 'center' as const,
            }}>
              <span style={{ display: 'block', marginBottom: 2 }}>{stat.icon}</span>
              <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</span>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Condensed Gig List */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Upcoming Gigs</Text>
            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[600] }}>Total: ${totalGigFees.toLocaleString()}</span>
          </div>
          {mockGigs.map((gig, idx) => (
            <div
              key={gig.id}
              onClick={() => onGigClick?.(gig.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px 0`,
                borderBottom: idx < mockGigs.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: tokens.borderRadius.sm,
                backgroundColor: tokens.colors.primaryScale[50],
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 8, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{gig.date.toLocaleDateString([], { month: 'short' }).toUpperCase()}</span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700], lineHeight: 1 }}>{gig.date.getDate()}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gig.eventName}</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{gig.venue}</span>
              </div>
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], flexShrink: 0 }}>${gig.fee.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Recent Requests - compact */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Recent Requests</Text>
            <span style={{
              fontSize: 10, fontWeight: tokens.typography.fontWeight.bold,
              padding: '1px 6px', borderRadius: tokens.borderRadius.sm,
              backgroundColor: tokens.colors.warningScale[100], color: tokens.colors.warningScale[700],
            }}>{mockRequests.filter(r => r.status === 'pending').length} pending</span>
          </div>
          {mockRequests.map((req, idx) => {
            const sc = requestStatusColors[req.status];
            return (
              <div key={req.id} style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                padding: `${tokens.spacing[1]}px 0`,
                borderBottom: idx < mockRequests.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
              }}>
                <span style={{ fontSize: tokens.typography.fontSize.sm }}>🎵</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], display: 'block' }}>{req.songTitle}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{req.artist}</span>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: tokens.typography.fontWeight.bold,
                  padding: '1px 6px', borderRadius: tokens.borderRadius.sm,
                  backgroundColor: sc.bg, color: sc.text, textTransform: 'uppercase' as const,
                }}>{req.status}</span>
              </div>
            );
          })}
        </div>

        {/* Tip Summary - compact */}
        <div style={cardBase}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>Tips Earned</Text>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{mockTips.sessionCount} sessions</span>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], display: 'block' }}>${mockTips.totalAmount.toLocaleString()}</span>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Top: {mockTips.topTipper} 🏆</span>
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
