'use client';

/**
 * BhPipelineStatsBar - Compact Preset
 * Single row summary with key stats, inline conversion indicators,
 * and bottleneck warning. Designed for dashboard headers.
 */

import { useMemo, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Clock, AlertTriangle,
  Users, Briefcase, ArrowRight, Activity,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  formatDistanceToNow,
  createPersonalitySectionHeaderStyle,
  getAccentAwareLayout,

  createDividerStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type {
  BhPipelineStatsBarProps,
  StageConversion,
  TrendDirection,
  TimeToHireMetric,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getTrendIcon(trend: TrendDirection) {
  switch (trend) {
    case 'up': return TrendingUp;
    case 'down': return TrendingDown;
    case 'flat': return Minus;
  }
}

function getTrendColor(trend: TrendDirection, t: DesignTokens, invertForTime = false): string {
  if (invertForTime) {
    switch (trend) {
      case 'up': return t.colors.errorScale[500];
      case 'down': return t.colors.successScale[500];
      case 'flat': return t.colors.neutral[400];
    }
  }
  switch (trend) {
    case 'up': return t.colors.successScale[500];
    case 'down': return t.colors.errorScale[500];
    case 'flat': return t.colors.neutral[400];
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_BOTTLENECK = 'Assessment';
const MOCK_TOTAL = 362;
const MOCK_ACTIVE_JOBS = 12;

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhPipelineStatsBar = createPreset<BhPipelineStatsBarProps>({
  name: 'BhPipelineStatsBar.Compact',
  render: (ctx: PresetContext<BhPipelineStatsBarProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      conversionRates: rawConversionRates = [],
      avgTimeToHire: rawAvgTimeToHire = {} as Partial<TimeToHireMetric>,
      bottleneckStage: rawBottleneckStage = MOCK_BOTTLENECK,
      totalCandidates = MOCK_TOTAL,
      activeJobs: rawActiveJobs = MOCK_ACTIVE_JOBS,
      onConversionClick,
      onBottleneckClick,
      className,
      style,
    } = props;

    const conversionRates = Array.isArray(rawConversionRates) ? rawConversionRates : [] as StageConversion[];
    const avgTimeToHire = (Array.isArray(rawAvgTimeToHire) ? rawAvgTimeToHire : rawAvgTimeToHire ?? {}) as Partial<TimeToHireMetric>;
    const bottleneckStage = (Array.isArray(rawBottleneckStage) ? rawBottleneckStage : rawBottleneckStage ?? MOCK_BOTTLENECK) as string;
    const activeJobs = (Array.isArray(rawActiveJobs) ? rawActiveJobs : rawActiveJobs ?? MOCK_ACTIVE_JOBS) as number;

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleBottleneckClick = useCallback(() => {
      if (bottleneckStage) onBottleneckClick?.(bottleneckStage);
    }, [onBottleneckClick, bottleneckStage]);

    const overallConversion = useMemo(() => {
      if (conversionRates.length === 0) return 0;
      const product = conversionRates.reduce((acc, c) => acc * ((c.rate ?? 0) / 100), 1);
      return Math.round(product * 100);
    }, [conversionRates]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const tthTrend = avgTimeToHire?.trend ?? 'flat';
    const TrendIcon = getTrendIcon(tthTrend);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[1],
          flexWrap: 'wrap',
        }}>
          {/* Total Candidates */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            flex: '1 1 auto',
            minWidth: 120,
          }} role="status" aria-label={`Total candidates: ${totalCandidates}`}>
            <Users size={16} color={t.colors.primaryScale[500]} />
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block', lineHeight: 1 }}>
                {totalCandidates}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Candidates
              </Text>
            </Box>
          </Box>

          {/* Divider */}
          <Box style={{ width: 1, height: 32, backgroundColor: t.colors.neutral[100], flexShrink: 0 }} />

          {/* Active Jobs */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            flex: '1 1 auto',
            minWidth: 100,
          }} role="status" aria-label={`Active jobs: ${activeJobs}`}>
            <Briefcase size={16} color={t.colors.infoScale[500]} />
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block', lineHeight: 1 }}>
                {activeJobs}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Jobs
              </Text>
            </Box>
          </Box>

          <Box style={{ width: 1, height: 32, backgroundColor: t.colors.neutral[100], flexShrink: 0 }} />

          {/* Overall Conversion */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            flex: '1 1 auto',
            minWidth: 100,
          }} role="status" aria-label={`Overall conversion: ${overallConversion}%`}>
            <Activity size={16} color={t.colors.successScale[500]} />
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block', lineHeight: 1 }}>
                {overallConversion}%
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Conversion
              </Text>
            </Box>
          </Box>

          <Box style={{ width: 1, height: 32, backgroundColor: t.colors.neutral[100], flexShrink: 0 }} />

          {/* Time to Hire */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            flex: '1 1 auto',
            minWidth: 120,
          }} role="status" aria-label={`Average time to hire: ${avgTimeToHire?.days ?? 0} days`}>
            <Clock size={16} color={t.colors.warningScale[500]} />
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], lineHeight: 1 }}>
                  {avgTimeToHire?.days ?? 0}d
                </Text>
                <TrendIcon size={12} color={getTrendColor(tthTrend, t, true)} />
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Time to Hire
              </Text>
            </Box>
          </Box>

          <Box style={{ width: 1, height: 32, backgroundColor: t.colors.neutral[100], flexShrink: 0 }} />

          {/* Inline conversion flow */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[1],
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            flex: '2 1 auto',
            minWidth: 200,
            overflow: 'auto',
          }} role="list" aria-label="Stage conversion rates">
            {conversionRates.map((conv, i) => (
              <Box
                key={`${conv.fromStage}-${conv.toStage}`}
                style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}
                role="listitem"
              >
                {i > 0 && <ArrowRight size={10} color={t.colors.neutral[300]} />}
                <Box style={{
                  ...createBadgeStyle(t, (conv.rate ?? 0) >= 50 ? 'success' : (conv.rate ?? 0) >= 30 ? 'warning' : 'error'),
                  borderRadius: badgeRadius,
                  padding: `1px ${t.spacing[1]}px`,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{conv.rate}%</Text>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Bottleneck warning */}
          {bottleneckStage && (
            <>
              <Box style={{ width: 1, height: 32, backgroundColor: t.colors.neutral[100], flexShrink: 0 }} />
              <Box
                tabIndex={0}
                role="button"
                aria-label={`Bottleneck at ${bottleneckStage}`}
                onClick={handleBottleneckClick}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBottleneckClick(); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Box style={{
                  width: 8,
                  height: 8,
                  borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.errorScale[400],
                  animation: 'pulse 2s ease-in-out infinite',
                  flexShrink: 0,
                }} />
                <Box style={{
                  ...createBadgeStyle(t, 'error'),
                  borderRadius: badgeRadius,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: t.spacing[1],
                }}>
                  <AlertTriangle size={10} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{bottleneckStage}</Text>
                </Box>
              </Box>
            </>
          )}
        </Box>
        </Box>
      </Box>
    );
  },
});
