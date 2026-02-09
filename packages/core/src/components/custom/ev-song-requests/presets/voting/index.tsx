'use client';

/**
 * EvSongRequests - Voting Preset
 * Card grid with vote counts and upvote buttons
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { EvSongRequestsProps, SongRequestItem } from '../../core';

const MOCK: SongRequestItem[] = [
  { id: 'r1', songTitle: 'Blinding Lights', artist: 'The Weeknd', requesterName: 'PartyKing', votes: 24, status: 'playing', requestedAt: new Date(Date.now() - 600000), tipAmount: 50 },
  { id: 'r2', songTitle: 'Levels', artist: 'Avicii', requesterName: 'MidnightOwl', votes: 18, status: 'accepted', requestedAt: new Date(Date.now() - 500000), tipAmount: 25 },
  { id: 'r3', songTitle: 'Titanium', artist: 'David Guetta ft. Sia', requesterName: 'NeonQueen', votes: 15, status: 'pending', requestedAt: new Date(Date.now() - 400000), tipAmount: 10 },
  { id: 'r4', songTitle: 'Strobe', artist: 'Deadmau5', requesterName: 'TechnoFan99', votes: 12, status: 'pending', requestedAt: new Date(Date.now() - 350000) },
  { id: 'r5', songTitle: 'Clarity', artist: 'Zedd ft. Foxes', requesterName: 'GlowStick', votes: 8, status: 'pending', requestedAt: new Date(Date.now() - 300000), tipAmount: 5 },
  { id: 'r6', songTitle: 'In The Name of Love', artist: 'Martin Garrix', requesterName: 'RaveLover', votes: 22, status: 'accepted', requestedAt: new Date(Date.now() - 250000), tipAmount: 30 },
  { id: 'r7', songTitle: 'Scary Monsters', artist: 'Skrillex', requesterName: 'BassDropper', votes: 6, status: 'pending', requestedAt: new Date(Date.now() - 200000) },
  { id: 'r8', songTitle: 'Summer', artist: 'Calvin Harris', requesterName: 'DanceMachine', votes: 14, status: 'pending', requestedAt: new Date(Date.now() - 150000), tipAmount: 15 },
];

export const VotingEvSongRequests = createPreset<EvSongRequestsProps>({
  name: 'EvSongRequests.Voting',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvSongRequestsProps>) => {
    const { Box, Text } = primitives;
    const [search, setSearch] = useState('');
    const { requests = MOCK, onVote, onSearch, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const statusBadges = useMemo(() => ({
      playing: createBadgeStyle(tokens, 'success'), accepted: createBadgeStyle(tokens, 'primary'),
      pending: createBadgeStyle(tokens, 'warning'), rejected: createBadgeStyle(tokens, 'error'),
    }), [tokens]);

    const filtered = useMemo(() => {
      const q = search.toLowerCase();
      return requests.filter(r => r.status !== 'rejected' && (!q || r.songTitle.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q)))
        .sort((a, b) => b.votes - a.votes);
    }, [requests, search]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>🗳 Vote for Songs</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Upvote your favorites to hear them next</Text>
          </div>
        </div>

        <div style={{ marginBottom: tokens.spacing[4] }}>
          <input
            type="text" placeholder="🔍 Search songs or artists..."
            value={search} onChange={(e) => { setSearch(e.target.value); onSearch?.(e.target.value); }}
            style={{ width: '100%', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, border: `1px solid ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.sm, outline: 'none', backgroundColor: tokens.colors.common.white, fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: tokens.spacing[4] }}>
          {filtered.map((req) => (
            <div key={req.id} style={{ ...cardBase, padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3], ...hoverStyle, position: 'relative' as const }}>
              {req.status === 'playing' && (
                <div style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, height: 3, backgroundColor: tokens.colors.successScale[500], borderRadius: `${tokens.borderRadius.lg} ${tokens.borderRadius.lg} 0 0` }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: 2 }}>{req.songTitle}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{req.artist}</Text>
                </div>
                <span style={statusBadges[req.status] || {}}>{req.status === 'playing' ? '🎵' : req.status === 'accepted' ? '✅' : '⏳'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>by {req.requesterName}</Text>
                {req.tipAmount ? <span style={{ ...createBadgeStyle(tokens, 'success') }}>💰 ${req.tipAmount}</span> : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: tokens.spacing[2], borderTop: `1px solid ${tokens.colors.neutral[100]}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{req.votes}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>votes</Text>
                </div>
                <button
                  onClick={() => onVote?.(req.id)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[50],
                    color: tokens.colors.primaryScale[700], border: `1px solid ${tokens.colors.primaryScale[200]}`,
                    borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', fontFamily: 'inherit', ...hoverStyle,
                  }}
                >
                  👍 Upvote
                </button>
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
