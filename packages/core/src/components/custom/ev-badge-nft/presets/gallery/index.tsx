'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { BadgeNftProps, DigitalBadge, BadgeProgress } from '../../core';

// Mock data for standalone demo
const MOCK_BADGES: DigitalBadge[] = [
  {
    id: '1',
    name: 'First Purchase',
    description: 'Complete your first transaction',
    rarity: 'common',
    criteria: 'Make 1 purchase',
    earned: true,
    earnedDate: new Date('2026-01-15'),
    totalEarned: 1250,
    totalPossible: 1500,
  },
  {
    id: '2',
    name: 'Loyalty Champion',
    description: 'Reach 100 orders milestone',
    rarity: 'rare',
    criteria: 'Complete 100 orders',
    earned: true,
    earnedDate: new Date('2026-02-01'),
    totalEarned: 45,
    totalPossible: 1500,
  },
  {
    id: '3',
    name: 'Early Adopter',
    description: 'Join during beta period',
    rarity: 'epic',
    criteria: 'Sign up before launch',
    earned: true,
    earnedDate: new Date('2025-12-10'),
    totalEarned: 150,
    totalPossible: 1500,
  },
  {
    id: '4',
    name: 'Social Butterfly',
    description: 'Refer 10 friends',
    rarity: 'uncommon',
    criteria: 'Get 10 successful referrals',
    earned: false,
    totalEarned: 0,
    totalPossible: 1500,
  },
  {
    id: '5',
    name: 'VIP Whale',
    description: 'Spend over $10,000 total',
    rarity: 'legendary',
    criteria: 'Lifetime spending > $10k',
    earned: false,
    totalEarned: 0,
    totalPossible: 1500,
  },
  {
    id: '6',
    name: 'Speed Demon',
    description: 'Complete order in under 2 minutes',
    rarity: 'uncommon',
    criteria: 'Checkout < 2min',
    earned: true,
    earnedDate: new Date('2026-01-20'),
    totalEarned: 320,
    totalPossible: 1500,
  },
  {
    id: '7',
    name: 'Night Owl',
    description: 'Place order between 12am-4am',
    rarity: 'common',
    criteria: 'Order during night hours',
    earned: false,
    totalEarned: 0,
    totalPossible: 1500,
  },
  {
    id: '8',
    name: 'Perfect Streak',
    description: 'Order every day for 30 days',
    rarity: 'epic',
    criteria: '30-day ordering streak',
    earned: false,
    totalEarned: 0,
    totalPossible: 1500,
  },
];

const MOCK_PROGRESS: BadgeProgress[] = [
  { badgeId: '4', current: 6, required: 10, percentComplete: 60 },
  { badgeId: '5', current: 7250, required: 10000, percentComplete: 72.5 },
  { badgeId: '7', current: 0, required: 1, percentComplete: 0 },
  { badgeId: '8', current: 12, required: 30, percentComplete: 40 },
];

