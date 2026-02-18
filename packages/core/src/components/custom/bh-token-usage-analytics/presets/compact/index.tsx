'use client';

/**
 * BhTokenUsageAnalytics - Compact Preset
 * Compact widget with total usage / budget progress bar,
 * mini sparkline for trend, and top categories.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  Zap,
  DollarSign,
  Target,
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

function formatCurrency(n: number): string {
  return `$${n.toFixed(2)}`;
}

function sparkPoints(data: number[], w: number, h: number, pad = 2): string {
  if (data.length < 2) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  return data.map((v, i) => `${pad + i * step},${h - pad - ((v - min) / range) * (h - pad * 2)}`).join(' ');
}

function sparkArea(data: number[], w: number, h: number, pad = 2): string {
  if (data.length < 2) return '';
  const pts = sparkPoints(data, w, h, pad);
  const lastX = pad + (data.length - 1) * ((w - pad * 2) / (data.length - 1));
  return `${pad},${h - pad} ${pts} ${lastX},${h - pad}`;
}

function getCategoryColors(t: DesignTokens): string[] {
  return [
    t.colors.primaryScale[500],
    t.colors.successScale[500],
    t.colors.warningScale[500],
    t.colors.errorScale[500],
    t.colors.infoScale[500],
    t.colors.secondaryScale[500],
  ];
}

/* ================================================================== */
/*  Preset                                                             */
/* ================================================================== */
export const CompactBhTokenUsageAnalytics = createPreset<BhTokenUsageAnalyticsProps>({
  name: 'BhTokenUsageAnalytics.Compact',
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
      title = 'Token Usage',
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

    /* -- Styles -------------------------------------------------------- */
    const isGlass = t.surface.useGlass && !!t.glass;
    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
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

    const trendData = useMemo(() => usage.map(p => p.tokens), [usage]);
    const trendDirection = useMemo(() => {
      if (trendData.length < 2) return 'flat';
      return trendData[trendData.length - 1] > trendData[trendData.length - 2] ? 'up' : 'down';
    }, [trendData]);

    const topCategories = useMemo(() => {
      return [...categories].sort((a, b) => b.percentage - a.percentage).slice(0, 4);
    }, [categories]);

    /* -- Loading -------------------------------------------------------- */
    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[8], ...style }}>
          <Loader2 size={20} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[2] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
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
          ...card,
          width: '100%',
          display: 'flex',
          flexDirection: 'column' as const,
          gap: t.spacing[4],
          ...glassStyle,
          ...entrance.animate,
          transition: entrance.transition,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={{
              ...createIconContainerStyle(t, { size: 32, color: t.colors.primaryScale[50] }),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Coins size={16} color={t.colors.primaryScale[600]} />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: typo.headingWeight,
              color: t.colors.neutral[900],
              letterSpacing: typo.headingLetterSpacing,
            }}>
              {title}
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, trendDirection === 'up' ? 'warning' : 'success'),
            borderRadius: badgeRadius,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <TrendingUp size={10} style={trendDirection === 'down' ? { transform: 'scaleY(-1)' } : undefined} />
            <Text style={{ fontSize: t.typography.fontSize.xs }}>
              {trendDirection === 'up' ? 'Rising' : 'Stable'}
            </Text>
          </Box>
        </Box>

        {/* Token count + cost */}
        <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[3] }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
              {formatTokens(totalTokens)}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginLeft: t.spacing[1] }}>
              tokens
            </Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            <DollarSign size={12} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600] }}>
              {formatCurrency(totalCost)}
            </Text>
          </Box>
        </Box>

        {/* Budget progress bar */}
        {budget && budget > 0 && (() => {
          const bar = createProgressBarStyle(t, {
            color: budgetPct >= 90 ? t.colors.errorScale[500] : budgetPct >= 70 ? t.colors.warningScale[500] : t.colors.successScale[500],
            percent: budgetPct,
          });
          return (
            <Box>
              <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Budget</Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                  {budgetPct.toFixed(0)}% used
                </Text>
              </Box>
              <Box style={{ ...bar.track, height: 6 }}>
                <Box style={bar.fill} />
              </Box>
            </Box>
          );
        })()}

        {/* Mini sparkline */}
        {trendData.length >= 2 && (
          <Box>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[500],
              marginBottom: t.spacing[2],
              fontWeight: t.typography.fontWeight.medium,
              textTransform: typo.labelTransform,
              letterSpacing: typo.labelLetterSpacing,
            }}>
              Trend
            </Text>
            <svg width="100%" height={40} viewBox="0 0 200 40" preserveAspectRatio="none" role="img" aria-label="Token usage trend">
              <defs>
                <linearGradient id="tua-c-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.colors.primaryScale[400]} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={t.colors.primaryScale[400]} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={sparkArea(trendData, 200, 40)} fill="url(#tua-c-grad)" />
              <polyline points={sparkPoints(trendData, 200, 40)} fill="none" stroke={t.colors.primaryScale[500]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
        )}

        {/* Granularity indicator */}
        {granularity && (
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Granularity:</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], textTransform: 'capitalize' as const }}>
              {granularity}
            </Text>
          </Box>
        )}

        {/* Top providers */}
        {topProviders && topProviders.length > 0 && (
          <Box>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[500],
              marginBottom: t.spacing[2],
              fontWeight: t.typography.fontWeight.medium,
              textTransform: typo.labelTransform,
              letterSpacing: typo.labelLetterSpacing,
            }}>
              Top Providers
            </Text>
            {topProviders.slice(0, 3).map((provider, idx) => (
              <Box key={provider.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1],
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: categoryColors[idx % categoryColors.length], flexShrink: 0 }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>{provider.name}</Text>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600] }}>
                  {formatTokens(provider.tokens)}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        {/* Top categories */}
        <Box>
          <Text style={{
            fontSize: t.typography.fontSize.xs,
            color: t.colors.neutral[500],
            marginBottom: t.spacing[2],
            fontWeight: t.typography.fontWeight.medium,
            textTransform: typo.labelTransform,
            letterSpacing: typo.labelLetterSpacing,
          }}>
            Top Categories
          </Text>
          {topCategories.map((cat, idx) => {
            const barColor = categoryColors[idx % categoryColors.length];
            const bar = createProgressBarStyle(t, { color: barColor, percent: cat.percentage });
            const itemEntrance = createEntranceAnimation(t, { index: idx });
            return (
              <Box key={cat.category} style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2],
                ...itemEntrance.animate,
              }}>
                <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: barColor, flexShrink: 0 }} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], width: 100, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                  {cat.category}
                </Text>
                <Box style={{ flex: 1 }}>
                  <Box style={{ ...bar.track, height: 4 }}>
                    <Box style={bar.fill} />
                  </Box>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], width: 30, textAlign: 'right' as const, flexShrink: 0 }}>
                  {cat.percentage}%
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
