'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { NewsFeedProps } from '../../core';
import { formatDistanceToNow } from '../../../helpers';

export default createPreset<NewsFeedProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Stack } = primitives;
  const { posts, onLike, onComment, onShare, className, style } = props;

  const formatTimestamp = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.md,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[6],
        ...style,
      }}
    >
      {posts.map((post) => (
        <Box
          key={post.id}
          style={{
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.lg,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            overflow: 'hidden',
          }}
        >
          {/* Author Header */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              padding: tokens.spacing[6],
            }}
          >
            {post.author.avatar ? (
              <Box
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundImage: `url(${post.author.avatar})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ) : (
              <Box
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.primaryScale[600],
                  }}
                >
                  {post.author.name.charAt(0).toUpperCase()}
                </Text>
              </Box>
            )}
            <Box style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {post.author.name}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                {formatTimestamp(post.timestamp)}
              </Text>
            </Box>
          </Box>

          {/* Content */}
          <Box style={{ padding: `0 ${tokens.spacing[6]} ${tokens.spacing[6]}` }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[800],
                lineHeight: tokens.typography.lineHeight.relaxed,
                marginBottom: post.image ? tokens.spacing[4] : 0,
              }}
            >
              {post.content}
            </Text>
          </Box>

          {/* Image */}
          {post.image && (
            <Box
              style={{
                width: '100%',
                height: '300px',
                backgroundImage: `url(${post.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}

          {/* Reactions Bar */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: tokens.spacing[4],
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
              {post.reactions && post.reactions.length > 0 && (
                <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                  {post.reactions.map((reaction, idx) => (
                    <Box
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                        backgroundColor: tokens.colors.neutral[50],
                        borderRadius: tokens.borderRadius.full,
                      }}
                    >
                      <span>{reaction.emoji}</span>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        {reaction.count}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Box style={{ display: 'flex', gap: tokens.spacing[6] }}>
              <Box
                as="button"
                onClick={() => onLike?.(post.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: post.liked ? tokens.colors.errorScale[600] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {post.liked ? '❤️ Liked' : '🤍 Like'}
              </Box>
              {post.commentCount !== undefined && (
                <Box
                  as="button"
                  onClick={() => onComment?.(post.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  💬 {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
                </Box>
              )}
              <Box
                as="button"
                onClick={() => onShare?.(post.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                🔗 Share
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
});