export const BadgeNftGallery = createPreset<BadgeNftProps>({
  name: 'BadgeNFT.Gallery',
  render: (ctx: PresetContext<BadgeNftProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const badges = props.badges || MOCK_BADGES;
    const progress = props.progress || MOCK_PROGRESS;

    const getRarityColor = (rarity: DigitalBadge['rarity']) => {
      switch (rarity) {
        case 'common':
          return tokens.colors.secondaryScale;
        case 'uncommon':
          return tokens.colors.successScale;
        case 'rare':
          return tokens.colors.infoScale;
        case 'epic':
          return tokens.colors.primaryScale;
        case 'legendary':
          return tokens.colors.warningScale;
        default:
          return tokens.colors.primaryScale;
      }
    };

    const getRarityIcon = (rarity: DigitalBadge['rarity']) => {
      switch (rarity) {
        case 'common':
          return '⚪';
        case 'uncommon':
          return '🟢';
        case 'rare':
          return '🔵';
        case 'epic':
          return '🟣';
        case 'legendary':
          return '🟡';
        default:
          return '⚪';
      }
    };

    const getBadgeIcon = (badge: DigitalBadge) => {
      const icons: Record<string, string> = {
        'First Purchase': '🛍️',
        'Loyalty Champion': '👑',
        'Early Adopter': '🌟',
        'Social Butterfly': '🦋',
        'VIP Whale': '🐋',
        'Speed Demon': '⚡',
        'Night Owl': '🦉',
        'Perfect Streak': '🔥',
      };
      return icons[badge.name] || '🏆';
    };

    const getBadgeProgress = (badgeId: string) => {
      return progress.find((p) => p.badgeId === badgeId);
    };

    const formatDate = (date?: Date) => {
      if (!date) return '';
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    };

    const earnedBadges = badges.filter((b) => b.earned);
    const lockedBadges = badges.filter((b) => !b.earned);

    const rarities: DigitalBadge['rarity'][] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[4],
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
        }}
      >
        {/* Header */}
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[700],
              }}
            >
              Badge Collection
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Earn digital badges and NFTs for your achievements
            </Text>
          </Box>
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[4],
              backgroundColor: tokens.colors.primaryScale[50],
              borderColor: tokens.colors.primaryScale[200],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              Collection Progress
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primaryScale[600],
                marginTop: tokens.spacing[1],
              }}
            >
              {earnedBadges.length}/{badges.length}
            </Text>
          </Box>
        </Box>

        {/* Filter Pills */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[2],
            flexWrap: 'wrap',
          }}
        >
          <Box
            style={{
              ...createFilterPillStyle(tokens, { active: true }),
              cursor: 'pointer',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              All ({badges.length})
            </Text>
          </Box>
          {rarities.map((rarity) => {
            const count = badges.filter((b) => b.rarity === rarity).length;
            const rarityColor = getRarityColor(rarity);
            return (
              <Box
                key={rarity}
                style={{
                  ...createFilterPillStyle(tokens, { active: false }),
                  cursor: 'pointer',
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.sm }}>
                  {getRarityIcon(rarity)}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    textTransform: 'capitalize',
                  }}
                >
                  {rarity} ({count})
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Badge Grid */}
        <Box
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: tokens.spacing[4],
            overflowY: 'auto',
          }}
        >
          {badges.map((badge) => {
            const rarityColor = getRarityColor(badge.rarity);
            const badgeProgress = getBadgeProgress(badge.id);
            const isLocked = !badge.earned;

            return (
              <Box
                key={badge.id}
                style={{
                  ...createCardStyle(tokens),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[3],
                  cursor: 'pointer',
                  opacity: isLocked ? 0.6 : 1,
                  borderWidth: '2px',
                  borderColor: badge.earned ? rarityColor[400] : tokens.colors.neutral[200],
                  backgroundColor: badge.earned
                    ? tokens.colors.neutral[100]
                    : tokens.colors.neutral[50],
                  ...createHoverStyle(tokens),
                }}
                onClick={() => props.onBadgeClick?.(badge.id)}
              >
                {/* Badge Icon */}
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: tokens.spacing[6],
                    backgroundColor: badge.earned ? rarityColor[50] : tokens.colors.neutral[100],
                    borderRadius: tokens.borderRadius.lg,
                  }}
                >
                  <Text
                    style={{
                      fontSize: '64px',
                      filter: isLocked ? 'grayscale(100%)' : 'none',
                    }}
                  >
                    {isLocked ? '🔒' : getBadgeIcon(badge)}
                  </Text>
                </Box>

                {/* Badge Info */}
                <Box>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {badge.name}
                    </Text>
                    <Box
                      style={{
                        ...createBadgeStyle(tokens, badge.rarity === 'common' ? 'secondary' : badge.rarity === 'uncommon' ? 'success' : badge.rarity === 'rare' ? 'info' : badge.rarity === 'epic' ? 'primary' : 'warning'),
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.xs }}>
                        {getRarityIcon(badge.rarity)}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          textTransform: 'capitalize',
                        }}
                      >
                        {badge.rarity}
                      </Text>
                    </Box>
                  </Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    {badge.description}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      fontStyle: 'italic',
                    }}
                  >
                    {badge.criteria}
                  </Text>
                </Box>

                {/* Progress Bar for Locked Badges */}
                {isLocked && badgeProgress && (
                  <Box>
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        Progress
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[700],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        {badgeProgress.current}/{badgeProgress.required}
                      </Text>
                    </Box>
                    {(() => {
                      const progressStyles = createProgressBarStyle(tokens, { percent: badgeProgress.percentComplete, color: rarityColor[500] });
                      return (
                        <Box style={progressStyles.track}>
                          <Box style={progressStyles.fill} />
                        </Box>
                      );
                    })()}
                  </Box>
                )}

                {/* Earned Info */}
                {badge.earned && (
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: tokens.spacing[2],
                      borderTop: `1px solid ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        Earned on
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        {formatDate(badge.earnedDate)}
                      </Text>
                    </Box>
                    <Box style={{ textAlign: 'right' }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        Rarity
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: rarityColor[600],
                          fontWeight: tokens.typography.fontWeight.semibold,
                        }}
                      >
                        {badge.totalEarned}/{badge.totalPossible}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
