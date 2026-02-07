'use client';

/**
 * ChatMessaging - Split Preset
 * Sidebar conversation list + chat panel
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { ChatMessagingProps, ConversationTab } from '../../core';
import { getMessageBubbleColors, getBannerColors, formatMessageTime, formatConversationDate } from '../../core';

export const SplitChatMessaging = createPreset<ChatMessagingProps>({
  name: 'ChatMessaging.Split',
  render: ({ primitives, props, tokens, engine }: PresetContext<ChatMessagingProps>) => {
    const { Box, Stack } = primitives;
    const bubbleColors = getMessageBubbleColors(tokens);
    const bannerColors = getBannerColors(tokens);

    const {
      conversations = [],
      activeConversationId,
      onConversationSelect,
      messages,
      onSendMessage,
      onAttach,
      activeTab = 'conversations',
      onTabChange,
      archivedBanner,
      onUnarchive,
      title = 'Messages',
      placeholder = 'Type a message...',
      showToolbar = true,
      loading,
      className,
      style,
    } = props;

    const [messageText, setMessageText] = useState('');
    const [internalTab, setInternalTab] = useState<ConversationTab>(activeTab);
    const currentTab = activeTab ?? internalTab;

    const handleSend = () => {
      if (messageText.trim()) {
        onSendMessage?.(messageText);
        setMessageText('');
      }
    };

    const handleTabChange = (tab: ConversationTab) => {
      setInternalTab(tab);
      onTabChange?.(tab);
    };

    const activeConv = conversations.find(c => c.id === activeConversationId);
    const activeParticipant = activeConv?.participants.find(p => p.id !== 'self');

    return (
      <Box className={className} style={{ display: 'flex', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Sidebar */}
        <Box style={{ width: 320, borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Sidebar header */}
          <Box style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px ${tokens.spacing[2]}px` }}>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{title}</h2>
          </Box>

          {/* Tabs */}
          <Box style={{ display: 'flex', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, padding: `0 ${tokens.spacing[4]}px` }}>
            {(['conversations', 'requests'] as ConversationTab[]).map((tab) => (
              <button key={tab} onClick={() => handleTabChange(tab)} style={{
                flex: 1, padding: `${tokens.spacing[2]}px`, border: 'none',
                borderBottom: currentTab === tab ? `2px solid ${tokens.colors.neutral[900]}` : '2px solid transparent',
                backgroundColor: 'transparent',
                color: currentTab === tab ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                fontWeight: currentTab === tab ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'capitalize',
              }}>
                {tab}
              </button>
            ))}
          </Box>

          {/* Conversation list */}
          <Box style={{ flex: 1, overflow: 'auto' }}>
            <Stack direction="vertical" spacing="none">
              {conversations.map((conv) => {
                const participant = conv.participants.find(p => p.id !== 'self') ?? conv.participants[0];
                const isActive = conv.id === activeConversationId;
                return (
                  <Box key={conv.id} onClick={() => onConversationSelect?.(conv.id)} style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    cursor: 'pointer',
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                    borderLeft: isActive ? `3px solid ${tokens.colors.primaryScale[500]}` : '3px solid transparent',
                  }}>
                    <Box style={{ position: 'relative', flexShrink: 0 }}>
                      {participant?.avatar ? (
                        <img src={participant.avatar} alt="" style={{ width: tokens.spacing[8], height: tokens.spacing[8], borderRadius: tokens.borderRadius.full }} />
                      ) : (
                        <Box style={{ width: tokens.spacing[8], height: tokens.spacing[8], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.semibold }}>
                          {participant?.name.charAt(0) ?? '?'}
                        </Box>
                      )}
                      {participant?.online && (
                        <Box style={{ position: 'absolute', bottom: 0, right: 0, width: tokens.spacing[3], height: tokens.spacing[3], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[500], border: `2px solid ${tokens.colors.common.white}` }} />
                      )}
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>
                          {participant?.name ?? 'Unknown'}
                        </span>
                        {conv.lastMessage && (
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                            {formatConversationDate(conv.lastMessage.timestamp)}
                          </span>
                        )}
                      </Box>
                      {conv.lastMessage && (
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing[1] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                            {conv.lastMessage.content}
                          </span>
                          {(conv.unreadCount ?? 0) > 0 && (
                            <span style={{ minWidth: tokens.spacing[5], height: tokens.spacing[5], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `0 ${tokens.spacing[1]}px` }}>
                              {conv.unreadCount}
                            </span>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>

        {/* Chat panel */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!activeConversationId ? (
            <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.md }}>
              Select a conversation
            </Box>
          ) : (
            <>
              {/* Chat header */}
              <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                {activeParticipant?.avatar ? (
                  <img src={activeParticipant.avatar} alt="" style={{ width: tokens.spacing[7], height: tokens.spacing[7], borderRadius: tokens.borderRadius.full }} />
                ) : (
                  <Box style={{ width: tokens.spacing[7], height: tokens.spacing[7], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.sm }}>
                    {activeParticipant?.name.charAt(0) ?? '?'}
                  </Box>
                )}
                <Box>
                  <Box style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{activeParticipant?.name ?? 'Unknown'}</Box>
                  {activeParticipant?.online && <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[500] }}>Online</Box>}
                </Box>
              </Box>

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
                          <Box style={{ maxWidth: '70%' }}>
                            {/* Embedded card */}
                            {msg.embeddedCard && (
                              <Box style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50], marginBottom: tokens.spacing[1] }}>
                                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'uppercase', marginBottom: tokens.spacing[1] }}>{msg.embeddedCard.type}</Box>
                                <Box style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{msg.embeddedCard.title}</Box>
                                {msg.embeddedCard.subtitle && <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>{msg.embeddedCard.subtitle}</Box>}
                              </Box>
                            )}
                            {/* Message bubble */}
                            <Box style={{
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                              borderRadius: tokens.borderRadius.lg,
                              backgroundColor: colors.bgColor, color: colors.color,
                              fontSize: tokens.typography.fontSize.sm,
                              lineHeight: tokens.typography.lineHeight.relaxed,
                            }}>
                              {msg.content}
                            </Box>
                            {/* Attachments */}
                            {msg.attachments?.map((att) => (
                              <Box key={att.id} style={{ marginTop: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                                📎 {att.name} {att.size && <span style={{ color: tokens.colors.neutral[400] }}>({att.size})</span>}
                              </Box>
                            ))}
                            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1], textAlign: isOwn ? 'right' : 'left' }}>
                              {formatMessageTime(msg.timestamp)}
                              {isOwn && msg.status && <span style={{ marginLeft: tokens.spacing[1] }}>{msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓' : ''}</span>}
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
                  />
                  <button onClick={handleSend} style={{
                    width: tokens.spacing[8], height: tokens.spacing[8], border: 'none',
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    ➤
                  </button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    );
  },
});
