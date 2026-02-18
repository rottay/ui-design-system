'use client';

/**
 * BhProviderCost - Dashboard Preset
 * Full cost dashboard with budget overview, alerts, provider table,
 * and horizontal bar chart. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Minus, AlertTriangle,
  X, BarChart3, Loader2,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createCardHoverStyles,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createProgressBarStyle,
  createEmptyStateStyle,
  getChartConfig,
  getAccentAwareLayout,
} from '../../../helpers';
import type {
  BhProviderCostProps,
  ProviderCostEntry,
  CostAlert,
  CostAlertSeverity,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSeverityColor(severity: CostAlertSeverity, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[600];
    case 'warning': return t.colors.warningScale[500];
    case 'info': return t.colors.infoScale[500];
  }
}

function getSeverityBg(severity: CostAlertSeverity, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[50];
    case 'warning': return t.colors.warningScale[50];
    case 'info': return t.colors.infoScale[50];
  }
}

function getSeverityBadgeKey(severity: CostAlertSeverity): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'critical': return 'error';
    case 'warning': return 'warning';
    case 'info': return 'info';
  }
}

function getBudgetColor(pct: number, t: DesignTokens): string {
  if (pct >= 90) return t.colors.errorScale[500];
  if (pct >= 70) return t.colors.warningScale[500];
  return t.colors.successScale[500];
}

function getBudgetBg(pct: number, t: DesignTokens): string {
  if (pct >= 90) return t.colors.errorScale[50];
  if (pct >= 70) return t.colors.warningScale[50];
  return t.colors.successScale[50];
}

function formatCurrency(value: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '\u20AC' : currency;
  return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

function getTrendIcon(trend: 'up' | 'down' | 'flat') {
  switch (trend) {
    case 'up': return TrendingUp;
    case 'down': return TrendingDown;
    case 'flat': return Minus;
  }
}

function getTrendColor(trend: 'up' | 'down' | 'flat', t: DesignTokens): string {
  switch (trend) {
    case 'up': return t.colors.errorScale[600];
    case 'down': return t.colors.successScale[600];
    case 'flat': return t.colors.neutral[500];
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_TOTAL_BUDGET = 15000;

/* ================================================================== */
/*  Dashboard Preset                                                   */
/* ================================================================== */

