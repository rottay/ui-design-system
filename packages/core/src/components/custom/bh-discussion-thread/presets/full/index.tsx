'use client';

/**
 * BhDiscussionThread - Full Preset
 * Split-panel layout with thread list on the left and comment timeline
 * with reply input on the right.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  MessageSquare,
  User,
  Briefcase,
  Video,
  FileText,
  Users,
  Search,
  CheckCircle2,
  ArchiveRestore,
  RotateCcw,
  Clock,
  Paperclip,
  Send,
  ChevronRight,
  MessageCircle,
  Hash,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createIconContainerStyle,
  createEntranceAnimation,
  createStaggerDelay,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type {
  BhDiscussionThreadProps,
  DiscussionThread,
  DiscussionComment,
  ThreadStatus,
  DiscussionEntityType,
} from '../../core';
import {
  getStatusColor,
  getEntityLabel,
  formatThreadTimestamp,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getEntityIcon(entityType: DiscussionEntityType, size: number) {
  switch (entityType) {
    case 'candidate': return <User size={size} />;
    case 'job': return <Briefcase size={size} />;
    case 'interview': return <Video size={size} />;
    case 'offer': return <FileText size={size} />;
    case 'position': return <Users size={size} />;
    default: return <MessageSquare size={size} />;
  }
}

const STATUS_OPTIONS: { value: ThreadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'archived', label: 'Archived' },
];

/* ------------------------------------------------------------------ */
/*  Full Preset                                                        */
/* ------------------------------------------------------------------ */
export const FullBhDiscussionThread = createPreset<BhDiscussionThreadProps>({
  name: 'BhDiscussionThread.Full',
  render: ({ primitives, props, tokens }: PresetContext<BhDiscussionThreadProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      threads: threadsProp,
      selectedThreadId: externalSelected,
      comments: commentsProp,
      onSelectThread,
      onAddComment,
      onResolve,
      onReopen,
      onArchive,
      onReact,
      onEntityClick,
      searchQuery: externalSearch,
      onSearchChange,
      statusFilter: externalStatusFilter,
      onStatusFilterChange,
      className,
      style,
    } = props;

    const threads = threadsProp?.length ? threadsProp : [];
    const comments = commentsProp?.length ? commentsProp : [];

    /* -- Internal state ---------------------------------------------- */
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(externalSelected ?? null);
    const [searchQuery, setSearchQuery] = useState(externalSearch ?? '');
    const [statusFilter, setStatusFilter] = useState<ThreadStatus | 'all'>(externalStatusFilter ?? 'all');
    const [replyText, setReplyText] = useState('');

    const handleSelectThread = useCallback((id: string | null) => {
      setSelectedThreadId(id);
      setReplyText('');
      onSelectThread?.(id);
    }, [onSelectThread]);

    const handleSearchChange = useCallback((value: string) => {
      setSearchQuery(value);
      onSearchChange?.(value);
    }, [onSearchChange]);

    const handleStatusFilter = useCallback((status: ThreadStatus | 'all') => {
      setStatusFilter(status);
      onStatusFilterChange?.(status);
    }, [onStatusFilterChange]);

    const handleSendReply = useCallback(() => {
      if (!selectedThreadId || !replyText.trim()) return;
      onAddComment?.(selectedThreadId, replyText.trim());
      setReplyText('');
    }, [selectedThreadId, replyText, onAddComment]);

    /* -- Styles ------------------------------------------------------ */
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const card = useMemo(() => createCardStyle(t, { padding: 16 }), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const glassStyle = useMemo(() => {
      if (t.surface.useGlass && t.glass) {
        return {
          backdropFilter: t.glass.blur,
          WebkitBackdropFilter: t.glass.blur,
        };
      }
      return {};
    }, [t]);

    /* -- Filtered threads -------------------------------------------- */
    const filteredThreads = useMemo(() => threads.filter((thread) => {
      if (statusFilter !== 'all' && thread.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          thread.title.toLowerCase().includes(q) ||
          thread.entityName.toLowerCase().includes(q) ||
          thread.createdBy.name.toLowerCase().includes(q)
        );
      }
      return true;
    }), [threads, statusFilter, searchQuery]);

    const selectedThread = useMemo(
      () => threads.find((th) => th.id === selectedThreadId) ?? null,
      [threads, selectedThreadId],
    );

    const threadComments = useMemo(
      () => comments.filter((c) => c.threadId === selectedThreadId),
      [comments, selectedThreadId],
    );

    /* ================================================================ */
    /*  Inner Components                                                 */
    /* ================================================================ */

    const StatusBadge = ({ status }: { status: ThreadStatus }) => {
      const sc = getStatusColor(status);
      return (
        <Box style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: `2px ${t.spacing[2]}px`,
          borderRadius: badgeR,
          backgroundColor: sc.bg,
          color: sc.text,
          fontSize: t.typography.fontSize.xs,
          fontWeight: t.typography.fontWeight.medium,
        }}>
          <Text style={{ fontSize: t.typography.fontSize.xs }}>{sc.label}</Text>
        </Box>
      );
    };

    const ThreadListItem = ({ thread }: { thread: DiscussionThread }) => {
      const isSelected = selectedThreadId === thread.id;

      return (
        <Box
          onClick={() => handleSelectThread(thread.id)}
          role="button"
          tabIndex={0}
          aria-label={`Thread: ${thread.title}`}
          aria-selected={isSelected}
          style={{
            padding: t.spacing[3],
            borderRadius: t.borderRadius.md,
            backgroundColor: isSelected ? t.colors.primaryScale[50] : 'transparent',
            border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${isSelected ? t.colors.primaryScale[200] : 'transparent'}`,
            cursor: 'pointer',
            transition: `all ${t.motion.hover}`,
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
            if (!isSelected) e.currentTarget.style.backgroundColor = t.colors.neutral[50];
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Title row */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flex: 1, minWidth: 0 }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
              }}>
                {thread.title}
              </Text>
            </Box>
            {thread.unreadCount != null && thread.unreadCount > 0 && (
              <Box style={{
                minWidth: 20,
                height: 20,
                borderRadius: t.borderRadius.full,
                backgroundColor: t.colors.primaryScale[500],
                color: t.colors.common.white,
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `0 ${t.spacing[1]}px`,
                flexShrink: 0,
              }}>
                <Text style={{ fontSize: 10, color: 'inherit' }}>{thread.unreadCount}</Text>
              </Box>
            )}
          </Box>

          {/* Entity reference */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
            {getEntityIcon(thread.entityType, 12)}
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[500],
            }}>
              {getEntityLabel(thread.entityType)}: {thread.entityName}
            </Text>
          </Box>

          {/* Bottom row */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <StatusBadge status={thread.status} />
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <MessageCircle size={12} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {thread.commentCount}
                </Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Clock size={12} color={t.colors.neutral[400]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                {formatThreadTimestamp(thread.lastActivityAt)}
              </Text>
            </Box>
          </Box>
        </Box>
      );
    };

    const CommentCard = ({ comment, index }: { comment: DiscussionComment; index: number }) => {
      const itemEntrance = createEntranceAnimation(t, { index });

      return (
        <Box
          key={comment.id}
          style={{
            display: 'flex',
            gap: t.spacing[3],
            ...itemEntrance.animate,
            transition: itemEntrance.transition,
          }}
        >
          {/* Avatar */}
          <Box style={{
            width: 36,
            height: 36,
            borderRadius: t.borderRadius.full,
            backgroundColor: t.colors.neutral[200],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {comment.author.avatar ? (
              <Box
                as="img"
                style={{ width: 36, height: 36, borderRadius: t.borderRadius.full, objectFit: 'cover' as const }}
                {...{ src: comment.author.avatar, alt: comment.author.name }}
              />
            ) : (
              <User size={18} color={t.colors.neutral[500]} />
            )}
          </Box>

          {/* Comment body */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            {/* Author + timestamp */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
              }}>
                {comment.author.name}
              </Text>
              {comment.author.role && (
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.neutral[400],
                }}>
                  {comment.author.role}
                </Text>
              )}
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[400],
              }}>
                {formatThreadTimestamp(comment.timestamp)}
              </Text>
              {comment.isEdited && (
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.neutral[400],
                  fontStyle: 'italic' as const,
                }}>
                  (edited)
                </Text>
              )}
            </Box>

            {/* Content */}
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[700],
              lineHeight: 1.6,
              display: 'block',
              marginBottom: t.spacing[2],
            }}>
              {comment.content}
            </Text>

            {/* Attachments */}
            {comment.attachments && comment.attachments.length > 0 && (
              <Box style={{ display: 'flex', gap: t.spacing[2], flexWrap: 'wrap' as const, marginBottom: t.spacing[2] }}>
                {comment.attachments.map((att, i) => (
                  <Box key={att.id} style={{
                    ...animStyle(i),
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: t.spacing[1],
                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                    borderRadius: t.borderRadius.md,
                    backgroundColor: t.colors.neutral[100],
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[600],
                  }}>
                    <Paperclip size={12} />
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{att.name}</Text>
                  </Box>
                ))}
              </Box>
            )}

            {/* Reactions */}
            {comment.reactions && comment.reactions.length > 0 && (
              <Box style={{ display: 'flex', gap: t.spacing[1], flexWrap: 'wrap' as const }}>
                {comment.reactions.map((reaction, ri) => (
                  <Box
                    key={ri}
                    onClick={() => onReact?.(comment.id, reaction.emoji)}
                    role="button"
                    tabIndex={0}
                    aria-label={`React with ${reaction.emoji}`}
                    style={{
                      ...animStyle(ri),
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: t.spacing[1],
                      padding: `2px ${t.spacing[2]}px`,
                      borderRadius: t.borderRadius.full,
                      border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${reaction.reacted ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                      backgroundColor: reaction.reacted ? t.colors.primaryScale[50] : t.colors.common.white,
                      fontSize: t.typography.fontSize.xs,
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{reaction.emoji}</Text>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: reaction.reacted ? t.colors.primaryScale[700] : t.colors.neutral[500],
                    }}>
                      {reaction.count}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  Render                                                           */
    /* ================================================================ */
    return (
      <Box
        className={className}
        role="region"
        aria-label="Discussion Threads"
        style={{
          minHeight: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          ...glassStyle,
          ...entrance.animate,
          transition: entrance.transition,
          ...style,
        }}
      >
        <Box style={{
          display: 'flex',
          height: '100%',
          minHeight: 600,
          border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
          borderRadius: t.borderRadius.lg,
          overflow: 'hidden',
          backgroundColor: t.colors.common.white,
        }}>

          {/* ============================================================ */}
          {/*  Left Panel - Thread List                                     */}
          {/* ============================================================ */}
          <Box style={{
            width: 360,
            flexShrink: 0,
            borderRight: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
            display: 'flex',
            flexDirection: 'column' as const,
            backgroundColor: t.colors.common.white,
          }}>
            {/* Search */}
            <Box style={{
              padding: t.spacing[3],
              borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
            }}>
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.neutral[50],
              }}>
                <Search size={14} color={t.colors.neutral[400]} />
                <Box
                  as="input"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: t.typography.fontSize.sm,
                    color: t.colors.neutral[900],
                    fontFamily: 'inherit',
                  }}
                  {...{
                    type: 'text',
                    placeholder: 'Search threads...',
                    value: searchQuery,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value),
                  }}
                />
              </Box>

              {/* Status filter tabs */}
              <Box style={{
                display: 'flex',
                gap: t.spacing[1],
                marginTop: t.spacing[2],
              }}>
                {STATUS_OPTIONS.map((opt) => {
                  const isActive = statusFilter === opt.value;
                  return (
                    <Box
                      key={opt.value}
                      onClick={() => handleStatusFilter(opt.value)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      style={{
                        flex: 1,
                        textAlign: 'center' as const,
                        padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                        borderRadius: t.borderRadius.md,
                        backgroundColor: isActive ? t.colors.primaryScale[50] : 'transparent',
                        color: isActive ? t.colors.primaryScale[700] : t.colors.neutral[500],
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.medium,
                        cursor: 'pointer',
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{opt.label}</Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Thread list */}
            <Box style={{
              flex: 1,
              overflowY: 'auto' as const,
              padding: t.spacing[2],
            }}>
              {filteredThreads.length === 0 ? (
                <Box style={{
                  padding: t.spacing[6],
                  textAlign: 'center' as const,
                }}>
                  <Box style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }}>
                    <MessageSquare size={28} />
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                    No threads found
                  </Text>
                </Box>
              ) : (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  {filteredThreads.map((thread, i) => (
                    <Box key={thread.id} style={animStyle(i)}>
                      <ThreadListItem thread={thread} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* ============================================================ */}
          {/*  Right Panel - Selected Thread                                */}
          {/* ============================================================ */}
          <Box style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as const,
            backgroundColor: t.colors.neutral[50],
          }}>
            {!selectedThread ? (
              <Box style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                gap: t.spacing[3],
              }}>
                <Box style={{ color: t.colors.neutral[300] }}>
                  <MessageSquare size={40} />
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                  Select a thread to view the discussion
                </Text>
              </Box>
            ) : (
              <>
                {/* Thread header */}
                <Box style={{
                  padding: t.spacing[4],
                  borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.md,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[900],
                        display: 'block',
                        marginBottom: t.spacing[1],
                      }}>
                        {selectedThread.title}
                      </Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap' as const }}>
                        <Box
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: t.spacing[1],
                            color: t.colors.neutral[500],
                            fontSize: t.typography.fontSize.xs,
                            cursor: onEntityClick ? 'pointer' : 'default',
                          }}
                          onClick={onEntityClick ? () => onEntityClick(selectedThread.entityType, selectedThread.entityId) : undefined}
                        >
                          {getEntityIcon(selectedThread.entityType, 12)}
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {getEntityLabel(selectedThread.entityType)}: {selectedThread.entityName}
                          </Text>
                        </Box>
                        <StatusBadge status={selectedThread.status} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          Started by {selectedThread.createdBy.name}
                        </Text>
                      </Box>
                    </Box>

                    {/* Thread actions */}
                    <Box style={{ display: 'flex', gap: t.spacing[2], flexShrink: 0 }}>
                      {selectedThread.status === 'open' && onResolve && (
                        <Box
                          onClick={() => onResolve(selectedThread.id)}
                          role="button"
                          tabIndex={0}
                          aria-label="Resolve thread"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: t.spacing[1],
                            padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                            borderRadius: t.borderRadius.md,
                            border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.successScale[300]}`,
                            backgroundColor: t.colors.successScale[50],
                            color: t.colors.successScale[700],
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.medium,
                            cursor: 'pointer',
                            transition: `all ${t.motion.hover}`,
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>Resolve</Text>
                        </Box>
                      )}
                      {selectedThread.status === 'resolved' && onReopen && (
                        <Box
                          onClick={() => onReopen(selectedThread.id)}
                          role="button"
                          tabIndex={0}
                          aria-label="Reopen thread"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: t.spacing[1],
                            padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                            borderRadius: t.borderRadius.md,
                            border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.warningScale[300]}`,
                            backgroundColor: t.colors.warningScale[50],
                            color: t.colors.warningScale[700],
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.medium,
                            cursor: 'pointer',
                            transition: `all ${t.motion.hover}`,
                          }}
                        >
                          <RotateCcw size={14} />
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>Reopen</Text>
                        </Box>
                      )}
                      {selectedThread.status !== 'archived' && onArchive && (
                        <Box
                          onClick={() => onArchive(selectedThread.id)}
                          role="button"
                          tabIndex={0}
                          aria-label="Archive thread"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: t.spacing[1],
                            padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                            borderRadius: t.borderRadius.md,
                            border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                            backgroundColor: t.colors.common.white,
                            color: t.colors.neutral[600],
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.medium,
                            cursor: 'pointer',
                            transition: `all ${t.motion.hover}`,
                          }}
                        >
                          <ArchiveRestore size={14} />
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>Archive</Text>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Participants */}
                  {selectedThread.participants && selectedThread.participants.length > 0 && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[3] }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[400],
                      }}>
                        Participants:
                      </Text>
                      <Box style={{ display: 'flex', gap: -8 }}>
                        {selectedThread.participants.slice(0, 5).map((p, pi) => (
                          <Box key={p.id} style={{
                            width: 24,
                            height: 24,
                            borderRadius: t.borderRadius.full,
                            backgroundColor: t.colors.neutral[200],
                            border: `2px solid ${t.colors.common.white}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: pi > 0 ? -8 : 0,
                            zIndex: 5 - pi,
                            overflow: 'hidden',
                          }}>
                            {p.avatar ? (
                              <Box
                                as="img"
                                style={{ width: 24, height: 24, borderRadius: t.borderRadius.full, objectFit: 'cover' as const }}
                                {...{ src: p.avatar, alt: p.name }}
                              />
                            ) : (
                              <User size={12} color={t.colors.neutral[500]} />
                            )}
                          </Box>
                        ))}
                        {selectedThread.participants.length > 5 && (
                          <Box style={{
                            width: 24,
                            height: 24,
                            borderRadius: t.borderRadius.full,
                            backgroundColor: t.colors.neutral[100],
                            border: `2px solid ${t.colors.common.white}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: -8,
                            fontSize: 10,
                            color: t.colors.neutral[500],
                            fontWeight: t.typography.fontWeight.medium,
                          }}>
                            <Text style={{ fontSize: 10 }}>+{selectedThread.participants.length - 5}</Text>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Comments list */}
                <Box style={{
                  flex: 1,
                  overflowY: 'auto' as const,
                  padding: t.spacing[4],
                }}>
                  {threadComments.length === 0 ? (
                    <Box style={{
                      padding: t.spacing[6],
                      textAlign: 'center' as const,
                    }}>
                      <Box style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }}>
                        <MessageCircle size={28} />
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                        No comments yet. Start the conversation.
                      </Text>
                    </Box>
                  ) : (
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
                      {threadComments.map((comment, idx) => (
                        <CommentCard key={comment.id} comment={comment} index={idx} />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Reply input */}
                {selectedThread.status !== 'archived' && onAddComment && (
                  <Box style={{
                    padding: t.spacing[3],
                    borderTop: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                    backgroundColor: t.colors.common.white,
                  }}>
                    <Box style={{
                      display: 'flex',
                      gap: t.spacing[2],
                      alignItems: 'flex-end',
                    }}>
                      <Box style={{
                        flex: 1,
                        padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                        borderRadius: t.borderRadius.md,
                        border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                        backgroundColor: t.colors.neutral[50],
                        minHeight: 40,
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                        <Box
                          as="input"
                          style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            fontSize: t.typography.fontSize.sm,
                            color: t.colors.neutral[900],
                            fontFamily: 'inherit',
                          }}
                          {...{
                            type: 'text',
                            placeholder: 'Write a reply...',
                            value: replyText,
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setReplyText(e.target.value),
                            onKeyDown: (e: React.KeyboardEvent) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendReply();
                              }
                            },
                          }}
                        />
                      </Box>
                      <Box
                        onClick={handleSendReply}
                        role="button"
                        tabIndex={0}
                        aria-label="Send reply"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: replyText.trim() ? t.colors.primaryScale[500] : t.colors.neutral[200],
                          color: replyText.trim() ? t.colors.common.white : t.colors.neutral[400],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: replyText.trim() ? 'pointer' : 'default',
                          transition: `all ${t.motion.hover}`,
                          flexShrink: 0,
                        }}
                      >
                        <Send size={16} />
                      </Box>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
