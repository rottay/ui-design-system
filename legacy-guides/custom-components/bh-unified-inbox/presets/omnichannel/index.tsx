'use client';

/**
 * BhUnifiedInbox - Omnichannel Preset
 * Main inbox view with thread list sidebar, message detail panel,
 * channel filter pills, stats bar, and reply composer.
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  Mail,
  MessageSquare,
  MessageCircle,
  Linkedin,
  MessagesSquare,
  Search,
  Archive,
  CheckCheck,
  Star,
  Send,
  Paperclip,
  Clock,
  Inbox,
  Filter,
  ChevronDown,
  PartyPopper,
  ArrowLeft,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalitySkeletonStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getPulseSpeed,
  createDividerStyle,
  createFocusRingStyle,
  clickableProps,
  listProps,
  listItemProps,
  formatDistanceToNow,
  ICON_SIZES,
} from '../../../helpers';
import type {
  BhUnifiedInboxProps,
  InboxThread,
  InboxMessage,
  InboxChannel,
} from '../../core';
import { formatTimeAgo, getChannelColor } from '../../core';

/* ------------------------------------------------------------------ */
/*  Channel Icon Component                                             */
/* ------------------------------------------------------------------ */

function ChannelIcon({ channel, size = ICON_SIZES.section }: { channel: InboxChannel; size?: number }) {
  switch (channel) {
    case 'email': return <Mail size={size} />;
    case 'sms': return <MessageSquare size={size} />;
    case 'whatsapp': return <MessageCircle size={size} />;
    case 'linkedin': return <Linkedin size={size} />;
    case 'internal': return <MessagesSquare size={size} />;
    default: return <Mail size={size} />;
  }
}

