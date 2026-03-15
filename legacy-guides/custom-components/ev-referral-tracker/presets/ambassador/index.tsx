'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { ReferralTrackerProps, Ambassador, ReferralChain } from '../../core';

// Mock data for standalone demo - ambassador view
const MOCK_AMBASSADOR: Ambassador = {
  id: '1',
  name: 'Sarah Johnson',
  referralCode: 'SARAH2026',
  clicks: 342,
  signups: 68,
  sales: 42,
  earnings: 8450,
  tier: 'pro',
  status: 'active',
};

const MOCK_REFERRAL_CHAIN: ReferralChain[] = [
  {
    referrerId: '1',
    referredId: '101',
    referredName: 'Michael Chen',
    date: new Date('2026-02-08'),
    converted: true,
    revenue: 250,
  },
  {
    referrerId: '1',
    referredId: '102',
    referredName: 'Emma Davis',
    date: new Date('2026-02-07'),
    converted: true,
    revenue: 180,
  },
  {
    referrerId: '1',
    referredId: '103',
    referredName: 'James Wilson',
    date: new Date('2026-02-05'),
    converted: false,
    revenue: 0,
  },
  {
    referrerId: '1',
    referredId: '104',
    referredName: 'Olivia Martinez',
    date: new Date('2026-02-03'),
    converted: true,
    revenue: 420,
  },
  {
    referrerId: '1',
    referredId: '105',
    referredName: 'Liam Anderson',
    date: new Date('2026-02-01'),
    converted: false,
    revenue: 0,
  },
  {
    referrerId: '1',
    referredId: '106',
    referredName: 'Sophia Taylor',
    date: new Date('2026-01-28'),
    converted: true,
    revenue: 310,
  },
  {
    referrerId: '1',
    referredId: '107',
    referredName: 'Noah Thomas',
    date: new Date('2026-01-25'),
    converted: true,
    revenue: 195,
  },
  {
    referrerId: '1',
    referredId: '108',
    referredName: 'Ava Jackson',
    date: new Date('2026-01-22'),
    converted: false,
    revenue: 0,
  },
];