export const DashboardBhProviderCost = createPreset<BhProviderCostProps>({
  name: 'BhProviderCost.Dashboard',
  render: (ctx: PresetContext<BhProviderCostProps>) => {
    const { primitives, props, tokens: t } = ctx;
    const { Box, Text } = primitives;

    const isGlass = t.surface.useGlass && !!t.glass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const chartCfg = useMemo(() => getChartConfig(t), [t]);

    const {
      providers: rawProviders = [],
      alerts: rawAlerts = [],
      totalBudget: rawTotalBudget = MOCK_TOTAL_BUDGET,
      totalSpent: rawTotalSpent = 0,
      currency = 'USD',
      period = 'This Month',
      onProviderClick,
      onAlertDismiss,
      cacheEntries: rawCacheEntries,
      loading = false,
      className,
      style,
    } = props;

    const cacheEntries = Array.isArray(rawCacheEntries) ? rawCacheEntries : [];

    const providers = Array.isArray(rawProviders) ? rawProviders : [];
    const alerts = Array.isArray(rawAlerts) ? rawAlerts : [];
    const totalBudget = Array.isArray(rawTotalBudget) ? rawTotalBudget : MOCK_TOTAL_BUDGET;
    const totalSpent = Array.isArray(rawTotalSpent) ? rawTotalSpent : 0;

    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const progressBar = useMemo(() => createProgressBarStyle(t, { percent: 0 }), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    const handleProviderClick = useCallback((provider: string) => {
      onProviderClick?.(provider);
    }, [onProviderClick]);

    const handleAlertDismiss = useCallback((alertId: string) => {
      onAlertDismiss?.(alertId);
      setDismissedAlerts(prev => new Set([...prev, alertId]));
    }, [onAlertDismiss]);

    const budgetPct = useMemo(() => {
      if (totalBudget <= 0) return 0;
      return Math.min(100, (totalSpent / totalBudget) * 100);
    }, [totalSpent, totalBudget]);

    const activeAlerts = useMemo(() => {
      return alerts.filter(a => !dismissedAlerts.has(a.id));
    }, [alerts, dismissedAlerts]);

    const sortedProviders = useMemo(() => {
      return [...providers].sort((a, b) => b.totalCost - a.totalCost);
    }, [providers]);

    const maxProviderCost = useMemo(() => {
      return Math.max(...sortedProviders.map(p => p.totalCost), 1);
    }, [sortedProviders]);

    const barChartHeight = useMemo(() => {
      return Math.max(200, sortedProviders.length * 48 + 40);
    }, [sortedProviders.length]);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[10], ...style }}>
          <Loader2 size={24} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[3] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading cost data...</Text>
        </Box>
      );
    }

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
                <DollarSign size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Provider Cost Dashboard
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  {period} - Budget and spend analytics by provider
                </Text>
              </Box>
            </Box>
            {activeAlerts.length > 0 && (
              <Box style={{
                ...createBadgeStyle(t, activeAlerts.some(a => a.severity === 'critical') ? 'error' : 'warning'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <AlertTriangle size={12} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>

          {/* Budget Overview Card */}
          <Box style={{ ...card, ...hoverStyles.base, ...animStyle(0), marginBottom: t.spacing[6] }} role="status" aria-label={`Budget: ${formatCurrency(totalSpent, currency)} of ${formatCurrency(totalBudget, currency)} spent`}>
            {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
              <Box>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.neutral[500],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                  marginBottom: t.spacing[1],
                  display: 'block',
                }}>
                  Total Budget
                </Text>
                <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[2] }}>
                  <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                    {formatCurrency(totalSpent, currency)}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                    / {formatCurrency(totalBudget, currency)}
                  </Text>
                </Box>
              </Box>
              <Box style={{
                ...createBadgeStyle(t, budgetPct >= 90 ? 'error' : budgetPct >= 70 ? 'warning' : 'success'),
                borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold }}>
                  {budgetPct.toFixed(1)}%
                </Text>
              </Box>
            </Box>
            {/* Budget progress bar */}
            <Box style={{
              height: 10,
              borderRadius: t.borderRadius.full,
              backgroundColor: getBudgetBg(budgetPct, t),
              overflow: 'hidden',
            }}>
              <Box style={{
                height: '100%',
                width: `${budgetPct}%`,
                borderRadius: t.borderRadius.full,
                backgroundColor: getBudgetColor(budgetPct, t),
                transition: `width ${chartCfg.animationDuration}ms ease`,
              }} />
            </Box>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: t.spacing[2] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                {formatCurrency(totalBudget - totalSpent, currency)} remaining
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                {period}
              </Text>
            </Box>
          </Box>

          {/* Alerts Section */}
          {activeAlerts.length > 0 && (
            <Box style={{ marginBottom: t.spacing[6], ...animStyle(1) }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Active Alerts</Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {activeAlerts.map((alert) => (
                  <Box
                    key={alert.id}
                    style={{
                      ...card,
                      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                      borderLeft: `4px solid ${getSeverityColor(alert.severity, t)}`,
                      backgroundColor: getSeverityBg(alert.severity, t),
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[3],
                    }}
                    role="alert"
                    aria-label={`${alert.severity} alert: ${alert.message}`}
                  >
                    <AlertTriangle size={16} color={getSeverityColor(alert.severity, t)} style={{ flexShrink: 0 }} />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                        <Box style={{
                          ...createBadgeStyle(t, getSeverityBadgeKey(alert.severity)),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {(alert.severity || '').charAt(0).toUpperCase() + (alert.severity || '').slice(1)}
                          </Text>
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {alert.provider}
                        </Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800] }}>
                        {alert.message}
                      </Text>
                    </Box>
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`Dismiss alert: ${alert.message}`}
                      onClick={() => handleAlertDismiss(alert.id)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAlertDismiss(alert.id); } }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: t.borderRadius.md,
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: `background-color ${t.motion.hover}`,
                      }}
                    >
                      <X size={14} color={t.colors.neutral[400]} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Provider Cost Table + Bar Chart Row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(400px, 2fr) minmax(280px, 1fr)',
            gap: t.spacing[6],
            marginBottom: t.spacing[6],
          }}>
            {/* Provider Cost Table */}
            <Box style={{ ...card, ...animStyle(2), padding: 0, overflow: 'hidden' }}>
              <Box style={{
                padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
                borderBottom: `1px solid ${t.colors.neutral[100]}`,
                backgroundColor: t.colors.neutral[50],
                borderRadius: `${t.borderRadius.lg} ${t.borderRadius.lg} 0 0`,
              }}>
                <Text style={{
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[800],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  Cost by Provider
                </Text>
              </Box>

              {/* Table Header */}
              <Box style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 0.8fr 0.8fr 1fr 0.5fr',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                borderBottom: `1px solid ${t.colors.neutral[100]}`,
                backgroundColor: t.colors.neutral[50],
              }}>
                {['Provider / Model', 'Total Cost', 'Tokens', 'Avg/Req', 'Budget', 'Trend'].map((header) => (
                  <Text key={header} style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.semibold,
                    color: t.colors.neutral[500],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    {header}
                  </Text>
                ))}
              </Box>

              {/* Table Rows */}
              {sortedProviders.length === 0 ? (
                <Box style={{ ...emptyState }}>
                  <DollarSign size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                    No provider cost data available
                  </Text>
                </Box>
              ) : (
                <Box role="list" aria-label="Provider cost breakdown">
                  {sortedProviders.map((entry, index) => {
                    const entryBudgetPct = entry.budgetLimit > 0 ? (entry.budgetUsed / entry.budgetLimit) * 100 : 0;
                    const TrendIcon = getTrendIcon(entry.trend);
                    const trendColor = getTrendColor(entry.trend, t);

                    return (
                      <Box
                        key={`${entry.provider}-${entry.model}`}
                        role="listitem"
                        tabIndex={0}
                        aria-label={`${entry.provider} ${entry.model}: ${formatCurrency(entry.totalCost, currency)}`}
                        onClick={() => handleProviderClick(entry.provider)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleProviderClick(entry.provider); } }}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.4fr 1fr 0.8fr 0.8fr 1fr 0.5fr',
                          gap: t.spacing[2],
                          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                          borderBottom: index < sortedProviders.length - 1 ? `1px solid ${t.colors.neutral[100]}` : 'none',
                          cursor: 'pointer',
                          transition: `background-color ${t.motion.hover}`,
                          alignItems: 'center',
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.currentTarget.style.backgroundColor = t.colors.neutral[50];
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {/* Provider / Model */}
                        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], display: 'block' }}>
                            {entry.provider}
                          </Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                            {entry.model}
                          </Text>
                        </Box>

                        {/* Total Cost */}
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                          {formatCurrency(entry.totalCost, currency)}
                        </Text>

                        {/* Tokens */}
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>
                          {formatTokens(entry.tokenCount)}
                        </Text>

                        {/* Avg Cost/Request */}
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>
                          {formatCurrency(entry.avgCostPerRequest, currency)}
                        </Text>

                        {/* Mini Budget Bar */}
                        <Box>
                          <Box style={{
                            height: 6,
                            borderRadius: t.borderRadius.full,
                            backgroundColor: t.colors.neutral[100],
                            overflow: 'hidden',
                            marginBottom: t.spacing[1],
                          }}>
                            <Box style={{
                              height: '100%',
                              width: `${Math.min(100, entryBudgetPct)}%`,
                              borderRadius: t.borderRadius.full,
                              backgroundColor: getBudgetColor(entryBudgetPct, t),
                              transition: `width ${chartCfg.animationDuration}ms ease`,
                            }} />
                          </Box>
                          <Text style={{ fontSize: 9, color: t.colors.neutral[400] }}>
                            {entryBudgetPct.toFixed(0)}%
                          </Text>
                        </Box>

                        {/* Trend Arrow */}
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TrendIcon size={16} color={trendColor} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* SVG Bar Chart - Cost by Provider */}
            <Box style={{ ...card, ...animStyle(3) }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Cost Distribution</Text>
              {sortedProviders.length === 0 ? (
                <Box style={{ ...emptyState }}>
                  <BarChart3 size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No data</Text>
                </Box>
              ) : (
                <svg
                  width="100%"
                  height={barChartHeight}
                  viewBox={`0 0 300 ${barChartHeight}`}
                  preserveAspectRatio="xMidYMid meet"
                  role="img"
                  aria-label={`Cost distribution chart: ${sortedProviders.map(p => `${p.provider}: ${formatCurrency(p.totalCost, currency)}`).join(', ')}`}
                  style={{ display: 'block' }}
                >
                  {sortedProviders.map((entry, i) => {
                    const barWidth = (entry.totalCost / maxProviderCost) * 180;
                    const y = 20 + i * 48;
                    const colorScale = [
                      t.colors.primaryScale[500],
                      t.colors.infoScale[500],
                      t.colors.successScale[500],
                      t.colors.warningScale[500],
                      t.colors.errorScale[400],
                    ];
                    const barColor = colorScale[i % colorScale.length];

                    return (
                      <g key={`${entry.provider}-${entry.model}`}>
                        {/* Provider label */}
                        <text
                          x={0}
                          y={y + 10}
                          fill={t.colors.neutral[700]}
                          fontSize={11}
                          fontWeight={600}
                        >
                          {entry.provider}
                        </text>
                        {/* Background bar */}
                        <rect
                          x={80}
                          y={y}
                          width={180}
                          height={20}
                          rx={Number(String(t.borderRadius.sm).replace('px', '')) || 4}
                          fill={t.colors.neutral[100]}
                        />
                        {/* Value bar */}
                        <rect
                          x={80}
                          y={y}
                          width={barWidth}
                          height={20}
                          rx={Number(String(t.borderRadius.sm).replace('px', '')) || 4}
                          fill={barColor}
                          style={{ transition: `width ${chartCfg.animationDuration}ms ease` }}
                        />
                        {/* Value label */}
                        <text
                          x={80 + barWidth + 6}
                          y={y + 14}
                          fill={t.colors.neutral[600]}
                          fontSize={10}
                          fontWeight={500}
                        >
                          {formatCurrency(entry.totalCost, currency)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </Box>
          </Box>

          {/* Cache Entries */}
          {cacheEntries.length > 0 && (
            <Box style={{ ...card, ...animStyle(4), marginBottom: t.spacing[6] }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Cache Savings</Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {cacheEntries.slice(0, 5).map((entry, idx) => (
                  <Box key={(entry as any).id ?? idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md,
                    backgroundColor: t.colors.successScale[50],
                    border: `1px solid ${t.colors.successScale[200]}`,
                  }}>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                        {(entry as any).providerCode ?? (entry as any).provider ?? 'Provider'}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {(entry as any).cacheKey ? `Key: ${String((entry as any).cacheKey).slice(0, 20)}...` : 'Cached response'}
                      </Text>
                    </Box>
                    <Box style={{
                      padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                      borderRadius: badgeRadius,
                      backgroundColor: t.colors.successScale[100],
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[700] }}>
                        {(entry as any).hitCount ?? 0} hits
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Box>
              {cacheEntries.length > 5 && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginTop: t.spacing[2] }}>
                  +{cacheEntries.length - 5} more cache entries
                </Text>
              )}
            </Box>
          )}
        </Box>
        </Box>
      </Box>
    );
  },
});
