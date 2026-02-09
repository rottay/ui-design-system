'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { EvSponsorshipHubProps, Sponsor, SponsorDeliverable } from '../../core';

type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';

const MOCK_SPONSORS: Sponsor[] = [
  {
    id: '1',
    companyName: 'TechCorp Global',
    contactName: 'Sarah Chen',
    tier: 'platinum',
    dealValue: 150000,
    status: 'confirmed',
    deliverables: [
      { id: 'd1', name: 'Logo on stage backdrop', type: 'logo-placement', status: 'completed' },
      { id: 'd2', name: 'Keynote mention', type: 'stage-naming', status: 'completed' },
      { id: 'd3', name: 'Booth space premium', type: 'booth', status: 'in-progress' },
    ],
    roi: 3.2,
  },
  {
    id: '2',
    companyName: 'MediaVision Inc',
    contactName: 'James Rodriguez',
    tier: 'gold',
    dealValue: 75000,
    status: 'active',
    deliverables: [
      { id: 'd4', name: 'Banner ads', type: 'digital-ad', status: 'completed' },
      { id: 'd5', name: 'Social media posts', type: 'digital-ad', status: 'in-progress' },
    ],
    roi: 2.8,
  },
  {
    id: '3',
    companyName: 'InnovateLabs',
    contactName: 'Emily Watson',
    tier: 'gold',
    dealValue: 60000,
    status: 'negotiating',
    deliverables: [
      { id: 'd6', name: 'Workshop sponsorship', type: 'stage-naming', status: 'pending' },
      { id: 'd7', name: 'Swag bag insert', type: 'product-sampling', status: 'pending' },
    ],
  },
  {
    id: '4',
    companyName: 'DataFlow Systems',
    contactName: 'Michael Park',
    tier: 'silver',
    dealValue: 30000,
    status: 'proposal',
    deliverables: [
      { id: 'd8', name: 'Email newsletter feature', type: 'digital-ad', status: 'pending' },
    ],
  },
  {
    id: '5',
    companyName: 'CloudScale',
    contactName: 'Amanda Liu',
    tier: 'platinum',
    dealValue: 175000,
    status: 'lead',
    deliverables: [],
  },
  {
    id: '6',
    companyName: 'StartupBoost',
    contactName: 'Ryan Thompson',
    tier: 'bronze',
    dealValue: 15000,
    status: 'confirmed',
    deliverables: [
      { id: 'd9', name: 'Logo on website', type: 'logo-placement', status: 'completed' },
    ],
    roi: 2.1,
  },
  {
    id: '7',
    companyName: 'FutureWorks',
    contactName: 'Lisa Martinez',
    tier: 'silver',
    dealValue: 40000,
    status: 'proposal',
    deliverables: [
      { id: 'd10', name: 'Lunch sponsorship', type: 'product-sampling', status: 'pending' },
    ],
  },
  {
    id: '8',
    companyName: 'DevTools Pro',
    contactName: 'Chris Anderson',
    tier: 'bronze',
    dealValue: 12000,
    status: 'active',
    deliverables: [
      { id: 'd11', name: 'Logo on badges', type: 'logo-placement', status: 'in-progress' },
    ],
    roi: 1.9,
  },
];

