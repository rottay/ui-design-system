'use client';

import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createHoverStyle, createBadgeStyle } from '../../../helpers';
import type { BadgeNftProps, DigitalBadge } from '../../core';

// Mock data matching gallery preset
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

export const BadgeNftAdmin = createPreset<BadgeNftProps>({
  name: 'BadgeNFT.Admin',
  render: (ctx: PresetContext<BadgeNftProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const badges = props.badges || MOCK_BADGES;

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

    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('en-US').format(num);
    };

    const getRarityDistribution = () => {
      const distribution: Record<DigitalBadge['rarity'], number> = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
      };
      badges.forEach((badge) => {
        distribution[badge.rarity]++;
      });
      return distribution;
    };

    const distribution = getRarityDistribution();
    const totalEarned = badges.reduce((sum, b) => sum + b.totalEarned, 0);
    const activeBadges = badges.filter((b) => b.totalEarned > 0).length;

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
              Badge Management
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Create and manage digital badges and NFT rewards
            </Text>
          </Box>
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              cursor: 'pointer',
              ...createHoverStyle(tokens),
            }}
            onClick={props.onCreateBadge}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
              }}
            >
              + Create Badge
            </Text>
          </Box>
        </Box>

        {/* Stats Overview */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          {[
            { label: 'Total Badges', value: badges.length, icon: '🏆' },
            { label: 'Active Badges', value: activeBadges, icon: '✅' },
            { label: 'Total Earned', value: formatNumber(totalEarned), icon: '⭐' },
            {
              label: 'Avg Distribution',
              value: formatNumber(Math.round(totalEarned / badges.length)),
              icon: '📊',
            },
          ].map((stat) => (
            <Box
              key={stat.label}
              style={{
                ...createCardStyle(tokens),
                padding: tokens.spacing[4],
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xl }}>{stat.icon}</Text>
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[700],
                      marginTop: tokens.spacing[1],
                    }}
                  >
                    {stat.value}
                  </Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Rarity Distribution */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[6],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[4],
            }}
          >
            Rarity Distribution
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {Object.entries(distribution).map(([rarity, count]) => {
              const rarityColor = getRarityColor(rarity as DigitalBadge['rarity']);
              const percentage = (count / badges.length) * 100;

              return (
                <Box key={rarity}>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[700],
                        textTransform: 'capitalize',
                      }}
                    >
                      {rarity}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {count} badges ({percentage.toFixed(0)}%)
                    </Text>
                  </Box>
                  <Box
                    style={{
                      width: '100%',
                      height: '32px',
                      backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.md,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: rarityColor[500],
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Badge Management Table */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[6],
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[4],
            }}
          >
            All Badges
          </Text>
          <Box style={{ flex: 1, overflowY: 'auto' }}>
            <Box style={{ minWidth: '900px' }}>
              {/* Table Header */}
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 2fr 1fr 1.5fr',
                  gap: tokens.spacing[3],
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.md,
                }}
              >
                {['Badge Name', 'Rarity', 'Criteria', 'Total Earned', 'Actions'].map((header) => (
                  <Text
                    key={header}
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase',
                    }}
                  >
                    {header}
                  </Text>
                ))}
              </Box>

              {/* Table Rows */}
              <Box style={{ marginTop: tokens.spacing[2] }}>
                {badges.map((badge) => {
                  const rarityColor = getRarityColor(badge.rarity);

                  return (
                    <Box
                      key={badge.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 2fr 1fr 1.5fr',
                        gap: tokens.spacing[3],
                        padding: tokens.spacing[3],
                        borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                        alignItems: 'center',
                      }}
                    >
                      {/* Badge Name */}
                      <Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[700],
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}
                        >
                          {badge.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          {badge.description}
                        </Text>
                      </Box>

                      {/* Rarity */}
                      <Box
                        style={{
                          ...createBadgeStyle(tokens, badge.rarity === 'common' ? 'secondary' : badge.rarity === 'uncommon' ? 'success' : badge.rarity === 'rare' ? 'info' : badge.rarity === 'epic' ? 'primary' : 'warning'),
                          display: 'inline-flex',
                          alignSelf: 'flex-start',
                        }}
                      >
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

                      {/* Criteria */}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        {badge.criteria}
                      </Text>

                      {/* Total Earned */}
                      <Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[700],
                            fontWeight: tokens.typography.fontWeight.semibold,
                          }}
                        >
                          {formatNumber(badge.totalEarned)}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          {((badge.totalEarned / badge.totalPossible) * 100).toFixed(1)}% of users
                        </Text>
                      </Box>

                      {/* Actions */}
                      <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                        <Box
                          style={{
                            ...createCardStyle(tokens),
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            backgroundColor: tokens.colors.primaryScale[50],
                            borderColor: tokens.colors.primaryScale[200],
                            cursor: 'pointer',
                            ...createHoverStyle(tokens),
                          }}
                          onClick={() => props.onMintNft?.(badge.id)}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.primaryScale[700],
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}
                          >
                            🎨 Mint NFT
                          </Text>
                        </Box>
                        <Box
                          style={{
                            ...createCardStyle(tokens),
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            backgroundColor: tokens.colors.neutral[100],
                            cursor: 'pointer',
                            ...createHoverStyle(tokens),
                          }}
                          onClick={() => props.onBadgeClick?.(badge.id)}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[700],
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}
                          >
                            ✏️ Edit
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Earning Distribution Stats */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[6],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[4],
            }}
          >
            Top Performing Badges
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            {badges
              .filter((b) => b.totalEarned > 0)
              .sort((a, b) => b.totalEarned - a.totalEarned)
              .slice(0, 5)
              .map((badge, index) => {
                const rarityColor = getRarityColor(badge.rarity);
                const maxEarned = Math.max(...badges.map((b) => b.totalEarned));
                const widthPercent = (badge.totalEarned / maxEarned) * 100;

                return (
                  <Box
                    key={badge.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[500],
                        width: '24px',
                      }}
                    >
                      {index + 1}
                    </Text>
                    <Box style={{ width: '160px' }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {badge.name}
                      </Text>
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Box
                        style={{
                          width: '100%',
                          height: '24px',
                          backgroundColor: tokens.colors.neutral[100],
                          borderRadius: tokens.borderRadius.md,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          style={{
                            width: `${widthPercent}%`,
                            height: '100%',
                            backgroundColor: rarityColor[500],
                          }}
                        />
                      </Box>
                    </Box>
                    <Box style={{ width: '100px', textAlign: 'right' }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {formatNumber(badge.totalEarned)}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
          </Box>
        </Box>
      </Box>
    );
  },
});
