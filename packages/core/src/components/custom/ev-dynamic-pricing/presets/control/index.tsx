'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { EvDynamicPricingProps, PricingTier } from '../../core';

const MOCK_TIERS: PricingTier[] = [
  {
    id: 'vip',
    name: 'VIP Experience',
    basePrice: 500,
    currentPrice: 650,
    recommendedPrice: 725,
    minPrice: 450,
    maxPrice: 850,
    demand: 85,
    sold: 34,
    capacity: 40,
    autoEnabled: true,
  },
  {
    id: 'premium',
    name: 'Premium Seating',
    basePrice: 250,
    currentPrice: 280,
    recommendedPrice: 320,
    minPrice: 200,
    maxPrice: 400,
    demand: 72,
    sold: 108,
    capacity: 150,
    autoEnabled: true,
  },
  {
    id: 'general',
    name: 'General Admission',
    basePrice: 75,
    currentPrice: 85,
    recommendedPrice: 85,
    minPrice: 50,
    maxPrice: 120,
    demand: 45,
    sold: 450,
    capacity: 1000,
    autoEnabled: false,
  },
  {
    id: 'earlybird',
    name: 'Early Bird Special',
    basePrice: 60,
    currentPrice: 55,
    recommendedPrice: 65,
    minPrice: 45,
    maxPrice: 80,
    demand: 38,
    sold: 190,
    capacity: 500,
    autoEnabled: false,
  },
];

export const ControlEvDynamicPricing = createPreset<EvDynamicPricingProps>({
  name: 'DynamicPricing.Control',
  render: (ctx: PresetContext<EvDynamicPricingProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const {
      tiers = MOCK_TIERS,
      onPriceOverride,
      onToggleAuto,
      onSimulate,
    } = props;

    const totalRevenue = tiers.reduce(
      (sum, tier) => sum + tier.currentPrice * tier.sold,
      0
    );
    const projectedRevenue = tiers.reduce(
      (sum, tier) => sum + tier.recommendedPrice * tier.sold,
      0
    );
    const revenueImpact = projectedRevenue - totalRevenue;
    const revenueImpactPercent = totalRevenue > 0
      ? ((revenueImpact / totalRevenue) * 100).toFixed(1)
      : '0.0';

    const getDemandColor = (demand: number) => {
      if (demand >= 70) return tokens.colors.successScale;
      if (demand >= 40) return tokens.colors.warningScale;
      return tokens.colors.errorScale;
    };

    const getTierBadgeColor = (tierId: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      if (tierId === 'vip') return 'primary';
      if (tierId === 'premium') return 'secondary';
      if (tierId === 'earlybird') return 'success';
      return 'info';
    };

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
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                marginBottom: tokens.spacing[1],
              }}
            >
              Dynamic Pricing Control
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              Adjust pricing tiers and enable auto-optimization
            </Text>
          </Box>
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[3],
              minWidth: '200px',
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Revenue Impact
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color:
                  revenueImpact >= 0
                    ? tokens.colors.successScale[600]
                    : tokens.colors.errorScale[600],
              }}
            >
              {revenueImpact >= 0 ? '+' : ''}$
              {revenueImpact.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              {revenueImpact >= 0 ? '+' : ''}
              {revenueImpactPercent}% projected increase
            </Text>
          </Box>
        </Box>

        {/* Tier Cards Grid */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          {tiers.map((tier) => {
            const demandScale = getDemandColor(tier.demand);
            const tierBadgeScale = getTierBadgeColor(tier.id);
            const soldPercent = (tier.sold / tier.capacity) * 100;
            const priceRange = tier.maxPrice - tier.minPrice;
            const currentPricePercent =
              ((tier.currentPrice - tier.minPrice) / priceRange) * 100;
            const recommendedPricePercent =
              ((tier.recommendedPrice - tier.minPrice) / priceRange) * 100;

            return (
              <Box
                key={tier.id}
                style={{
                  ...createCardStyle(tokens),
                  padding: tokens.spacing[3],
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[3],
                }}
              >
                {/* Tier Header */}
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {tier.name}
                    </Text>
                    <Box
                      style={{
                        ...createBadgeStyle(tokens, tierBadgeScale),
                        display: 'inline-block',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        {tier.sold}/{tier.capacity} sold
                      </Text>
                    </Box>
                  </Box>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      cursor: 'pointer',
                    }}
                    onClick={() => onToggleAuto?.(tier.id, !tier.autoEnabled)}
                  >
                    <Box
                      style={{
                        width: '40px',
                        height: '22px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tier.autoEnabled
                          ? tokens.colors.primaryScale[500]
                          : tokens.colors.neutral[300],
                        position: 'relative',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <Box
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: tier.autoEnabled ? '20px' : '2px',
                          width: '18px',
                          height: '18px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.common.white,
                          transition: 'left 0.2s',
                        }}
                      />
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      Auto
                    </Text>
                  </Box>
                </Box>

                {/* Price Display */}
                <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
                  <Box style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Current Price
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {'$'}{tier.currentPrice}
                    </Text>
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      Recommended
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.successScale[600],
                      }}
                    >
                      {'$'}{tier.recommendedPrice}
                    </Text>
                  </Box>
                </Box>

                {/* Price Range Slider */}
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
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      {'$'}{tier.minPrice}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      {'$'}{tier.maxPrice}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      position: 'relative',
                      height: '8px',
                      backgroundColor: tokens.colors.neutral[200],
                      borderRadius: tokens.borderRadius.full,
                    }}
                  >
                    {/* Current Price Marker */}
                    <Box
                      style={{
                        position: 'absolute',
                        left: `${currentPricePercent}%`,
                        top: '-4px',
                        width: '16px',
                        height: '16px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[500],
                        border: `2px solid ${tokens.colors.common.white}`,
                        boxShadow: tokens.shadows.sm,
                        transform: 'translateX(-50%)',
                      }}
                    />
                    {/* Recommended Price Marker */}
                    <Box
                      style={{
                        position: 'absolute',
                        left: `${recommendedPricePercent}%`,
                        top: '-4px',
                        width: '16px',
                        height: '16px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.successScale[500],
                        border: `2px solid ${tokens.colors.common.white}`,
                        boxShadow: tokens.shadows.sm,
                        transform: 'translateX(-50%)',
                        opacity: 0.7,
                      }}
                    />
                  </Box>
                </Box>

                {/* Demand Bar */}
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
                      Demand Score
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: demandScale[600],
                      }}
                    >
                      {tier.demand}%
                    </Text>
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
                        width: `${tier.demand}%`,
                        backgroundColor: demandScale[500],
                        transition: 'width 0.3s',
                      }}
                    />
                  </Box>
                </Box>

                {/* Capacity Bar */}
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
                      Capacity
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {soldPercent.toFixed(0)}%
                    </Text>
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
                        width: `${soldPercent}%`,
                        backgroundColor: tokens.colors.primaryScale[500],
                        transition: 'width 0.3s',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* What-If Simulator */}
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
            What-If Simulator
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {tiers.slice(0, 2).map((tier) => (
              <Box key={tier.id}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  {tier.name}
                </Text>
                <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder={`${tier.currentPrice}`}
                    style={{
                      flex: 1,
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[900],
                      backgroundColor: tokens.colors.neutral[50],
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onSimulate?.({ tierId: tier.id, price: parseFloat(e.target.value) })
                    }
                  />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    Demand: {tier.demand}%
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  },
});
