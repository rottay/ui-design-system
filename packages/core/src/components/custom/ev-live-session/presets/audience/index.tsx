'use client';

/**
 * EvLiveSession - Audience Preset
 * Audience view with chat, song requests & tipping
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
  { id: '1', author: 'PartyKing', message: 'This set is fire!!!', time: new Date(Date.now() - 30000), isHighlighted: true },
  { id: '2', author: 'NeonQueen', message: 'Can you play some house music?', time: new Date(Date.now() - 60000), isHighlighted: false },
  { id: '3', author: 'BassDropper', message: 'The bass is insane right now', time: new Date(Date.now() - 90000), isHighlighted: false },
  { id: '4', author: 'DanceMachine', message: 'Everyone on the floor!!', time: new Date(Date.now() - 120000), isHighlighted: false },
  { id: '5', author: 'VIPVibes', message: 'Best DJ set I have heard all year', time: new Date(Date.now() - 150000), isHighlighted: true },
  { id: '6', author: 'GlowStick', message: 'The visuals are amazing', time: new Date(Date.now() - 180000), isHighlighted: false },
  { id: '7', author: 'TechnoFan99', message: 'Smooth transition!', time: new Date(Date.now() - 210000), isHighlighted: false },
  { id: '8', author: 'RaveLover', message: 'This is what I came for!', time: new Date(Date.now() - 240000), isHighlighted: false },
  { id: '9', author: 'MidnightOwl', message: 'Play Levels by Avicii please!', time: new Date(Date.now() - 270000), isHighlighted: false },
  { id: '10', author: 'EDMJunkie', message: 'Hands up everyone!', time: new Date(Date.now() - 300000), isHighlighted: false },
];

const MOCK_REQUESTS: SongRequest[] = [
  { id: 'r1', songTitle: 'Blinding Lights', artist: 'The Weeknd', requesterName: 'PartyKing', votes: 24, status: 'playing' },
  { id: 'r2', songTitle: 'Levels', artist: 'Avicii', requesterName: 'MidnightOwl', votes: 18, status: 'accepted' },
  { id: 'r3', songTitle: 'Titanium', artist: 'David Guetta', requesterName: 'NeonQueen', votes: 15, status: 'pending' },
  { id: 'r4', songTitle: 'Strobe', artist: 'Deadmau5', requesterName: 'TechnoFan99', votes: 12, status: 'pending' },
];

export const AudienceEvLiveSession = createPreset<EvLiveSessionProps>({
  name: 'EvLiveSession.Audience',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvLiveSessionProps>) => {
    const { Box, Text } = primitives;
    const [chatInput, setChatInput] = useState('');
    const [requestSong, setRequestSong] = useState('');
    const [requestArtist, setRequestArtist] = useState('');
    const [showTipModal, setShowTipModal] = useState(false);

    const {
      session,
      chatMessages: rawChatMessages = MOCK_CHAT,
      songRequests: rawSongRequests = MOCK_REQUESTS,
      onSendMessage,
      className,
      style,
    } = props;

    const chatMessages = Array.isArray(rawChatMessages) ? rawChatMessages : MOCK_CHAT;
    const songRequests = Array.isArray(rawSongRequests) ? rawSongRequests : MOCK_REQUESTS;

    const djName = session?.djName ?? 'DJ Nova';
    const eventName = session?.eventName ?? 'Neon Nights Festival';
    const viewerCount = session?.viewerCount ?? 1247;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const liveBadge = useMemo(() => createBadgeStyle(tokens, 'error'), [tokens]);
    const panelHeader = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);
    const statusBadges: Record<string, ReturnType<typeof createBadgeStyle>> = useMemo(() => ({
      playing: createBadgeStyle(tokens, 'success'),
      accepted: createBadgeStyle(tokens, 'primary'),
      pending: createBadgeStyle(tokens, 'warning'),
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
          padding: tokens.spacing[4],
          maxWidth: 480,
          margin: '0 auto',
          ...style,
        }}
      >
        {/* Session Info Header */}
        <div
          style={{
            ...cardBase,
            padding: tokens.spacing[4],
            marginBottom: tokens.spacing[4],
            textAlign: 'center' as const,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[100],
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}
            >
              🎧
            </div>
            <div style={{ textAlign: 'left' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
                {djName}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                {eventName}
              </Text>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: tokens.spacing[4] }}>
            <span style={{ ...liveBadge, fontWeight: tokens.typography.fontWeight.bold }}>🔴 LIVE</span>
            <span style={{ ...createBadgeStyle(tokens, 'info') }}>👁 {viewerCount.toLocaleString()} viewers</span>
          </div>
        </div>

        {/* Chat Feed */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden', marginBottom: tokens.spacing[4] }}>
          <div style={{ ...panelHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
              💬 Live Chat
            </Text>
          </div>
          <div style={{ maxHeight: 280, overflow: 'auto', padding: tokens.spacing[2] }}>
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  marginBottom: 2,
                  backgroundColor: msg.isHighlighted ? tokens.colors.warningScale[50] : 'transparent',
                }}
              >
                <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600], marginRight: tokens.spacing[2] }}>
                  {msg.author}{msg.isHighlighted ? ' ⭐' : ''}
                </span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                  {msg.message}
                </span>
              </div>
            ))}
          </div>
          <div style={{ padding: tokens.spacing[3], borderTop: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', gap: tokens.spacing[2] }}>
            <input
              type="text"
              placeholder="Say something..."
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
              onClick={() => { if (chatInput.trim()) { onSendMessage?.(chatInput); setChatInput(''); } }}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                border: 'none',
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Song Request Form */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], display: 'block', marginBottom: tokens.spacing[3] }}>
            🎵 Request a Song
          </Text>
          <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
            <input
              type="text"
              placeholder="Song title"
              value={requestSong}
              onChange={(e) => setRequestSong(e.target.value)}
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
            <input
              type="text"
              placeholder="Artist"
              value={requestArtist}
              onChange={(e) => setRequestArtist(e.target.value)}
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
          </div>
          <button
            style={{
              width: '100%',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
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
            Submit Request
          </button>
          {/* Current Queue */}
          <div style={{ marginTop: tokens.spacing[3] }}>
            {songRequests.filter(r => r.status !== 'rejected').map((req) => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${tokens.spacing[2]}px 0`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], display: 'block' }}>
                    {req.songTitle} - {req.artist}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    {req.votes} votes
                  </Text>
                </div>
                <span style={statusBadges[req.status] || {}}>{req.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tip Button */}
        <button
          onClick={() => setShowTipModal(!showTipModal)}
          style={{
            width: '100%',
            padding: `${tokens.spacing[3]}px`,
            backgroundColor: tokens.colors.successScale[600],
            color: tokens.colors.common.white,
            border: 'none',
            borderRadius: tokens.borderRadius.lg,
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.bold,
            cursor: 'pointer',
            fontFamily: 'inherit',
            ...hoverStyle,
          }}
        >
          💰 Send a Tip to {djName}
        </button>

        {showTipModal && (
          <div style={{ ...cardBase, marginTop: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], display: 'block', marginBottom: tokens.spacing[3] }}>
              Choose tip amount
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: tokens.spacing[2] }}>
              {[5, 10, 25, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  style={{
                    padding: `${tokens.spacing[3]}px`,
                    backgroundColor: tokens.colors.common.white,
                    border: `2px solid ${tokens.colors.successScale[300]}`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.successScale[700],
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    ...hoverStyle,
                  }}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>
        )}
      </Box>
    );
  },
});
