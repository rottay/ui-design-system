'use client';

import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createFilterPillStyle } from '../../../helpers';
import type { SocialWallProps } from '../../core';
import { useState } from 'react';

// Mock data for standalone demo
const MOCK_POSTS = [
  {
    id: 'post-001',
    platform: 'instagram' as const,
    author: '@alexchen',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    content: 'Best night ever! The energy was incredible 🔥✨',
    mediaUrl: 'https://picsum.photos/seed/event1/400/300',
    timestamp: new Date('2026-02-09T23:15:00'),
    likes: 234,
    status: 'approved' as const,
  },
  {
    id: 'post-002',
    platform: 'twitter' as const,
    author: '@musiclover22',
    content: 'DJ absolutely killed it tonight! Already want to come back next week 🎵🎉',
    timestamp: new Date('2026-02-09T23:30:00'),
    likes: 89,
    status: 'approved' as const,
  },
  {
    id: 'post-003',
    platform: 'tiktok' as const,
    author: '@partyvibes',
    authorAvatar: 'https://i.pravatar.cc/150?img=8',
    content: 'When the beat drops and everyone goes crazy 🤯',
    mediaUrl: 'https://picsum.photos/seed/event2/400/500',
    timestamp: new Date('2026-02-09T23:45:00'),
    likes: 512,
    status: 'approved' as const,
  },
  {
    id: 'post-004',
    platform: 'internal' as const,
    author: 'Sarah M.',
    content: 'Celebrating my birthday with the best crew! Thank you for the amazing experience 🎂🎊',
    timestamp: new Date('2026-02-09T22:50:00'),
    likes: 45,
    status: 'approved' as const,
  },
  {
    id: 'post-005',
    platform: 'instagram' as const,
    author: '@nightlifeking',
    authorAvatar: 'https://i.pravatar.cc/150?img=12',
    content: 'VIP experience on point. Service was impeccable! 💎',
    mediaUrl: 'https://picsum.photos/seed/event3/400/400',
    timestamp: new Date('2026-02-09T22:20:00'),
    likes: 167,
    status: 'approved' as const,
  },
  {
    id: 'post-006',
    platform: 'twitter' as const,
    author: '@eventgoer',
    content: 'Already planning my next visit. This venue is top tier! 🌟',
    timestamp: new Date('2026-02-09T22:05:00'),
    likes: 73,
    status: 'approved' as const,
  },
  {
    id: 'post-007',
    platform: 'instagram' as const,
    author: '@photogal',
    authorAvatar: 'https://i.pravatar.cc/150?img=20',
    content: 'The lighting and production value here is unmatched 📸✨',
    mediaUrl: 'https://picsum.photos/seed/event4/400/350',
    timestamp: new Date('2026-02-09T21:40:00'),
    likes: 298,
    status: 'approved' as const,
  },
  {
    id: 'post-008',
    platform: 'tiktok' as const,
    author: '@dancefloor',
    content: 'POV: You\'re having the time of your life',
    timestamp: new Date('2026-02-09T21:15:00'),
    likes: 421,
    status: 'approved' as const,
  },
];

