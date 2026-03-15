'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { LoyaltyProgramProps, LoyaltyMember, LoyaltyReward } from '../../core';

// Mock data for standalone demo
const MOCK_MEMBER = {
  id: 'member-001',
  name: 'Alexandra Chen',
  tier: 'gold' as const,
  points: 4250,
  lifetimePoints: 12800,
  eventsAttended: 18,
  achievements: [
    {
      id: 'ach-1',
      name: 'First Event',
      description: 'Attended your first event',
      icon: '🎉',
      earned: true,
      earnedDate: new Date('2025-01-15'),
    },
    {
      id: 'ach-2',
      name: '5 Events Club',
      description: 'Attended 5 events',
      icon: '⭐',
      earned: true,
      earnedDate: new Date('2025-04-20'),
    },
    {
      id: 'ach-3',
      name: '10 Events Club',
      description: 'Attended 10 events',
      icon: '🌟',
      earned: true,
      earnedDate: new Date('2025-07-10'),
    },
    {
      id: 'ach-4',
      name: 'Early Bird',
      description: 'Purchased tickets 30 days in advance',
      icon: '🐦',
      earned: true,
      earnedDate: new Date('2025-03-05'),
    },
    {
      id: 'ach-5',
      name: 'Night Owl',
      description: 'Stayed until closing time',
      icon: '🦉',
      earned: true,
      earnedDate: new Date('2025-05-22'),
    },
    {
      id: 'ach-6',
      name: 'VIP Spender',
      description: 'Spent $1000+ in a single event',
      icon: '💎',
      earned: false,
    },
    {
      id: 'ach-7',
      name: 'Social Butterfly',
      description: 'Brought 5 friends to events',
      icon: '🦋',
      earned: false,
    },
    {
      id: 'ach-8',
      name: 'Platinum Journey',
      description: 'Reach Platinum tier',
      icon: '👑',
      earned: false,
    },
  ],
};

const MOCK_REWARDS = [
  {
    id: 'reward-1',
    name: 'Free Drink Voucher',
    pointsCost: 500,
    description: 'One complimentary drink at any event',
    category: 'beverage',
    available: true,
  },
  {
    id: 'reward-2',
    name: 'VIP Table Upgrade',
    pointsCost: 2000,
    description: 'Upgrade to VIP table seating',
    category: 'seating',
    available: true,
  },
  {
    id: 'reward-3',
    name: 'Meet & Greet Pass',
    pointsCost: 3500,
    description: 'Meet the artist after the show',
    category: 'experience',
    available: true,
  },
  {
    id: 'reward-4',
    name: 'Event Merchandise',
    pointsCost: 1200,
    description: 'Official event t-shirt and poster',
    category: 'merchandise',
    available: true,
  },
];

const MOCK_RECENT_ACTIVITY = [
  { date: '2026-02-05', description: 'Attended "Winter Wonderland"', points: 500 },
  { date: '2026-01-28', description: 'Earned "Night Owl" achievement', points: 200 },
  { date: '2026-01-20', description: 'Redeemed VIP Table Upgrade', points: -2000 },
  { date: '2026-01-15', description: 'Attended "New Year Celebration"', points: 800 },
];

