'use client';

import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createHoverStyle, createBadgeStyle } from '../../../helpers';
import type { ReferralTrackerProps, Ambassador } from '../../core';

// Mock data - admin view with multiple ambassadors
const MOCK_AMBASSADORS: Ambassador[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    referralCode: 'SARAH2026',
    clicks: 342,
    signups: 68,
    sales: 42,
    earnings: 8450,
    tier: 'pro',
    status: 'active',
  },
  {
    id: '2',
    name: 'Marcus Williams',
    referralCode: 'MARCUS2026',
    clicks: 856,
    signups: 124,
    sales: 89,
    earnings: 18230,
    tier: 'elite',
    status: 'active',
  },
  {
    id: '3',
    name: 'Jessica Lee',
    referralCode: 'JESS2026',
    clicks: 245,
    signups: 42,
    sales: 28,
    earnings: 5640,
    tier: 'pro',
    status: 'active',
  },
  {
    id: '4',
    name: 'David Brown',
    referralCode: 'DAVID2026',
    clicks: 128,
    signups: 18,
    sales: 6,
    earnings: 1250,
    tier: 'starter',
    status: 'paused',
  },
  {
    id: '5',
    name: 'Emily Garcia',
    referralCode: 'EMILY2026',
    clicks: 512,
    signups: 92,
    sales: 61,
    earnings: 12480,
    tier: 'pro',
    status: 'active',
  },
  {
    id: '6',
    name: 'Ryan Thompson',
    referralCode: 'RYAN2026',
    clicks: 89,
    signups: 12,
    sales: 3,
    earnings: 580,
    tier: 'starter',
    status: 'suspended',
  },
];