export const SocialWallDisplay = createPreset<SocialWallProps>({
  name: 'SocialWall.Display',
  render: (ctx: PresetContext<SocialWallProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const posts = (props.posts || MOCK_POSTS).filter((p) => p.status === 'approved');
    const [platformFilter, setPlatformFilter] = useState<string | null>(null);

    const getPlatformColor = (platform: string) => {
      switch (platform) {
        case 'instagram':
          return {
            bg: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)',
            text: tokens.colors.common.white,
          };
        case 'twitter':
          return {
            bg: tokens.colors.infoScale[500],
            text: tokens.colors.common.white,
          };
        case 'tiktok':
          return {
            bg: 'linear-gradient(135deg, #00F2EA 0%, #FF0050 100%)',
            text: tokens.colors.common.white,
          };
        case 'internal':
          return {
            bg: tokens.colors.primaryScale[600],
            text: tokens.colors.common.white,
          };
        default:
          return {
            bg: tokens.colors.secondaryScale[500],
            text: tokens.colors.common.white,
          };
      }
    };

    const getPlatformIcon = (platform: string) => {
      switch (platform) {
        case 'instagram':
          return '📷';
        case 'twitter':
          return '🐦';
        case 'tiktok':
          return '🎵';
        case 'internal':
          return '💬';
        default:
          return '📱';
      }
    };

    const filteredPosts = platformFilter
      ? posts.filter((p) => p.platform === platformFilter)
      : posts;

    const cardStyle = createCardStyle(tokens);
    const filterPillStyle = createFilterPillStyle(tokens, { active: false });

    const platforms = ['instagram', 'twitter', 'tiktok', 'internal'];

    return (
      <Box style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing[6],
          }}
        >
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              Social Wall
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Live updates from our community
            </Text>
          </Box>

          {/* Auto-scroll indicator */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
              backgroundColor: tokens.colors.successScale[100],
              color: tokens.colors.successScale[700],
              borderRadius: tokens.borderRadius.full,
              border: `1px solid ${tokens.colors.successScale[200]}`,
            }}
          >
            <Box
              style={{
                width: '8px',
                height: '8px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.successScale[600],
                animation: 'pulse 2s infinite',
              }}
            />
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              Live
            </Text>
          </Box>
        </Box>

        {/* Platform Filters */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[1],
            marginBottom: tokens.spacing[4],
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setPlatformFilter(null)}
            style={{
              ...filterPillStyle,
              backgroundColor: !platformFilter
                ? tokens.colors.primaryScale[100]
                : tokens.colors.neutral[100],
              color: !platformFilter
                ? tokens.colors.primaryScale[700]
                : tokens.colors.neutral[500],
              border: `1px solid ${
                !platformFilter ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
              }`,
              cursor: 'pointer',
            }}
          >
            All Platforms
          </button>
          {platforms.map((platform) => {
            const isActive = platformFilter === platform;
            const platformColors = getPlatformColor(platform);
            return (
              <button
                key={platform}
                onClick={() => setPlatformFilter(platform)}
                style={{
                  ...filterPillStyle,
                  backgroundColor: isActive
                    ? tokens.colors.primaryScale[100]
                    : tokens.colors.neutral[100],
                  color: isActive
                    ? tokens.colors.primaryScale[700]
                    : tokens.colors.neutral[500],
                  border: `1px solid ${
                    isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                  }`,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}
              >
                <span>{getPlatformIcon(platform)}</span>
                {platform}
              </button>
            );
          })}
        </Box>

        {/* Posts Count */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            marginBottom: tokens.spacing[3],
          }}
        >
          Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
        </Text>

        {/* Masonry Grid */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: tokens.spacing[3],
            alignItems: 'start',
          }}
        >
          {filteredPosts.map((post) => {
            const platformColors = getPlatformColor(post.platform);
            return (
              <Box
                key={post.id}
                style={{
                  ...cardStyle,
                  overflow: 'hidden',
                  background: platformColors.bg,
                  border: 'none',
                }}
              >
                {/* Platform Header */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  {post.authorAvatar && (
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: tokens.borderRadius.full,
                        objectFit: 'cover',
                        border: `2px solid ${platformColors.text}`,
                      }}
                    />
                  )}
                  <Box style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: platformColors.text,
                      }}
                    >
                      {post.author}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: platformColors.text,
                        opacity: 0.8,
                        textTransform: 'capitalize',
                      }}
                    >
                      {post.platform}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.xl,
                    }}
                  >
                    {getPlatformIcon(post.platform)}
                  </Box>
                </Box>

                {/* Media */}
                {post.mediaUrl && (
                  <img
                    src={post.mediaUrl}
                    alt="Post media"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: tokens.borderRadius.md,
                      marginBottom: tokens.spacing[3],
                    }}
                  />
                )}

                {/* Content */}
                <Box
                  style={{
                    backgroundColor: tokens.colors.common.white,
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      color: tokens.colors.neutral[900],
                      lineHeight: 1.5,
                    }}
                  >
                    {post.content}
                  </Text>
                </Box>

                {/* Footer */}
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        color: platformColors.text,
                      }}
                    >
                      ❤️
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: platformColors.text,
                      }}
                    >
                      {post.likes}
                    </Text>
                  </Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: platformColors.text,
                      opacity: 0.8,
                    }}
                  >
                    {post.timestamp.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
