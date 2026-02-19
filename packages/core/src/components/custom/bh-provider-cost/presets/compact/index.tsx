'use client';

/**
 * BhProviderCost - Compact Preset
 * Widget view with budget ratio, mini progress bar,
 * top 3 providers by cost, and alert count badge.
 */

import { useMemo, useCallback } from 'react';
import { DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
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

  createDividerStyle,
} from '../../../helpers';
import type {
  BhProviderCostProps,
  ProviderCostEntry,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

function formatCompactCurrency(value: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '\u20AC' : currency;
  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(1)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_TOTAL_BUDGET = 15000;

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhProviderCost = createPreset<BhProviderCostProps>({
  name: 'BhProviderCost.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhProviderCostProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      providers: rawProviders = [],
      alerts: rawAlerts = [],
      totalBudget: rawTotalBudget = MOCK_TOTAL_BUDGET,
      totalSpent: rawTotalSpent = 0,
      currency = 'USD',
      onProviderClick,
      loading = false,
      className,
      style,
    } = props;

    const providers = Array.isArray(rawProviders) ? rawProviders : [];
    const alerts = Array.isArray(rawAlerts) ? rawAlerts : [];
    const totalBudget = Array.isArray(rawTotalBudget) ? rawTotalBudget : MOCK_TOTAL_BUDGET;
    const totalSpent = Array.isArray(rawTotalSpent) ? rawTotalSpent : 0;

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const chartCfg = useMemo(() => getChartConfig(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    const handleProviderClick = useCallback((provider: string) => {
      onProviderClick?.(provider);
    }, [onProviderClick]);

    const budgetPct = useMemo(() => {
      if (totalBudget <= 0) return 0;
      return Math.min(100, (totalSpent / totalBudget) * 100);
    }, [totalSpent, totalBudget]);

    const top3 = useMemo(() => {
      return [...providers].sort((a, b) => b.totalCost - a.totalCost).slice(0, 3);
    }, [providers]);

    const maxTop3Cost = useMemo(() => {
      return Math.max(...top3.map(p => p.totalCost), 1);
    }, [top3]);

    const activeAlertCount = useMemo(() => {
      return alerts.length;
    }, [alerts]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[6], ...style }}>
          <Loader2 size={18} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[2] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardBase, padding: 0, ...style }}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[2],
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
        }}>
          <DollarSign size={14} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>
            Cost
          </Text>
          <Box style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            {/* Total spent / budget ratio */}
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.semibold }}>
              {formatCompactCurrency(totalSpent, currency)}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              / {formatCompactCurrency(totalBudget, currency)}
            </Text>
            {/* Alert count badge */}
            {activeAlertCount > 0 && (
              <Box style={{
                ...createBadgeStyle(t, 'error'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                padding: `0px ${t.spacing[1]}px`,
                minWidth: 18,
                justifyContent: 'center',
              }}>
                <AlertTriangle size={9} />
                <Text style={{ fontSize: 9, fontWeight: t.typography.fontWeight.bold }}>
                  {activeAlertCount}
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Mini budget progress bar */}
        <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px` }}>
          <Box style={{
            height: 6,
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
          <Text style={{ fontSize: 9, color: t.colors.neutral[400], marginTop: t.spacing[1], display: 'block' }}>
            {budgetPct.toFixed(0)}% of budget used
          </Text>
        </Box>

        {/* Top 3 providers */}
        {top3.length === 0 ? (
          <Box style={{ ...emptyState, padding: t.spacing[4] }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No data</Text>
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
            {top3.map((entry, index) => {
              const barPct = (entry.totalCost / maxTop3Cost) * 100;
              return (
                <Box
                  key={`${entry.provider}-${entry.model}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${entry.provider}: ${formatCurrency(entry.totalCost, currency)}`}
                  onClick={() => handleProviderClick(entry.provider)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleProviderClick(entry.provider); } }}
                  style={{
                    ...animStyle(index),
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[3],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderBottom: index < top3.length - 1
                      ? `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`
                      : 'none',
                    cursor: 'pointer',
                    transition: `background-color ${t.motion.hover}`,
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.backgroundColor = t.colors.neutral[50];
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Provider name */}
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                    width: 70,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {entry.provider}
                  </Text>

                  {/* Inline cost bar */}
                  <Box style={{ flex: 1, minWidth: 40 }}>
                    <Box style={{
                      height: 8,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.neutral[100],
                      overflow: 'hidden',
                    }}>
                      <Box style={{
                        height: '100%',
                        width: `${barPct}%`,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.primaryScale[400],
                        transition: `width ${chartCfg.animationDuration}ms ease`,
                      }} />
                    </Box>
                  </Box>

                  {/* Cost value */}
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.semibold,
                    color: t.colors.neutral[700],
                    flexShrink: 0,
                    minWidth: 50,
                    textAlign: 'right' as const,
                  }}>
                    {formatCompactCurrency(entry.totalCost, currency)}
                  </Text>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
