'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { EvPromoEngineProps, PromoCode } from '../../core';

const MOCK_PROMOS: PromoCode[] = [
  {
    id: '1',
    code: 'EARLYBIRD2026',
    type: 'percentage',
    value: 20,
    description: '20% off for early registrations',
    status: 'active',
    usageCount: 145,
    usageLimit: 500,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-03-01'),
    revenueGenerated: 14500,
    redemptionRate: 29,
  },
  {
    id: '2',
    code: 'VIP500',
    type: 'fixed',
    value: 500,
    description: '$500 off VIP packages',
    status: 'active',
    usageCount: 28,
    usageLimit: 50,
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-02-28'),
    revenueGenerated: 42000,
    redemptionRate: 56,
  },
  {
    id: '3',
    code: 'BOGO-GENERAL',
    type: 'bogo',
    value: 1,
    description: 'Buy one general admission, get one free',
    status: 'scheduled',
    usageCount: 0,
    usageLimit: 200,
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-15'),
    revenueGenerated: 0,
    redemptionRate: 0,
  },
  {
    id: '4',
    code: 'BUNDLE-PREMIUM',
    type: 'bundle',
    value: 150,
    description: 'Premium ticket + merch bundle discount',
    status: 'active',
    usageCount: 42,
    usageLimit: 100,
    startDate: new Date('2026-01-20'),
    revenueGenerated: 12600,
    redemptionRate: 42,
  },
  {
    id: '5',
    code: 'REFER-FRIEND',
    type: 'referral',
    value: 15,
    description: '15% off when you refer a friend',
    status: 'active',
    usageCount: 89,
    startDate: new Date('2026-01-01'),
    revenueGenerated: 8900,
    redemptionRate: 0,
  },
];

