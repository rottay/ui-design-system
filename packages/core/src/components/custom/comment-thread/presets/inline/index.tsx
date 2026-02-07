'use client';

/**
 * CommentThread - Inline Preset
 * Comments-only view without sidebar
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { CommentThreadProps, Comment, AuthorRole } from '../../core';
import { getRoleBadgeColors, formatRelativeTime } from '../../core';

export const InlineCommentThread = createPreset<CommentThreadProps>({
  name: 'CommentThread.Inline',
  render: ({ primitives, props, tokens, engine }: PresetContext<CommentThreadProps>) => {
    const { Box, Stack } = primitives;
    const roleBadgeColors = getRoleBadgeColors(tokens);

    const {
      comments,
      title,
      onReply,
      onReact,
      onNewComment,
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
          color: colors.color, backgroundColor: colors.bgColor,
          textTransform: 'uppercase',
        }}>
          {role}
        </span>
      );
    };

    const renderComment = (comment: Comment, depth: number = 0) => (
      <Box key={comment.id} style={{
        marginLeft: depth * tokens.spacing[5],
        padding: `${tokens.spacing[3]}px`,
        borderRadius: tokens.borderRadius.md,
        backgroundColor: depth === 0 ? tokens.colors.common.white : tokens.colors.neutral[50],
        border: depth === 0 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
        marginBottom: tokens.spacing[2],
      }}>
        <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
          {comment.author.avatar ? (
            <img src={comment.author.avatar} alt="" style={{ width: tokens.spacing[7], height: tokens.spacing[7], borderRadius: tokens.borderRadius.full, flexShrink: 0 }} />
          ) : (
            <Box style={{ width: tokens.spacing[7], height: tokens.spacing[7], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[600], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, flexShrink: 0 }}>
              {comment.author.name.charAt(0)}
            </Box>
          )}
          <Box style={{ flex: 1 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
              <span style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>
                {comment.author.name}
              </span>
              {renderRoleBadge(comment.author.role)}
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                {formatRelativeTime(comment.timestamp)}
              </span>
            </Box>
            <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], lineHeight: tokens.typography.lineHeight.relaxed }}>
              {comment.content}
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[2] }}>
              {comment.reactions?.map((reaction, idx) => (
                <button key={idx} onClick={() => onReact?.(comment.id, reaction.emoji)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
                  padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${reaction.reacted ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                  backgroundColor: reaction.reacted ? tokens.colors.primaryScale[50] : 'transparent',
                  fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600],
                  cursor: 'pointer', fontFamily: 'inherit', height: tokens.spacing[6],
                }}>
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
              <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} style={{
                border: 'none', backgroundColor: 'transparent',
                fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500],
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: tokens.typography.fontWeight.medium,
              }}>
                Reply
              </button>
            </Box>
            {replyingTo === comment.id && (
              <Box style={{ marginTop: tokens.spacing[2], display: 'flex', gap: tokens.spacing[2] }}>
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply(comment.id)}
                  placeholder="Write a reply..."
                  style={{
                    flex: 1, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit', outline: 'none',
                  }}
                />
                <button onClick={() => handleSubmitReply(comment.id)} style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.sm, border: 'none',
                  backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Reply
                </button>
              </Box>
            )}
          </Box>
        </Box>
        {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
      </Box>
    );

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {title && (
          <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              {title}
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.normal, color: tokens.colors.neutral[400], marginLeft: tokens.spacing[2] }}>
                {comments.length} comments
              </span>
            </h3>
          </Box>
        )}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : (
            <Stack direction="vertical" spacing="sm">
              {comments.map((comment) => renderComment(comment))}
            </Stack>
          )}
        </Box>
        <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
          <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <input
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNewComment()}
              placeholder="Add a comment..."
              style={{
                flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button onClick={handleNewComment} style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md, border: 'none',
              backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Post
            </button>
          </Box>
        </Box>
      </Box>
    );
  },
});
