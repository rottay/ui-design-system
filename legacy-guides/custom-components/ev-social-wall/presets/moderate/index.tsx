'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createListItemStyle,
  createFilterPillStyle,
} from '../../../helpers';
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
    author: '@newuser',
    content: 'First time here and loving it! Great vibes all around 🎉',
    timestamp: new Date('2026-02-09T23:35:00'),
    likes: 12,
    status: 'pending' as const,
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
    platform: 'instagram' as const,
    author: '@spammer123',
    content: 'Check out my mixtape link in bio!!!',
    timestamp: new Date('2026-02-09T23:50:00'),
    likes: 2,
    status: 'pending' as const,
  },
  {
    id: 'post-005',
    platform: 'internal' as const,
    author: 'Sarah M.',
    content: 'Celebrating my birthday with the best crew! Thank you 🎂🎊',
    timestamp: new Date('2026-02-09T22:50:00'),
    likes: 45,
    status: 'approved' as const,
  },
  {
    id: 'post-006',
    platform: 'twitter' as const,
    author: '@hater404',
    content: 'This place is terrible, worst experience ever',
    timestamp: new Date('2026-02-09T23:55:00'),
    likes: 0,
    status: 'rejected' as const,
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
    author: '@questionable',
    content: 'Anyone want to party after hours? DM me 😏',
    timestamp: new Date('2026-02-09T23:58:00'),
    likes: 5,
    status: 'pending' as const,
  },
];

const MOCK_BANNED_WORDS = [
  'spam',
  'mixtape',
  'link in bio',
  'after hours',
  'terrible',
  'worst',
];

