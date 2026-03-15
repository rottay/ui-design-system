'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { LoyaltyProgramProps, LoyaltyMember } from '../../core';

// Mock data for standalone demo
const MOCK_PROGRAM_STATS = {
  totalMembers: 3420,
  pointsIssued: 456780,
  rewardsRedeemed: 892,
  engagementRate: 68.5,
};

const MOCK_TIER_DISTRIBUTION = [
  { tier: 'bronze', count: 1850, percentage: 54.1 },
  { tier: 'silver', count: 982, percentage: 28.7 },
  { tier: 'gold', count: 428, percentage: 12.5 },
  { tier: 'platinum', count: 160, percentage: 4.7 },
];

const MOCK_TOP_MEMBERS = [
  {
    id: 'member-001',
    name: 'Alexandra Chen',
    tier: 'platinum' as const,
    points: 15420,
    lifetimePoints: 28900,
    eventsAttended: 24,
    achievements: [],
  },
  {
    id: 'member-002',
    name: 'Noah Anderson',
    tier: 'platinum' as const,
    points: 14850,
    lifetimePoints: 26300,
    eventsAttended: 28,
    achievements: [],
  },
  {
    id: 'member-003',
    name: 'Marcus Johnson',
    tier: 'gold' as const,
    points: 12200,
    lifetimePoints: 19800,
    eventsAttended: 18,
    achievements: [],
  },
  {
    id: 'member-004',
    name: 'Emily Thompson',
    tier: 'gold' as const,
    points: 10950,
    lifetimePoints: 17600,
    eventsAttended: 15,
    achievements: [],
  },
  {
    id: 'member-005',
    name: 'Sophia Rodriguez',
    tier: 'gold' as const,
    points: 9870,
    lifetimePoints: 15200,
    eventsAttended: 12,
    achievements: [],
  },
];

const MOCK_ACHIEVEMENT_STATS = [
  { name: 'First Event', completionRate: 94.2 },
  { name: '5 Events Club', completionRate: 72.5 },
  { name: '10 Events Club', completionRate: 45.8 },
  { name: 'Early Bird', completionRate: 68.3 },
  { name: 'Night Owl', completionRate: 52.1 },
  { name: 'VIP Spender', completionRate: 28.6 },
];

export const LoyaltyProgramDashboard = createPreset<LoyaltyProgramProps>({
  name: 'LoyaltyProgram.Dashboard',
  render: (ctx: PresetContext<LoyaltyProgramProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const programStats = props.programStats || MOCK_PROGRAM_STATS;
    const tierDistribution = MOCK_TIER_DISTRIBUTION;
    const topMembers = (props.members || MOCK_TOP_MEMBERS) as LoyaltyMember[];
    const achievementStats = MOCK_ACHIEVEMENT_STATS;

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

    const cardStyle = createCardStyle(tokens);

    return (
      <Box style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Program KPIs */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[6],
          }}
        >
          <Box style={{ ...cardStyle, textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primaryScale[600],
              }}
            >
              {programStats.totalMembers.toLocaleString()}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Total Members
            </Text>
          </Box>

          <Box style={{ ...cardStyle, textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.warningScale[600],
              }}
            >
              {('pointsIssued' in programStats ? programStats.pointsIssued : 0).toLocaleString()}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Points Issued
            </Text>
          </Box>

          <Box style={{ ...cardStyle, textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[600],
              }}
            >
              {programStats.rewardsRedeemed.toLocaleString()}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Rewards Redeemed
            </Text>
          </Box>

          <Box style={{ ...cardStyle, textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.infoScale[600],
              }}
            >
              {'engagementRate' in programStats ? programStats.engagementRate : 0}%
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Engagement Rate
            </Text>
          </Box>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: tokens.spacing[6],
          }}
        >
          {/* Tier Distribution */}
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
                Member Distribution by Tier
              </Text>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                {tierDistribution.map((item) => {
                  const tierScale = getTierScale(item.tier);
                  const progressStyles = createProgressBarStyle(tokens, { color: tierScale[600], percent: item.percentage });

                  return (
                    <Box key={item.tier}>
                      <Box
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.md,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[900],
                            textTransform: 'capitalize',
                          }}
                        >
                          {item.tier}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          {item.count} ({item.percentage}%)
                        </Text>
                      </Box>
                      <Box
                        style={{
                          ...progressStyles.track,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          style={progressStyles.fill}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Top Members Leaderboard */}
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
                Top Members
              </Text>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {topMembers.map((member, index) => {
                  const tierScale = getTierScale(member.tier);
                  const tierBadge = getTierBadgeColor(member.tier);
                  const initials = member.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <Box
                      key={member.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        padding: tokens.spacing[3],
                        backgroundColor: tokens.colors.neutral[100],
                        borderRadius: tokens.borderRadius.md,
                        border: `1px solid ${tokens.colors.neutral[200]}`,
                      }}
                    >
                      {/* Rank */}
                      <Box
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor:
                            index === 0
                              ? tokens.colors.warningScale[100]
                              : tokens.colors.primaryScale[100],
                          color:
                            index === 0
                              ? tokens.colors.warningScale[700]
                              : tokens.colors.primaryScale[700],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.bold,
                        }}
                      >
                        {index + 1}
                      </Box>

                      {/* Avatar */}
                      <Box
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tierScale[100],
                          color: tierScale[700],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.bold,
                          border: `2px solid ${tierScale[500]}`,
                        }}
                      >
                        {initials}
                      </Box>

                      {/* Info */}
                      <Box style={{ flex: 1 }}>
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.md,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[900],
                            }}
                          >
                            {member.name}
                          </Text>
                          <Box
                            style={{
                              ...createBadgeStyle(tokens, tierBadge),
                              fontSize: tokens.typography.fontSize.xs,
                              textTransform: 'uppercase',
                            }}
                          >
                            {member.tier}
                          </Box>
                        </Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[500],
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          {member.eventsAttended} events • {member.lifetimePoints.toLocaleString()}{' '}
                          lifetime points
                        </Text>
                      </Box>

                      {/* Points */}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tierScale[600],
                        }}
                      >
                        {member.points.toLocaleString()}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Achievement Completion Rates */}
        <Box style={{ ...cardStyle, marginTop: tokens.spacing[6] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[4],
            }}
          >
            Achievement Completion Rates
          </Text>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {achievementStats.map((achievement) => {
              const progressStyles = createProgressBarStyle(tokens, {
                color: tokens.colors.primaryScale[600],
                percent: achievement.completionRate,
              });

              return (
                <Box key={achievement.name}>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {achievement.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.primaryScale[600],
                      }}
                    >
                      {achievement.completionRate}%
                    </Text>
                  </Box>
                  <Box
                    style={{
                      ...progressStyles.track,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={progressStyles.fill}
                    />
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
