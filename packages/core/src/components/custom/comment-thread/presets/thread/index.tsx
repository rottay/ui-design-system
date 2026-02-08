'use client';

/**
 * CommentThread - Thread Preset
 * Full sidebar + comments layout with categories and members
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { CommentThreadProps, Comment, AuthorRole } from '../../core';
import { getRoleBadgeColors, formatRelativeTime } from '../../core';

export const ThreadCommentThread = createPreset<CommentThreadProps>({
  name: 'CommentThread.Thread',
  render: ({ primitives, props, tokens, engine }: PresetContext<CommentThreadProps>) => {
    const { Box, Stack } = primitives;
    const roleBadgeColors = getRoleBadgeColors(tokens);

    const {
      comments,
      categories = [],
      activeCategoryKey,
      onCategorySelect,
      members = [],
      title = 'Discussion',
      description,
      onReply,
      onReact,
      onNewComment,
      showSidebar = true,
      loading,
      className,
      style,
    } = props;

    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [newCommentText, setNewCommentText] = useState('');

    const handleSubmitReply = (commentId: string) => {
      if (replyText.trim()) {
        onReply?.(commentId, replyText);
        setReplyText('');
        setReplyingTo(null);
      }
    };

    const handleNewComment = () => {
      if (newCommentText.trim()) {
        onNewComment?.(newCommentText);
        setNewCommentText('');
      }
    };

    const renderRoleBadge = (role: AuthorRole) => {
      if (role === 'member' || role === 'guest') return null;
      const colors = roleBadgeColors[role];
      return (
        <span style={{
          display: 'inline-block',
          padding: `0 ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.sm,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: colors.color,
          backgroundColor: colors.bgColor,
          textTransform: 'uppercase',
        }}>
          {role}
        </span>
      );
    };

    const renderComment = (comment: Comment, depth: number = 0) => (
      <Box key={comment.id} style={{ marginLeft: depth * tokens.spacing[6], marginBottom: tokens.spacing[3] }}>
        <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
          {/* Avatar */}
          {comment.author.avatar ? (
            <img src={comment.author.avatar} alt="" style={{ width: tokens.spacing[7], height: tokens.spacing[7], borderRadius: tokens.borderRadius.full, flexShrink: 0 }} />
          ) : (
            <Box style={{ width: tokens.spacing[7], height: tokens.spacing[7], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[600], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, flexShrink: 0 }}>
              {comment.author.name.charAt(0)}
            </Box>
          )}
          <Box style={{ flex: 1 }}>
            {/* Author line */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
              <span style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>
                {comment.author.name}
              </span>
              {renderRoleBadge(comment.author.role)}
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                {formatRelativeTime(comment.timestamp)}
              </span>
              {comment.edited && (
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], fontStyle: 'italic' }}>edited</span>
              )}
            </Box>
            {/* Content */}
            <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], lineHeight: tokens.typography.lineHeight.relaxed, marginBottom: tokens.spacing[2] }}>
              {comment.content}
            </Box>
            {/* Actions */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              {comment.reactions?.map((reaction, idx) => (
                <button key={idx} onClick={() => onReact?.(comment.id, reaction.emoji)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
                  padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${reaction.reacted ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                  backgroundColor: reaction.reacted ? tokens.colors.primaryScale[50] : 'transparent',
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
              <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} style={{
                border: 'none', backgroundColor: 'transparent',
                fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500],
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: tokens.typography.fontWeight.medium,
                transition: `all ${tokens.motion.hover}`,
              }}>
                Reply
              </button>
            </Box>
            {/* Reply input */}
            {replyingTo === comment.id && (
              <Box style={{ marginTop: tokens.spacing[2], display: 'flex', gap: tokens.spacing[2] }}>
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply(comment.id)}
                  placeholder="Write a reply..."
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
                <button onClick={() => handleSubmitReply(comment.id)} style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md, border: 'none',
                  backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  Reply
                </button>
              </Box>
            )}
          </Box>
        </Box>
        {/* Nested replies */}
        {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
      </Box>
    );

    return (
      <Box className={className} style={{ display: 'flex', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Sidebar */}
        {showSidebar && (
          <Box style={{ width: 260, borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            {/* Categories */}
            <Box style={{ padding: tokens.spacing[4], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase', marginBottom: tokens.spacing[2], letterSpacing: '0.5px' }}>
                Categories
              </Box>
              <Stack direction="vertical" spacing="none">
                {categories.map((cat) => (
                  <Box key={cat.key} onClick={() => onCategorySelect?.(cat.key)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm, cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    backgroundColor: cat.key === activeCategoryKey ? tokens.colors.primaryScale[50] : 'transparent',
                    color: cat.key === activeCategoryKey ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.sm,
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.label}
                    </span>
                    {cat.count !== undefined && (
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{cat.count}</span>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
            {/* Members */}
            <Box style={{ padding: tokens.spacing[4], flex: 1, overflow: 'auto' }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase', marginBottom: tokens.spacing[2], letterSpacing: '0.5px' }}>
                Members ({members.length})
              </Box>
              <Stack direction="vertical" spacing="sm">
                {members.map((member) => (
                  <Box key={member.id} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], fontSize: tokens.typography.fontSize.sm }}>
                    <Box style={{ position: 'relative' }}>
                      {member.avatar ? (
                        <img src={member.avatar} alt="" style={{ width: tokens.spacing[7], height: tokens.spacing[7], borderRadius: tokens.borderRadius.full }} />
                      ) : (
                        <Box style={{ width: tokens.spacing[7], height: tokens.spacing[7], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                          {member.name.charAt(0)}
                        </Box>
                      )}
                      {member.online && (
                        <Box style={{ position: 'absolute', bottom: 0, right: 0, width: tokens.spacing[2], height: tokens.spacing[2], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[500], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}` }} />
                      )}
                    </Box>
                    <span style={{ color: tokens.colors.neutral[700] }}>{member.name}</span>
                    {renderRoleBadge(member.role)}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        )}

        {/* Main content */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <Box style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{title}</h2>
            {description && (
              <p style={{ margin: `${tokens.spacing[1]}px 0 0`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{description}</p>
            )}
          </Box>

          {/* Comments */}
          <Box style={{ flex: 1, overflow: 'auto', padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px` }}>
            {loading ? (
              <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
            ) : (
              <Stack direction="vertical" spacing="md">
                {comments.map((comment) => renderComment(comment))}
              </Stack>
            )}
          </Box>

          {/* New comment */}
          <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                style={{
                  flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit', resize: 'vertical', outline: 'none',
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
              <button onClick={handleNewComment} style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md, border: 'none',
                backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-end',
                transition: `all ${tokens.motion.hover}`,
              }}>
                Post
              </button>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
