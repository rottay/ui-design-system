'use client';

/**
 * ChatMessaging - Panel Preset
 * Chat-only view without conversation sidebar
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createEmptyStateStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { ChatMessagingProps } from '../../core';
import { getMessageBubbleColors, getBannerColors, formatMessageTime } from '../../core';

export const PanelChatMessaging = createPreset<ChatMessagingProps>({
  name: 'ChatMessaging.Panel',
  render: ({ primitives, props, tokens, engine }: PresetContext<ChatMessagingProps>) => {
    const { Box, Stack } = primitives;
    const bubbleColors = getMessageBubbleColors(tokens);
    const bannerColors = getBannerColors(tokens);

    const {
      messages,
      onSendMessage,
      onAttach,
      archivedBanner,
      onUnarchive,
      title,
      placeholder = 'Type a message...',
      showToolbar = true,
      loading,
      className,
      style,
    } = props;

    const [messageText, setMessageText] = useState('');

    const handleSend = () => {
      if (messageText.trim()) {
        onSendMessage?.(messageText);
        setMessageText('');
      }
    };

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        {title && (
          <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{title}</h3>
          </Box>
        )}

        {/* Archived banner */}
        {archivedBanner && (
          <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: bannerColors.bgColor, color: bannerColors.color, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${bannerColors.border}`, fontSize: tokens.typography.fontSize.sm, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>This conversation is archived</span>
            <button onClick={onUnarchive} style={{ border: 'none', backgroundColor: 'transparent', color: bannerColors.color, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: tokens.typography.fontSize.sm }}>Unarchive</button>
          </Box>
        )}

        {/* Messages */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : (
            <Stack direction="vertical" spacing="sm">
              {messages.map((msg) => {
                const isOwn = msg.sender.isOwn;
                const colors = isOwn ? bubbleColors.own : bubbleColors.other;
                return (
                  <Box key={msg.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: tokens.spacing[2] }}>
                    {!isOwn && (
                      msg.sender.avatar ? (
                        <img src={msg.sender.avatar} alt="" style={{ width: tokens.spacing[7], height: tokens.spacing[7], borderRadius: tokens.borderRadius.full, flexShrink: 0 }} />
                      ) : (
                        <Box style={{ width: tokens.spacing[7], height: tokens.spacing[7], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, flexShrink: 0 }}>
                          {msg.sender.name.charAt(0)}
                        </Box>
                      )
                    )}
                    <Box style={{ maxWidth: '75%' }}>
                      {!isOwn && (
                        <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[1] }}>{msg.sender.name}</Box>
                      )}
                      {msg.embeddedCard && (
                        <Box style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50], marginBottom: tokens.spacing[1] }}>
                          <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'uppercase', marginBottom: tokens.spacing[1] }}>{msg.embeddedCard.type}</Box>
                          <Box style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{msg.embeddedCard.title}</Box>
                          {msg.embeddedCard.subtitle && <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>{msg.embeddedCard.subtitle}</Box>}
                        </Box>
                      )}
                      <Box style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.lg,
                        backgroundColor: colors.bgColor, color: colors.color,
                        fontSize: tokens.typography.fontSize.sm, lineHeight: tokens.typography.lineHeight.relaxed,
                      }}>
                        {msg.content}
                      </Box>
                      {msg.attachments?.map((att) => (
                        <Box key={att.id} style={{ marginTop: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                          📎 {att.name} {att.size && <span style={{ color: tokens.colors.neutral[400] }}>({att.size})</span>}
                        </Box>
                      ))}
                      <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1], textAlign: isOwn ? 'right' : 'left' }}>
                        {formatMessageTime(msg.timestamp)}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* Input */}
        <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
          {showToolbar && (
            <Box style={{ display: 'flex', gap: tokens.spacing[1], marginBottom: tokens.spacing[2] }}>
              {['B', 'I', 'U', 'S', '<>', '≡', '🔗'].map((btn) => (
                <button key={btn} style={{
                  width: tokens.spacing[7], height: tokens.spacing[7], border: 'none', borderRadius: tokens.borderRadius.sm,
                  backgroundColor: 'transparent', color: tokens.colors.neutral[500],
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: tokens.typography.fontSize.sm,
                  transition: `all ${tokens.motion.hover}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {btn}
                </button>
              ))}
            </Box>
          )}
          <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <button onClick={onAttach} style={{
              width: tokens.spacing[8], height: tokens.spacing[8], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md, backgroundColor: 'transparent',
              color: tokens.colors.neutral[500], cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${tokens.motion.hover}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              📎
            </button>
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={placeholder}
              style={{
                flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit', outline: 'none',
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
            <button onClick={handleSend} style={{
              width: tokens.spacing[8], height: tokens.spacing[8], border: 'none',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${tokens.motion.hover}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              ➤
            </button>
          </Box>
        </Box>
      </Box>
    );
  },
});
