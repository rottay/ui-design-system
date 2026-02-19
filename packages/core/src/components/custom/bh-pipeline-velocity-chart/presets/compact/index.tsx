'use client';

/**
 * BhPipelineVelocityChart - Compact Preset
 * Sparkline version of the velocity chart for sidebar/widget placement.
 * Personality-driven, glass-aware.
 */

import { useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Activity,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhPipelineVelocityChartProps,
  VelocityDataPoint,
  VelocityPeriod,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

function generateMockData(): VelocityDataPoint[] {
  const data: VelocityDataPoint[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      count: 5 + Math.floor(Math.random() * 15),
      target: 12,
    });
  }
  return data;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildSparklinePath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhPipelineVelocityChart = createPreset<BhPipelineVelocityChartProps>({
  name: 'BhPipelineVelocityChart.Compact',
  render: (ctx: PresetContext<BhPipelineVelocityChartProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      data: dataProp,
      period = 30,
      showTarget = false,
      showAverage = false,
      metric,
      benchmarkData,
      className,
      style,
    } = props;

    const data = useMemo(() => dataProp ?? [] as VelocityDataPoint[], [dataProp]);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    /* Metrics */
    const metrics = useMemo(() => {
      if (data.length === 0) return null;
      const counts = data.map(d => d.count ?? 0);
      const total = counts.reduce((s, c) => s + c, 0);
      const avg = counts.length > 0 ? total / counts.length : 0;
      const recentAvg = counts.slice(-7).reduce((s, c) => s + c, 0) / Math.min(7, Math.max(counts.length, 1));
      const prevAvg = counts.slice(0, -7).reduce((s, c) => s + c, 0) / Math.max(1, counts.length - 7);
      const trend = recentAvg >= prevAvg ? 'up' : 'down';
      const trendPct = prevAvg > 0 ? Math.abs(((recentAvg - prevAvg) / prevAvg) * 100) : 0;
      return { total, avg, trend, trendPct, todayCount: counts[counts.length - 1] ?? 0 };
    }, [data]);

    /* Sparkline points */
    const sparkWidth = 160;
    const sparkHeight = 40;
    const sparkPoints = useMemo(() => {
      if (data.length < 2) return [];
      const counts = data.map(d => d.count ?? 0);
      const maxVal = Math.max(...counts, 1);
      const minVal = Math.min(...counts, 0);
      const range = maxVal - minVal || 1;
      return counts.map((c, i) => ({
        x: (i / (counts.length - 1)) * sparkWidth,
        y: sparkHeight - ((c - minVal) / range) * (sparkHeight - 4) - 2,
      }));
    }, [data]);

    const sparkPath = useMemo(() => buildSparklinePath(sparkPoints), [sparkPoints]);
    const sparkAreaPath = useMemo(() => {
      if (sparkPoints.length < 2) return '';
      return `${sparkPath} L${sparkPoints[sparkPoints.length - 1].x},${sparkHeight} L${sparkPoints[0].x},${sparkHeight} Z`;
    }, [sparkPath, sparkPoints]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const trendColor = useMemo(() => {
      if (!metrics) return t.colors.neutral[500];
      return metrics.trend === 'up' ? t.colors.successScale[600] : t.colors.errorScale[600];
    }, [metrics, t]);

    const trendBg = useMemo(() => {
      if (!metrics) return t.colors.neutral[50];
      return metrics.trend === 'up' ? t.colors.successScale[50] : t.colors.errorScale[50];
    }, [metrics, t]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <TrendingUp size={14} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[700],
              textTransform: ptypo.labelTransform,
              letterSpacing: ptypo.labelLetterSpacing,
            }}>
              Velocity
            </Text>
          </Box>
          {metrics && (
            <Box style={{
              ...createBadgeStyle(t, metrics.trend === 'up' ? 'success' : 'error'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
              gap: 2,
            }}>
              {metrics.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{metrics.trendPct.toFixed(1)}%</Text>
            </Box>
          )}
        </Box>

        {/* Metric + benchmark indicators */}
        {(metric || (benchmarkData && benchmarkData.length > 0)) && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            padding: `0 ${t.spacing[4]}px ${t.spacing[1]}px`,
          }}>
            {metric && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: 'capitalize' as const }}>
                Metric: {metric}
              </Text>
            )}
            {benchmarkData && benchmarkData.length > 0 && (
              <Box style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: `1px ${t.spacing[2]}px`,
                borderRadius: badgeRadius,
                backgroundColor: t.colors.infoScale[50],
              }}>
                <Box style={{ width: 8, height: 1, backgroundColor: t.colors.infoScale[400] }} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.infoScale[600] }}>Benchmark</Text>
              </Box>
            )}
          </Box>
        )}

        {/* Main value + sparkline */}
        <Box style={{
          padding: `0 ${t.spacing[4]}px ${t.spacing[2]}px`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: t.spacing[3],
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{
              fontSize: t.typography.fontSize['2xl'],
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.neutral[900],
              display: 'block',
              lineHeight: 1,
            }}>
              {metrics?.todayCount ?? 0}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginTop: t.spacing[1] }}>
              today
            </Text>
          </Box>

          {/* Sparkline */}
          <Box role="img" aria-label={`Velocity sparkline over ${data.length} days`}>
            <svg
              width={sparkWidth}
              height={sparkHeight}
              viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}
              style={{ display: 'block' }}
            >
              <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.colors.primaryScale[400]} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={t.colors.primaryScale[400]} stopOpacity={0} />
                </linearGradient>
              </defs>
              {sparkAreaPath && (
                <path d={sparkAreaPath} fill="url(#sparkFill)" />
              )}
              {sparkPath && (
                <path
                  d={sparkPath}
                  fill="none"
                  stroke={t.colors.primaryScale[500]}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              )}
              {sparkPoints.length > 0 && (
                <circle
                  cx={sparkPoints[sparkPoints.length - 1].x}
                  cy={sparkPoints[sparkPoints.length - 1].y}
                  r={2.5}
                  fill={t.colors.primaryScale[500]}
                />
              )}
            </svg>
          </Box>
        </Box>

        {/* Bottom stats row */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          borderTop: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          {[
            { label: 'Avg/day', value: metrics ? metrics.avg.toFixed(1) : '-' },
            { label: `${period}d total`, value: metrics ? String(metrics.total) : '-' },
          ].map((s, i) => (
            <Box
              key={s.label}
              style={{
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                textAlign: 'center',
                borderRight: i === 0 ? `1px solid ${t.colors.neutral[100]}` : 'none',
              }}
              role="status"
              aria-label={`${s.label}: ${s.value}`}
            >
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                {s.value}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{s.label}</Text>
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
});
