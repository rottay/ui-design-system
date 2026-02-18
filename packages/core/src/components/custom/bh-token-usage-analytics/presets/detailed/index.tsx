'use client';

/**
 * BhTokenUsageAnalytics - Detailed Preset
 * Full dashboard with area chart showing token consumption over time,
 * donut chart showing usage by category, stats cards, and category
 * breakdown table. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  PieChart,
  BarChart3,
  Calendar,
  DollarSign,
  Zap,
  Target,
  ArrowUpDown,
  Loader2,
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
  createProgressBarStyle,
} from '../../../helpers';
import type {
  BhTokenUsageAnalyticsProps,
  TokenUsagePoint,
  TokenCategory,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatCurrency(n: number, currency = 'USD'): string {
  return `$${n.toFixed(2)}`;
}

function getCategoryColors(t: DesignTokens): string[] {
  return [
    t.colors.primaryScale[500],
    t.colors.successScale[500],
    t.colors.warningScale[500],
    t.colors.errorScale[500],
    t.colors.infoScale[500],
    t.colors.secondaryScale[500],
    t.colors.primaryScale[700],
    t.colors.successScale[700],
  ];
}

/* ================================================================== */
/*  Preset                                                             */
/* ================================================================== */
export const DetailedBhTokenUsageAnalytics = createPreset<BhTokenUsageAnalyticsProps>({
  name: 'BhTokenUsageAnalytics.Detailed',
  render: ({ primitives, props, tokens }: PresetContext<BhTokenUsageAnalyticsProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      usageData: usageProp,
      categories: catProp,
      totalTokens: totalProp,
      totalCost: costProp,
      budget,
      currency = 'USD',
      title = 'Token Usage Analytics',
      onDateRangeChange,
      loading = false,
      granularity,
      topProviders,
      className,
      style,
    } = props;

    const usage = usageProp?.length ? usageProp : [];
    const categories = catProp?.length ? catProp : [];
    const totalTokens = totalProp ?? usage.reduce((s, p) => s + p.tokens, 0);
    const totalCost = costProp ?? usage.reduce((s, p) => s + p.cost, 0);

    const [dateRange, setDateRange] = useState('30d');

    const handleRangeChange = useCallback((range: string) => {
      setDateRange(range);
      onDateRangeChange?.(range);
    }, [onDateRangeChange]);

    /* -- Styles -------------------------------------------------------- */
    const isGlass = t.surface.useGlass && !!t.glass;
    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const categoryColors = useMemo(() => getCategoryColors(t), [t]);

    const glassStyle = useMemo(() => {
      if (isGlass && t.glass) {
        return { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur };
      }
      return {};
    }, [t, isGlass]);

    /* -- Computed ------------------------------------------------------- */
    const budgetPct = useMemo(() => {
      if (!budget || budget <= 0) return 0;
      return Math.min(100, (totalCost / budget) * 100);
    }, [totalCost, budget]);

    const dailyAvg = useMemo(() => {
      if (usage.length === 0) return 0;
      return Math.round(totalTokens / usage.length);
    }, [totalTokens, usage.length]);

    const maxTokens = useMemo(() => Math.max(...usage.map(p => p.tokens), 1), [usage]);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    /* -- Chart helpers -------------------------------------------------- */
    const chartW = 600;
    const chartH = 200;
    const chartPad = 4;

    const areaPoints = useMemo(() => {
      if (usage.length < 2) return { line: '', area: '' };
      const step = (chartW - chartPad * 2) / (usage.length - 1);
      const pts = usage.map((p, i) => {
        const x = chartPad + i * step;
        const y = chartH - chartPad - (p.tokens / maxTokens) * (chartH - chartPad * 2);
        return `${x},${y}`;
      });
      const lastX = chartPad + (usage.length - 1) * step;
      return {
        line: pts.join(' '),
        area: `${chartPad},${chartH - chartPad} ${pts.join(' ')} ${lastX},${chartH - chartPad}`,
      };
    }, [usage, maxTokens]);

    /* -- Loading -------------------------------------------------------- */
    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[10], ...style }}>
          <Loader2 size={24} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[3] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading token data...</Text>
        </Box>
      );
    }

    /* ================================================================== */
    return (
      <Box
        className={className}
        role="region"
        aria-label={title}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          width: '100%',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...entrance.animate,
          transition: entrance.transition,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...glassStyle,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
                <Coins size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: typo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: typo.headingLetterSpacing,
                }}>
                  {title}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  Token consumption and cost breakdown
                </Text>
              </Box>
            </Box>
            {/* Granularity + Date range selector */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            {granularity && (
              <Box style={{
                ...createBadgeStyle(t, 'secondary'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, textTransform: 'capitalize' as const }}>{granularity}</Text>
              </Box>
            )}
            <Box style={{ display: 'flex', gap: t.spacing[1] }} role="radiogroup" aria-label="Date range">
              {[
                { label: '7d', value: '7d' },
                { label: '30d', value: '30d' },
                { label: '90d', value: '90d' },
              ].map(opt => (
                <Box
                  key={opt.value}
                  onClick={() => handleRangeChange(opt.value)}
                  role="radio"
                  aria-checked={dateRange === opt.value}
                  tabIndex={0}
                  style={{
                    padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                    borderRadius: badgeRadius,
                    cursor: 'pointer',
                    backgroundColor: dateRange === opt.value ? t.colors.primaryScale[600] : t.colors.neutral[100],
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: dateRange === opt.value ? t.colors.common.white : t.colors.neutral[600],
                    fontWeight: t.typography.fontWeight.medium,
                  }}>
                    {opt.label}
                  </Text>
                </Box>
              ))}
            </Box>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>

          {/* Stats Cards */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4], marginBottom: t.spacing[6] }}>
            {[
              { label: 'Total Tokens', value: formatTokens(totalTokens), icon: Zap, color: t.colors.primaryScale[600], scale: 'primaryScale' },
              { label: 'Total Cost', value: formatCurrency(totalCost, currency), icon: DollarSign, color: t.colors.successScale[600], scale: 'successScale' },
              { label: 'Daily Average', value: formatTokens(dailyAvg), icon: TrendingUp, color: t.colors.infoScale[600], scale: 'infoScale' },
              { label: budget ? 'Budget Used' : 'Categories', value: budget ? `${budgetPct.toFixed(0)}%` : String(categories.length), icon: budget ? Target : PieChart, color: t.colors.warningScale[600], scale: 'warningScale' },
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              const s = (t.colors as any)[kpi.scale];
              return (
                <Box key={kpi.label} style={{ ...card, ...hoverStyles.base, ...animStyle(i) }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                    <Box style={{
                      ...createIconContainerStyle(t, { size: 36, color: s[50] }),
                      color: s[600],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} />
                    </Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.neutral[500],
                      textTransform: typo.labelTransform,
                      letterSpacing: typo.labelLetterSpacing,
                    }}>
                      {kpi.label}
                    </Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                    {kpi.value}
                  </Text>
                </Box>
              );
            })}
          </Box>

          {/* Budget Progress (if budget provided) */}
          {budget && budget > 0 && (
            <Box style={{ ...card, ...animStyle(4), marginBottom: t.spacing[6] }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                <Text style={{ ...sectionLabel, marginBottom: 0 }}>Budget Usage</Text>
                <Box style={{
                  ...createBadgeStyle(t, budgetPct >= 90 ? 'error' : budgetPct >= 70 ? 'warning' : 'success'),
                  borderRadius: badgeRadius,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>
                    {formatCurrency(totalCost, currency)} / {formatCurrency(budget, currency)}
                  </Text>
                </Box>
              </Box>
              {(() => {
                const bar = createProgressBarStyle(t, {
                  color: budgetPct >= 90 ? t.colors.errorScale[500] : budgetPct >= 70 ? t.colors.warningScale[500] : t.colors.successScale[500],
                  percent: budgetPct,
                });
                return (
                  <Box style={{ ...bar.track, height: 10 }}>
                    <Box style={bar.fill} />
                  </Box>
                );
              })()}
            </Box>
          )}

          {/* Two-column: Area Chart + Donut */}
          <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: t.spacing[5], marginBottom: t.spacing[6] }}>

            {/* Area Chart */}
            <Box style={{ ...card, ...animStyle(5) }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <BarChart3 size={15} color={t.colors.primaryScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                  Token Consumption Over Time
                </Text>
              </Box>
              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" role="img" aria-label="Token consumption area chart">
                  <defs>
                    <linearGradient id="tua-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={t.colors.primaryScale[400]} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={t.colors.primaryScale[400]} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                    const y = chartPad + (1 - pct) * (chartH - chartPad * 2);
                    return (
                      <line key={pct} x1={chartPad} y1={y} x2={chartW - chartPad} y2={y} stroke={t.colors.neutral[100]} strokeWidth={1} />
                    );
                  })}
                  {/* Area */}
                  {areaPoints.area && (
                    <polygon points={areaPoints.area} fill="url(#tua-grad)" />
                  )}
                  {/* Line */}
                  {areaPoints.line && (
                    <polyline points={areaPoints.line} fill="none" stroke={t.colors.primaryScale[500]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {/* Data points */}
                  {usage.map((p, i) => {
                    const step = (chartW - chartPad * 2) / (usage.length - 1);
                    const x = chartPad + i * step;
                    const y = chartH - chartPad - (p.tokens / maxTokens) * (chartH - chartPad * 2);
                    return (
                      <circle key={i} cx={x} cy={y} r={3} fill={t.colors.common.white} stroke={t.colors.primaryScale[500]} strokeWidth={2} />
                    );
                  })}
                </svg>
              </Box>
              {/* X-axis labels */}
              <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: t.spacing[2], paddingLeft: chartPad, paddingRight: chartPad }}>
                {usage.map((p, i) => (
                  <Text key={i} style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {p.date.slice(5)}
                  </Text>
                ))}
              </Box>
            </Box>

            {/* Donut Chart */}
            <Box style={{ ...card, ...animStyle(6) }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <PieChart size={15} color={t.colors.primaryScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                  Usage by Category
                </Text>
              </Box>
              <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: t.spacing[4] }}>
                <svg width={160} height={160} viewBox="0 0 160 160" role="img" aria-label="Token usage by category">
                  {(() => {
                    let cumulative = 0;
                    const totalPct = categories.reduce((s, c) => s + c.percentage, 0) || 1;
                    return categories.map((cat, idx) => {
                      const pct = cat.percentage / totalPct;
                      const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
                      cumulative += pct;
                      const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
                      const largeArc = pct > 0.5 ? 1 : 0;
                      const x1 = 80 + 60 * Math.cos(startAngle);
                      const y1 = 80 + 60 * Math.sin(startAngle);
                      const x2 = 80 + 60 * Math.cos(endAngle);
                      const y2 = 80 + 60 * Math.sin(endAngle);
                      return (
                        <path
                          key={cat.category}
                          d={`M 80 80 L ${x1} ${y1} A 60 60 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={categoryColors[idx % categoryColors.length]}
                          opacity={0.8}
                          stroke={t.colors.common.white}
                          strokeWidth={2}
                        />
                      );
                    });
                  })()}
                  <circle cx={80} cy={80} r={32} fill={t.colors.common.white} />
                  <text x={80} y={76} textAnchor="middle" fontSize={14} fontWeight={700} fill={t.colors.neutral[900]}>
                    {formatTokens(totalTokens)}
                  </text>
                  <text x={80} y={92} textAnchor="middle" fontSize={10} fill={t.colors.neutral[400]}>
                    tokens
                  </text>
                </svg>
              </Box>
              {/* Legend */}
              {categories.map((cat, idx) => (
                <Box key={cat.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: categoryColors[idx % categoryColors.length], flexShrink: 0 }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{cat.category}</Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                    {cat.percentage}%
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Category Breakdown Table */}
          <Box style={{ ...card, padding: 0, overflow: 'hidden', ...animStyle(7) }} role="table" aria-label="Category breakdown">
            <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[5]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                Category Breakdown
              </Text>
            </Box>
            {/* Table header */}
            <Box role="row" style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 2fr',
              gap: t.spacing[3],
              padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
              borderBottom: `1px solid ${t.colors.neutral[200]}`,
              backgroundColor: t.colors.neutral[50],
            }}>
              {['Category', 'Tokens', 'Share', 'Usage'].map(col => (
                <Text key={col} style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.neutral[500],
                  textTransform: typo.labelTransform,
                  letterSpacing: typo.labelLetterSpacing,
                }}>
                  {col}
                </Text>
              ))}
            </Box>
            {/* Table rows */}
            {categories.map((cat, idx) => {
              const barColor = categoryColors[idx % categoryColors.length];
              const bar = createProgressBarStyle(t, { color: barColor, percent: cat.percentage });
              return (
                <Box key={cat.category} role="row" aria-label={`${cat.category}: ${formatTokens(cat.tokens)} tokens, ${cat.percentage}%`} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 2fr',
                  gap: t.spacing[3],
                  padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  alignItems: 'center',
                  transition: `background-color ${t.motion.hover}`,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: barColor, flexShrink: 0 }} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                      {cat.category}
                    </Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                    {formatTokens(cat.tokens)}
                  </Text>
                  <Box style={{
                    display: 'inline-flex',
                    padding: `2px ${t.spacing[2]}px`,
                    borderRadius: badgeRadius,
                    backgroundColor: t.colors.neutral[100],
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                      {cat.percentage}%
                    </Text>
                  </Box>
                  <Box style={{ ...bar.track, height: 6 }}>
                    <Box style={bar.fill} />
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Top Providers */}
          {topProviders && topProviders.length > 0 && (
            <Box style={{ ...card, ...animStyle(8), marginTop: t.spacing[6] }} role="region" aria-label="Top AI providers">
              <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[5]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                  Top AI Providers
                </Text>
              </Box>
              {topProviders.map((provider, idx) => (
                <Box key={provider.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{
                      width: 8,
                      height: 8,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: categoryColors[idx % categoryColors.length],
                      flexShrink: 0,
                    }} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                      {provider.name}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                      {formatTokens(provider.tokens)}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      {formatCurrency(provider.cost, currency)}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
