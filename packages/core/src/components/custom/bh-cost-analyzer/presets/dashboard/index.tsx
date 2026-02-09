import { useMemo } from 'react';
'use client';

/**
 * BhCostAnalyzer - Dashboard Preset
 * Full cost overview with provider breakdown, alerts, and token balance
 */

import { createPreset, PresetContext } from '../../../factory';
import type { BhCostAnalyzerProps } from '../../core';
import { getAlertSeverityColors, getTrendColors, formatCurrency, formatTokens } from '../../core';
import {
  createAccentBarStyle,
  createCardStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const DashboardBhCostAnalyzer = createPreset<BhCostAnalyzerProps>({
  name: 'BhCostAnalyzer.Dashboard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhCostAnalyzerProps>) => {
    const { Box, Flex, Stack, Text, Grid } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const alertColors = getAlertSeverityColors(tokens);
    const trendColors = getTrendColors(tokens);

    const {
      providers,
      models = [],
      trends = [],
      tokenBalance,
      alerts = [],
      summary,
      onAlertAcknowledge,
      loading,
      className,
      style,
    } = props;

    if (loading) {
      return (
        <Flex align="center" justify="center" style={{ padding: tokens.spacing[8], ...style }} className={className}>
          <Text style={{ color: tokens.colors.neutral[500] }}>Loading cost data...</Text>
        </Flex>
      );
    }

    const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
    const totalCost = providers.reduce((sum, p) => sum + p.totalCost, 0);
    const maxProviderCost = Math.max(...providers.map(p => p.totalCost), 1);

    return (
      <Box className={className} style={{ ...style }}>
        {/* Summary Stats */}
        {summary && (
          <Grid columns={{ xs: 2, sm: 4 }} gap={12} style={{ marginBottom: tokens.spacing[4] }}>
            {[
              { label: 'Total Spend', value: formatCurrency(summary.totalSpend), color: tokens.colors.neutral[800] },
              { label: 'Cost / Interview', value: formatCurrency(summary.costPerInterview), color: tokens.colors.neutral[800] },
              { label: 'Cost / Hire', value: formatCurrency(summary.costPerHire), color: tokens.colors.neutral[800] },
              { label: 'MoM Change', value: `${summary.monthOverMonthChange >= 0 ? '+' : ''}${summary.monthOverMonthChange.toFixed(1)}%`, color: summary.monthOverMonthChange > 10 ? tokens.colors.errorScale[600] : summary.monthOverMonthChange < 0 ? tokens.colors.successScale[600] : tokens.colors.neutral[700] },
            ].map(stat => (
              <Box key={stat.label} style={{ ...createCardStyle(tokens), overflow: 'hidden' }}>
                <div style={createAccentBarStyle(tokens, { position: 'top' })} />
                <Text style={createSectionHeaderStyle(tokens)}>{stat.label}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold, color: stat.color }}>{stat.value}</Text>
              </Box>
            ))}
          </Grid>
        )}

        {/* Budget Alerts */}
        {unacknowledgedAlerts.length > 0 && (
          <Stack gap={6} style={{ marginBottom: tokens.spacing[4] }}>
            {unacknowledgedAlerts.map(alert => {
              const ac = alertColors[alert.severity];
              return (
                <Flex key={alert.id} align="center" justify="between" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.lg, background: ac.bgColor, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${ac.border}`, boxShadow: tokens.shadows.sm }}>
                  <Flex gap={8} align="center">
                    <Box style={createStatusDotStyle(tokens, ac.color)} />
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: ac.color }}>{alert.message}</Text>
                  </Flex>
                  {onAlertAcknowledge && (
                    <Box onClick={() => onAlertAcknowledge(alert.id)} style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, background: ac.border, cursor: 'pointer', transition: `all ${tokens.motion.hover}` }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: ac.color }}>Dismiss</Text>
                    </Box>
                  )}
                </Flex>
              );
            })}
          </Stack>
        )}

        <Flex gap={16}>
          {/* Provider Breakdown */}
          <Box style={{ flex: 1, ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden' }}>
            <Box style={createPanelHeaderStyle(tokens)}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Cost by Provider</Text>
            </Box>
            <Stack gap={0}>
              {providers.map(prov => {
                const barWidth = maxProviderCost > 0 ? (prov.totalCost / maxProviderCost) * 100 : 0;
                const progressStyles = useMemo(() => createProgressBarStyle(tokens, { color: tokens.colors.primaryScale[500], percent: barWidth }), [tokens, barWidth]);
                return (
                  <Box key={prov.providerId} style={createListItemStyle(tokens, { interactive: false })}>
                    <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{prov.providerName}</Text>
                      <Flex gap={6} align="center">
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{formatCurrency(prov.totalCost)}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: trendColors[prov.trend] }}>
                          {prov.trend === 'up' ? '+' : prov.trend === 'down' ? '-' : ''}{prov.trendValue}%
                        </Text>
                      </Flex>
                    </Flex>
                    <Box style={progressStyles.track}>
                      <div style={progressStyles.fill} />
                    </Box>
                    <Flex justify="between" style={{ marginTop: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatTokens(prov.tokenCount)} tokens</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{prov.share.toFixed(1)}% share</Text>
                    </Flex>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Token Balance + Model Breakdown */}
          <Stack gap={16} style={{ width: 280 }}>
            {/* Token Balance */}
            {tokenBalance && (
              <Box style={createCardStyle(tokens)}>
                <Text style={{ ...createSectionHeaderStyle(tokens), marginBottom: tokens.spacing[2] }}>Token Balance</Text>
                <Text style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{formatTokens(tokenBalance.current)}</Text>
                <Flex justify="between" style={{ marginTop: tokens.spacing[2] }}>
                  <Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Burn Rate</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{formatTokens(tokenBalance.dailyBurnRate)}/day</Text>
                  </Box>
                  <Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Depletion</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokenBalance.projectedDepletionDays <= 7 ? tokens.colors.errorScale[600] : tokenBalance.projectedDepletionDays <= 30 ? tokens.colors.warningScale[600] : tokens.colors.successScale[600] }}>
                      {tokenBalance.projectedDepletionDays} days
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            {/* Top Models */}
            {models.length > 0 && (
              <Box style={{ ...createCardStyle(tokens, { glass: isGlass, padding: 0 }), overflow: 'hidden' }}>
                <Box style={createPanelHeaderStyle(tokens)}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Top Models</Text>
                </Box>
                <Stack gap={0}>
                  {models.slice(0, 5).map(m => (
                    <Flex key={m.modelId} justify="between" align="center" style={createListItemStyle(tokens, { interactive: false })}>
                      <Stack gap={1}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>{m.modelName}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{m.provider}</Text>
                      </Stack>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{formatCurrency(m.totalCost)}</Text>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Flex>

        {/* Trend Chart */}
        {trends.length > 0 && (
          <Box style={{ marginTop: tokens.spacing[4], ...createCardStyle(tokens) }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[2] }}>Cost Trend</Text>
            <Flex gap={2} align="end" style={{ height: 80 }}>
              {trends.map((point, i) => {
                const maxCost = Math.max(...trends.map(t => t.cost), 1);
                const barHeight = Math.max(4, (point.cost / maxCost) * 72);
                return (
                  <Stack key={i} gap={2} align="center" style={{ flex: 1 }}>
                    <Box style={{ width: '100%', height: barHeight, borderRadius: tokens.borderRadius.sm, background: tokens.colors.primaryScale[400], transition: `height ${tokens.transitions?.normal || tokens.motion.hover}` }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{point.label ?? point.date}</Text>
                  </Stack>
                );
              })}
            </Flex>
          </Box>
        )}
      </Box>
    );
  },
});
