'use client';

import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
} from '../../../helpers';
import type { CampaignManagerProps, Campaign, CampaignSegment } from '../../core';

// Mock data for standalone demo
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Spring Sale Launch',
    channels: ['email', 'sms', 'push'],
    status: 'active',
    audienceSize: 12500,
    sentCount: 12500,
    openRate: 42.5,
    clickRate: 18.3,
    conversionRate: 6.2,
    revenue: 48750,
    scheduledAt: new Date('2026-02-01T09:00:00'),
  },
  {
    id: '2',
    name: 'Loyalty Rewards Program',
    channels: ['email', 'whatsapp'],
    status: 'scheduled',
    audienceSize: 8200,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    revenue: 0,
    scheduledAt: new Date('2026-02-15T10:00:00'),
  },
  {
    id: '3',
    name: 'Flash Sale - Weekend',
    channels: ['push', 'sms'],
    status: 'completed',
    audienceSize: 15300,
    sentCount: 15300,
    openRate: 68.4,
    clickRate: 32.1,
    conversionRate: 12.8,
    revenue: 95600,
  },
  {
    id: '4',
    name: 'New Product Announcement',
    channels: ['email', 'sms', 'push', 'whatsapp'],
    status: 'draft',
    audienceSize: 0,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    revenue: 0,
  },
  {
    id: '5',
    name: 'Re-engagement Campaign',
    channels: ['email'],
    status: 'paused',
    audienceSize: 6800,
    sentCount: 3400,
    openRate: 28.7,
    clickRate: 9.2,
    conversionRate: 2.1,
    revenue: 8500,
  },
];

const MOCK_SEGMENTS: CampaignSegment[] = [
  {
    id: '1',
    name: 'Active Customers',
    criteria: 'Last purchase within 30 days',
    memberCount: 12500,
  },
  {
    id: '2',
    name: 'VIP Members',
    criteria: 'Lifetime value > $1000',
    memberCount: 8200,
  },
  {
    id: '3',
    name: 'All Users',
    criteria: 'Everyone',
    memberCount: 15300,
  },
];

export const CampaignManagerBuilder = createPreset<CampaignManagerProps>({
  name: 'CampaignManager.Builder',
  render: (ctx: PresetContext<CampaignManagerProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const campaigns = props.campaigns || MOCK_CAMPAIGNS;
    const segments = props.segments || MOCK_SEGMENTS;

    const getStatusColor = (status: Campaign['status']) => {
      switch (status) {
        case 'active':
          return tokens.colors.successScale;
        case 'scheduled':
          return tokens.colors.infoScale;
        case 'completed':
          return tokens.colors.secondaryScale;
        case 'paused':
          return tokens.colors.warningScale;
        case 'draft':
          return tokens.colors.errorScale;
        default:
          return tokens.colors.primaryScale;
      }
    };

    const getChannelIcon = (channel: Campaign['channels'][number]) => {
      switch (channel) {
        case 'email':
          return '✉️';
        case 'sms':
          return '📱';
        case 'push':
          return '🔔';
        case 'whatsapp':
          return '💬';
        default:
          return '📢';
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

    const formatDate = (date?: Date) => {
      if (!date) return 'Not scheduled';
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    };

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
              Campaign Manager
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Create and manage multi-channel marketing campaigns
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
            onClick={props.onCreateCampaign}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
              }}
            >
              + Create Campaign
            </Text>
          </Box>
        </Box>

        {/* Filter Pills */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[2],
            flexWrap: 'wrap',
          }}
        >
          {['all', 'active', 'scheduled', 'draft', 'paused', 'completed'].map((status) => {
            const count = status === 'all' ? campaigns.length : campaigns.filter((c) => c.status === status).length;
            return (
              <Box
                key={status}
                style={{
                  ...createFilterPillStyle(tokens, { active: false }),
                  cursor: 'pointer',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    textTransform: 'capitalize',
                  }}
                >
                  {status} ({count})
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Campaign Cards */}
        <Box
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: tokens.spacing[4],
            overflowY: 'auto',
          }}
        >
          {campaigns.map((campaign) => {
            const statusColor = getStatusColor(campaign.status);

            return (
              <Box
                key={campaign.id}
                style={{
                  ...createCardStyle(tokens),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[3],
                  cursor: 'pointer',
                  ...createHoverStyle(tokens),
                }}
                onClick={() => props.onCampaignClick?.(campaign.id)}
              >
                {/* Campaign Header */}
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {campaign.name}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      ...createBadgeStyle(tokens, campaign.status === 'active' ? 'success' : campaign.status === 'scheduled' ? 'info' : campaign.status === 'completed' ? 'secondary' : campaign.status === 'paused' ? 'warning' : 'error'),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        textTransform: 'capitalize',
                      }}
                    >
                      {campaign.status}
                    </Text>
                  </Box>
                </Box>

                {/* Channels */}
                <Box
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[2],
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    Channels:
                  </Text>
                  {campaign.channels.map((channel) => (
                    <Box
                      key={channel}
                      style={{
                        ...createCardStyle(tokens),
                        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                        backgroundColor: tokens.colors.neutral[100],
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.sm }}>
                        {getChannelIcon(channel)}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[700],
                          textTransform: 'capitalize',
                        }}
                      >
                        {channel}
                      </Text>
                    </Box>
                  ))}
                </Box>

                {/* Stats */}
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: tokens.spacing[3],
                    paddingTop: tokens.spacing[2],
                    borderTop: `1px solid ${tokens.colors.neutral[200]}`,
                  }}
                >
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      Audience
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[700],
                        marginTop: tokens.spacing[1],
                      }}
                    >
                      {formatNumber(campaign.audienceSize)}
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      Sent
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[700],
                        marginTop: tokens.spacing[1],
                      }}
                    >
                      {formatNumber(campaign.sentCount)}
                    </Text>
                  </Box>
                </Box>

                {/* Scheduled Date */}
                {campaign.scheduledAt && (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.sm }}>🗓️</Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {formatDate(campaign.scheduledAt)}
                    </Text>
                  </Box>
                )}

                {/* Actions */}
                <Box
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[2],
                    marginTop: tokens.spacing[2],
                  }}
                >
                  {campaign.status === 'active' && (
                    <Box
                      style={{
                        flex: 1,
                        ...createCardStyle(tokens),
                        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                        backgroundColor: tokens.colors.warningScale[50],
                        borderColor: tokens.colors.warningScale[200],
                        cursor: 'pointer',
                        textAlign: 'center',
                        ...createHoverStyle(tokens),
                      }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        props.onToggleStatus?.(campaign.id, 'paused');
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.warningScale[700],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        ⏸️ Pause
                      </Text>
                    </Box>
                  )}
                  <Box
                    style={{
                      flex: 1,
                      ...createCardStyle(tokens),
                      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                      backgroundColor: tokens.colors.neutral[100],
                      cursor: 'pointer',
                      textAlign: 'center',
                      ...createHoverStyle(tokens),
                    }}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      props.onCampaignClick?.(campaign.id);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}
                    >
                      📋 Duplicate
                    </Text>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
