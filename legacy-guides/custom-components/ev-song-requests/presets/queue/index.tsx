'use client';

/**
 * EvSongRequests - Queue Preset
 * Sortable song request queue with status management
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createPanelHeaderStyle, createHoverStyle, createFilterPillStyle } from '../../../helpers';
import type { EvSongRequestsProps, SongRequestItem } from '../../core';

const MOCK: SongRequestItem[] = [
  { id: 'r1', songTitle: 'Blinding Lights', artist: 'The Weeknd', requesterName: 'PartyKing', votes: 24, status: 'playing', requestedAt: new Date(Date.now() - 600000), tipAmount: 50 },
  { id: 'r2', songTitle: 'Levels', artist: 'Avicii', requesterName: 'MidnightOwl', votes: 18, status: 'accepted', requestedAt: new Date(Date.now() - 500000), tipAmount: 25 },
  { id: 'r3', songTitle: 'Titanium', artist: 'David Guetta ft. Sia', requesterName: 'NeonQueen', votes: 15, status: 'pending', requestedAt: new Date(Date.now() - 400000), tipAmount: 10 },
  { id: 'r4', songTitle: 'Strobe', artist: 'Deadmau5', requesterName: 'TechnoFan99', votes: 12, status: 'pending', requestedAt: new Date(Date.now() - 350000) },
  { id: 'r5', songTitle: 'Clarity', artist: 'Zedd ft. Foxes', requesterName: 'GlowStick', votes: 8, status: 'rejected', requestedAt: new Date(Date.now() - 300000), tipAmount: 5 },
  { id: 'r6', songTitle: 'In The Name of Love', artist: 'Martin Garrix', requesterName: 'RaveLover', votes: 22, status: 'accepted', requestedAt: new Date(Date.now() - 250000), tipAmount: 30 },
  { id: 'r7', songTitle: 'Scary Monsters', artist: 'Skrillex', requesterName: 'BassDropper', votes: 6, status: 'pending', requestedAt: new Date(Date.now() - 200000) },
  { id: 'r8', songTitle: 'Summer', artist: 'Calvin Harris', requesterName: 'DanceMachine', votes: 14, status: 'pending', requestedAt: new Date(Date.now() - 150000), tipAmount: 15 },
];

const STATUS_ORDER: Record<string, number> = { playing: 0, accepted: 1, pending: 2, rejected: 3 };

export const QueueEvSongRequests = createPreset<EvSongRequestsProps>({
  name: 'EvSongRequests.Queue',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvSongRequestsProps>) => {
    const { Box, Text } = primitives;
    const [filter, setFilter] = useState<string>('all');
    const { requests = MOCK, onAccept, onReject, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const panelHeader = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const statusBadges = useMemo(() => ({
      playing: createBadgeStyle(tokens, 'success'), accepted: createBadgeStyle(tokens, 'primary'),
      pending: createBadgeStyle(tokens, 'warning'), rejected: createBadgeStyle(tokens, 'error'),
    }), [tokens]);
    const statusEmoji: Record<string, string> = { playing: '🎵', accepted: '✅', pending: '⏳', rejected: '❌' };

    const filtered = useMemo(() => {
      const list = filter === 'all' ? requests : requests.filter(r => r.status === filter);
      return [...list].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
    }, [requests, filter]);

    const counts = useMemo(() => ({
      all: requests.length, playing: requests.filter(r => r.status === 'playing').length,
      accepted: requests.filter(r => r.status === 'accepted').length, pending: requests.filter(r => r.status === 'pending').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    }), [requests]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>🎵 Song Request Queue</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{requests.length} requests - ${requests.reduce((s, r) => s + (r.tipAmount || 0), 0)} in tips</Text>
          </div>
        </div>

        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[4], flexWrap: 'wrap' as const }}>
          {(['all', 'playing', 'accepted', 'pending', 'rejected'] as const).map((key) => (
            <button key={key} onClick={() => setFilter(key)} style={{ ...createFilterPillStyle(tokens, { active: filter === key }), border: 'none', fontFamily: 'inherit' }}>
              {key === 'all' ? '📋' : statusEmoji[key]} {key.charAt(0).toUpperCase() + key.slice(1)} ({counts[key]})
            </button>
          ))}
        </div>

        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
          <div style={{ ...panelHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Requests</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Sorted by status priority</Text>
          </div>
          {filtered.map((req, idx) => (
            <div key={req.id} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: idx < filtered.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', display: 'flex', alignItems: 'center', gap: tokens.spacing[3], backgroundColor: req.status === 'playing' ? tokens.colors.successScale[50] : tokens.colors.common.white, ...hoverStyle }}>
              <div style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.full, backgroundColor: req.status === 'playing' ? tokens.colors.successScale[100] : tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: req.status === 'playing' ? tokens.colors.successScale[700] : tokens.colors.neutral[600], flexShrink: 0 }}>{idx + 1}</div>
              <div style={{ flex: 1 }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{req.songTitle}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{req.artist} - by {req.requesterName}</Text>
              </div>
              <div style={{ textAlign: 'center' as const, minWidth: 50 }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], display: 'block' }}>{req.votes}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>votes</Text>
              </div>
              {req.tipAmount ? <span style={{ ...createBadgeStyle(tokens, 'success'), minWidth: 50, justifyContent: 'center' }}>💰 ${req.tipAmount}</span> : <div style={{ minWidth: 50 }} />}
              <span style={{ ...(statusBadges[req.status] || {}), minWidth: 70, justifyContent: 'center' }}>{statusEmoji[req.status]} {req.status}</span>
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                  <button onClick={() => onAccept?.(req.id)} style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.successScale[100], color: tokens.colors.successScale[700], border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✓</button>
                  <button onClick={() => onReject?.(req.id)} style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.errorScale[100], color: tokens.colors.errorScale[700], border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