function getChannelLabel(channel: InboxChannel): string {
  switch (channel) {
    case 'email': return 'Email';
    case 'sms': return 'SMS';
    case 'whatsapp': return 'WhatsApp';
    case 'linkedin': return 'LinkedIn';
    case 'internal': return 'Internal';
    default: return channel;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const OmnichannelBhUnifiedInbox = createPreset<BhUnifiedInboxProps>(
  'OmnichannelBhUnifiedInbox',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhUnifiedInboxProps>) => {
    const {
      threads = [],
      selectedThread: propSelectedThread,
      stats,
      loading = false,
      onSelectThread,
      onSendMessage,
      onArchive,
      onMarkRead,
      searchQuery: externalSearchQuery,
      onSearch,
      className,
      style,
    } = props;

    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [channelFilter, setChannelFilter] = useState<string>('all');
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyChannel, setReplyChannel] = useState<InboxChannel>('email');
    const [hoveredThread, setHoveredThread] = useState<string | null>(null);
    const [showChannelDropdown, setShowChannelDropdown] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const searchQuery = externalSearchQuery ?? internalSearchQuery;
    const handleSearch = onSearch ?? setInternalSearchQuery;

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const focusRing = useMemo(() => createFocusRingStyle(tokens), [tokens]);

    // Determine selected thread
    const selectedThread = useMemo(() => {
      if (propSelectedThread) return propSelectedThread;
      if (internalSelectedId) return threads.find(t => t.id === internalSelectedId) ?? null;
      return null;
    }, [propSelectedThread, internalSelectedId, threads]);

    const handleSelectThread = useCallback((threadId: string) => {
      setInternalSelectedId(threadId);
      onSelectThread?.(threadId);
      onMarkRead?.(threadId);
    }, [onSelectThread, onMarkRead]);

    // Filter threads
    const filteredThreads = useMemo(() => {
      let result = [...threads];

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
          (t) =>
            t.candidateName.toLowerCase().includes(q) ||
            t.lastMessagePreview.toLowerCase().includes(q) ||
            (t.subject && t.subject.toLowerCase().includes(q))
        );
      }

      if (channelFilter !== 'all') {
        result = result.filter((t) => t.channel === channelFilter);
      }

      // Sort: unread first, then by last message time
      result.sort((a, b) => {
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });

      return result;
    }, [threads, searchQuery, channelFilter]);

    const handleSendReply = useCallback(() => {
      if (!selectedThread || !replyContent.trim()) return;
      onSendMessage?.({
        threadId: selectedThread.id,
        channel: replyChannel,
        content: replyContent,
      });
      setReplyContent('');
    }, [selectedThread, replyContent, replyChannel, onSendMessage]);

    const channelOptions: Array<{ key: string; label: string }> = [
      { key: 'all', label: 'All' },
      { key: 'email', label: 'Email' },
      { key: 'sms', label: 'SMS' },
      { key: 'whatsapp', label: 'WhatsApp' },
      { key: 'linkedin', label: 'LinkedIn' },
      { key: 'internal', label: 'Internal' },
    ];

    const replyChannelOptions: InboxChannel[] = ['email', 'sms', 'whatsapp', 'linkedin', 'internal'];

    // ---- Styles ----
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      ...style,
    };

    const mainLayoutStyle: React.CSSProperties = {
      display: 'flex',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
    };

    const sidebarStyle: React.CSSProperties = {
      width: 380,
      minWidth: 320,
      display: 'flex',
      flexDirection: 'column',
      borderRight: `1px solid ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.common.white,
      overflow: 'hidden',
    };

    const threadListStyle: React.CSSProperties = {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
    };

    const detailPanelStyle: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: tokens.colors.neutral[50],
      minWidth: 0,
    };

    const statsBarStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[5],
      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
      backgroundColor: tokens.colors.common.white,
      borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
      flexWrap: 'wrap',
    };

    const statItemStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    };

    const searchBarStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
    };

    const filtersRowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[1],
      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
      borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
      flexWrap: 'wrap',
    };

    const messagesContainerStyle: React.CSSProperties = {
      flex: 1,
      overflowY: 'auto',
      padding: tokens.spacing[4],
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing[3],
    };

    const composerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing[2],
      padding: tokens.spacing[3],
      borderTop: `1px solid ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.common.white,
    };

    const composerInputRowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-end',
      gap: tokens.spacing[2],
    };

    // ---- Loading State ----
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={containerStyle} className={className}>
          <Box style={statsBarStyle}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} style={{ ...skeletonStyle, width: 100, height: 40, borderRadius: tokens.borderRadius.md }} />
            ))}
          </Box>
          <Box style={mainLayoutStyle}>
            <Box style={{ ...sidebarStyle, gap: tokens.spacing[2], padding: tokens.spacing[3] }}>
              <Box style={{ ...skeletonStyle, height: 36, borderRadius: tokens.borderRadius.md }} />
              <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                {[1, 2, 3, 4].map((i) => (
                  <Box key={i} style={{ ...skeletonStyle, width: 60, height: 28, borderRadius: tokens.borderRadius.full }} />
                ))}
              </Box>
              {[1, 2, 3, 4, 5].map((i) => (
                <Box key={i} style={{ ...skeletonStyle, height: 72, borderRadius: tokens.borderRadius.md }} />
              ))}
            </Box>
            <Box style={{ flex: 1, padding: tokens.spacing[4] }}>
              <Box style={{ ...skeletonStyle, height: '100%', borderRadius: tokens.borderRadius.lg }} />
            </Box>
          </Box>
        </Box>
      );
    }

    // ---- Empty State ----
    if (threads.length === 0) {
      return (
        <Box style={containerStyle} className={className}>
          <Box style={createEmptyStateStyle(tokens)}>
            <Box style={createIconContainerStyle(tokens, { size: 64, color: tokens.colors.successScale[50] })}>
              <PartyPopper size={ICON_SIZES.hero} style={{ color: tokens.colors.successScale[500] }} />
            </Box>
            <Text style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginTop: tokens.spacing[3],
            }}>
              Inbox Zero
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
              maxWidth: 400,
            }}>
              You're all caught up! No unread conversations. New messages from candidates will appear here.
            </Text>
          </Box>
        </Box>
      );
    }

    // ---- Thread Item Renderer ----
    const renderThreadItem = (thread: InboxThread, index: number) => {
      const isSelected = selectedThread?.id === thread.id;
      const isHovered = hoveredThread === thread.id;
      const hasUnread = thread.unreadCount > 0;
      const channelColorName = getChannelColor(thread.channel);
      const entrance = createEntranceAnimation(tokens, { index });

      const threadItemStyle: React.CSSProperties = {
        ...createListItemStyle(tokens, { active: isSelected, interactive: true }),
        display: 'flex',
        gap: tokens.spacing[2],
        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
        ...(isHovered && !isSelected ? { backgroundColor: tokens.colors.neutral[50] } : {}),
        ...entrance.animate,
        transition: `background-color 150ms ease, ${entrance.transition}`,
      };

      const avatarStyle: React.CSSProperties = {
        width: 40,
        height: 40,
        borderRadius: tokens.borderRadius.full,
        backgroundColor: tokens.colors.primaryScale[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.semibold,
        color: tokens.colors.primaryScale[700],
        overflow: 'hidden',
      };

      const initials = thread.candidateName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      return (
        <Box
          key={thread.id}
          style={threadItemStyle}
          onClick={() => handleSelectThread(thread.id)}
          onMouseEnter={() => setHoveredThread(thread.id)}
          onMouseLeave={() => setHoveredThread(null)}
          {...clickableProps(() => handleSelectThread(thread.id), `Open conversation with ${thread.candidateName}`)}
        >
          {/* Avatar */}
          <Box style={avatarStyle}>
            {thread.candidateAvatarUrl ? (
              <img
                src={thread.candidateAvatarUrl}
                alt={thread.candidateName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: tokens.borderRadius.full }}
              />
            ) : (
              initials
            )}
          </Box>

          {/* Content */}
          <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacing[2] }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: hasUnread ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[hasUnread ? 900 : 700],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {thread.candidateName}
              </Text>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
                flexShrink: 0,
              }}>
                {formatTimeAgo(thread.lastMessageAt)}
              </Text>
            </Box>

            {thread.subject && (
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[600],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {thread.subject}
              </Text>
            )}

            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacing[1] }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[hasUnread ? 600 : 400],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}>
                {thread.lastMessagePreview}
              </Text>

              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flexShrink: 0 }}>
                {/* Channel icon */}
                <Box style={{
                  color: tokens.colors[`${channelColorName}Scale` as keyof typeof tokens.colors]
                    ? (tokens.colors[`${channelColorName}Scale` as keyof typeof tokens.colors] as Record<number, string>)[500]
                    : tokens.colors.neutral[400],
                }}>
                  <ChannelIcon channel={thread.channel} size={ICON_SIZES.label} />
                </Box>

                {/* Unread badge */}
                {hasUnread && (
                  <Box style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    fontSize: 10,
                    fontWeight: tokens.typography.fontWeight.bold,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: `0 ${tokens.spacing[1]}px`,
                  }}>
                    {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      );
    };

    // ---- Message Bubble Renderer ----
    const renderMessage = (message: InboxMessage, index: number) => {
      const isOutbound = message.direction === 'outbound';

      const bubbleContainerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: isOutbound ? 'flex-end' : 'flex-start',
        maxWidth: '100%',
      };

      const bubbleStyle: React.CSSProperties = {
        maxWidth: '70%',
        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
        borderRadius: tokens.borderRadius.lg,
        backgroundColor: isOutbound
          ? tokens.colors.primaryScale[50]
          : tokens.colors.neutral[100],
        border: `1px solid ${isOutbound
          ? tokens.colors.primaryScale[200]
          : tokens.colors.neutral[200]}`,
      };

      const bubbleHeaderStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: tokens.spacing[2],
        marginBottom: tokens.spacing[1],
      };

      return (
        <Box key={message.id} style={bubbleContainerStyle}>
          <Box style={bubbleStyle}>
            <Box style={bubbleHeaderStyle}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: isOutbound ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
              }}>
                {message.senderName}
              </Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Box style={{ color: tokens.colors.neutral[400] }}>
                  <ChannelIcon channel={message.channel} size={ICON_SIZES.inline} />
                </Box>
                <Text style={{ fontSize: 10, color: tokens.colors.neutral[400] }}>
                  {formatTimeAgo(message.sentAt)}
                </Text>
              </Box>
            </Box>

            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[800],
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {message.content}
            </Text>

            {/* Attachments */}
            {message.attachments.length > 0 && (
              <Box style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: tokens.spacing[1],
                marginTop: tokens.spacing[2],
              }}>
                {message.attachments.map(att => (
                  <Box key={att.id} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                  }}>
                    <Paperclip size={ICON_SIZES.inline} />
                    {att.fileName}
                  </Box>
                ))}
              </Box>
            )}

            {/* Message status indicators */}
            {isOutbound && (
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: tokens.spacing[1],
                marginTop: tokens.spacing[1],
              }}>
                {message.readAt && (
                  <CheckCheck size={ICON_SIZES.inline} style={{ color: tokens.colors.primaryScale[500] }} />
                )}
                {message.deliveredAt && !message.readAt && (
                  <CheckCheck size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400] }} />
                )}
              </Box>
            )}
          </Box>
        </Box>
      );
    };

    // ---- Detail Panel Header ----
    const renderDetailHeader = () => {
      if (!selectedThread) return null;

      const headerStyle = createPanelHeaderStyle(tokens);

      return (
        <Box style={{
          ...headerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: tokens.spacing[3],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {/* Avatar */}
            <Box style={{
              width: 36,
              height: 36,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.primaryScale[700],
              flexShrink: 0,
            }}>
              {selectedThread.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}>
                {selectedThread.candidateName}
              </Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  {selectedThread.candidateEmail}
                </Text>
                <Box style={createBadgeStyle(tokens, getChannelColor(selectedThread.channel))}>
                  <ChannelIcon channel={selectedThread.channel} size={ICON_SIZES.inline} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, marginLeft: 4 }}>
                    {getChannelLabel(selectedThread.channel)}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Actions */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            {onArchive && (
              <Button
                onClick={() => onArchive(selectedThread.id)}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  backgroundColor: 'transparent',
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  color: tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.xs,
                }}
              >
                <Archive size={ICON_SIZES.label} />
                Archive
              </Button>
            )}
          </Box>
        </Box>
      );
    };

    // ---- No Thread Selected State ----
    const renderNoThreadSelected = () => (
      <Box style={{
        ...createEmptyStateStyle(tokens),
        flex: 1,
      }}>
        <Box style={createIconContainerStyle(tokens, { size: 56, color: tokens.colors.neutral[100] })}>
          <Inbox size={ICON_SIZES.hero} style={{ color: tokens.colors.neutral[400] }} />
        </Box>
        <Text style={{
          fontSize: tokens.typography.fontSize.md,
          fontWeight: tokens.typography.fontWeight.medium,
          color: tokens.colors.neutral[500],
          marginTop: tokens.spacing[3],
        }}>
          Select a conversation
        </Text>
        <Text style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[400],
          marginTop: tokens.spacing[1],
        }}>
          Choose a thread from the sidebar to view messages
        </Text>
      </Box>
    );

    // ---- Reply Composer ----
    const renderComposer = () => {
      if (!selectedThread) return null;

      return (
        <Box style={composerStyle}>
          {/* Channel selector row */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              ...ptypo,
            }}>
              Reply via
            </Text>
            <Box style={{ position: 'relative' }}>
              <Button
                onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                style={{
                  ...createBadgeStyle(tokens, getChannelColor(replyChannel)),
                  cursor: 'pointer',
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}
              >
                <ChannelIcon channel={replyChannel} size={ICON_SIZES.inline} />
                {getChannelLabel(replyChannel)}
                <ChevronDown size={ICON_SIZES.inline} />
              </Button>
              {showChannelDropdown && (
                <Box style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  backgroundColor: tokens.colors.common.white,
                  borderRadius: tokens.borderRadius.md,
                  boxShadow: tokens.shadows.lg,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  zIndex: 50,
                  overflow: 'hidden',
                  minWidth: 140,
                }}>
                  {replyChannelOptions.map(ch => (
                    <Box
                      key={ch}
                      onClick={() => {
                        setReplyChannel(ch);
                        setShowChannelDropdown(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        cursor: 'pointer',
                        fontSize: tokens.typography.fontSize.sm,
                        color: replyChannel === ch ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
                        backgroundColor: replyChannel === ch ? tokens.colors.primaryScale[50] : 'transparent',
                      }}
                      {...clickableProps(() => {
                        setReplyChannel(ch);
                        setShowChannelDropdown(false);
                      })}
                    >
                      <ChannelIcon channel={ch} size={ICON_SIZES.label} />
                      {getChannelLabel(ch)}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* Input row */}
          <Box style={composerInputRowStyle}>
            <Box style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.lg,
              border: `1px solid ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              minHeight: 44,
            }}>
              <div
                ref={messagesEndRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setReplyContent((e.target as HTMLDivElement).textContent ?? '')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                    if (messagesEndRef.current) {
                      messagesEndRef.current.textContent = '';
                    }
                  }
                }}
                style={{
                  flex: 1,
                  outline: 'none',
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                  lineHeight: 1.5,
                  minHeight: 20,
                  maxHeight: 120,
                  overflowY: 'auto',
                }}
                data-placeholder="Type a message..."
              />
            </Box>

            {/* Action buttons */}
            <Box style={{ display: 'flex', gap: tokens.spacing[1], flexShrink: 0 }}>
              <Button
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tokens.colors.neutral[500],
                }}
                aria-label="Attach file"
              >
                <Paperclip size={ICON_SIZES.section} />
              </Button>

              <Button
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tokens.colors.neutral[500],
                }}
                aria-label="Schedule message"
              >
                <Clock size={ICON_SIZES.section} />
              </Button>

              <Button
                onClick={handleSendReply}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: replyContent.trim()
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[200],
                  cursor: replyContent.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: replyContent.trim()
                    ? tokens.colors.common.white
                    : tokens.colors.neutral[400],
                  transition: `all ${tokens.motion.hover}`,
                }}
                aria-label="Send message"
              >
                <Send size={ICON_SIZES.section} />
              </Button>
            </Box>
          </Box>
        </Box>
      );
    };

    // ---- Main Render ----
    return (
      <Box style={containerStyle} className={className}>
        {/* Stats Bar */}
        {stats && (
          <Box style={statsBarStyle}>
            <Box style={statItemStyle}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], ...{ textTransform: ptypo.labelTransform as any, letterSpacing: ptypo.labelLetterSpacing } }}>
                Unread
              </Text>
              <Text style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: stats.totalUnread > 0 ? tokens.colors.primaryScale[600] : tokens.colors.neutral[800],
              }}>
                {stats.totalUnread}
              </Text>
            </Box>
            <Box style={{ width: 1, height: 32, backgroundColor: tokens.colors.neutral[200] }} />
            <Box style={statItemStyle}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], ...{ textTransform: ptypo.labelTransform as any, letterSpacing: ptypo.labelLetterSpacing } }}>
                Response Rate
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>
                {stats.responseRate}%
              </Text>
            </Box>
            <Box style={{ width: 1, height: 32, backgroundColor: tokens.colors.neutral[200] }} />
            <Box style={statItemStyle}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], ...{ textTransform: ptypo.labelTransform as any, letterSpacing: ptypo.labelLetterSpacing } }}>
                Avg Response
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>
                {stats.avgResponseTime}m
              </Text>
            </Box>
            <Box style={{ width: 1, height: 32, backgroundColor: tokens.colors.neutral[200] }} />
            <Box style={statItemStyle}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], ...{ textTransform: ptypo.labelTransform as any, letterSpacing: ptypo.labelLetterSpacing } }}>
                Active Sequences
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>
                {stats.activeSequences}
              </Text>
            </Box>
          </Box>
        )}

        {/* Main Layout */}
        <Box style={mainLayoutStyle}>
          {/* Thread List Sidebar */}
          <Box style={sidebarStyle}>
            {/* Search */}
            <Box style={searchBarStyle}>
              <Search size={ICON_SIZES.section} style={{ color: tokens.colors.neutral[400], flexShrink: 0 }} />
              <Input
                value={searchQuery}
                onChange={(value: string) => handleSearch(value)}
                placeholder="Search conversations..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                  padding: 0,
                }}
              />
            </Box>

            {/* Channel Filters */}
            <Box style={filtersRowStyle}>
              {channelOptions.map(opt => (
                <Box
                  key={opt.key}
                  onClick={() => setChannelFilter(opt.key)}
                  style={createFilterPillStyle(tokens, { active: channelFilter === opt.key })}
                  {...clickableProps(() => setChannelFilter(opt.key), `Filter by ${opt.label}`)}
                >
                  {opt.key !== 'all' && (
                    <Box style={{ marginRight: 4 }}>
                      <ChannelIcon channel={opt.key as InboxChannel} size={ICON_SIZES.inline} />
                    </Box>
                  )}
                  {opt.label}
                  {opt.key !== 'all' && stats?.unreadByChannel[opt.key] ? (
                    <Box style={{
                      marginLeft: 4,
                      minWidth: 16,
                      height: 16,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[600],
                      color: tokens.colors.common.white,
                      fontSize: 9,
                      fontWeight: tokens.typography.fontWeight.bold,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                    }}>
                      {stats.unreadByChannel[opt.key]}
                    </Box>
                  ) : null}
                </Box>
              ))}
            </Box>

            {/* Thread List */}
            <Box style={threadListStyle} {...listProps('Inbox conversations')}>
              {filteredThreads.length === 0 ? (
                <Box style={{
                  ...createEmptyStateStyle(tokens),
                  padding: tokens.spacing[6],
                }}>
                  <Search size={ICON_SIZES.feature} style={{ color: tokens.colors.neutral[300] }} />
                  <Text style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[400],
                    marginTop: tokens.spacing[2],
                  }}>
                    No conversations found
                  </Text>
                </Box>
              ) : (
                filteredThreads.map((thread, index) => (
                  <Box key={thread.id} {...listItemProps()}>
                    {renderThreadItem(thread, index)}
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* Detail Panel */}
          <Box style={detailPanelStyle}>
            {selectedThread ? (
              <>
                {renderDetailHeader()}
                <Box style={messagesContainerStyle}>
                  {selectedThread.messages.map((msg, idx) => renderMessage(msg, idx))}
                </Box>
                {renderComposer()}
              </>
            ) : (
              renderNoThreadSelected()
            )}
          </Box>
        </Box>
      </Box>
    );
  }
);
