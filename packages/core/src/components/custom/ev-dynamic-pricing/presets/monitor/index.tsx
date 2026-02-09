'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
} from '../../../helpers';
import type { EvDynamicPricingProps, PricingTier, PriceHistory } from '../../core';

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

const MOCK_HISTORY: PriceHistory[] = [
  { timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), tierId: 'vip', price: 500, demand: 45 },
  { timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), tierId: 'vip', price: 550, demand: 58 },
  { timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), tierId: 'vip', price: 600, demand: 68 },
  { timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), tierId: 'vip', price: 625, demand: 75 },
  { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), tierId: 'vip', price: 650, demand: 82 },
  { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), tierId: 'vip', price: 650, demand: 85 },
  { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), tierId: 'vip', price: 650, demand: 85 },
  { timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), tierId: 'premium', price: 200, demand: 35 },
  { timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), tierId: 'premium', price: 220, demand: 48 },
  { timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), tierId: 'premium', price: 240, demand: 58 },
  { timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), tierId: 'premium', price: 260, demand: 65 },
  { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), tierId: 'premium', price: 270, demand: 70 },
  { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), tierId: 'premium', price: 280, demand: 72 },
  { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), tierId: 'premium', price: 280, demand: 72 },
];

export const MonitorEvDynamicPricing = createPreset<EvDynamicPricingProps>({
  name: 'DynamicPricing.Monitor',
  render: (ctx: PresetContext<EvDynamicPricingProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const { tiers = MOCK_TIERS, history: priceHistory = MOCK_HISTORY } = props;

    const totalRevenue = tiers.reduce(
      (sum, tier) => sum + tier.currentPrice * tier.sold,
      0
    );
    const projectedRevenue = tiers.reduce(
      (sum, tier) => sum + tier.recommendedPrice * tier.capacity,
      0
    );
    const variance = projectedRevenue - totalRevenue;

    const getPriceChange = (tier: PricingTier) => {
      const change = tier.currentPrice - tier.basePrice;
      const percentChange = ((change / tier.basePrice) * 100).toFixed(1);
      return { change, percentChange };
    };

    const getTierHistory = (tierId: string) => {
      return priceHistory
        .filter((h) => h.tierId === tierId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    };

    const getDemandColor = (demand: number) => {
      if (demand >= 70) return tokens.colors.successScale;
      if (demand >= 40) return tokens.colors.warningScale;
      return tokens.colors.errorScale;
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
              Pricing Monitor
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              Real-time price tracking and demand analytics
            </Text>
          </Box>
        </Box>

        {/* Revenue Metrics */}
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
                color: tokens.colors.neutral[900],
              }}
            >
              {'$'}{totalRevenue.toLocaleString()}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              Current sales
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
              Projected Revenue
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {'$'}{projectedRevenue.toLocaleString()}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              At full capacity
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
              Variance
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color:
                  variance >= 0
                    ? tokens.colors.successScale[600]
                    : tokens.colors.errorScale[600],
              }}
            >
              {variance >= 0 ? '+' : ''}${variance.toLocaleString()}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              Revenue potential
            </Text>
          </Box>
        </Box>

        {/* Price Ticker */}
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
            Current Prices
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {tiers.map((tier) => {
              const { change, percentChange } = getPriceChange(tier);
              const isIncrease = change > 0;
              const isDecrease = change < 0;

              return (
                <Box
                  key={tier.id}
                  style={{
                    padding: tokens.spacing[3],
                    backgroundColor: tokens.colors.neutral[50],
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    {tier.name}
                  </Text>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: tokens.spacing[2],
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {'$'}{tier.currentPrice}
                    </Text>
                    {change !== 0 && (
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
                            color: isIncrease
                              ? tokens.colors.successScale[600]
                              : tokens.colors.errorScale[600],
                          }}
                        >
                          {isIncrease ? '↑' : '↓'}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: isIncrease
                              ? tokens.colors.successScale[600]
                              : tokens.colors.errorScale[600],
                          }}
                        >
                          {Math.abs(change)} ({percentChange}%)
                        </Text>
                      </Box>
                    )}
                  </Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    Base: {'$'}{tier.basePrice}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Demand Gauges */}
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
            Demand Levels
          </Text>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[3],
            }}
          >
            {tiers.map((tier) => {
              const demandScale = getDemandColor(tier.demand);

              return (
                <Box key={tier.id}>
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
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {tier.name}
                    </Text>
                    <Box style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center' }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        {tier.sold}/{tier.capacity} sold
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: demandScale[600],
                        }}
                      >
                        {tier.demand}%
                      </Text>
                    </Box>
                  </Box>
                  <Box
                    style={{
                      height: '12px',
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
              );
            })}
          </Box>
        </Box>

        {/* Price History Timeline */}
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
            Price History (Last 7 Days)
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: tokens.spacing[4],
            }}
          >
            {tiers.slice(0, 2).map((tier) => {
              const history = getTierHistory(tier.id);
              const maxPrice = Math.max(...history.map((h) => h.price));

              return (
                <Box key={tier.id}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                      marginBottom: tokens.spacing[3],
                    }}
                  >
                    {tier.name}
                  </Text>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: tokens.spacing[1],
                      height: '80px',
                    }}
                  >
                    {history.map((entry, idx) => {
                      const heightPercent = (entry.price / maxPrice) * 100;

                      return (
                        <Box
                          key={idx}
                          style={{
                            flex: 1,
                            height: `${heightPercent}%`,
                            backgroundColor: tokens.colors.primaryScale[500],
                            borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0`,
                            opacity: 0.6 + (idx / history.length) * 0.4,
                            position: 'relative',
                          }}
                          title={`$${entry.price} - ${entry.timestamp.toLocaleDateString()}`}
                        />
                      );
                    })}
                  </Box>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: tokens.spacing[1],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      7 days ago
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      Today
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