export const SocialWallModerate = createPreset<SocialWallProps>({
  name: 'SocialWall.Moderate',
  render: (ctx: PresetContext<SocialWallProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const posts = props.posts || MOCK_POSTS;
    const bannedWords = props.bannedWords || MOCK_BANNED_WORDS;
    const [platformFilter, setPlatformFilter] = useState<string | null>(null);

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

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'approved':
          return tokens.colors.successScale;
        case 'pending':
          return tokens.colors.warningScale;
        case 'rejected':
          return tokens.colors.errorScale;
        default:
          return tokens.colors.secondaryScale;
      }
    };

    const getStatusBadgeKey = (status: string): 'success' | 'warning' | 'error' | 'secondary' => {
      switch (status) {
        case 'approved':
          return 'success';
        case 'pending':
          return 'warning';
        case 'rejected':
          return 'error';
        default:
          return 'secondary';
      }
    };

    const filteredPosts = platformFilter
      ? posts.filter((p) => p.platform === platformFilter)
      : posts;

    const pendingPosts = filteredPosts.filter((p) => p.status === 'pending');
    const approvedPosts = filteredPosts.filter((p) => p.status === 'approved');
    const rejectedPosts = filteredPosts.filter((p) => p.status === 'rejected');

    const cardStyle = createCardStyle(tokens);
    const listItemStyle = createListItemStyle(tokens);
    const filterPillStyle = createFilterPillStyle(tokens, { active: false });

    const platforms = ['instagram', 'twitter', 'tiktok', 'internal'];

    const statusCounts = {
      approved: approvedPosts.length,
      pending: pendingPosts.length,
      rejected: rejectedPosts.length,
    };

    return (
      <Box style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats Header */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[6],
          }}
        >
          {Object.entries(statusCounts).map(([status, count]) => {
            const statusScale = getStatusColor(status);
            return (
              <Box
                key={status}
                style={{ ...cardStyle, textAlign: 'center' }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: statusScale[600],
                  }}
                >
                  {count}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                    textTransform: 'capitalize',
                    marginTop: tokens.spacing[1],
                  }}
                >
                  {status}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Platform Filter */}
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

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
            gap: tokens.spacing[6],
          }}
        >
          {/* Moderation Queue */}
          <Box>
            {/* Pending Posts */}
            {pendingPosts.length > 0 && (
              <Box style={{ marginBottom: tokens.spacing[6] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  Pending Review ({pendingPosts.length})
                </Text>

                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                  {pendingPosts.map((post) => {
                    const statusScale = getStatusColor(post.status);
                    const statusBadge = createBadgeStyle(tokens, getStatusBadgeKey(post.status));

                    return (
                      <Box
                        key={post.id}
                          style={{
                          ...listItemStyle,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: tokens.spacing[3],
                        }}
                      >
                        {/* Header */}
                        <Box
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Box
                            style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}
                          >
                            {post.authorAvatar && (
                              <img
                                src={post.authorAvatar}
                                alt={post.author}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: tokens.borderRadius.full,
                                  objectFit: 'cover',
                                }}
                              />
                            )}
                            <Box>
                              <Text
                                style={{
                                  fontSize: tokens.typography.fontSize.md,
                                  fontWeight: tokens.typography.fontWeight.semibold,
                                  color: tokens.colors.neutral[900],
                                }}
                              >
                                {post.author}
                              </Text>
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: tokens.spacing[1],
                                  marginTop: tokens.spacing[1],
                                }}
                              >
                                <Text style={{ fontSize: tokens.typography.fontSize.lg }}>
                                  {getPlatformIcon(post.platform)}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: tokens.typography.fontSize.sm,
                                    color: tokens.colors.neutral[500],
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {post.platform}
                                </Text>
                              </Box>
                            </Box>
                          </Box>

                          <Box style={{ ...statusBadge }}>
                            {post.status}
                          </Box>
                        </Box>

                        {/* Content */}
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.md,
                            color: tokens.colors.neutral[900],
                            lineHeight: 1.5,
                          }}
                        >
                          {post.content}
                        </Text>

                        {/* Media */}
                        {post.mediaUrl && (
                          <img
                            src={post.mediaUrl}
                            alt="Post media"
                            style={{
                              width: '100%',
                              maxHeight: '200px',
                              objectFit: 'cover',
                              borderRadius: tokens.borderRadius.md,
                            }}
                          />
                        )}

                        {/* Metadata */}
                        <Box
                          style={{
                            display: 'flex',
                            gap: tokens.spacing[3],
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          <Text>❤️ {post.likes}</Text>
                          <Text>
                            {post.timestamp.toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                        </Box>

                        {/* Actions */}
                        <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                          <button
                            style={{
                              flex: 1,
                              padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                              backgroundColor: tokens.colors.successScale[600],
                              color: tokens.colors.common.white,
                              border: 'none',
                              borderRadius: tokens.borderRadius.md,
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              cursor: 'pointer',
                            }}
                          >
                            Approve
                          </button>
                          <button
                            style={{
                              flex: 1,
                              padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                              backgroundColor: tokens.colors.errorScale[600],
                              color: tokens.colors.common.white,
                              border: 'none',
                              borderRadius: tokens.borderRadius.md,
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              cursor: 'pointer',
                            }}
                          >
                            Reject
                          </button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Approved Posts */}
            {approvedPosts.length > 0 && (
              <Box style={{ marginBottom: tokens.spacing[6] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  Recently Approved ({approvedPosts.length})
                </Text>

                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {approvedPosts.slice(0, 3).map((post) => (
                    <Box
                      key={post.id}
                      style={{
                        ...listItemStyle,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {post.author}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          {post.content.substring(0, 50)}...
                        </Text>
                      </Box>
                      <Box
                        style={{
                          ...createBadgeStyle(tokens, 'success'),
                          fontSize: tokens.typography.fontSize.xs,
                        }}
                      >
                        Approved
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Rejected Posts */}
            {rejectedPosts.length > 0 && (
              <Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  Rejected ({rejectedPosts.length})
                </Text>

                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {rejectedPosts.map((post) => (
                    <Box
                      key={post.id}
                      style={{
                        ...listItemStyle,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: 0.6,
                      }}
                    >
                      <Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {post.author}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          {post.content.substring(0, 50)}...
                        </Text>
                      </Box>
                      <Box
                        style={{
                          ...createBadgeStyle(tokens, 'error'),
                          fontSize: tokens.typography.fontSize.xs,
                        }}
                      >
                        Rejected
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Banned Words List */}
          <Box>
            <Box style={cardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[3],
                }}
              >
                Banned Words
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[4],
                }}
              >
                Posts containing these words will be flagged for review
              </Text>

              <Box
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: tokens.spacing[1],
                }}
              >
                {bannedWords.map((word, index) => (
                  <Box
                    key={index}
                    style={{
                      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                      backgroundColor: tokens.colors.errorScale[100],
                      color: tokens.colors.errorScale[700],
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.sm,
                      border: `1px solid ${tokens.colors.errorScale[200]}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}
                  >
                    {word}
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        color: tokens.colors.errorScale[700],
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: tokens.typography.fontSize.sm,
                      }}
                    >
                      ×
                    </button>
                  </Box>
                ))}
              </Box>

              <Box style={{ marginTop: tokens.spacing[4] }}>
                <input
                  type="text"
                  placeholder="Add banned word..."
                  style={{
                    width: '100%',
                    padding: tokens.spacing[2],
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.md,
                    outline: 'none',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
