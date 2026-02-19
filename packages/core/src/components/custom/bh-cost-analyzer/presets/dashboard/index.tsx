'use client';

/**
 * BhCostAnalyzer - Dashboard Preset
 * Slite-inspired full cost overview with provider breakdown, alerts,
 * token balance, trend chart, generous whitespace and warm neutrals.
 */

import { useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhCostAnalyzerProps, ProviderCost } from '../../core';
import { getAlertSeverityColors, getTrendColors, formatCurrency, formatTokens } from '../../core';
import {
  createCardStyle, createSectionHeaderStyle, createStatusDotStyle, createBadgeStyle,
  createCardHoverStyles, createEntranceAnimation, createStaggerDelay,
  createIconContainerStyle, createPersonalitySectionHeaderStyle,
  getPersonalityTypography, getPersonalityBadgeRadius, createPersonalityAccentBar,
  createEmptyStateStyle,
  createMetadataFieldStyle, createMetadataGridStyle, createMetadataValueStyle,
  createStatValueStyle, createStatLabelStyle,
  ICON_SIZES,
} from '../../../helpers';
import type { DesignTokens } from '../../../../../types';
import { DollarSign, TrendingUp, AlertCircle, Coins, BarChart3, Activity } from 'lucide-react';

export const DashboardBhCostAnalyzer = createPreset<BhCostAnalyzerProps>({
  name: 'BhCostAnalyzer.Dashboard',
  render: ({ primitives, props, tokens }: PresetContext<BhCostAnalyzerProps>) => {
    const { Box, Text } = primitives;
    const isGlass = tokens.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const hoverStyles = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const alertColors = useMemo(() => getAlertSeverityColors(tokens), [tokens]);
    const trendColors = useMemo(() => getTrendColors(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);

    const {
      providers: rawProviders = [], models: rawModels = [], trends: rawTrends = [], tokenBalance,
      alerts: rawAlerts = [], summary, onAlertAcknowledge,
      categoryFilter: categoryFilterProp,
      period: periodProp,
      searchCosts: rawSearchCosts = [],
      loading, className, style,
    } = props;

    const providers = Array.isArray(rawProviders) ? rawProviders : [];
    const models = Array.isArray(rawModels) ? rawModels : [];
    const trends = Array.isArray(rawTrends) ? rawTrends : [];
    const alerts = Array.isArray(rawAlerts) ? rawAlerts : [];
    const searchCosts = Array.isArray(rawSearchCosts) ? rawSearchCosts : [];

    if (loading) {
      return (
        <Box className={className} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: `${tokens.spacing[10]}px`, ...style,
        }}>
          <Activity size={24} color={tokens.colors.neutral[300]} style={{ marginRight: tokens.spacing[3] }} />
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>Loading cost data...</Text>
        </Box>
      );
    }

    const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
    const totalCost = providers.reduce((sum, p) => sum + p.totalCost, 0);
    const maxProviderCost = Math.max(...providers.map(p => p.totalCost), 1);

    const handleAlertAcknowledge = useCallback((alertId: string) => {
      onAlertAcknowledge?.(alertId);
    }, [onAlertAcknowledge]);

    const statCardStyle = (accentColor: string) => ({
      ...createCardStyle(tokens, { elevation: 'sm', padding: 0, glass: isGlass }),
      borderRadius: tokens.borderRadius.lg,
      border: `1px solid ${tokens.colors.neutral[100]}`,
      overflow: 'hidden' as const,
      position: 'relative' as const,
    });

    return (
      <Box className={className} style={{ ...style }}>
        {accentBar && <Box style={accentBar} />}
        {/* Summary Stats */}
        {summary && (
          <Box style={{
            ...createMetadataGridStyle(tokens, { columns: 4 }),
            marginBottom: tokens.spacing[6],
          }}>
            {[
              { label: 'Total Spend', value: formatCurrency(summary.totalSpend), color: tokens.colors.neutral[800], icon: <DollarSign size={ICON_SIZES.section} /> },
              { label: 'Cost / Interview', value: formatCurrency(summary.costPerInterview), color: tokens.colors.neutral[800], icon: <BarChart3 size={ICON_SIZES.section} /> },
              { label: 'Cost / Hire', value: formatCurrency(summary.costPerHire), color: tokens.colors.neutral[800], icon: <TrendingUp size={ICON_SIZES.section} /> },
              { label: 'MoM Change', value: `${(summary.monthOverMonthChange ?? 0) >= 0 ? '+' : ''}${(summary.monthOverMonthChange ?? 0).toFixed(1)}%`, color: (summary.monthOverMonthChange ?? 0) > 10 ? tokens.colors.errorScale[600] : (summary.monthOverMonthChange ?? 0) < 0 ? tokens.colors.successScale[600] : tokens.colors.neutral[700], icon: <Activity size={ICON_SIZES.section} /> },
            ].map(stat => (
              <Box key={stat.label} style={statCardStyle(stat.color)}>
                <Box style={{
                  height: 3, backgroundColor: tokens.colors.primaryScale[400],
                  borderRadius: `${tokens.borderRadius.lg} ${tokens.borderRadius.lg} 0 0`,
                }} />
                <Box style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px` }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                    <Box style={{ color: tokens.colors.neutral[400] }}>{stat.icon}</Box>
                    <Text style={{
                      ...createSectionHeaderStyle(tokens), marginBottom: 0,
                    }}>{stat.label}</Text>
                  </Box>
                  <Text style={{
                    ...createStatValueStyle(tokens, { size: '2xl' }),
                    color: stat.color,
                  }}>{stat.value}</Text>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Category Filter & Period */}
        {(categoryFilterProp || periodProp) && (
          <Box style={{
            display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}>
            {categoryFilterProp && (
              <Box style={{
                ...createBadgeStyle(tokens, 'primary'),
                borderRadius: badgeRadius,
                display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
              }}>
                <BarChart3 size={11} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs }}>Category: {categoryFilterProp}</Text>
              </Box>
            )}
            {periodProp && (
              <Box style={{
                ...createBadgeStyle(tokens, 'info'),
                borderRadius: badgeRadius,
                display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
              }}>
                <Activity size={11} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs }}>Period: {periodProp}</Text>
              </Box>
            )}
          </Box>
        )}

        {/* Budget Alerts */}
        {unacknowledgedAlerts.length > 0 && (
          <Box style={{
            display: 'flex', flexDirection: 'column' as const,
            gap: tokens.spacing[2], marginBottom: tokens.spacing[6],
          }}>
            {unacknowledgedAlerts.map(alert => {
              const ac = alertColors[alert.severity];
              return (
                <Box key={alert.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  background: ac.bgColor,
                  border: `1px solid ${ac.border}`,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <AlertCircle size={16} color={ac.color} />
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: ac.color }}>{alert.message}</Text>
                  </Box>
                  {onAlertAcknowledge && (
                    <Box onClick={() => handleAlertAcknowledge(alert.id)} role="button" tabIndex={0} aria-label={`Dismiss alert: ${alert.message}`} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAlertAcknowledge(alert.id); } }} style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.full,
                      background: ac.border, cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: ac.color, fontWeight: tokens.typography.fontWeight.medium }}>Dismiss</Text>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        <Box style={{ display: 'flex', gap: tokens.spacing[5] }}>
          {/* Provider Breakdown */}
          <Box style={{
            flex: 1,
            ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${tokens.colors.neutral[100]}`,
            overflow: 'hidden',
          }}>
            <Box style={{
              padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <BarChart3 size={16} color={tokens.colors.neutral[500]} />
                <Text style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: ptypo.headingWeight,
                  color: tokens.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>Cost by Provider</Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
              {providers.map(prov => {
                const barWidth = maxProviderCost > 0 ? (prov.totalCost / maxProviderCost) * 100 : 0;
                return (
                  <Box key={prov.providerId} style={{
                    padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                    borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                  }}>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{prov.providerName}</Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{formatCurrency(prov.totalCost)}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: trendColors[prov.trend], fontWeight: tokens.typography.fontWeight.medium }}>
                          {prov.trend === 'up' ? '+' : prov.trend === 'down' ? '-' : ''}{prov.trendValue}%
                        </Text>
                      </Box>
                    </Box>
                    <Box style={{
                      height: 6, borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.neutral[100], overflow: 'hidden',
                    }}>
                      <Box style={{
                        height: '100%', width: `${barWidth}%`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[400],
                        transition: `width ${tokens.motion.hover}`,
                      }} />
                    </Box>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatTokens(prov.tokenCount)} tokens</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{(prov.share ?? 0).toFixed(1)}% share</Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Right sidebar: Token Balance + Top Models */}
          <Box style={{ width: 300, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5] }}>
            {/* Token Balance */}
            {tokenBalance && (
              <Box style={{
                ...createCardStyle(tokens, { elevation: 'sm' }),
                borderRadius: tokens.borderRadius.lg,
                border: `1px solid ${tokens.colors.neutral[100]}`,
                padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px`,
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                  <Coins size={16} color={tokens.colors.neutral[500]} />
                  <Text style={{ ...createSectionHeaderStyle(tokens), marginBottom: 0 }}>Token Balance</Text>
                </Box>
                <Text style={{
                  ...createStatValueStyle(tokens, { size: '2xl' }),
                  fontSize: tokens.typography.fontSize['3xl'],
                  marginBottom: tokens.spacing[3],
                }}>{formatTokens(tokenBalance.current)}</Text>
                <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box style={createMetadataFieldStyle(tokens)}>
                    <Text style={{ ...createStatLabelStyle(tokens), marginBottom: tokens.spacing[1] }}>Burn Rate</Text>
                    <Text style={createMetadataValueStyle(tokens, { weight: 'semibold' })}>{formatTokens(tokenBalance.dailyBurnRate)}/day</Text>
                  </Box>
                  <Box style={createMetadataFieldStyle(tokens)}>
                    <Text style={{ ...createStatLabelStyle(tokens), marginBottom: tokens.spacing[1] }}>Depletion</Text>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokenBalance.projectedDepletionDays <= 7 ? tokens.colors.errorScale[600] : tokenBalance.projectedDepletionDays <= 30 ? tokens.colors.warningScale[600] : tokens.colors.successScale[600],
                    }}>
                      {tokenBalance.projectedDepletionDays} days
                    </Text>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Top Models */}
            {models.length > 0 && (
              <Box style={{
                ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
                borderRadius: tokens.borderRadius.lg,
                border: `1px solid ${tokens.colors.neutral[100]}`,
                overflow: 'hidden',
              }}>
                <Box style={{
                  padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                }}>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}>Top Models</Text>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
                  {models.slice(0, 5).map(m => (
                    <Box key={m.modelId} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
                      borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                    }}>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], fontWeight: tokens.typography.fontWeight.medium }}>{m.modelName}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400]}}>{m.provider}</Text>
                      </Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>{formatCurrency(m.totalCost)}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Trend Chart */}
        {trends.length > 0 && (
          <Box style={{
            marginTop: tokens.spacing[6],
            ...createCardStyle(tokens, { elevation: 'sm' }),
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${tokens.colors.neutral[100]}`,
            padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
              <TrendingUp size={16} color={tokens.colors.neutral[500]} />
              <Text style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}>Cost Trend</Text>
            </Box>
            <Box style={{ display: 'flex', gap: tokens.spacing[1], alignItems: 'flex-end', height: 100 }}>
              {trends.map((point, i) => {
                const maxCost = Math.max(...trends.map(t => t.cost), 1);
                const barHeight = Math.max(6, (point.cost / maxCost) * 88);
                return (
                  <Box key={i} style={{
                    ...animStyle(i),
                    flex: 1, display: 'flex', flexDirection: 'column' as const,
                    alignItems: 'center', gap: tokens.spacing[1],
                  }}>
                    <Box style={{
                      width: '100%', height: barHeight,
                      borderRadius: tokens.borderRadius.md,
                      background: tokens.colors.primaryScale[300],
                      transition: `height ${tokens.motion.hover}`,
                    }} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400],
                      whiteSpace: 'nowrap' as const,
                    }}>{point.label ?? point.date}</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
        {/* Search Costs */}
        {searchCosts.length > 0 && (
          <Box style={{
            marginTop: tokens.spacing[6],
            ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${tokens.colors.neutral[100]}`,
            overflow: 'hidden',
          }}>
            <Box style={{
              padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <DollarSign size={16} color={tokens.colors.neutral[500]} />
                <Text style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: ptypo.headingWeight,
                  color: tokens.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>Search Costs</Text>
                <Box style={{ ...createBadgeStyle(tokens, 'info'), borderRadius: badgeRadius }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{searchCosts.length}</Text>
                </Box>
              </Box>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
              {searchCosts.slice(0, 10).map((sc, idx) => (
                <Box key={(sc as any).id ?? idx} style={{
                  ...animStyle(idx),
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                }}>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], fontWeight: tokens.typography.fontWeight.medium }}>
                      {(sc as any).model ?? (sc as any).provider ?? 'Search'}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                      {(sc as any).createdAt ? new Date((sc as any).createdAt).toLocaleDateString() : ''}
                      {(sc as any).tokensUsed != null ? ` - ${(sc as any).tokensUsed} tokens` : ''}
                    </Text>
                  </Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>
                    {(sc as any).cost != null ? formatCurrency((sc as any).cost) : '-'}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
