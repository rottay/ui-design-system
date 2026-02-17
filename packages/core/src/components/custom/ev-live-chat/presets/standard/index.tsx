'use client';

/**
 * EvLiveChat - Standard Preset
 * Full-featured chat with pinned message, avatars, reactions, moderation, search, stats
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvLiveChatProps, LiveMessage } from '../../core';

const MOCK_PINNED: LiveMessage = {
  id: 'pin1', author: 'DJ Nova', authorAvatar: '', message: 'Welcome to Neon Nights! Drop your song requests in the chat. VIP members get priority! Next set starts at 11 PM.',
  time: new Date(Date.now() - 1800000), isPinned: true, isHighlighted: true, reactions: [{ emoji: '\uD83D\uDD25', count: 42 }, { emoji: '\u2764\uFE0F', count: 18 }],
};

const MOCK_MSGS: LiveMessage[] = [
  { id: '1', author: 'PartyKing', message: 'This remix is absolutely insane!!!', time: new Date(Date.now() - 15000), isPinned: false, isHighlighted: true, reactions: [{ emoji: '\uD83D\uDD25', count: 8 }, { emoji: '\uD83C\uDF89', count: 3 }] },
  { id: '2', author: 'NeonQueen', message: 'Can we get some deep house vibes?', time: new Date(Date.now() - 30000), isPinned: false, isHighlighted: false, reactions: [{ emoji: '\uD83D\uDC4D', count: 5 }] },
  { id: '3', author: 'BassDropper', message: 'That drop was legendary', time: new Date(Date.now() - 60000), isPinned: false, isHighlighted: false, reactions: [{ emoji: '\uD83D\uDCA5', count: 12 }] },
  { id: '4', author: 'DanceMachine', message: 'The crowd is going wild right now!', time: new Date(Date.now() - 90000), isPinned: false, isHighlighted: false, reactions: [] },
  { id: '5', author: 'VIPVibes', message: 'Best Friday night ever', time: new Date(Date.now() - 120000), isPinned: false, isHighlighted: true, reactions: [{ emoji: '\u2764\uFE0F', count: 7 }] },
  { id: '6', author: 'GlowStick', message: 'Anyone else near the main stage?', time: new Date(Date.now() - 180000), isPinned: false, isHighlighted: false, reactions: [] },
  { id: '7', author: 'TechnoFan99', message: 'Smooth transition into that track!', time: new Date(Date.now() - 240000), isPinned: false, isHighlighted: false, reactions: [{ emoji: '\uD83D\uDC4F', count: 4 }] },
  { id: '8', author: 'RaveLover', message: 'Turn up the bass!!', time: new Date(Date.now() - 300000), isPinned: false, isHighlighted: false, reactions: [{ emoji: '\uD83D\uDD0A', count: 9 }] },
  { id: '9', author: 'MidnightOwl', message: 'This set is pure magic', time: new Date(Date.now() - 360000), isPinned: false, isHighlighted: false, reactions: [] },
  { id: '10', author: 'EDMJunkie', message: 'I have been waiting for this all week!', time: new Date(Date.now() - 420000), isPinned: false, isHighlighted: false, reactions: [{ emoji: '\uD83D\uDE4C', count: 3 }] },
];

export const StandardEvLiveChat = createPreset<EvLiveChatProps>({
  name: 'EvLiveChat.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvLiveChatProps>) => {
    const { Box, Text } = primitives;
    const [msgInput, setMsgInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'highlighted' | 'reactions'>('all');
    const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
    const { messages: rawMessages = MOCK_MSGS, pinnedMessage: rawPinnedMessage = MOCK_PINNED, onSend, onPin, onReact, onDelete, className, style } = props;

    const messages = Array.isArray(rawMessages) ? rawMessages : MOCK_MSGS;
    const pinnedMessage = Array.isArray(rawPinnedMessage) ? rawPinnedMessage : MOCK_PINNED;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredMessages = useMemo(() => {
      return messages.filter(msg => {
        if (searchTerm && !msg.message.toLowerCase().includes(searchTerm.toLowerCase()) && !msg.author.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filterMode === 'highlighted' && !msg.isHighlighted) return false;
        if (filterMode === 'reactions' && msg.reactions.length === 0) return false;
        return true;
      });
    }, [messages, searchTerm, filterMode]);

    const formatTime = (d: Date) => {
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      return `${Math.floor(diff / 3600)}h ago`;
    };

    const avatarColors = [tokens.colors.primaryScale[200], tokens.colors.successScale[200], tokens.colors.warningScale[200], tokens.colors.infoScale[200], tokens.colors.errorScale[200]];
    const totalReactions = messages.reduce((s, m) => s + m.reactions.reduce((sr, r) => sr + r.count, 0), 0);
    const highlightedCount = messages.filter(m => m.isHighlighted).length;
    const uniqueAuthors = [...new Set(messages.map(m => m.author))].length;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{'\uD83D\uDCAC'} Live Chat</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filteredMessages.length} messages - {uniqueAuthors} participants</Text>
          </div>
          <span style={{ ...createBadgeStyle(tokens, 'success') }}>{'\uD83D\uDFE2'} {messages.length} online</span>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Messages', value: messages.length.toString(), emoji: '\uD83D\uDCAC', color: 'primary' as const },
            { label: 'Reactions', value: totalReactions.toString(), emoji: '\uD83D\uDD25', color: 'warning' as const },
            { label: 'VIP Messages', value: highlightedCount.toString(), emoji: '\u2B50', color: 'info' as const },
            { label: 'Active Users', value: uniqueAuthors.toString(), emoji: '\uD83D\uDC65', color: 'success' as const },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, textAlign: 'center' as const, padding: tokens.spacing[2] }}>
              <span style={{ fontSize: 16 }}>{stat.emoji}</span>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors[`${stat.color}Scale`][600], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 180, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'\uD83D\uDD0D'}</div>
              <input type="text" placeholder="Search messages..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <div onClick={() => setFilterMode('all')} style={createFilterPillStyle(tokens, { active: filterMode === 'all' })}>All</div>
              <div onClick={() => setFilterMode('highlighted')} style={createFilterPillStyle(tokens, { active: filterMode === 'highlighted' })}>{'\u2B50'} VIP</div>
              <div onClick={() => setFilterMode('reactions')} style={createFilterPillStyle(tokens, { active: filterMode === 'reactions' })}>{'\uD83D\uDD25'} Reactions</div>
            </div>
          </div>
        </div>

        <div style={{ ...cardBase, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, maxHeight: 500 }}>
          {/* Pinned Message */}
          {pinnedMessage && (
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.warningScale[50], borderBottom: `1px solid ${tokens.colors.warningScale[200]}`, display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3] }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{'\uD83D\uDCCC'}</span>
              <div style={{ flex: 1 }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.warningScale[700], display: 'block', marginBottom: 2 }}>Pinned by {pinnedMessage.author}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{pinnedMessage.message}</Text>
                {pinnedMessage.reactions.length > 0 && (
                  <div style={{ display: 'flex', gap: tokens.spacing[1], marginTop: tokens.spacing[1] }}>
                    {pinnedMessage.reactions.map((r, i) => (
                      <span key={i} style={{ fontSize: tokens.typography.fontSize.xs, backgroundColor: tokens.colors.common.white, padding: `1px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.full, border: `1px solid ${tokens.colors.neutral[200]}` }}>{r.emoji} {r.count}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[3] }}>
            {filteredMessages.map((msg, idx) => {
              const isHovered = hoveredMsg === msg.id;
              return (
                <div key={msg.id}
                  onMouseEnter={() => setHoveredMsg(msg.id)} onMouseLeave={() => setHoveredMsg(null)}
                  style={{ display: 'flex', gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md, marginBottom: tokens.spacing[1], backgroundColor: msg.isHighlighted ? tokens.colors.primaryScale[50] : isHovered ? tokens.colors.neutral[100] : 'transparent', ...hoverStyle }}>
                  <div style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.full, backgroundColor: avatarColors[idx % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700], flexShrink: 0 }}>
                    {msg.author.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: 2 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{msg.author}</Text>
                      {msg.isHighlighted && <span style={{ fontSize: 10 }}>{'\u2B50'}</span>}
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatTime(msg.time)}</Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], display: 'block' }}>{msg.message}</Text>
                    {msg.reactions.length > 0 && (
                      <div style={{ display: 'flex', gap: tokens.spacing[1], marginTop: tokens.spacing[1] }}>
                        {msg.reactions.map((r, ri) => (
                          <button key={ri} onClick={() => onReact?.(msg.id, r.emoji)} style={{ fontSize: tokens.typography.fontSize.xs, backgroundColor: tokens.colors.neutral[100], padding: `1px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, border: `1px solid ${tokens.colors.neutral[200]}`, cursor: 'pointer', fontFamily: 'inherit' }}>{r.emoji} {r.count}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Moderation */}
                  <div style={{ display: 'flex', gap: tokens.spacing[1], alignItems: 'flex-start', opacity: isHovered ? 1 : 0.3 }}>
                    <button onClick={() => onPin?.(msg.id)} style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: tokens.colors.neutral[400], fontFamily: 'inherit' }} title="Pin">{'\uD83D\uDCCC'}</button>
                    <button onClick={() => onDelete?.(msg.id)} style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: tokens.colors.neutral[400], fontFamily: 'inherit' }} title="Delete">{'\uD83D\uDDD1'}</button>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {filteredMessages.length === 0 && (
              <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'\uD83D\uDCAC'}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block' }}>No messages match your filter</Text>
              </div>
            )}
          </div>

          {/* Send Input */}
          <div style={{ padding: tokens.spacing[3], borderTop: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', gap: tokens.spacing[2] }}>
            <input type="text" placeholder="Type a message..." value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && msgInput.trim()) { onSend?.(msgInput); setMsgInput(''); } }}
              style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: `1px solid ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, outline: 'none', backgroundColor: tokens.colors.common.white, fontFamily: 'inherit' }}
            />
            <button onClick={() => { if (msgInput.trim()) { onSend?.(msgInput); setMsgInput(''); } }}
              style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>
              Send
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div style={{ ...cardBase, marginTop: tokens.spacing[4], display: 'flex', justifyContent: 'space-around', padding: tokens.spacing[3] }}>
          {[
            { label: 'Total Messages', value: messages.length.toString(), emoji: '\uD83D\uDCAC' },
            { label: 'Total Reactions', value: totalReactions.toString(), emoji: '\uD83D\uDD25' },
            { label: 'VIP Messages', value: highlightedCount.toString(), emoji: '\u2B50' },
            { label: 'Participants', value: uniqueAuthors.toString(), emoji: '\uD83D\uDC65' },
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
