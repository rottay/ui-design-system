'use client';

/**
 * EvLiveSession - Performer Preset
 * Live DJ session control panel with chat, requests & tips
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createPanelHeaderStyle,
} from '../../../helpers';
import type { EvLiveSessionProps, ChatMessage, SongRequest, TipNotification } from '../../core';

const MOCK_CHAT: ChatMessage[] = [
  { id: '1', author: 'PartyKing', message: 'This set is absolutely fire!!! Keep it going!', time: new Date(Date.now() - 30000), isHighlighted: true },
  { id: '2', author: 'NeonQueen', message: 'Can you play some house music next?', time: new Date(Date.now() - 60000), isHighlighted: false },
  { id: '3', author: 'BassDropper', message: 'The bass is insane right now', time: new Date(Date.now() - 90000), isHighlighted: false },
  { id: '4', author: 'DanceMachine', message: 'Everyone on the floor!!', time: new Date(Date.now() - 120000), isHighlighted: false },
  { id: '5', author: 'VIPVibes', message: 'Best DJ set I have heard all year', time: new Date(Date.now() - 150000), isHighlighted: true },
  { id: '6', author: 'GlowStick', message: 'The visuals are amazing with this track', time: new Date(Date.now() - 180000), isHighlighted: false },
  { id: '7', author: 'TechnoFan99', message: 'Smooth transition!', time: new Date(Date.now() - 210000), isHighlighted: false },
  { id: '8', author: 'RaveLover', message: 'This is what I came for!', time: new Date(Date.now() - 240000), isHighlighted: false },
  { id: '9', author: 'MidnightOwl', message: 'Play Levels by Avicii please!', time: new Date(Date.now() - 270000), isHighlighted: false },
  { id: '10', author: 'EDMJunkie', message: 'Hands up everyone!', time: new Date(Date.now() - 300000), isHighlighted: false },
  { id: '11', author: 'NightShift', message: 'This melody is gorgeous', time: new Date(Date.now() - 330000), isHighlighted: false },
  { id: '12', author: 'CrowdSurfer', message: 'What a vibe tonight!', time: new Date(Date.now() - 360000), isHighlighted: false },
];

const MOCK_REQUESTS: SongRequest[] = [
  { id: 'r1', songTitle: 'Blinding Lights', artist: 'The Weeknd', requesterName: 'PartyKing', votes: 24, status: 'playing' },
  { id: 'r2', songTitle: 'Levels', artist: 'Avicii', requesterName: 'MidnightOwl', votes: 18, status: 'accepted' },
  { id: 'r3', songTitle: 'Titanium', artist: 'David Guetta', requesterName: 'NeonQueen', votes: 15, status: 'pending' },
  { id: 'r4', songTitle: 'Strobe', artist: 'Deadmau5', requesterName: 'TechnoFan99', votes: 12, status: 'pending' },
  { id: 'r5', songTitle: 'Clarity', artist: 'Zedd', requesterName: 'GlowStick', votes: 3, status: 'rejected' },
];

const MOCK_TIPS: TipNotification[] = [
  { id: 't1', from: 'PartyKing', amount: 150, currency: 'USD', message: 'Best set ever!', time: new Date(Date.now() - 20000) },
  { id: 't2', from: 'VIPVibes', amount: 50, currency: 'USD', message: 'Love it!', time: new Date(Date.now() - 80000) },
  { id: 't3', from: 'NeonQueen', amount: 25, currency: 'USD', time: new Date(Date.now() - 140000) },
];

export const PerformerEvLiveSession = createPreset<EvLiveSessionProps>({
  name: 'EvLiveSession.Performer',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvLiveSessionProps>) => {
    const { Box, Text } = primitives;
    const [chatInput, setChatInput] = useState('');

    const {
      session,
      chatMessages: rawChatMessages = MOCK_CHAT,
      songRequests: rawSongRequests = MOCK_REQUESTS,
      recentTips: rawRecentTips = MOCK_TIPS,
      onSendMessage,
      onAcceptRequest,
      onRejectRequest,
      className,
      style,
    } = props;

    const chatMessages = Array.isArray(rawChatMessages) ? rawChatMessages : MOCK_CHAT;
    const songRequests = Array.isArray(rawSongRequests) ? rawSongRequests : MOCK_REQUESTS;
    const recentTips = Array.isArray(rawRecentTips) ? rawRecentTips : MOCK_TIPS;

    const djName = session?.djName ?? 'DJ Nova';
    const eventName = session?.eventName ?? 'Neon Nights Festival';
    const viewerCount = session?.viewerCount ?? 1247;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(
      () => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }),
      [tokens, isGlass]
    );
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const liveBadge = useMemo(() => createBadgeStyle(tokens, 'error'), [tokens]);
    const panelHeader = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);

    const statusColors: Record<string, ReturnType<typeof createBadgeStyle>> = useMemo(() => ({
      playing: createBadgeStyle(tokens, 'success'),
      accepted: createBadgeStyle(tokens, 'primary'),
      pending: createBadgeStyle(tokens, 'warning'),
      rejected: createBadgeStyle(tokens, 'error'),
    }), [tokens]);

    const formatTime = (date: Date) => {
      const diff = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      return `${Math.floor(diff / 3600)}h ago`;
    };

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
        {/* Session Header */}
        <div
          style={{
            ...cardBase,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[6],
            padding: tokens.spacing[5],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              🎧
            </div>
            <div>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
                {djName}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                {eventName}
              </Text>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
            <span style={{ ...liveBadge, animation: 'pulse 2s infinite', fontWeight: tokens.typography.fontWeight.bold }}>
              🔴 LIVE
            </span>
            <div style={{ textAlign: 'right' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
                {viewerCount.toLocaleString()}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                👁 viewers
              </Text>
            </div>
          </div>
        </div>

        {/* 2-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[6] }}>
          {/* Left: Chat Feed */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const }}>
            <div style={{ ...panelHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                💬 Live Chat
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                {chatMessages.length} messages
              </Text>
            </div>
            <div style={{ flex: 1, maxHeight: 360, overflow: 'auto', padding: tokens.spacing[2] }}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    marginBottom: tokens.spacing[1],
                    backgroundColor: msg.isHighlighted ? tokens.colors.warningScale[50] : 'transparent',
                    border: msg.isHighlighted ? `1px solid ${tokens.colors.warningScale[200]}` : '1px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600] }}>
                      {msg.author} {msg.isHighlighted && '⭐'}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                      {formatTime(msg.time)}
                    </Text>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                    {msg.message}
                  </Text>
                </div>
              ))}
            </div>
            <div style={{ padding: tokens.spacing[3], borderTop: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', gap: tokens.spacing[2] }}>
              <input
                type="text"
                placeholder="Send a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    onSendMessage?.(chatInput);
                    setChatInput('');
                  }
                }}
                style={{
                  flex: 1,
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  border: `1px solid ${tokens.colors.neutral[300]}`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  outline: 'none',
                  backgroundColor: tokens.colors.common.white,
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => {
                  if (chatInput.trim()) {
                    onSendMessage?.(chatInput);
                    setChatInput('');
                  }
                }}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  border: 'none',
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  ...hoverStyle,
                }}
              >
                Send
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[6] }}>
            {/* Song Request Queue */}
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <div style={{ ...panelHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                  🎵 Song Requests
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {songRequests.length} requests
                </Text>
              </div>
              <div style={{ maxHeight: 220, overflow: 'auto' }}>
                {songRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], display: 'block' }}>
                        {req.songTitle}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {req.artist} - by {req.requesterName} - {req.votes} votes
                      </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={statusColors[req.status]}>
                        {req.status}
                      </span>
                      {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                          <button
                            onClick={() => onAcceptRequest?.(req.id)}
                            style={{
                              width: 28, height: 28,
                              borderRadius: tokens.borderRadius.md,
                              backgroundColor: tokens.colors.successScale[100],
                              color: tokens.colors.successScale[700],
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'inherit',
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => onRejectRequest?.(req.id)}
                            style={{
                              width: 28, height: 28,
                              borderRadius: tokens.borderRadius.md,
                              backgroundColor: tokens.colors.errorScale[100],
                              color: tokens.colors.errorScale[700],
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'inherit',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip Notifications */}
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              <div style={{ ...panelHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                  💰 Recent Tips
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>
                  ${recentTips.reduce((s, t) => s + t.amount, 0)}
                </Text>
              </div>
              {recentTips.map((tip) => (
                <div
                  key={tip.id}
                  style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], display: 'block' }}>
                      {tip.from}
                    </Text>
                    {tip.message && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontStyle: 'italic' as const }}>
                        &quot;{tip.message}&quot;
                      </Text>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600], display: 'block' }}>
                      ${tip.amount}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                      {formatTime(tip.time)}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Box>
    );
  },
});
