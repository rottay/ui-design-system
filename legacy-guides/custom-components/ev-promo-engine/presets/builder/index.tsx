'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
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

export const BuilderEvPromoEngine = createPreset<EvPromoEngineProps>({
  name: 'PromoEngine.Builder',
  render: (ctx: PresetContext<EvPromoEngineProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const promos = props.promos || MOCK_PROMOS;
    const { onToggleStatus, onCreatePromo, onPromoClick } = props;

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

    const getTypeIcon = (type: PromoCode['type']) => {
      switch (type) {
        case 'percentage':
          return '%';
        case 'fixed':
          return '$';
        case 'bogo':
          return '2×1';
        case 'bundle':
          return '📦';
        case 'referral':
          return '👥';
        default:
          return '🎟️';
      }
    };

    const getTypeLabel = (type: PromoCode['type']) => {
      switch (type) {
        case 'percentage':
          return 'Percentage Discount';
        case 'fixed':
          return 'Fixed Amount';
        case 'bogo':
          return 'Buy One Get One';
        case 'bundle':
          return 'Bundle Deal';
        case 'referral':
          return 'Referral Bonus';
        default:
          return type;
      }
    };

    const getTimeRemaining = (endDate?: Date) => {
      if (!endDate) return null;
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      if (diff <= 0) return 'Expired';
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) return `${days}d ${hours}h`;
      return `${hours}h`;
    };

    const activePromos = promos.filter((p) => p.status === 'active');
    const promoTypes: PromoCode['type'][] = [
      'percentage',
      'fixed',
      'bogo',
      'bundle',
      'referral',
    ];

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
            Promo Code Builder
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}
          >
            Create and manage promotional campaigns
          </Text>
        </Box>

        {/* Quick Create Section */}
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
            Create New Promo
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {promoTypes.map((type) => {
              const typeScale = getTypeBadgeScale(type);

              return (
                <Box
                  key={type}
                  style={{
                    ...createCardStyle(tokens),
                    ...createHoverStyle(tokens),
                    padding: tokens.spacing[3],
                    backgroundColor: typeScale[50],
                    border: `2px solid ${typeScale[200]}`,
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                  }}
                  onClick={() => onCreatePromo?.()}
                >
                  <Box
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: typeScale[500],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.common.white,
                      }}
                    >
                      {getTypeIcon(type)}
                    </Text>
                  </Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                      textAlign: 'center',
                    }}
                  >
                    {getTypeLabel(type)}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Active Promos */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[3],
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
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}
            >
              Active Campaigns
            </Text>
            <Box
              style={{
                ...createBadgeStyle(tokens, 'success'),
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                }}
              >
                {activePromos.length} Active
              </Text>
            </Box>
          </Box>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[3],
            }}
          >
            {activePromos.map((promo) => {
              const typeScale = getTypeBadgeScale(promo.type);
              const statusScale = getStatusBadgeScale(promo.status);
              const timeRemaining = getTimeRemaining(promo.endDate);
              const usagePercent = promo.usageLimit
                ? (promo.usageCount / promo.usageLimit) * 100
                : 0;

              return (
                <Box
                  key={promo.id}
                  style={{
                    ...createCardStyle(tokens),
                    padding: tokens.spacing[3],
                    backgroundColor: tokens.colors.neutral[50],
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
                    <Box style={{ flex: 1 }}>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.lg,
                            fontWeight: tokens.typography.fontWeight.bold,
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
                            {getTypeIcon(promo.type)} {getTypeLabel(promo.type)}
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
                        {promo.description}
                      </Text>
                      <Box
                        style={{
                          display: 'flex',
                          gap: tokens.spacing[4],
                          flexWrap: 'wrap',
                        }}
                      >
                        <Box>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[400],
                            }}
                          >
                            Value
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.md,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                            }}
                          >
                            {promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`}
                          </Text>
                        </Box>
                        <Box>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[400],
                            }}
                          >
                            Used
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.md,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                            }}
                          >
                            {promo.usageCount}
                            {promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
                          </Text>
                        </Box>
                        <Box>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[400],
                            }}
                          >
                            Revenue
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.md,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.successScale[600],
                            }}
                          >
                            ${promo.revenueGenerated.toLocaleString()}
                          </Text>
                        </Box>
                        {timeRemaining && (
                          <Box>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[400],
                              }}
                            >
                              Time Left
                            </Text>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.md,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color:
                                  timeRemaining === 'Expired'
                                    ? tokens.colors.errorScale[600]
                                    : tokens.colors.neutral[900],
                              }}
                            >
                              {timeRemaining}
                            </Text>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                      }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          cursor: 'pointer',
                        }}
                        onClick={() => onToggleStatus?.(promo.id, promo.status !== 'active')}
                      >
                        <Box
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor:
                              promo.status === 'active'
                                ? tokens.colors.successScale[500]
                                : tokens.colors.neutral[300],
                            position: 'relative',
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <Box
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: promo.status === 'active' ? '22px' : '2px',
                              width: '20px',
                              height: '20px',
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.common.white,
                              transition: 'left 0.2s',
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Usage Progress Bar */}
                  {promo.usageLimit && (
                    <Box>
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
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* All Promos */}
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
            All Campaigns
          </Text>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[2],
            }}
          >
            {promos.map((promo) => {
              const typeScale = getTypeBadgeScale(promo.type);
              const statusScale = getStatusBadgeScale(promo.status);

              return (
                <Box
                  key={promo.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    gap: tokens.spacing[3],
                    padding: tokens.spacing[2],
                    borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => onPromoClick?.(promo.id)}
                >
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
                      {promo.description}
                    </Text>
                  </Box>
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
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    {promo.usageCount}
                    {promo.usageLimit ? ` / ${promo.usageLimit}` : ''} uses
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.successScale[600],
                    }}
                  >
                    ${promo.revenueGenerated.toLocaleString()}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