export const LoyaltyProgramMember = createPreset<LoyaltyProgramProps>({
  name: 'LoyaltyProgram.Member',
  render: (ctx: PresetContext<LoyaltyProgramProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const member = (props.members?.[0] || MOCK_MEMBER) as LoyaltyMember & { achievements: typeof MOCK_MEMBER.achievements };
    const rewards = props.rewards || MOCK_REWARDS;
    const recentActivity = MOCK_RECENT_ACTIVITY;

    const getTierScale = (tier: string) => {
      switch (tier) {
        case 'platinum':
          return tokens.colors.primaryScale;
        case 'gold':
          return tokens.colors.warningScale;
        case 'silver':
          return tokens.colors.infoScale;
        default:
          return tokens.colors.secondaryScale;
      }
    };

    const getTierBadgeColor = (tier: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      switch (tier) {
        case 'platinum':
          return 'primary';
        case 'gold':
          return 'warning';
        case 'silver':
          return 'info';
        default:
          return 'secondary';
      }
    };

    const getNextTier = (currentTier: string) => {
      const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
      const currentIndex = tierOrder.indexOf(currentTier);
      if (currentIndex === tierOrder.length - 1) return null;
      return tierOrder[currentIndex + 1];
    };

    const getTierThreshold = (tier: string) => {
      switch (tier) {
        case 'platinum':
          return 10000;
        case 'gold':
          return 5000;
        case 'silver':
          return 2000;
        default:
          return 0;
      }
    };

    const tierScale = getTierScale(member.tier);
    const nextTier = getNextTier(member.tier);
    const nextTierThreshold = nextTier ? getTierThreshold(nextTier) : 0;
    const currentTierThreshold = getTierThreshold(member.tier);
    const progressToNextTier = nextTier
      ? ((member.points - currentTierThreshold) / (nextTierThreshold - currentTierThreshold)) * 100
      : 100;

    const cardStyle = createCardStyle(tokens);
    const badgeStyle = createBadgeStyle(tokens, getTierBadgeColor(member.tier));

    const initials = member.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();

    return (
      <Box style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Member Card */}
        <Box style={{ ...cardStyle, marginBottom: tokens.spacing[6] }}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              marginBottom: tokens.spacing[4],
            }}
          >
            {/* Avatar */}
            <Box
              style={{
                width: '80px',
                height: '80px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tierScale[100],
                color: tierScale[700],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                border: `3px solid ${tierScale[500]}`,
              }}
            >
              {initials}
            </Box>

            {/* Member Info */}
            <Box style={{ flex: 1 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {member.name}
                </Text>
                <Box
                  style={{
                    ...badgeStyle,
                    fontSize: tokens.typography.fontSize.sm,
                    textTransform: 'uppercase',
                  }}
                >
                  {member.tier}
                </Box>
              </Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  color: tokens.colors.neutral[500],
                  marginTop: tokens.spacing[1],
                }}
              >
                Member since January 2025
              </Text>
            </Box>

            {/* Points Display */}
            <Box style={{ textAlign: 'right' }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['3xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tierScale[600],
                }}
              >
                {member.points.toLocaleString()}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  marginTop: tokens.spacing[1],
                }}
              >
                Available Points
              </Text>
            </Box>
          </Box>

          {/* Progress to Next Tier */}
          {nextTier && (
            <Box>
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: tokens.spacing[2],
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  Progress to {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  {nextTierThreshold - member.points} points needed
                </Text>
              </Box>
              <Box
                style={{
                  ...createProgressBarStyle(tokens, { color: tierScale[600], percent: Math.min(progressToNextTier, 100) }).track,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={createProgressBarStyle(tokens, { color: tierScale[600], percent: Math.min(progressToNextTier, 100) }).fill}
                />
              </Box>
            </Box>
          )}

          {/* Stats */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: tokens.spacing[3],
              marginTop: tokens.spacing[4],
              paddingTop: tokens.spacing[4],
              borderTop: `1px solid ${tokens.colors.neutral[200]}`,
            }}
          >
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                Events Attended
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginTop: tokens.spacing[1],
                }}
              >
                {member.eventsAttended}
              </Text>
            </Box>
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                Lifetime Points
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginTop: tokens.spacing[1],
                }}
              >
                {member.lifetimePoints.toLocaleString()}
              </Text>
            </Box>
          </Box>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: tokens.spacing[6],
          }}
        >
          {/* Achievements */}
          <Box>
            <Box style={cardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[4],
                }}
              >
                Achievements ({member.achievements.filter((a) => a.earned).length}/
                {member.achievements.length})
              </Text>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: tokens.spacing[3],
                }}
              >
                {member.achievements.map((achievement) => (
                  <Box
                    key={achievement.id}
                    style={{
                      padding: tokens.spacing[3],
                      backgroundColor: achievement.earned
                        ? tokens.colors.primaryScale[50]
                        : tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.md,
                      border: `1px solid ${
                        achievement.earned ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]
                      }`,
                      textAlign: 'center',
                      opacity: achievement.earned ? 1 : 0.5,
                    }}
                  >
                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize['3xl'],
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      {achievement.icon}
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: achievement.earned
                          ? tokens.colors.neutral[900]
                          : tokens.colors.neutral[500],
                      }}
                    >
                      {achievement.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginTop: tokens.spacing[1],
                      }}
                    >
                      {achievement.description}
                    </Text>
                    {achievement.earned && achievement.earnedDate && (
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.primaryScale[600],
                          marginTop: tokens.spacing[1],
                        }}
                      >
                        {achievement.earnedDate.toLocaleDateString()}
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Rewards Catalog */}
          <Box>
            <Box style={cardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[4],
                }}
              >
                Rewards Catalog
              </Text>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {rewards.map((reward) => {
                  const canAfford = member.points >= reward.pointsCost;
                  return (
                    <Box
                      key={reward.id}
                      style={{
                        padding: tokens.spacing[3],
                        backgroundColor: tokens.colors.neutral[100],
                        borderRadius: tokens.borderRadius.md,
                        border: `1px solid ${tokens.colors.neutral[200]}`,
                      }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: tokens.spacing[2],
                        }}
                      >
                        <Box style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.md,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                            }}
                          >
                            {reward.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.neutral[500],
                              marginTop: tokens.spacing[1],
                            }}
                          >
                            {reward.description}
                          </Text>
                        </Box>
                        <Box
                          style={{
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            backgroundColor: canAfford
                              ? tokens.colors.successScale[100]
                              : tokens.colors.secondaryScale[100],
                            color: canAfford
                              ? tokens.colors.successScale[700]
                              : tokens.colors.secondaryScale[700],
                            borderRadius: tokens.borderRadius.md,
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            border: `1px solid ${
                              canAfford
                                ? tokens.colors.successScale[200]
                                : tokens.colors.secondaryScale[200]
                            }`,
                          }}
                        >
                          {reward.pointsCost} pts
                        </Box>
                      </Box>
                      <button
                        disabled={!canAfford}
                        style={{
                          width: '100%',
                          padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                          backgroundColor: canAfford
                            ? tokens.colors.primaryScale[600]
                            : tokens.colors.neutral[100],
                          color: canAfford
                            ? tokens.colors.common.white
                            : tokens.colors.neutral[500],
                          border: canAfford ? 'none' : `1px solid ${tokens.colors.neutral[200]}`,
                          borderRadius: tokens.borderRadius.md,
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {canAfford ? 'Redeem' : 'Not Enough Points'}
                      </button>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Recent Activity */}
        <Box style={{ ...cardStyle, marginTop: tokens.spacing[6] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[4],
            }}
          >
            Recent Activity
          </Text>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            {recentActivity.map((activity, index) => (
              <Box
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                }}
              >
                <Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {activity.description}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                      marginTop: tokens.spacing[1],
                    }}
                  >
                    {new Date(activity.date).toLocaleDateString()}
                  </Text>
                </Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color:
                      activity.points >= 0
                        ? tokens.colors.successScale[600]
                        : tokens.colors.errorScale[600],
                  }}
                >
                  {activity.points >= 0 ? '+' : ''}
                  {activity.points}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  },
});