export const ReferralTrackerAdmin = createPreset<ReferralTrackerProps>({
  name: 'ReferralTracker.Admin',
  render: (ctx: PresetContext<ReferralTrackerProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const ambassadors = props.ambassadors || MOCK_AMBASSADORS;

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

    const getStatusColor = (status: Ambassador['status']) => {
      switch (status) {
        case 'active':
          return tokens.colors.successScale;
        case 'paused':
          return tokens.colors.warningScale;
        case 'suspended':
          return tokens.colors.errorScale;
        default:
          return tokens.colors.secondaryScale;
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

    const getStatusBadgeKey = (status: Ambassador['status']): 'success' | 'warning' | 'error' | 'secondary' => {
      switch (status) {
        case 'active': return 'success';
        case 'paused': return 'warning';
        case 'suspended': return 'error';
        default: return 'secondary';
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

    // Calculate program stats
    const totalAmbassadors = ambassadors.length;
    const activeAmbassadors = ambassadors.filter((a) => a.status === 'active').length;
    const totalReferrals = ambassadors.reduce((sum, a) => sum + a.signups, 0);
    const totalRevenue = ambassadors.reduce((sum, a) => sum + a.earnings, 0);
    const totalSales = ambassadors.reduce((sum, a) => sum + a.sales, 0);

    // Top performers
    const topPerformers = [...ambassadors]
      .filter((a) => a.status === 'active')
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    // Fraud alerts (ambassadors with suspicious patterns)
    const fraudAlerts = ambassadors.filter(
      (a) => a.clicks > 0 && a.signups / a.clicks > 0.5 // More than 50% conversion rate is suspicious
    );

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
              Referral Program Admin
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Manage ambassadors and track program performance
            </Text>
          </Box>
        </Box>

        {/* Program Stats */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          {[
            { label: 'Total Ambassadors', value: totalAmbassadors, icon: '👥' },
            { label: 'Active', value: activeAmbassadors, icon: '✅' },
            { label: 'Total Referrals', value: formatNumber(totalReferrals), icon: '🔗' },
            { label: 'Total Sales', value: formatNumber(totalSales), icon: '💰' },
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: '💵' },
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

        {/* Fraud Detection Alerts */}
        {fraudAlerts.length > 0 && (
          <Box
            style={{
              ...createCardStyle(tokens),
              padding: tokens.spacing[4],
              backgroundColor: tokens.colors.errorScale[50],
              borderColor: tokens.colors.errorScale[300],
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl }}>⚠️</Text>
              <Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.errorScale[700],
                  }}
                >
                  Fraud Detection Alert
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.errorScale[600],
                    marginTop: tokens.spacing[1],
                  }}
                >
                  {fraudAlerts.length} ambassador(s) with suspicious activity patterns detected
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Top Performers */}
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
            Top Performers
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            {topPerformers.map((ambassador, index) => {
              const tierColor = getTierColor(ambassador.tier);
              const maxEarnings = topPerformers[0]?.earnings || 1;
              const widthPercent = (ambassador.earnings / maxEarnings) * 100;

              return (
                <Box
                  key={ambassador.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                  }}
                >
                  <Box
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tierColor[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tierColor[700],
                      }}
                    >
                      {index + 1}
                    </Text>
                  </Box>
                  <Box style={{ width: '140px' }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {ambassador.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        textTransform: 'uppercase',
                      }}
                    >
                      {ambassador.tier}
                    </Text>
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Box
                      style={{
                        width: '100%',
                        height: '24px',
                        backgroundColor: tokens.colors.neutral[100],
                        borderRadius: tokens.borderRadius.md,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        style={{
                          width: `${widthPercent}%`,
                          height: '100%',
                          backgroundColor: tierColor[500],
                        }}
                      />
                    </Box>
                  </Box>
                  <Box style={{ width: '120px', textAlign: 'right' }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {formatCurrency(ambassador.earnings)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {ambassador.sales} sales
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Ambassador Table */}
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
            All Ambassadors
          </Text>
          <Box style={{ flex: 1, overflowY: 'auto' }}>
            <Box style={{ minWidth: '1000px' }}>
              {/* Table Header */}
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 1fr 1.2fr 1fr 1.5fr',
                  gap: tokens.spacing[3],
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.md,
                }}
              >
                {[
                  'Name',
                  'Code',
                  'Tier',
                  'Clicks',
                  'Sign-ups',
                  'Sales',
                  'Earnings',
                  'Status',
                  'Actions',
                ].map((header) => (
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
                {ambassadors.map((ambassador) => {
                  const tierColor = getTierColor(ambassador.tier);
                  const statusColor = getStatusColor(ambassador.status);

                  return (
                    <Box
                      key={ambassador.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 1fr 1.2fr 1fr 1.5fr',
                        gap: tokens.spacing[3],
                        padding: tokens.spacing[3],
                        borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                        alignItems: 'center',
                      }}
                    >
                      {/* Name */}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        {ambassador.name}
                      </Text>

                      {/* Code */}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          fontFamily: 'monospace',
                        }}
                      >
                        {ambassador.referralCode}
                      </Text>

                      {/* Tier */}
                      <Box
                        style={{
                          ...createBadgeStyle(tokens, getTierBadgeKey(ambassador.tier)),
                          display: 'inline-flex',
                          alignSelf: 'flex-start',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            textTransform: 'capitalize',
                          }}
                        >
                          {ambassador.tier}
                        </Text>
                      </Box>

                      {/* Clicks */}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {formatNumber(ambassador.clicks)}
                      </Text>

                      {/* Sign-ups */}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {formatNumber(ambassador.signups)}
                      </Text>

                      {/* Sales */}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                          fontWeight: tokens.typography.fontWeight.semibold,
                        }}
                      >
                        {formatNumber(ambassador.sales)}
                      </Text>

                      {/* Earnings */}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.successScale[600],
                          fontWeight: tokens.typography.fontWeight.semibold,
                        }}
                      >
                        {formatCurrency(ambassador.earnings)}
                      </Text>

                      {/* Status */}
                      <Box
                        style={{
                          ...createBadgeStyle(tokens, getStatusBadgeKey(ambassador.status)),
                          display: 'inline-flex',
                          alignSelf: 'flex-start',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            textTransform: 'capitalize',
                          }}
                        >
                          {ambassador.status}
                        </Text>
                      </Box>

                      {/* Actions */}
                      <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                        {ambassador.status === 'active' && (
                          <Box
                            style={{
                              ...createCardStyle(tokens),
                              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                              backgroundColor: tokens.colors.warningScale[50],
                              borderColor: tokens.colors.warningScale[200],
                              cursor: 'pointer',
                              ...createHoverStyle(tokens),
                            }}
                            onClick={() => props.onToggleStatus?.(ambassador.id, 'paused')}
                          >
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.warningScale[700],
                                fontWeight: tokens.typography.fontWeight.medium,
                              }}
                            >
                              ⏸️
                            </Text>
                          </Box>
                        )}
                        {ambassador.status === 'suspended' && (
                          <Box
                            style={{
                              ...createCardStyle(tokens),
                              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                              backgroundColor: tokens.colors.successScale[50],
                              borderColor: tokens.colors.successScale[200],
                              cursor: 'pointer',
                              ...createHoverStyle(tokens),
                            }}
                            onClick={() => props.onToggleStatus?.(ambassador.id, 'active')}
                          >
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.successScale[700],
                                fontWeight: tokens.typography.fontWeight.medium,
                              }}
                            >
                              ✓
                            </Text>
                          </Box>
                        )}
                        <Box
                          style={{
                            ...createCardStyle(tokens),
                            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                            backgroundColor: tokens.colors.neutral[100],
                            cursor: 'pointer',
                            ...createHoverStyle(tokens),
                          }}
                          onClick={() => props.onAmbassadorClick?.(ambassador.id)}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[700],
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}
                          >
                            👁️
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