export const DashboardEvSponsorshipHub = createPreset<EvSponsorshipHubProps>({
  name: 'SponsorshipHub.Dashboard',
  render: (ctx: PresetContext<EvSponsorshipHubProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const { sponsors = MOCK_SPONSORS, onSponsorClick } = props;

    const getTierBadgeColor = (tier: Sponsor['tier']): BadgeColor => {
      switch (tier) {
        case 'platinum':
          return 'primary';
        case 'gold':
          return 'warning';
        case 'silver':
          return 'secondary';
        case 'bronze':
          return 'secondary';
        default:
          return 'secondary';
      }
    };

    const getTierScale = (tier: Sponsor['tier']) => {
      switch (tier) {
        case 'platinum':
          return tokens.colors.primaryScale;
        case 'gold':
          return tokens.colors.warningScale;
        case 'silver':
          return tokens.colors.neutral;
        case 'bronze':
          return tokens.colors.secondaryScale;
        default:
          return tokens.colors.neutral;
      }
    };

    const getStatusBadgeColor = (status: Sponsor['status']): BadgeColor => {
      switch (status) {
        case 'active':
        case 'completed':
          return 'success';
        case 'confirmed':
          return 'primary';
        case 'negotiating':
        case 'proposal':
          return 'warning';
        case 'lead':
          return 'info';
        default:
          return 'secondary';
      }
    };

    const totalRevenue = sponsors.reduce((sum: number, s: Sponsor) => sum + s.dealValue, 0);
    const revenueByTier = {
      platinum: sponsors
        .filter((s: Sponsor) => s.tier === 'platinum')
        .reduce((sum: number, s: Sponsor) => sum + s.dealValue, 0),
      gold: sponsors
        .filter((s: Sponsor) => s.tier === 'gold')
        .reduce((sum: number, s: Sponsor) => sum + s.dealValue, 0),
      silver: sponsors
        .filter((s: Sponsor) => s.tier === 'silver')
        .reduce((sum: number, s: Sponsor) => sum + s.dealValue, 0),
      bronze: sponsors
        .filter((s: Sponsor) => s.tier === 'bronze')
        .reduce((sum: number, s: Sponsor) => sum + s.dealValue, 0),
    };

    const allDeliverables = sponsors.flatMap((s: Sponsor) => s.deliverables);
    const completedDeliverables = allDeliverables.filter(
      (d: SponsorDeliverable) => d.status === 'completed'
    ).length;
    const totalDeliverables = allDeliverables.length;
    const deliverableCompletionRate =
      totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;

    const sponsorsWithRoi = sponsors.filter((s: Sponsor) => s.roi).sort((a: Sponsor, b: Sponsor) => (b.roi || 0) - (a.roi || 0));

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
            Sponsorship Dashboard
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}
          >
            Overview of sponsorship revenue, deliverables, and ROI
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
                color: tokens.colors.neutral[900],
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
              {sponsors.length} sponsors
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
              Active Sponsors
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {sponsors.filter((s: Sponsor) => s.status === 'active' || s.status === 'confirmed').length}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              Confirmed partnerships
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
              Deliverable Completion
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {deliverableCompletionRate.toFixed(0)}%
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              {completedDeliverables}/{totalDeliverables} completed
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
              Average ROI
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[600],
              }}
            >
              {sponsorsWithRoi.length > 0
                ? (
                    sponsorsWithRoi.reduce((sum: number, s: Sponsor) => sum + (s.roi || 0), 0) /
                    sponsorsWithRoi.length
                  ).toFixed(1)
                : '0.0'}
              x
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              Return on investment
            </Text>
          </Box>
        </Box>

        {/* Revenue by Tier */}
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
            Revenue by Tier
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {Object.entries(revenueByTier).map(([tier, revenue]: [string, number]) => {
              const tierScale = getTierScale(tier as Sponsor['tier']);
              const tierBadgeColor = getTierBadgeColor(tier as Sponsor['tier']);
              const tierPercent = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

              return (
                <Box
                  key={tier}
                  style={{
                    padding: tokens.spacing[3],
                    backgroundColor: tierScale[50],
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${tierScale[200]}`,
                  }}
                >
                  <Box
                    style={{
                      ...createBadgeStyle(tokens, tierBadgeColor),
                      display: 'inline-block',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        textTransform: 'capitalize',
                      }}
                    >
                      {tier}
                    </Text>
                  </Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    ${revenue.toLocaleString()}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    {tierPercent.toFixed(1)}% of total
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Deliverables Tracker */}
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
            Deliverables Progress
          </Text>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[3],
            }}
          >
            {sponsors
              .filter((s: Sponsor) => s.deliverables.length > 0)
              .slice(0, 5)
              .map((sponsor: Sponsor) => {
                const completed = sponsor.deliverables.filter(
                  (d: SponsorDeliverable) => d.status === 'completed'
                ).length;
                const total = sponsor.deliverables.length;
                const progress = (completed / total) * 100;
                const progressStyles = createProgressBarStyle(tokens, { percent: progress });

                return (
                  <Box key={sponsor.id}>
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
                        {sponsor.companyName}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        {completed}/{total} completed
                      </Text>
                    </Box>
                    <Box style={progressStyles.track}>
                      <Box style={progressStyles.fill} />
                    </Box>
                  </Box>
                );
              })}
          </Box>
        </Box>

        {/* ROI Ranking */}
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
            Top Sponsors by ROI
          </Text>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[2],
            }}
          >
            {sponsorsWithRoi.slice(0, 5).map((sponsor: Sponsor, idx: number) => (
              <Box
                key={sponsor.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: tokens.spacing[2],
                  backgroundColor:
                    idx === 0
                      ? tokens.colors.successScale[50]
                      : tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${
                    idx === 0 ? tokens.colors.successScale[200] : tokens.colors.neutral[200]
                  }`,
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
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
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {sponsor.companyName}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      ${sponsor.dealValue.toLocaleString()} deal value
                    </Text>
                  </Box>
                </Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.successScale[600],
                  }}
                >
                  {sponsor.roi}x
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Sponsor Table */}
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
            All Sponsors
          </Text>
          <Box style={{ overflowX: 'auto' }}>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr',
                gap: tokens.spacing[3],
                padding: tokens.spacing[2],
                backgroundColor: tokens.colors.neutral[50],
                borderRadius: tokens.borderRadius.md,
                marginBottom: tokens.spacing[2],
              }}
            >
              {['Company', 'Contact', 'Tier', 'Deal Value', 'Status', 'ROI'].map((header: string) => (
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
            {sponsors.map((sponsor: Sponsor) => {
              const tierBadgeColor = getTierBadgeColor(sponsor.tier);
              const statusBadgeColor = getStatusBadgeColor(sponsor.status);

              return (
                <Box
                  key={sponsor.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr',
                    gap: tokens.spacing[3],
                    padding: tokens.spacing[2],
                    borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={() => onSponsorClick?.(sponsor.id)}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {sponsor.companyName}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    {sponsor.contactName}
                  </Text>
                  <Box
                    style={{
                      ...createBadgeStyle(tokens, tierBadgeColor),
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
                      {sponsor.tier}
                    </Text>
                  </Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    ${sponsor.dealValue.toLocaleString()}
                  </Text>
                  <Box
                    style={{
                      ...createBadgeStyle(tokens, statusBadgeColor),
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
                      {sponsor.status}
                    </Text>
                  </Box>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: sponsor.roi
                        ? tokens.colors.successScale[600]
                        : tokens.colors.neutral[400],
                    }}
                  >
                    {sponsor.roi ? `${sponsor.roi}x` : '-'}
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
