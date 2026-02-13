'use client';

/**
 * BhTokenManager - Overview Preset
 * Full token & billing dashboard with balance hero, consumption chart,
 * cost breakdown donut, quota management, transaction history,
 * alerts config, usage forecast, and top-up action.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createDividerStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createPersonalityAccentBar,
  createProgressBarStyle,
  createSectionHeaderStyle,
  getCardPadding,
  getHoverTransform,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
} from '../../../helpers';
import type {
  BhTokenManagerProps,
  TokenBalance,
  ConsumptionDataPoint,
  CostBreakdownItem,
  TeamQuota,
  TokenTransaction,
  AlertConfig,
  ForecastPoint,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

/* ------------------------------------------------------------------ */
/*  Helper: format large numbers with K/M suffix                      */
/* ------------------------------------------------------------------ */
function formatTokenCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

/* ------------------------------------------------------------------ */
/*  Helper: format currency                                           */
/* ------------------------------------------------------------------ */
function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

/* ------------------------------------------------------------------ */
/*  Helper: area chart polyline points from data array                */
/* ------------------------------------------------------------------ */
function areaChartPoints(data: ConsumptionDataPoint[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const amounts = data.map((d) => d.amount);
  const max = Math.max(...amounts);
  const min = Math.min(...amounts);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  return data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((d.amount - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

function areaChartPolygon(data: ConsumptionDataPoint[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const line = areaChartPoints(data, width, height, padding);
  const amounts = data.map((d) => d.amount);
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  const lastX = padding + (data.length - 1) * stepX;
  return `${padding},${height - padding} ${line} ${lastX},${height - padding}`;
}

/* ------------------------------------------------------------------ */
/*  Helper: donut chart SVG arc path                                  */
/* ------------------------------------------------------------------ */
function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
}

/* ------------------------------------------------------------------ */
/*  Helper: forecast line points                                      */
/* ------------------------------------------------------------------ */
function forecastLinePoints(data: ForecastPoint[], width: number, height: number, padding: number, key: 'projected' | 'confidenceLow' | 'confidenceHigh'): string {
  if (!data.length) return '';
  const values = data.map((d) => Math.max(d.projected, d.confidenceHigh));
  const allMin = Math.min(...data.map((d) => d.confidenceLow));
  const allMax = Math.max(...values);
  const range = allMax - allMin || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  return data
    .map((d, i) => {
      const x = padding + i * stepX;
      const val = d[key];
      const y = height - padding - ((val - allMin) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

function confidenceBandPolygon(data: ForecastPoint[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const allMin = Math.min(...data.map((d) => d.confidenceLow));
  const allMax = Math.max(...data.map((d) => d.confidenceHigh));
  const range = allMax - allMin || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);

  const topPoints = data.map((d, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((d.confidenceHigh - allMin) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const bottomPoints = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((d.confidenceLow - allMin) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .reverse();

  return [...topPoints, ...bottomPoints].join(' ');
}

/* ------------------------------------------------------------------ */
/*  Helper: trend arrow symbol                                        */
/* ------------------------------------------------------------------ */
function trendArrow(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '\u2191';
    case 'down':
      return '\u2193';
    case 'stable':
      return '\u2192';
  }
}

/* ------------------------------------------------------------------ */
/*  Overview Preset                                                   */
/* ------------------------------------------------------------------ */
export const OverviewBhTokenManager = createPreset<BhTokenManagerProps>({
  name: 'BhTokenManager.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhTokenManagerProps>) => {
    const { Box, Text } = primitives;

    const {
      balance,
      consumptionData = [],
      costBreakdown = [],
      teamQuotas = [],
      transactions = [],
      alerts = [],
      forecast = [],
      timeRange: controlledTimeRange,
      onTimeRangeChange,
      costGrouping: controlledCostGrouping,
      onCostGroupingChange,
      selectedTeam: controlledSelectedTeam,
      onTeamSelect,
      showQuotaModal: controlledShowQuotaModal,
      onQuotaModalToggle,
      transactionFilter: controlledTransactionFilter,
      onTransactionFilterChange,
      forecastPeriod: controlledForecastPeriod,
      onForecastPeriodChange,
      onTopUp,
      onAlertConfigChange,
      className,
      style,
    } = props;

    const [localTimeRange, setLocalTimeRange] = useState<'7d' | '30d' | '90d' | 'year'>('30d');
    const [localCostGrouping, setLocalCostGrouping] = useState<'provider' | 'operation' | 'team'>('provider');
    const [localSelectedTeam, setLocalSelectedTeam] = useState<string | null>(null);
    const [localShowQuotaModal, setLocalShowQuotaModal] = useState(false);
    const [localTransactionFilter, setLocalTransactionFilter] = useState<'all' | 'usage' | 'purchase' | 'credit'>('all');
    const [localForecastPeriod, setLocalForecastPeriod] = useState<'30d' | '60d' | '90d'>('30d');

    const timeRange = controlledTimeRange ?? localTimeRange;
    const costGrouping = controlledCostGrouping ?? localCostGrouping;
    const selectedTeam = controlledSelectedTeam !== undefined ? controlledSelectedTeam : localSelectedTeam;
    const showQuotaModal = controlledShowQuotaModal ?? localShowQuotaModal;
    const transactionFilter = controlledTransactionFilter ?? localTransactionFilter;
    const forecastPeriod = controlledForecastPeriod ?? localForecastPeriod;

    const handleTimeRange = (range: '7d' | '30d' | '90d' | 'year') => {
      setLocalTimeRange(range);
      onTimeRangeChange?.(range);
    };

    const handleCostGrouping = (grouping: 'provider' | 'operation' | 'team') => {
      setLocalCostGrouping(grouping);
      onCostGroupingChange?.(grouping);
    };

    const handleTeamSelect = (teamId: string | null) => {
      setLocalSelectedTeam(teamId);
      onTeamSelect?.(teamId);
    };

    const handleQuotaModal = (show: boolean) => {
      setLocalShowQuotaModal(show);
      onQuotaModalToggle?.(show);
    };

    const handleTransactionFilter = (filter: 'all' | 'usage' | 'purchase' | 'credit') => {
      setLocalTransactionFilter(filter);
      onTransactionFilterChange?.(filter);
    };

    const handleForecastPeriod = (period: '30d' | '60d' | '90d') => {
      setLocalForecastPeriod(period);
      onForecastPeriodChange?.(period);
    };

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens, { color: tokens.colors.primaryScale[500] }), [tokens]);

    const filteredTransactions = useMemo(() => {
      if (transactionFilter === 'all') return transactions;
      return transactions.filter((t) => t.type === transactionFilter);
    }, [transactions, transactionFilter]);

    const totalCost = useMemo(() => {
      return costBreakdown.reduce((sum, item) => sum + item.amount, 0);
    }, [costBreakdown]);

    /* ---------- Trend color ---------- */
    const trendColor = (trend: 'up' | 'down' | 'stable') => {
      switch (trend) {
        case 'up':
          return tokens.colors.errorScale[500];
        case 'down':
          return tokens.colors.successScale[500];
        case 'stable':
          return tokens.colors.neutral[500];
      }
    };

    /* ---------- Transaction type badge ---------- */
    const txTypeBadge = (type: 'usage' | 'purchase' | 'credit') => {
      switch (type) {
        case 'usage':
          return createBadgeStyle(tokens, 'warning');
        case 'purchase':
          return createBadgeStyle(tokens, 'success');
        case 'credit':
          return createBadgeStyle(tokens, 'info');
      }
    };

    /* ---------- Runway status color ---------- */
    const runwayColor = (days: number) => {
      if (days < 7) return tokens.colors.errorScale[500];
      if (days < 30) return tokens.colors.warningScale[500];
      return tokens.colors.successScale[500];
    };

    /* ---------- Quota percentage color ---------- */
    const quotaColor = (used: number, limit: number) => {
      const pct = limit > 0 ? used / limit : 0;
      if (pct >= 0.9) return tokens.colors.errorScale[500];
      if (pct >= 0.7) return tokens.colors.warningScale[500];
      return tokens.colors.primaryScale[500];
    };

    /* ---------- Alert type label ---------- */
    const alertLabel = (type: AlertConfig['type']) => {
      switch (type) {
        case 'low_balance':
          return 'Low Balance';
        case 'high_usage':
          return 'High Usage';
        case 'quota_exceeded':
          return 'Quota Exceeded';
      }
    };

    const alertBadgeColor = (type: AlertConfig['type']): 'error' | 'warning' | 'info' => {
      switch (type) {
        case 'low_balance':
          return 'error';
        case 'high_usage':
          return 'warning';
        case 'quota_exceeded':
          return 'info';
      }
    };

    /* ---------- Chart dimensions ---------- */
    const chartWidth = 560;
    const chartHeight = 200;
    const chartPadding = 24;
    const donutSize = 180;
    const donutRadius = 70;
    const donutStroke = 24;
    const forecastWidth = 560;
    const forecastHeight = 180;

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          width: '100%',
          gap: tokens.spacing[6],
          padding: tokens.spacing[6],
          minHeight: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* ========== BALANCE HERO ========== */}
        <Box
          style={{
            ...cardBase,
            padding: tokens.spacing[6],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap' as const,
            gap: tokens.spacing[4],
            background: isGlass
              ? tokens.glass?.bg
              : `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.common.white})`,
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
            <Text style={{ ...sectionHeader, marginBottom: 0 }}>Token Balance</Text>
            <Box style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[2] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['3xl'] || '1.875rem',
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: 1.2,
                }}
              >
                {balance ? formatTokenCount(balance.balance) : '0'}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                tokens
              </Text>
            </Box>
            {balance && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginTop: tokens.spacing[1] }}>
                <Box
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.neutral[100],
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                  }}
                >
                  <Text style={{ color: trendColor(balance.trend), fontWeight: tokens.typography.fontWeight.semibold }}>
                    {trendArrow(balance.trend)}
                  </Text>
                  {formatTokenCount(balance.burnRatePerDay)}/day
                </Box>
              </Box>
            )}
          </Box>

          {/* Runway badge */}
          {balance && (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.lg,
                backgroundColor: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                minWidth: 120,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'] || '1.5rem',
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: runwayColor(balance.projectedRunwayDays),
                }}
              >
                {balance.projectedRunwayDays}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                days runway
              </Text>
            </Box>
          )}

          {/* Top-up button */}
          <Box
            onClick={onTopUp}
            style={{
              ...hoverStyle,
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              border: 'none',
            }}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, { backgroundColor: tokens.colors.primaryScale[700] })}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { backgroundColor: tokens.colors.primaryScale[600] })}
          >
            + Top Up Tokens
          </Box>
        </Box>

        {/* ========== TIME RANGE SELECTOR ========== */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          {(['7d', '30d', '90d', 'year'] as const).map((range) => (
            <Box
              key={range}
              onClick={() => handleTimeRange(range)}
              style={{
                ...hoverStyle,
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: timeRange === range ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                backgroundColor: timeRange === range ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: timeRange === range ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${timeRange === range ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
              }}
            >
              {range === 'year' ? '1Y' : range.toUpperCase()}
            </Box>
          ))}
        </Box>

        {/* ========== CONSUMPTION CHART ========== */}
        <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
          <Text style={{ ...sectionHeader }}>Token Consumption</Text>
          {consumptionData.length > 0 ? (
            <Box style={{ width: '100%', overflowX: 'auto' as const }}>
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                style={{ width: '100%', maxWidth: chartWidth, height: 'auto' }}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="consumptionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tokens.colors.primaryScale[400]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={tokens.colors.primaryScale[400]} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = chartPadding + pct * (chartHeight - chartPadding * 2);
                  return (
                    <line
                      key={i}
                      x1={chartPadding}
                      y1={y}
                      x2={chartWidth - chartPadding}
                      y2={y}
                      stroke={tokens.colors.neutral[100]}
                      strokeWidth={1}
                    />
                  );
                })}
                {/* Area fill */}
                <polygon
                  points={areaChartPolygon(consumptionData, chartWidth, chartHeight, chartPadding)}
                  fill="url(#consumptionGrad)"
                />
                {/* Line */}
                <polyline
                  points={areaChartPoints(consumptionData, chartWidth, chartHeight, chartPadding)}
                  fill="none"
                  stroke={tokens.colors.primaryScale[500]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {consumptionData.map((d, i) => {
                  const amounts = consumptionData.map((p) => p.amount);
                  const max = Math.max(...amounts);
                  const min = Math.min(...amounts);
                  const range = max - min || 1;
                  const stepX = (chartWidth - chartPadding * 2) / (consumptionData.length - 1 || 1);
                  const x = chartPadding + i * stepX;
                  const y = chartHeight - chartPadding - ((d.amount - min) / range) * (chartHeight - chartPadding * 2);
                  return (
                    <g key={d.date}>
                      <circle
                        cx={x}
                        cy={y}
                        r={3}
                        fill={tokens.colors.common.white}
                        stroke={tokens.colors.primaryScale[500]}
                        strokeWidth={2}
                      />
                      <title>{`${d.date}: ${formatTokenCount(d.amount)} tokens`}</title>
                    </g>
                  );
                })}
                {/* X-axis labels */}
                {consumptionData.length > 0 &&
                  consumptionData
                    .filter((_, i) => i % Math.max(1, Math.floor(consumptionData.length / 6)) === 0)
                    .map((d, i) => {
                      const idx = consumptionData.indexOf(d);
                      const stepX = (chartWidth - chartPadding * 2) / (consumptionData.length - 1 || 1);
                      const x = chartPadding + idx * stepX;
                      return (
                        <text
                          key={d.date}
                          x={x}
                          y={chartHeight - 4}
                          textAnchor="middle"
                          fontSize={tokens.typography.fontSize.xs}
                          fill={tokens.colors.neutral[400]}
                        >
                          {d.date.slice(5)}
                        </text>
                      );
                    })}
              </svg>
            </Box>
          ) : (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 120,
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
              }}
            >
              No consumption data available
            </Box>
          )}
        </Box>

        {/* ========== TWO-COLUMN: COST BREAKDOWN + QUOTA MANAGEMENT ========== */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[6] }}>
          {/* ---- Cost Breakdown Donut ---- */}
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>Cost Breakdown</Text>
              <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                {(['provider', 'operation', 'team'] as const).map((grp) => (
                  <Box
                    key={grp}
                    onClick={() => handleCostGrouping(grp)}
                    style={{
                      ...hoverStyle,
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: costGrouping === grp ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                      backgroundColor: costGrouping === grp ? tokens.colors.primaryScale[50] : 'transparent',
                      color: costGrouping === grp ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                    }}
                  >
                    {grp.charAt(0).toUpperCase() + grp.slice(1)}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
              {/* Donut SVG */}
              <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`}>
                {costBreakdown.length > 0 ? (
                  (() => {
                    let startAngle = 0;
                    return costBreakdown.map((item, i) => {
                      const sweep = (item.percentage / 100) * 360;
                      const endAngle = startAngle + sweep;
                      const path = describeArc(donutSize / 2, donutSize / 2, donutRadius, startAngle, endAngle - 0.5);
                      startAngle = endAngle;
                      return (
                        <path
                          key={item.category}
                          d={path}
                          fill="none"
                          stroke={item.color}
                          strokeWidth={donutStroke}
                          strokeLinecap="butt"
                        >
                          <title>{`${item.category}: ${formatCurrency(item.amount)} (${item.percentage}%)`}</title>
                        </path>
                      );
                    });
                  })()
                ) : (
                  <circle
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={donutRadius}
                    fill="none"
                    stroke={tokens.colors.neutral[100]}
                    strokeWidth={donutStroke}
                  />
                )}
                {/* Center text */}
                <text
                  x={donutSize / 2}
                  y={donutSize / 2 - 6}
                  textAnchor="middle"
                  fontSize={tokens.typography.fontSize.lg}
                  fontWeight={tokens.typography.fontWeight.bold}
                  fill={tokens.colors.neutral[900]}
                >
                  {formatCurrency(totalCost)}
                </text>
                <text
                  x={donutSize / 2}
                  y={donutSize / 2 + 12}
                  textAnchor="middle"
                  fontSize={tokens.typography.fontSize.xs}
                  fill={tokens.colors.neutral[400]}
                >
                  Total
                </text>
              </svg>

              {/* Legend */}
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2], flex: 1 }}>
                {costBreakdown.map((item) => (
                  <Box key={item.category} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        flex: 1,
                      }}
                    >
                      {item.category}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                      }}
                    >
                      {item.percentage}%
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* ---- Quota Management ---- */}
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>Team Quotas</Text>
              <Box
                onClick={() => handleQuotaModal(true)}
                style={{
                  ...hoverStyle,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.primaryScale[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Edit Quotas
              </Box>
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              {teamQuotas.map((team) => {
                const pct = team.limit > 0 ? Math.min((team.used / team.limit) * 100, 100) : 0;
                const barColor = quotaColor(team.used, team.limit);
                return (
                  <Box
                    key={team.teamId}
                    onClick={() => handleTeamSelect(selectedTeam === team.teamId ? null : team.teamId)}
                    style={{
                      ...hoverStyle,
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: selectedTeam === team.teamId ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${selectedTeam === team.teamId ? tokens.colors.primaryScale[200] : tokens.colors.neutral[100]}`,
                    }}
                  >
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                        {team.teamName}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {formatTokenCount(team.used)} / {formatTokenCount(team.limit)}
                      </Text>
                    </Box>
                    {/* Progress bar */}
                    <Box
                      style={{
                        width: '100%',
                        height: 6,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.neutral[100],
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: barColor,
                          transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
              {teamQuotas.length === 0 && (
                <Box style={{ textAlign: 'center' as const, padding: tokens.spacing[4], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                  No team quotas configured
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* ========== TRANSACTION HISTORY ========== */}
        <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
            <Text style={{ ...sectionHeader, marginBottom: 0 }}>Transaction History</Text>
            <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
              {(['all', 'usage', 'purchase', 'credit'] as const).map((f) => (
                <Box
                  key={f}
                  onClick={() => handleTransactionFilter(f)}
                  style={{
                    ...hoverStyle,
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: transactionFilter === f ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    backgroundColor: transactionFilter === f ? tokens.colors.primaryScale[50] : 'transparent',
                    color: transactionFilter === f ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Box>
              ))}
            </Box>
          </Box>

          <Box style={{ overflowX: 'auto' as const, maxHeight: 320, overflowY: 'auto' as const }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse' as const,
                fontSize: tokens.typography.fontSize.sm,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    position: 'sticky' as const,
                    top: 0,
                    backgroundColor: tokens.colors.common.white,
                    zIndex: 1,
                  }}
                >
                  {['Date', 'Type', 'Amount', 'Provider', 'Team', 'Cost', 'Balance'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        textAlign: 'left' as const,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        fontSize: tokens.typography.fontSize.xs,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tokens.colors.neutral[50])}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[600] }}>
                      {tx.date}
                    </td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                      <Text style={txTypeBadge(tx.type)}>
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </Text>
                    </td>
                    <td
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tx.type === 'usage' ? tokens.colors.errorScale[600] : tokens.colors.successScale[600],
                      }}
                    >
                      {tx.type === 'usage' ? '-' : '+'}{formatTokenCount(tx.amount)}
                    </td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[600] }}>
                      {tx.provider || '\u2014'}
                    </td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[600] }}>
                      {tx.team || '\u2014'}
                    </td>
                    <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[700] }}>
                      {formatCurrency(tx.cost)}
                    </td>
                    <td
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
                      }}
                    >
                      {formatTokenCount(tx.runningBalance)}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: tokens.spacing[6],
                        textAlign: 'center' as const,
                        color: tokens.colors.neutral[400],
                        fontSize: tokens.typography.fontSize.sm,
                      }}
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Box>

        {/* ========== TWO-COLUMN: ALERTS CONFIG + FORECAST ========== */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[6] }}>
          {/* ---- Alerts Configuration ---- */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Alert Configuration</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              {alerts.map((alert) => (
                <Box
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: alert.enabled ? tokens.colors.neutral[50] : 'transparent',
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    opacity: alert.enabled ? 1 : 0.6,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {/* Toggle switch */}
                  <Box
                    onClick={() => onAlertConfigChange?.(alert.id, { enabled: !alert.enabled })}
                    style={{
                      ...hoverStyle,
                      width: 36,
                      height: 20,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: alert.enabled ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                      position: 'relative' as const,
                      flexShrink: 0,
                      transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                    }}
                  >
                    <Box
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.common.white,
                        position: 'absolute' as const,
                        top: 2,
                        left: alert.enabled ? 18 : 2,
                        transition: `left ${tokens.transitions?.normal || tokens.motion.hover}`,
                        boxShadow: tokens.shadows.sm,
                      }}
                    />
                  </Box>

                  <Box style={{ flex: 1 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Text style={createBadgeStyle(tokens, alertBadgeColor(alert.type))}>
                        {alertLabel(alert.type)}
                      </Text>
                    </Box>
                  </Box>

                  {/* Threshold value */}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                      Threshold:
                    </Text>
                    <Text style={{ fontWeight: tokens.typography.fontWeight.semibold }}>
                      {alert.type === 'low_balance'
                        ? formatTokenCount(alert.threshold)
                        : `${alert.threshold}%`}
                    </Text>
                  </Box>
                </Box>
              ))}
              {alerts.length === 0 && (
                <Box style={{ textAlign: 'center' as const, padding: tokens.spacing[4], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                  No alerts configured
                </Box>
              )}
            </Box>
          </Box>

          {/* ---- Usage Forecast ---- */}
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>Usage Forecast</Text>
              <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                {(['30d', '60d', '90d'] as const).map((p) => (
                  <Box
                    key={p}
                    onClick={() => handleForecastPeriod(p)}
                    style={{
                      ...hoverStyle,
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: forecastPeriod === p ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                      backgroundColor: forecastPeriod === p ? tokens.colors.primaryScale[50] : 'transparent',
                      color: forecastPeriod === p ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                    }}
                  >
                    {p.toUpperCase()}
                  </Box>
                ))}
              </Box>
            </Box>

            {forecast.length > 0 ? (
              <svg
                viewBox={`0 0 ${forecastWidth} ${forecastHeight}`}
                style={{ width: '100%', maxWidth: forecastWidth, height: 'auto' }}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tokens.colors.warningScale[300]} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={tokens.colors.warningScale[300]} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = chartPadding + pct * (forecastHeight - chartPadding * 2);
                  return (
                    <line
                      key={i}
                      x1={chartPadding}
                      y1={y}
                      x2={forecastWidth - chartPadding}
                      y2={y}
                      stroke={tokens.colors.neutral[100]}
                      strokeWidth={1}
                    />
                  );
                })}
                {/* Confidence band */}
                <polygon
                  points={confidenceBandPolygon(forecast, forecastWidth, forecastHeight, chartPadding)}
                  fill="url(#confidenceGrad)"
                />
                {/* Confidence high line (dashed) */}
                <polyline
                  points={forecastLinePoints(forecast, forecastWidth, forecastHeight, chartPadding, 'confidenceHigh')}
                  fill="none"
                  stroke={tokens.colors.warningScale[300]}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                {/* Confidence low line (dashed) */}
                <polyline
                  points={forecastLinePoints(forecast, forecastWidth, forecastHeight, chartPadding, 'confidenceLow')}
                  fill="none"
                  stroke={tokens.colors.warningScale[300]}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                {/* Projected line (solid) */}
                <polyline
                  points={forecastLinePoints(forecast, forecastWidth, forecastHeight, chartPadding, 'projected')}
                  fill="none"
                  stroke={tokens.colors.primaryScale[500]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Projected data points */}
                {forecast.map((d, i) => {
                  const allMin = Math.min(...forecast.map((f) => f.confidenceLow));
                  const allMax = Math.max(...forecast.map((f) => f.confidenceHigh));
                  const range = allMax - allMin || 1;
                  const stepX = (forecastWidth - chartPadding * 2) / (forecast.length - 1 || 1);
                  const x = chartPadding + i * stepX;
                  const y = forecastHeight - chartPadding - ((d.projected - allMin) / range) * (forecastHeight - chartPadding * 2);
                  return (
                    <g key={d.date}>
                      <circle
                        cx={x}
                        cy={y}
                        r={3}
                        fill={tokens.colors.common.white}
                        stroke={tokens.colors.primaryScale[500]}
                        strokeWidth={2}
                      />
                      <title>{`${d.date}: ${formatTokenCount(d.projected)} (${formatTokenCount(d.confidenceLow)}-${formatTokenCount(d.confidenceHigh)})`}</title>
                    </g>
                  );
                })}
                {/* X-axis labels */}
                {forecast
                  .filter((_, i) => i % Math.max(1, Math.floor(forecast.length / 5)) === 0)
                  .map((d) => {
                    const idx = forecast.indexOf(d);
                    const stepX = (forecastWidth - chartPadding * 2) / (forecast.length - 1 || 1);
                    const x = chartPadding + idx * stepX;
                    return (
                      <text
                        key={d.date}
                        x={x}
                        y={forecastHeight - 4}
                        textAnchor="middle"
                        fontSize={tokens.typography.fontSize.xs}
                        fill={tokens.colors.neutral[400]}
                      >
                        {d.date.slice(5)}
                      </text>
                    );
                  })}
              </svg>
            ) : (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 120,
                  color: tokens.colors.neutral[400],
                  fontSize: tokens.typography.fontSize.sm,
                }}
              >
                No forecast data available
              </Box>
            )}
          </Box>
        </Box>

        {/* ========== TOP-UP PREMIUM CARD ========== */}
        <Box
          style={{
            ...cardInteractive,
            padding: tokens.spacing[5],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isGlass
              ? tokens.glass?.bg
              : `linear-gradient(135deg, ${tokens.colors.primaryScale[600]}, ${tokens.colors.secondaryScale ? tokens.colors.secondaryScale[600] : tokens.colors.primaryScale[800]})`,
            border: 'none',
          }}
          onClick={onTopUp}
          onMouseEnter={(e: React.MouseEvent<HTMLElement>) => Object.assign(e.currentTarget.style, hoverTransform)}
          onMouseLeave={(e: React.MouseEvent<HTMLElement>) => Object.assign(e.currentTarget.style, { transform: 'none' })}
        >
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.common.white,
              }}
            >
              Need More Tokens?
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.overlay?.white,
              }}
            >
              Purchase additional tokens to keep your AI interviews running smoothly.
            </Text>
          </Box>
          <Box
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.primaryScale[700],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.bold,
              flexShrink: 0,
            }}
          >
            Purchase Tokens
          </Box>
        </Box>

        {/* ========== QUOTA MODAL OVERLAY ========== */}
        {showQuotaModal && (
          <Box
            style={{
              position: 'fixed' as const,
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tokens.overlay?.medium,
            }}
            onClick={() => handleQuotaModal(false)}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              style={{
                ...cardBase,
                padding: tokens.spacing[6],
                minWidth: 400,
                maxWidth: 560,
                width: '90%',
                backgroundColor: tokens.colors.common.white,
                maxHeight: '80vh',
                overflowY: 'auto' as const,
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  Edit Team Quotas
                </Text>
                <Box
                  onClick={() => handleQuotaModal(false)}
                  style={{
                    ...hoverStyle,
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.lg,
                    color: tokens.colors.neutral[500],
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tokens.colors.neutral[100])}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  \u00D7
                </Box>
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                {teamQuotas.map((team) => {
                  const pct = team.limit > 0 ? Math.min((team.used / team.limit) * 100, 100) : 0;
                  return (
                    <Box
                      key={team.teamId}
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      }}
                    >
                      <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                        <Text style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], fontSize: tokens.typography.fontSize.sm }}>
                          {team.teamName}
                        </Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          {pct.toFixed(0)}% used
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], flexShrink: 0 }}>
                          Limit:
                        </Text>
                        <Box
                          style={{
                            flex: 1,
                            height: 32,
                            borderRadius: tokens.borderRadius.md,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                            display: 'flex',
                            alignItems: 'center',
                            padding: `0 ${tokens.spacing[2]}px`,
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[800],
                            backgroundColor: tokens.colors.neutral[50],
                          }}
                        >
                          {formatTokenCount(team.limit)}
                        </Box>
                      </Box>
                      {/* Usage bar */}
                      <Box
                        style={{
                          width: '100%',
                          height: 4,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.neutral[100],
                          overflow: 'hidden',
                          marginTop: tokens.spacing[2],
                        }}
                      >
                        <Box
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: quotaColor(team.used, team.limit),
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
