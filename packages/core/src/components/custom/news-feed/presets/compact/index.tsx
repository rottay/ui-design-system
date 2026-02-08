'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { NewsFeedProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
  formatDistanceToNow,
} from '../../../helpers';

export default createPreset<NewsFeedProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { posts, onLike, onComment, className, style } = props;

  const formatTimestamp = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const truncateContent = (content: string, maxLength: number = 120): string => {
    return content.length > maxLength ? `${content.slice(0, maxLength)}...` : content;
  };

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.md,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[2],
        ...style,
      }}
    >
      {posts.map((post) => (
        <Box
          key={post.id}
          style={{
            display: 'flex',
            gap: tokens.spacing[4],
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            transition: `all ${tokens.motion.hover}`,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
            e.currentTarget.style.transform = tokens.motion.transform;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.common.white;
            e.currentTarget.style.transform = 'none';
          }}
        >
          {/* Avatar */}
          {post.author.avatar ? (
            <Box
              style={{
                width: '32px',
                height: '32px',
                borderRadius: tokens.borderRadius.full,
                backgroundImage: `url(${post.author.avatar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              style={{
                width: '32px',
                height: '32px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.primaryScale[600],
                }}
              >
                {post.author.name.charAt(0).toUpperCase()}
              </Text>
            </Box>
          )}

          {/* Content */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[1] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {post.author.name}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                • {formatTimestamp(post.timestamp)}
              </Text>
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
                lineHeight: tokens.typography.lineHeight.normal,
              }}
            >
              {truncateContent(post.content)}
            </Text>
            {(post.reactions || post.commentCount !== undefined) && (
              <Box style={{ display: 'flex', gap: tokens.spacing[4], marginTop: tokens.spacing[1] }}>
                {post.liked && (
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[600] }}>
                    ❤️ Liked
                  </Text>
                )}
                {post.commentCount !== undefined && post.commentCount > 0 && (
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    💬 {post.commentCount}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
});
