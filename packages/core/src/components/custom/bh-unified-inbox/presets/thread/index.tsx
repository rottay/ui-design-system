'use client';

/**
 * BhUnifiedInbox - Thread Preset
 * Single thread detail view for embedded use in candidate profile pages.
 * Shows full message history, thread metadata, reply composer,
 * attachment display, and message status indicators.
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  Mail,
  MessageSquare,
  MessageCircle,
  Linkedin,
  MessagesSquare,
  Send,
  Paperclip,
  Clock,
  CheckCheck,
  Check,
  ArrowLeft,
  Star,
  Archive,
  ChevronDown,
  FileText,
  Image,
  File,
  Download,
  User,
  Calendar,
  Hash,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createPersonalitySkeletonStyle,
  createEmptyStateStyle,
  createPanelHeaderStyle,
  createMetadataGridStyle,
  createMetadataFieldStyle,
  createMetadataLabelStyle,
  createMetadataValueStyle,
  getPersonalityTypography,
  createFocusRingStyle,
  clickableProps,
  formatDistanceToNow,
  ICON_SIZES,
} from '../../../helpers';
import type {
  BhUnifiedInboxProps,
  InboxThread,
  InboxMessage,
  InboxAttachment,
  InboxChannel,
} from '../../core';
import { formatTimeAgo, getChannelColor } from '../../core';

/* ------------------------------------------------------------------ */
/*  Channel helpers                                                    */
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

function getAttachmentIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf')) return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const ThreadBhUnifiedInbox = createPreset<BhUnifiedInboxProps>(
  'ThreadBhUnifiedInbox',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhUnifiedInboxProps>) => {
    const {
      selectedThread,
      loading = false,
      onSendMessage,
      onArchive,
      onMarkRead,
      className,
      style,
    } = props;

    const [replyContent, setReplyContent] = useState('');
    const [replyChannel, setReplyChannel] = useState<InboxChannel>(selectedThread?.channel ?? 'email');
    const [showChannelDropdown, setShowChannelDropdown] = useState(false);

    const composerRef = useRef<HTMLDivElement>(null);

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);

    const handleSendReply = useCallback(() => {
      if (!selectedThread || !replyContent.trim()) return;
      onSendMessage?.({
        threadId: selectedThread.id,
        channel: replyChannel,
        content: replyContent,
      });
      setReplyContent('');
      if (composerRef.current) {
        composerRef.current.textContent = '';
      }
    }, [selectedThread, replyContent, replyChannel, onSendMessage]);

    const replyChannelOptions: InboxChannel[] = ['email', 'sms', 'whatsapp', 'linkedin', 'internal'];

    // ---- Styles ----
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: tokens.colors.common.white,
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${tokens.colors.neutral[200]}`,
      overflow: 'hidden',
      ...style,
    };

    const headerStyle: React.CSSProperties = {
      ...createPanelHeaderStyle(tokens),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: tokens.spacing[3],
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
    };

    const metadataStyle: React.CSSProperties = {
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
      backgroundColor: tokens.colors.neutral[50],
    };

    const messagesContainerStyle: React.CSSProperties = {
      flex: 1,
      overflowY: 'auto',
      padding: tokens.spacing[4],
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing[4],
    };

    const composerContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing[2],
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      borderTop: `1px solid ${tokens.colors.neutral[200]}`,
      backgroundColor: tokens.colors.common.white,
    };

    // ---- Loading State ----
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={containerStyle} className={className}>
          <Box style={{ ...headerStyle }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box style={{ ...skeletonStyle, width: 40, height: 40, borderRadius: tokens.borderRadius.full }} />
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box style={{ ...skeletonStyle, width: 150, height: 16 }} />
                <Box style={{ ...skeletonStyle, width: 200, height: 12 }} />
              </Box>
            </Box>
          </Box>
          <Box style={{ flex: 1, padding: tokens.spacing[4], display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {[1, 2, 3, 4].map(i => (
              <Box key={i} style={{
                display: 'flex',
                justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start',
              }}>
                <Box style={{ ...skeletonStyle, width: '60%', height: 60 + (i * 10), borderRadius: tokens.borderRadius.lg }} />
              </Box>
            ))}
          </Box>
        </Box>
      );
    }

    // ---- Empty / No Thread ----
    if (!selectedThread) {
      return (
        <Box style={containerStyle} className={className}>
          <Box style={createEmptyStateStyle(tokens)}>
            <Box style={createIconContainerStyle(tokens, { size: 56, color: tokens.colors.neutral[100] })}>
              <MessagesSquare size={ICON_SIZES.hero} style={{ color: tokens.colors.neutral[400] }} />
            </Box>
            <Text style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[3],
            }}>
              No thread selected
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[400],
              marginTop: tokens.spacing[1],
            }}>
              Select a conversation to view the message history
            </Text>
          </Box>
        </Box>
      );
    }

    // ---- Message Renderer ----
    const renderMessage = (message: InboxMessage, index: number) => {
      const isOutbound = message.direction === 'outbound';
      const entrance = createEntranceAnimation(tokens, { index });
      const AttIcon = message.attachments.length > 0 ? Paperclip : null;

      const timestampFull = new Date(message.sentAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      return (
        <Box key={message.id} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOutbound ? 'flex-end' : 'flex-start',
          ...entrance.animate,
          transition: entrance.transition,
        }}>
          {/* Sender info */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            marginBottom: tokens.spacing[1],
          }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[600],
            }}>
              {message.senderName}
            </Text>
            <Box style={{ color: tokens.colors.neutral[300] }}>
              <ChannelIcon channel={message.channel} size={ICON_SIZES.inline} />
            </Box>
            <Text style={{ fontSize: 10, color: tokens.colors.neutral[400] }}>
              {timestampFull}
            </Text>
          </Box>

          {/* Bubble */}
          <Box style={{
            maxWidth: '75%',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: isOutbound
              ? tokens.colors.primaryScale[50]
              : tokens.colors.neutral[100],
            border: `1px solid ${isOutbound
              ? tokens.colors.primaryScale[200]
              : tokens.colors.neutral[200]}`,
          }}>
            {message.subject && (
              <Text style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
                marginBottom: tokens.spacing[1],
              }}>
                {message.subject}
              </Text>
            )}

            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[800],
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {message.content}
            </Text>

            {/* Attachments */}
            {message.attachments.length > 0 && (
              <Box style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[1],
                marginTop: tokens.spacing[2],
                paddingTop: tokens.spacing[2],
                borderTop: `1px solid ${isOutbound ? tokens.colors.primaryScale[100] : tokens.colors.neutral[200]}`,
              }}>
                {message.attachments.map(att => {
                  const FileIcon = getAttachmentIcon(att.mimeType);
                  return (
                    <Box key={att.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: isOutbound ? tokens.colors.primaryScale[100] : tokens.colors.neutral[50],
                      border: `1px solid ${isOutbound ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                    }}>
                      <FileIcon size={ICON_SIZES.section} style={{ color: tokens.colors.neutral[500], flexShrink: 0 }} />
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {att.fileName}
                        </Text>
                        <Text style={{ fontSize: 10, color: tokens.colors.neutral[400] }}>
                          {formatFileSize(att.fileSize)}
                        </Text>
                      </Box>
                      <Download size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400], cursor: 'pointer', flexShrink: 0 }} />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Status indicators for outbound */}
          {isOutbound && (
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              marginTop: 4,
            }}>
              {message.readAt ? (
                <>
                  <CheckCheck size={ICON_SIZES.inline} style={{ color: tokens.colors.primaryScale[500] }} />
                  <Text style={{ fontSize: 10, color: tokens.colors.primaryScale[500] }}>Read</Text>
                </>
              ) : message.deliveredAt ? (
                <>
                  <CheckCheck size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400] }} />
                  <Text style={{ fontSize: 10, color: tokens.colors.neutral[400] }}>Delivered</Text>
                </>
              ) : (
                <>
                  <Check size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400] }} />
                  <Text style={{ fontSize: 10, color: tokens.colors.neutral[400] }}>Sent</Text>
                </>
              )}
            </Box>
          )}
        </Box>
      );
    };

    // ---- Date Separator ----
    const renderDateSeparator = (dateStr: string) => {
      const date = new Date(dateStr);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return (
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[2]}px 0`,
        }}>
          <Box style={{ flex: 1, height: 1, backgroundColor: tokens.colors.neutral[200] }} />
          <Text style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
            flexShrink: 0,
          }}>
            {label}
          </Text>
          <Box style={{ flex: 1, height: 1, backgroundColor: tokens.colors.neutral[200] }} />
        </Box>
      );
    };

    // ---- Group messages by date ----
    const messageGroups = useMemo(() => {
      const groups: Array<{ date: string; messages: InboxMessage[] }> = [];
      let currentDate = '';
      for (const msg of selectedThread.messages) {
        const msgDate = new Date(msg.sentAt).toDateString();
        if (msgDate !== currentDate) {
          currentDate = msgDate;
          groups.push({ date: msg.sentAt, messages: [msg] });
        } else {
          groups[groups.length - 1].messages.push(msg);
        }
      }
      return groups;
    }, [selectedThread.messages]);

    // ---- Main Render ----
    return (
      <Box style={containerStyle} className={className}>
        {/* Header */}
        <Box style={headerStyle}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {/* Avatar */}
            <Box style={{
              width: 40,
              height: 40,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.primaryScale[700],
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              {selectedThread.candidateAvatarUrl ? (
                <img
                  src={selectedThread.candidateAvatarUrl}
                  alt={selectedThread.candidateName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                selectedThread.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              )}
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
              </Box>
            </Box>
          </Box>

          {/* Thread meta */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Box style={createBadgeStyle(tokens, getChannelColor(selectedThread.channel))}>
              <ChannelIcon channel={selectedThread.channel} size={ICON_SIZES.inline} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, marginLeft: 4 }}>
                {getChannelLabel(selectedThread.channel)}
              </Text>
            </Box>
            {selectedThread.tags.map(tag => (
              <Box key={tag} style={{
                ...createBadgeStyle(tokens, 'secondary'),
                gap: tokens.spacing[1],
              }}>
                <Hash size={ICON_SIZES.inline} />
                {tag}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Thread Metadata */}
        <Box style={metadataStyle}>
          <Box style={{ ...createMetadataGridStyle(tokens, { columns: 4 }) }}>
            <Box style={createMetadataFieldStyle(tokens)}>
              <Text style={createMetadataLabelStyle(tokens, { personality: ptypo })}>Channel</Text>
              <Text style={createMetadataValueStyle(tokens)}>{getChannelLabel(selectedThread.channel)}</Text>
            </Box>
            <Box style={createMetadataFieldStyle(tokens)}>
              <Text style={createMetadataLabelStyle(tokens, { personality: ptypo })}>Messages</Text>
              <Text style={createMetadataValueStyle(tokens)}>{selectedThread.messages.length}</Text>
            </Box>
            <Box style={createMetadataFieldStyle(tokens)}>
              <Text style={createMetadataLabelStyle(tokens, { personality: ptypo })}>Last Activity</Text>
              <Text style={createMetadataValueStyle(tokens)}>{formatTimeAgo(selectedThread.lastMessageAt)}</Text>
            </Box>
            <Box style={createMetadataFieldStyle(tokens)}>
              <Text style={createMetadataLabelStyle(tokens, { personality: ptypo })}>Status</Text>
              <Text style={createMetadataValueStyle(tokens)}>
                {selectedThread.isArchived ? 'Archived' : selectedThread.unreadCount > 0 ? 'Unread' : 'Read'}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Messages */}
        <Box style={messagesContainerStyle}>
          {messageGroups.map((group, groupIdx) => (
            <Box key={groupIdx}>
              {renderDateSeparator(group.date)}
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {group.messages.map((msg, msgIdx) => renderMessage(msg, groupIdx * 10 + msgIdx))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Reply Composer */}
        <Box style={composerContainerStyle}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
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
                  bottom: '100%',
                  left: 0,
                  marginBottom: 4,
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
                      onClick={() => { setReplyChannel(ch); setShowChannelDropdown(false); }}
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
                      {...clickableProps(() => { setReplyChannel(ch); setShowChannelDropdown(false); })}
                    >
                      <ChannelIcon channel={ch} size={ICON_SIZES.label} />
                      {getChannelLabel(ch)}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          <Box style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: tokens.spacing[2],
          }}>
            <Box style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.lg,
              border: `1px solid ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              minHeight: 44,
            }}>
              <div
                ref={composerRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setReplyContent((e.target as HTMLDivElement).textContent ?? '')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
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

            <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
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
      </Box>
    );
  }
);
