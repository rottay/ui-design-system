'use client';

import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createProgressBarStyle } from '../../../helpers';
import type { CampaignManagerProps, Campaign } from '../../core';

// Mock data matching builder preset
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

export const CampaignManagerAnalytics = createPreset<CampaignManagerProps>({
  name: 'CampaignManager.Analytics',
  render: (ctx: PresetContext<CampaignManagerProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const campaigns = props.campaigns || MOCK_CAMPAIGNS;
    const activeCampaigns = campaigns.filter((c) => c.sentCount > 0);

    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('en-US').format(num);
    };

    const formatCurrency = (num: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(num);
    };

    const formatPercent = (num: number) => {
      return `${num.toFixed(1)}%`;
    };

    // Calculate totals
    const totalSent = activeCampaigns.reduce((sum, c) => sum + c.sentCount, 0);
    const totalRevenue = activeCampaigns.reduce((sum, c) => sum + c.revenue, 0);
    const avgOpenRate =
      activeCampaigns.reduce((sum, c) => sum + c.openRate, 0) / activeCampaigns.length || 0;
    const avgClickRate =
      activeCampaigns.reduce((sum, c) => sum + c.clickRate, 0) / activeCampaigns.length || 0;
    const avgConversionRate =
      activeCampaigns.reduce((sum, c) => sum + c.conversionRate, 0) / activeCampaigns.length || 0;

    // Channel performance
    const channelStats = activeCampaigns.reduce((acc, campaign) => {
      campaign.channels.forEach((channel) => {
        if (!acc[channel]) {
          acc[channel] = { sent: 0, revenue: 0, campaigns: 0 };
        }
        acc[channel].sent += campaign.sentCount;
        acc[channel].revenue += campaign.revenue;
        acc[channel].campaigns += 1;
      });
      return acc;
    }, {} as Record<string, { sent: number; revenue: number; campaigns: number }>);

    // Funnel data (based on averages)
    const funnelData = [
      { stage: 'Sent', count: totalSent, percent: 100, color: tokens.colors.primaryScale },
      {
        stage: 'Opened',
        count: Math.round(totalSent * (avgOpenRate / 100)),
        percent: avgOpenRate,
        color: tokens.colors.infoScale,
      },
      {
        stage: 'Clicked',
        count: Math.round(totalSent * (avgClickRate / 100)),
        percent: avgClickRate,
        color: tokens.colors.successScale,
      },
      {
        stage: 'Converted',
        count: Math.round(totalSent * (avgConversionRate / 100)),
        percent: avgConversionRate,
        color: tokens.colors.warningScale,
      },
    ];

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
            Campaign Analytics
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
            }}
          >
            Performance metrics and insights across all campaigns
          </Text>
        </Box>

        {/* Overview Stats */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          {[
            { label: 'Total Sent', value: formatNumber(totalSent), icon: '📧' },
            { label: 'Avg Open Rate', value: formatPercent(avgOpenRate), icon: '👁️' },
            { label: 'Avg Click Rate', value: formatPercent(avgClickRate), icon: '🖱️' },
            { label: 'Avg Conversion', value: formatPercent(avgConversionRate), icon: '✅' },
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: '💰' },
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
                      fontSize: tokens.typography.fontSize['2xl'],
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

        {/* Funnel Visualization */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[6],
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
            Conversion Funnel
          </Text>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[4],
            }}
          >
            {funnelData.map((stage, index) => {
              const widthPercent = (stage.count / totalSent) * 100;
              return (
                <Box key={stage.stage}>
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
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {stage.stage}
                    </Text>
                    <Box style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center' }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        {formatNumber(stage.count)}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: stage.color[600],
                          fontWeight: tokens.typography.fontWeight.semibold,
                        }}
                      >
                        {formatPercent(stage.percent)}
                      </Text>
                    </Box>
                  </Box>
                  <Box
                    style={{
                      width: '100%',
                      height: '40px',
                      backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.md,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Box
                      style={{
                        width: `${widthPercent}%`,
                        height: '100%',
                        backgroundColor: stage.color[500],
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                  {index < funnelData.length - 1 && (
                    <Box
                      style={{
                        textAlign: 'center',
                        marginTop: tokens.spacing[1],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        ↓ {formatPercent(((funnelData[index + 1].count / stage.count) * 100))} conversion
                      </Text>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Channel Performance */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[6],
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
            Channel Performance
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {Object.entries(channelStats).map(([channel, stats]) => {
              const maxRevenue = Math.max(...Object.values(channelStats).map((s) => s.revenue));
              const widthPercent = (stats.revenue / maxRevenue) * 100;

              return (
                <Box
                  key={channel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[4],
                  }}
                >
                  <Box style={{ width: '120px' }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[700],
                        textTransform: 'capitalize',
                      }}
                    >
                      {channel}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {stats.campaigns} campaigns
                    </Text>
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Box
                      style={{
                        width: '100%',
                        height: '32px',
                        backgroundColor: tokens.colors.neutral[100],
                        borderRadius: tokens.borderRadius.md,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        style={{
                          width: `${widthPercent}%`,
                          height: '100%',
                          backgroundColor: tokens.colors.primaryScale[500],
                        }}
                      />
                    </Box>
                  </Box>
                  <Box style={{ width: '140px', textAlign: 'right' }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {formatCurrency(stats.revenue)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {formatNumber(stats.sent)} sent
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Campaign Performance Table */}
        <Box
          style={{
            ...createCardStyle(tokens),
            padding: tokens.spacing[6],
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
            Campaign Performance
          </Text>
          <Box style={{ overflowX: 'auto' }}>
            <Box style={{ minWidth: '800px' }}>
              {/* Table Header */}
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr',
                  gap: tokens.spacing[3],
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.md,
                }}
              >
                {['Campaign', 'Sent', 'Open Rate', 'Click Rate', 'Conversion', 'Revenue'].map((header) => (
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

              {/* Table Rows */}
              <Box style={{ marginTop: tokens.spacing[2] }}>
                {activeCampaigns.map((campaign) => (
                  <Box
                    key={campaign.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr',
                      gap: tokens.spacing[3],
                      padding: tokens.spacing[3],
                      borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}
                    >
                      {campaign.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {formatNumber(campaign.sentCount)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.successScale[600],
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}
                    >
                      {formatPercent(campaign.openRate)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.infoScale[600],
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}
                    >
                      {formatPercent(campaign.clickRate)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.warningScale[600],
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}
                    >
                      {formatPercent(campaign.conversionRate)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}
                    >
                      {formatCurrency(campaign.revenue)}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