export const ReferralTrackerAmbassador = createPreset<ReferralTrackerProps>({
  name: 'ReferralTracker.Ambassador',
  render: (ctx: PresetContext<ReferralTrackerProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const ambassador = (props.ambassadors && props.ambassadors.length > 0) ? props.ambassadors[0] : MOCK_AMBASSADOR;
    const referralChain = props.chains || MOCK_REFERRAL_CHAIN;

    const getTierColor = (tier: Ambassador['tier']) => {
      switch (tier) {
        case 'starter':
          return tokens.colors.secondaryScale;
        case 'pro':
          return tokens.colors.primaryScale;
        case 'elite':
          return tokens.colors.warningScale;
        default:
          return tokens.colors.primaryScale;
      }
    };

    const getTierBadgeKey = (tier: Ambassador['tier']): 'secondary' | 'primary' | 'warning' => {
      switch (tier) {
        case 'starter': return 'secondary';
        case 'pro': return 'primary';
        case 'elite': return 'warning';
        default: return 'primary';
      }
    };

    const getTierRequirements = (tier: Ambassador['tier']) => {
      switch (tier) {
        case 'starter':
          return { sales: 10, next: 'pro' };
        case 'pro':
          return { sales: 50, next: 'elite' };
        case 'elite':
          return { sales: 100, next: 'elite' };
        default:
          return { sales: 10, next: 'pro' };
      }
    };

    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('en-US').format(num);
    };

    const formatCurrency = (num: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(num);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    };

    const tierColor = getTierColor(ambassador.tier);
    const tierReqs = getTierRequirements(ambassador.tier);
    const tierProgress =
      ambassador.tier === 'elite' ? 100 : (ambassador.sales / tierReqs.sales) * 100;

    const conversionRate = ambassador.signups > 0 ? (ambassador.sales / ambassador.signups) * 100 : 0;
    const avgOrderValue = ambassador.sales > 0 ? ambassador.earnings / ambassador.sales : 0;

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
        <Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[700],
            }}
          >
            Ambassador Dashboard
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
            }}
          >
            Track your referrals and earnings
          </Text>
        </Box>

        {/* Referral Link Card */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[6],
            backgroundColor: tierColor[50],
            borderColor: tierColor[200],
          }}
        >
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: tokens.spacing[3],
            }}
          >
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                Your Referral Code
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tierColor[700],
                  marginTop: tokens.spacing[1],
                }}
              >
                {ambassador.referralCode}
              </Text>
            </Box>
            <Box
              style={{
                ...createBadgeStyle(tokens, getTierBadgeKey(ambassador.tier)),
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  textTransform: 'uppercase',
                }}
              >
                {ambassador.tier} Tier
              </Text>
            </Box>
          </Box>
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[2],
              alignItems: 'center',
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${tierColor[300]}`,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
                fontFamily: 'monospace',
              }}
            >
              https://app.example.com/ref/{ambassador.referralCode}
            </Text>
            <Box
              style={{
                ...createCardStyle(tokens),
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                backgroundColor: tierColor[600],
                color: tokens.colors.common.white,
                cursor: 'pointer',
                ...createHoverStyle(tokens),
              }}
              onClick={() => props.onAmbassadorClick?.(ambassador.id)}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                📋 Copy
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          {[
            { label: 'Clicks', value: formatNumber(ambassador.clicks), icon: '👁️' },
            { label: 'Sign-ups', value: formatNumber(ambassador.signups), icon: '✍️' },
            { label: 'Sales', value: formatNumber(ambassador.sales), icon: '💰' },
            { label: 'Earnings', value: formatCurrency(ambassador.earnings), icon: '💵' },
            { label: 'Conversion', value: `${conversionRate.toFixed(1)}%`, icon: '📊' },
            { label: 'Avg Order', value: formatCurrency(avgOrderValue), icon: '🛒' },
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
                      fontSize: tokens.typography.fontSize.xl,
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

        {/* Tier Progress */}
        {ambassador.tier !== 'elite' && (
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[6],
            }}
          >
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: tokens.spacing[3],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}
              >
                Progress to {tierReqs.next.toUpperCase()} Tier
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                {ambassador.sales}/{tierReqs.sales} sales
              </Text>
            </Box>
            <Box
              style={{
                ...createProgressBarStyle(tokens, { percent: tierProgress, color: tierColor[500] }).track,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  ...createProgressBarStyle(tokens, { percent: tierProgress, color: tierColor[500] }).fill,
                }}
              />
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[2],
              }}
            >
              {tierReqs.sales - ambassador.sales} more sales to unlock {tierReqs.next.toUpperCase()} tier benefits
            </Text>
          </Box>
        )}

        {/* Referral Chain */}
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
            Recent Referrals
          </Text>
          <Box style={{ flex: 1, overflowY: 'auto' }}>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {referralChain.map((referral) => (
                <Box
                  key={referral.referredId}
                  style={{
                    ...createCardStyle(tokens),
                    padding: tokens.spacing[3],
                    backgroundColor: tokens.colors.neutral[100],
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {referral.referredName}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginTop: tokens.spacing[1],
                      }}
                    >
                      {formatDate(referral.date)}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[4],
                    }}
                  >
                    {referral.converted ? (
                      <>
                        <Box
                          style={{
                            ...createBadgeStyle(tokens, 'success'),
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}
                          >
                            ✓ Converted
                          </Text>
                        </Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.successScale[600],
                            minWidth: '80px',
                            textAlign: 'right',
                          }}
                        >
                          {formatCurrency(referral.revenue)}
                        </Text>
                      </>
                    ) : (
                      <Box
                        style={{
                          ...createBadgeStyle(tokens, 'warning'),
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}
                        >
                          ⏳ Pending
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
