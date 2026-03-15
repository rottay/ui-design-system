'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
} from '../../../helpers';
import type { EvSponsorshipHubProps, Sponsor } from '../../core';

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

export const PipelineEvSponsorshipHub = createPreset<EvSponsorshipHubProps>({
  name: 'SponsorshipHub.Pipeline',
  render: (ctx: PresetContext<EvSponsorshipHubProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const { sponsors: rawSponsors = MOCK_SPONSORS, onStatusChange, onSponsorClick } = props;

    const sponsors = Array.isArray(rawSponsors) ? rawSponsors : MOCK_SPONSORS;

    const columns: Array<{ status: Sponsor['status']; label: string }> = [
      { status: 'lead', label: 'Lead' },
      { status: 'proposal', label: 'Proposal' },
      { status: 'negotiating', label: 'Negotiating' },
      { status: 'confirmed', label: 'Confirmed' },
      { status: 'active', label: 'Active' },
    ];

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

    const getColumnSponsors = (status: Sponsor['status']) => {
      return sponsors.filter((s: Sponsor) => s.status === status);
    };

    const getColumnTotal = (status: Sponsor['status']) => {
      return getColumnSponsors(status).reduce((sum: number, s: Sponsor) => sum + s.dealValue, 0);
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
        <Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[1],
            }}
          >
            Sponsorship Pipeline
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}
          >
            Track sponsor relationships from lead to active partnership
          </Text>
        </Box>

        {/* Tier Filter */}
        <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
          {['all', 'platinum', 'gold', 'silver', 'bronze'].map((tier: string) => {
            const isAll = tier === 'all';
            const tierScale = isAll
              ? tokens.colors.primaryScale
              : getTierScale(tier as Sponsor['tier']);

            return (
              <Box
                key={tier}
                style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tierScale[100],
                  border: `1px solid ${tierScale[200]}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tierScale[700],
                    textTransform: 'capitalize',
                  }}
                >
                  {tier}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Kanban Board */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: tokens.spacing[3],
            flex: 1,
            overflow: 'auto',
          }}
        >
          {columns.map((column: { status: Sponsor['status']; label: string }) => {
            const columnSponsors = getColumnSponsors(column.status);
            const columnTotal = getColumnTotal(column.status);

            return (
              <Box
                key={column.status}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[2],
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                }}
              >
                {/* Column Header */}
                <Box
                  style={{
                    paddingBottom: tokens.spacing[2],
                    borderBottom: `2px solid ${tokens.colors.neutral[200]}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    {column.label}
                  </Text>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {columnSponsors.length} sponsors
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.primaryScale[600],
                      }}
                    >
                      ${(columnTotal / 1000).toFixed(0)}K
                    </Text>
                  </Box>
                </Box>

                {/* Sponsor Cards */}
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: tokens.spacing[2],
                    flex: 1,
                  }}
                >
                  {columnSponsors.map((sponsor: Sponsor) => {
                    const tierBadgeColor = getTierBadgeColor(sponsor.tier);

                    return (
                      <Box
                        key={sponsor.id}
                        style={{
                          ...createCardStyle(tokens),
                          ...createHoverStyle(tokens),
                          padding: tokens.spacing[2],
                          cursor: 'pointer',
                        }}
                        onClick={() => onSponsorClick?.(sponsor.id)}
                      >
                        <Box
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: tokens.spacing[2],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                              flex: 1,
                            }}
                          >
                            {sponsor.companyName}
                          </Text>
                        </Box>

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
                            {sponsor.tier}
                          </Text>
                        </Box>

                        <Box
                          style={{
                            marginBottom: tokens.spacing[2],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[500],
                            }}
                          >
                            Contact: {sponsor.contactName}
                          </Text>
                        </Box>

                        <Box
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: tokens.spacing[2],
                            borderTop: `1px solid ${tokens.colors.neutral[200]}`,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.lg,
                              fontWeight: tokens.typography.fontWeight.bold,
                              color: tokens.colors.primaryScale[600],
                            }}
                          >
                            ${(sponsor.dealValue / 1000).toFixed(0)}K
                          </Text>
                          {sponsor.deliverables.length > 0 && (
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[400],
                              }}
                            >
                              {sponsor.deliverables.length} deliverables
                            </Text>
                          )}
                        </Box>

                        {sponsor.roi && (
                          <Box
                            style={{
                              marginTop: tokens.spacing[1],
                              padding: tokens.spacing[1],
                              backgroundColor: tokens.colors.successScale[50],
                              borderRadius: tokens.borderRadius.sm,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.successScale[700],
                                fontWeight: tokens.typography.fontWeight.medium,
                              }}
                            >
                              ROI: {sponsor.roi}x
                            </Text>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Summary Footer */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[3],
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[1],
                }}
              >
                Total Pipeline Value
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                $
                {sponsors
                  .reduce((sum: number, s: Sponsor) => sum + s.dealValue, 0)
                  .toLocaleString()}
              </Text>
            </Box>
            <Box>
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
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {sponsors.filter((s: Sponsor) => s.status === 'active').length}
              </Text>
            </Box>
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[1],
                }}
              >
                In Progress
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {
                  sponsors.filter(
                    (s: Sponsor) =>
                      s.status === 'proposal' ||
                      s.status === 'negotiating' ||
                      s.status === 'confirmed'
                  ).length
                }
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
