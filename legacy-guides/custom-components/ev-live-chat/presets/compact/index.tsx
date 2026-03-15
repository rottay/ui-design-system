'use client';

/**
 * EvLiveChat - Compact Preset
 * Minimal sidebar chat with condensed messages, quick reactions, activity indicator
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

const MOCK: LiveMessage[] = [
  { id: '1', author: 'PartyKing', message: 'This set is fire!!!', time: new Date(Date.now() - 15000), isPinned: false, isHighlighted: true, reactions: [{ emoji: '\uD83D\uDD25', count: 8 }] },
  { id: '2', author: 'NeonQueen', message: 'Play some house music!', time: new Date(Date.now() - 30000), isPinned: false, isHighlighted: false, reactions: [] },
  { id: '3', author: 'BassDropper', message: 'That bass drop though', time: new Date(Date.now() - 60000), isPinned: false, isHighlighted: false, reactions: [{ emoji: '\uD83D\uDCA5', count: 4 }] },
  { id: '4', author: 'DanceMachine', message: 'Everyone on the floor!', time: new Date(Date.now() - 90000), isPinned: false, isHighlighted: false, reactions: [] },
  { id: '5', author: 'VIPVibes', message: 'Best set I have heard all year', time: new Date(Date.now() - 120000), isPinned: false, isHighlighted: true, reactions: [{ emoji: '\u2764\uFE0F', count: 7 }] },
  { id: '6', author: 'GlowStick', message: 'The visuals are amazing', time: new Date(Date.now() - 180000), isPinned: false, isHighlighted: false, reactions: [] },
  { id: '7', author: 'TechnoFan99', message: 'Smooth transition!', time: new Date(Date.now() - 240000), isPinned: false, isHighlighted: false, reactions: [] },
  { id: '8', author: 'RaveLover', message: 'Turn it up!', time: new Date(Date.now() - 300000), isPinned: false, isHighlighted: false, reactions: [{ emoji: '\uD83D\uDD0A', count: 3 }] },
  { id: '9', author: 'MidnightOwl', message: 'Pure magic', time: new Date(Date.now() - 360000), isPinned: false, isHighlighted: false, reactions: [] },
  { id: '10', author: 'EDMJunkie', message: 'Hands up!', time: new Date(Date.now() - 420000), isPinned: false, isHighlighted: false, reactions: [] },
];

export const CompactEvLiveChat = createPreset<EvLiveChatProps>({
  name: 'EvLiveChat.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvLiveChatProps>) => {
    const { Box, Text } = primitives;
    const [msgInput, setMsgInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
    const { messages = MOCK, onSend, onReact, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const filteredMessages = useMemo(() => {
      if (!searchTerm) return messages;
      return messages.filter(m => m.message.toLowerCase().includes(searchTerm.toLowerCase()) || m.author.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [messages, searchTerm]);

    const formatTime = (d: Date) => {
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return `${diff}s`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m`;
      return `${Math.floor(diff / 3600)}h`;
    };

    const totalReactions = messages.reduce((s, m) => s + m.reactions.reduce((sr, r) => sr + r.count, 0), 0);
    const uniqueUsers = [...new Set(messages.map(m => m.author))].length;
    const activityPct = Math.min(100, Math.round((messages.length / 20) * 100));
    const activityBar = createProgressBarStyle(tokens, { percent: activityPct, color: activityPct > 70 ? tokens.colors.successScale[500] : activityPct > 30 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500] });

    const avatarColors = [tokens.colors.primaryScale[300], tokens.colors.successScale[300], tokens.colors.warningScale[300], tokens.colors.infoScale[300], tokens.colors.errorScale[300]];

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[3], maxWidth: 380, ...style }}>
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, height: '100%', minHeight: 500 }}>
          {/* Header */}
          <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{'\uD83D\uDCAC'} Chat</Text>
              <span style={createBadgeStyle(tokens, 'success')}>{uniqueUsers}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <button onClick={() => setShowSearch(!showSearch)} style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: tokens.colors.neutral[500], fontFamily: 'inherit' }}>{'\uD83D\uDD0D'}</button>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{messages.length} msgs</Text>
            </div>
          </div>

          {/* Search (collapsible) */}
          {showSearch && (
            <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, border: `1px solid ${tokens.colors.neutral[200]}`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, outline: 'none', backgroundColor: tokens.colors.common.white, fontFamily: 'inherit' }}
              />
            </div>
          )}

          {/* Activity Bar */}
          <div style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ fontSize: 10, color: tokens.colors.neutral[400] }}>Activity</Text>
              <Text style={{ fontSize: 10, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.semibold }}>{activityPct}%</Text>
            </div>
            <div style={activityBar.track}><div style={activityBar.fill} /></div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
            {[
              { emoji: '\uD83D\uDCAC', val: messages.length },
              { emoji: '\uD83D\uDD25', val: totalReactions },
              { emoji: '\u2B50', val: messages.filter(m => m.isHighlighted).length },
              { emoji: '\uD83D\uDC65', val: uniqueUsers },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' as const }}>
                <span style={{ fontSize: 12 }}>{s.emoji}</span>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700], display: 'block' }}>{s.val}</Text>
              </div>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
            {filteredMessages.map((msg, idx) => {
              const isHovered = hoveredMsg === msg.id;
              return (
                <div key={msg.id}
                  onMouseEnter={() => setHoveredMsg(msg.id)} onMouseLeave={() => setHoveredMsg(null)}
                  style={{ marginBottom: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: msg.isHighlighted ? tokens.colors.primaryScale[50] : isHovered ? tokens.colors.neutral[100] : 'transparent', display: 'flex', gap: tokens.spacing[2], alignItems: 'flex-start' }}>
                  {/* Mini avatar */}
                  <div style={{ width: 22, height: 22, borderRadius: tokens.borderRadius.full, backgroundColor: avatarColors[idx % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700], flexShrink: 0, marginTop: 1 }}>
                    {msg.author.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: msg.isHighlighted ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600] }}>
                        {msg.author}{msg.isHighlighted ? ' \u2B50' : ''}
                      </span>
                      <span style={{ fontSize: 10, color: tokens.colors.neutral[400] }}>{formatTime(msg.time)}</span>
                    </div>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], wordBreak: 'break-word' as const }}>{msg.message}</span>
                    {msg.reactions.length > 0 && (
                      <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                        {msg.reactions.map((r, i) => (
                          <button key={i} onClick={() => onReact?.(msg.id, r.emoji)} style={{ fontSize: 10, padding: '0 3px', backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, border: `1px solid ${tokens.colors.neutral[200]}`, cursor: 'pointer', fontFamily: 'inherit' }}>{r.emoji}{r.count}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {filteredMessages.length === 0 && (
              <div style={{ textAlign: 'center' as const, padding: tokens.spacing[6] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>No messages found</Text>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: tokens.spacing[2], borderTop: `1px solid ${tokens.colors.neutral[200]}`, display: 'flex', gap: tokens.spacing[1] }}>
            <input type="text" placeholder="Chat..." value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && msgInput.trim()) { onSend?.(msgInput); setMsgInput(''); } }}
              style={{ flex: 1, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, border: `1px solid ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, outline: 'none', backgroundColor: tokens.colors.common.white, fontFamily: 'inherit' }}
            />
            <button onClick={() => { if (msgInput.trim()) { onSend?.(msgInput); setMsgInput(''); } }}
              style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>
              {'\u27A4'}
            </button>
          </div>
        </div>
      </Box>
    );
  },
});