export const TrackerEvPromoEngine = createPreset<EvPromoEngineProps>({
  name: 'PromoEngine.Tracker',
  render: (ctx: PresetContext<EvPromoEngineProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const promos = props.promos || MOCK_PROMOS;
    const { onPromoClick } = props;

    const getTypeBadgeScale = (type: PromoCode['type']) => {
      switch (type) {
        case 'percentage':
          return tokens.colors.primaryScale;
        case 'fixed':
          return tokens.colors.successScale;
        case 'bogo':
          return tokens.colors.warningScale;
        case 'bundle':
          return tokens.colors.secondaryScale;
        case 'referral':
          return tokens.colors.infoScale;
        default:
          return tokens.colors.neutral;
      }
    };

    const getStatusBadgeScale = (status: PromoCode['status']) => {
      switch (status) {
        case 'active':
          return tokens.colors.successScale;
        case 'scheduled':
          return tokens.colors.infoScale;
        case 'expired':
          return tokens.colors.neutral;
        case 'paused':
          return tokens.colors.warningScale;
        default:
          return tokens.colors.neutral;
      }
    };

    const getTypeBadgeKey = (type: PromoCode['type']): 'primary' | 'success' | 'warning' | 'secondary' | 'info' => {
      switch (type) {
        case 'percentage': return 'primary';
        case 'fixed': return 'success';
        case 'bogo': return 'warning';
        case 'bundle': return 'secondary';
        case 'referral': return 'info';
        default: return 'secondary';
      }
    };

    const getStatusBadgeKey = (status: PromoCode['status']): 'success' | 'info' | 'secondary' | 'warning' => {
      switch (status) {
        case 'active': return 'success';
        case 'scheduled': return 'info';
        case 'expired': return 'secondary';
        case 'paused': return 'warning';
        default: return 'secondary';
      }
    };

    const getTimeRemainingBadgeKey = (timeRemaining: { expired?: boolean; urgent?: boolean }): 'secondary' | 'error' | 'info' => {
      if (timeRemaining.expired) return 'secondary';
      if (timeRemaining.urgent) return 'error';
      return 'info';
    };

    const getTypeLabel = (type: PromoCode['type']) => {
      switch (type) {
        case 'percentage':
          return 'Percentage';
        case 'fixed':
          return 'Fixed';
        case 'bogo':
          return 'BOGO';
        case 'bundle':
          return 'Bundle';
        case 'referral':
          return 'Referral';
        default:
          return type;
      }
    };

    const getTimeRemaining = (endDate?: Date) => {
      if (!endDate) return null;
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      if (diff <= 0) return { expired: true, display: 'Expired' };
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 7) return { expired: false, display: `${days} days` };
      if (days > 0) return { expired: false, display: `${days}d ${hours}h`, urgent: days <= 2 };
      return { expired: false, display: `${hours}h`, urgent: true };
    };

    const totalRevenue = promos.reduce((sum, p) => sum + p.revenueGenerated, 0);
    const totalUsage = promos.reduce((sum, p) => sum + p.usageCount, 0);
    const activePromos = promos.filter((p) => p.status === 'active').length;
    const avgRedemptionRate =
      promos.length > 0
        ? promos.reduce((sum, p) => sum + p.redemptionRate, 0) / promos.length
        : 0;

    const sortedByRevenue = [...promos].sort(
      (a, b) => b.revenueGenerated - a.revenueGenerated
    );
    const sortedByUsage = [...promos].sort((a, b) => b.usageCount - a.usageCount);

    return (
      <Box
        style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.neutral[50],
          borderRadius: tokens.borderRadius.lg,
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[4],
          height: '100%',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[1],
            }}
          >
            Promo Campaign Tracker
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}
          >
            Monitor performance and attribution of promotional codes
          </Text>
        </Box>

        {/* KPI Cards */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Total Revenue
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[600],
              }}
            >
              ${totalRevenue.toLocaleString()}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              All campaigns
            </Text>
          </Box>
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Total Usage
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {totalUsage.toLocaleString()}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              Redemptions
            </Text>
          </Box>
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Active Campaigns
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {activePromos}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              of {promos.length} total
            </Text>
          </Box>
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Avg Redemption Rate
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {avgRedemptionRate.toFixed(1)}%
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              Conversion rate
            </Text>
          </Box>
        </Box>

        {/* Campaign Tracker Table */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[3],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[3],
            }}
          >
            Campaign Performance
          </Text>
          <Box style={{ overflowX: 'auto' }}>
            {/* Table Header */}
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 1fr 1fr',
                gap: tokens.spacing[3],
                padding: tokens.spacing[2],
                backgroundColor: tokens.colors.neutral[50],
                borderRadius: tokens.borderRadius.md,
                marginBottom: tokens.spacing[2],
              }}
            >
              {['Code', 'Type', 'Status', 'Usage', 'Revenue', 'Redemption', 'Time Left'].map(
                (header) => (
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
                )
              )}
            </Box>

            {/* Table Rows */}
            {sortedByRevenue.map((promo) => {
              const typeScale = getTypeBadgeScale(promo.type);
              const statusScale = getStatusBadgeScale(promo.status);
              const usagePercent = promo.usageLimit
                ? (promo.usageCount / promo.usageLimit) * 100
                : 0;
              const timeRemaining = getTimeRemaining(promo.endDate);

              return (
                <Box
                  key={promo.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 1fr 1fr',
                    gap: tokens.spacing[3],
                    padding: tokens.spacing[2],
                    borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={() => onPromoClick?.(promo.id)}
                >
                  {/* Code */}
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        fontFamily: 'monospace',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {promo.code}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {promo.description.length > 40
                        ? `${promo.description.substring(0, 40)}...`
                        : promo.description}
                    </Text>
                  </Box>

                  {/* Type */}
                  <Box
                    style={{
                      ...createBadgeStyle(tokens, getTypeBadgeKey(promo.type)),
                      display: 'inline-block',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}
                    >
                      {getTypeLabel(promo.type)}
                    </Text>
                  </Box>

                  {/* Status */}
                  <Box
                    style={{
                      ...createBadgeStyle(tokens, getStatusBadgeKey(promo.status)),
                      display: 'inline-block',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        textTransform: 'capitalize',
                      }}
                    >
                      {promo.status}
                    </Text>
                  </Box>

                  {/* Usage with Progress Bar */}
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
                        {promo.usageCount}
                        {promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
                      </Text>
                      {promo.usageLimit && (
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {usagePercent.toFixed(0)}%
                        </Text>
                      )}
                    </Box>
                    {promo.usageLimit && (
                      <Box
                        style={{
                          height: '6px',
                          backgroundColor: tokens.colors.neutral[200],
                          borderRadius: tokens.borderRadius.full,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          style={{
                            height: '100%',
                            width: `${Math.min(usagePercent, 100)}%`,
                            backgroundColor:
                              usagePercent >= 90
                                ? tokens.colors.errorScale[500]
                                : usagePercent >= 70
                                ? tokens.colors.warningScale[500]
                                : tokens.colors.successScale[500],
                            transition: 'width 0.3s',
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Revenue */}
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.successScale[600],
                    }}
                  >
                    ${promo.revenueGenerated.toLocaleString()}
                  </Text>

                  {/* Redemption Rate */}
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {promo.redemptionRate}%
                  </Text>

                  {/* Time Remaining */}
                  {timeRemaining ? (
                    <Box
                      style={{
                        ...createBadgeStyle(
                          tokens,
                          getTimeRemainingBadgeKey(timeRemaining)
                        ),
                        display: 'inline-block',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        {timeRemaining.display}
                      </Text>
                    </Box>
                  ) : (
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      No limit
                    </Text>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Revenue Attribution */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[3],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[3],
            }}
          >
            Revenue Attribution
          </Text>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[3],
            }}
          >
            {sortedByRevenue.slice(0, 5).map((promo, idx) => {
              const revenuePercent = totalRevenue > 0 ? (promo.revenueGenerated / totalRevenue) * 100 : 0;
              const typeScale = getTypeBadgeScale(promo.type);

              return (
                <Box key={promo.id}>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor:
                            idx === 0
                              ? tokens.colors.successScale[500]
                              : tokens.colors.neutral[300],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.common.white,
                          }}
                        >
                          {idx + 1}
                        </Text>
                      </Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          fontFamily: 'monospace',
                        }}
                      >
                        {promo.code}
                      </Text>
                      <Box
                        style={{
                          ...createBadgeStyle(tokens, getTypeBadgeKey(promo.type)),
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}
                        >
                          {getTypeLabel(promo.type)}
                        </Text>
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.successScale[600],
                        }}
                      >
                        ${promo.revenueGenerated.toLocaleString()}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          minWidth: '50px',
                          textAlign: 'right',
                        }}
                      >
                        {revenuePercent.toFixed(1)}%
                      </Text>
                    </Box>
                  </Box>
                  <Box
                    style={{
                      height: '8px',
                      backgroundColor: tokens.colors.neutral[200],
                      borderRadius: tokens.borderRadius.full,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        height: '100%',
                        width: `${revenuePercent}%`,
                        backgroundColor: idx === 0 ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500],
                        transition: 'width 0.3s',
                      }}
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
