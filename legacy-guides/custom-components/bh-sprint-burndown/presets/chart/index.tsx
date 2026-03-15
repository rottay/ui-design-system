'use client';

/**
 * BhSprintBurndown - Chart Preset
 * Full burndown chart with actual vs ideal lines, day markers,
 * and sprint progress summary. Personality-driven, glass-aware.
 */

import { useMemo, useCallback} from 'react';
import {
  TrendingDown, Calendar, Target, Activity, Flame, Briefcase,
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
  createPersonalityAccentBar,
  createEmptyStateStyle,
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getChartConfig,
  getAccentAwareLayout,

  createDividerStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhSprintBurndownProps, BurndownDataPoint } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPointsOnTrack(data: BurndownDataPoint[]): boolean {
  if ((data ?? []).length < 2) return true;
  const last = data[data.length - 1];
return (last?.actual ?? 0) <= (last?.ideal ?? 0) * 1.15;
}

function getVelocityStatus(data: BurndownDataPoint[], t: DesignTokens): { label: string; color: string; bg: string } {
  if ((data ?? []).length < 2) return { label: 'No data', color: t.colors.neutral[500], bg: t.colors.neutral[50] };
  const last = data[data.length - 1];
  const ratio = (last?.actual ?? 0) / Math.max(last?.ideal ?? 1, 1);
  if (ratio <= 1) return { label: 'Ahead', color: t.colors.successScale[700], bg: t.colors.successScale[50] };
  if (ratio <= 1.15) return { label: 'On Track', color: t.colors.infoScale[700], bg: t.colors.infoScale[50] };
  if (ratio <= 1.3) return { label: 'Slightly Behind', color: t.colors.warningScale[700], bg: t.colors.warningScale[50] };
  return { label: 'Behind', color: t.colors.errorScale[700], bg: t.colors.errorScale[50] };
}

/* ================================================================== */
/*  Chart Preset                                                       */
/* ================================================================== */

export const ChartBhSprintBurndown = createPreset<BhSprintBurndownProps>({
  name: 'BhSprintBurndown.Chart',
  render: (ctx: PresetContext<BhSprintBurndownProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass && !!t.glass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const chartCfg = getChartConfig(t);

    const {
      data: rawData = [],
      sprintName = 'Sprint 12',
      totalPoints = 40,
      daysTotal = 10,
      daysElapsed = 7,
      title = 'Sprint Burndown',
      positionTarget: positionTargetProp,
      placementTarget: placementTargetProp,
      revenueTarget: revenueTargetProp,
      completionPercentage: completionPercentageProp,
      loading = false,
      className,
      style,
    } = props;

    const data = Array.isArray(rawData) ? rawData : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    const velocity = useMemo(() => getVelocityStatus(data, t), [data, t]);
    const remainingPoints = useMemo(() => {
      if ((data ?? []).length === 0) return totalPoints ?? 0;
      return data[data.length - 1]?.actual ?? 0;
    }, [data, totalPoints]);

    const progress = useMemo(() => createProgressBarStyle(t, {
      percent: ((totalPoints - remainingPoints) / totalPoints) * 100,
    }), [t, totalPoints, remainingPoints]);

    /* SVG Chart */
    const chartWidth = 560;
    const chartHeight = 240;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const plotW = chartWidth - padding.left - padding.right;
    const plotH = chartHeight - padding.top - padding.bottom;

    const maxPoints = useMemo(() => Math.max(totalPoints ?? 0, ...(data ?? []).map(d => Math.max(d.ideal ?? 0, d.actual ?? 0))), [data, totalPoints]);
    const maxDay = useMemo(() => Math.max(daysTotal ?? 0, ...(data ?? []).map(d => d.day ?? 0)), [data, daysTotal]);

    const toX = useCallback((day: number) => padding.left + (day / maxDay) * plotW, [maxDay, plotW]);
    const toY = useCallback((pts: number) => padding.top + (1 - pts / maxPoints) * plotH, [maxPoints, plotH]);

    const idealPath = useMemo(() => {
      if (data.length === 0) return '';
      return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX((d.day ?? 0))} ${toY((d.ideal ?? 0))}`).join(' ');
    }, [data, toX, toY]);

    const actualPath = useMemo(() => {
      if (data.length === 0) return '';
      return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX((d.day ?? 0))} ${toY((d.actual ?? 0))}`).join(' ');
    }, [data, toX, toY]);

    const yTicks = useMemo(() => {
      const count = 5;
      return Array.from({ length: count + 1 }, (_, i) => Math.round((maxPoints / count) * i));
    }, [maxPoints]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    if (loading) {
      return (
        <Box className={className} style={{ ...card, ...animStyle(0), ...style }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[8] }}>
            <Activity size={24} color={t.colors.neutral[300]} style={{ animation: 'pulse 1.5s infinite' }} />
          </Box>
        </Box>
      );
    }

    return (
      <Box
        className={className}
        role="region"
        aria-label={`${title} - ${sprintName}`}
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: t.spacing[5],
          ...style,
        }}
      >
        {/* Header Card */}
        <Box style={{ ...card, ...animStyle(0), ...accentLayout.outer }}>
          {accentBar && <Box style={accentBar} />}
          <Box style={accentLayout.inner}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
                <TrendingDown size={20} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                  display: 'block',
                }}>
                  {title}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                  {sprintName}
                </Text>
              </Box>
            </Box>
            <Box style={{
              ...createBadgeStyle(t, getPointsOnTrack(data) ? 'success' : 'warning'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{velocity.label}</Text>
            </Box>
          </Box>

          {/* Stats Row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: t.spacing[3],
            marginBottom: t.spacing[4],
          }}>
            {[
              { label: 'Total Points', value: totalPoints, icon: Target },
              { label: 'Remaining', value: remainingPoints, icon: Flame },
              { label: 'Days Elapsed', value: `${daysElapsed}/${daysTotal}`, icon: Calendar },
              { label: 'Completed', value: `${Math.round(((totalPoints - remainingPoints) / totalPoints) * 100)}%`, icon: Activity },
            ].map((stat, i) => {
              const Icon = stat.icon;

              return (
                <Box key={stat.label} role="status" aria-label={`${stat.label}: ${stat.value}`} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                  textAlign: 'center',
                  padding: t.spacing[3],
                  borderRadius: t.borderRadius.md,
                  backgroundColor: t.colors.neutral[50],
                }}>
                  <Icon size={14} color={t.colors.neutral[400]} style={{ marginBottom: t.spacing[1] }} />
                  <Text style={{
                    fontSize: t.typography.fontSize.lg,
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.neutral[900],
                    display: 'block',
                  }}>
                    {stat.value}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    {stat.label}
                  </Text>
                </Box>
              );
            })}
          </Box>

          {/* Progress Bar */}
          <Box>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Sprint Progress</Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[700] }}>
                {totalPoints - remainingPoints} / {totalPoints} pts
              </Text>
            </Box>
            <Box style={progress.track}>
              <Box style={progress.fill} />
            </Box>
          </Box>

          {/* Sprint Targets */}
          {(positionTargetProp != null || placementTargetProp != null || revenueTargetProp != null || completionPercentageProp != null) && (
            <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${[positionTargetProp, placementTargetProp, revenueTargetProp, completionPercentageProp].filter(v => v != null).length}, 1fr)`, gap: t.spacing[3], marginTop: t.spacing[4] }}>
              {positionTargetProp != null && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center', padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: t.colors.infoScale[50] }}>
                  <Briefcase size={14} color={t.colors.infoScale[500]} style={{ marginBottom: t.spacing[1] }} />
                  <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>{positionTargetProp}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>Position Target</Text>
                </Box>
              )}
              {placementTargetProp != null && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center', padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: t.colors.successScale[50] }}>
                  <Target size={14} color={t.colors.successScale[500]} style={{ marginBottom: t.spacing[1] }} />
                  <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>{placementTargetProp}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>Placement Target</Text>
                </Box>
              )}
              {revenueTargetProp != null && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center', padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: t.colors.warningScale[50] }}>
                  <TrendingDown size={14} color={t.colors.warningScale[500]} style={{ marginBottom: t.spacing[1] }} />
                  <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>${revenueTargetProp.toLocaleString()}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>Revenue Target</Text>
                </Box>
              )}
              {completionPercentageProp != null && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center', padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: t.colors.primaryScale[50] }}>
                  <Activity size={14} color={t.colors.primaryScale[500]} style={{ marginBottom: t.spacing[1] }} />
                  <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>{completionPercentageProp}%</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>Completion</Text>
                </Box>
              )}
            </Box>
          )}
          </Box>
        </Box>

        {/* Chart Card */}
        <Box style={{ ...card, ...animStyle(1) }}>
          <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Burndown Chart</Text>

          {data.length === 0 ? (
            <Box style={createEmptyStateStyle(t)}>
              <TrendingDown size={32} color={t.colors.neutral[300]} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400], marginTop: t.spacing[2] }}>
                No burndown data available
              </Text>
            </Box>
          ) : (
            <Box style={{ width: '100%', overflow: 'hidden' }}>
              <svg
                width="100%"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                role="img"
                aria-label={`Burndown chart showing ${data.length} data points. ${velocity.label}`}
                style={{ display: 'block' }}
              >
                {/* Grid lines */}
                {yTicks.map(tick => (
                  <g key={tick}>
                    <line
                      x1={padding.left}
                      y1={toY(tick)}
                      x2={chartWidth - padding.right}
                      y2={toY(tick)}
                      stroke={t.colors.neutral[100]}
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 8}
                      y={toY(tick) + 4}
                      textAnchor="end"
                      fill={t.colors.neutral[400]}
                      fontSize={t.typography.fontSize.xs}
                    >
                      {tick}
                    </text>
                  </g>
                ))}

                {/* X-axis labels */}
                {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0 || i === data.length - 1).map(d => (
                  <text
                    key={d.day}
                    x={toX((d.day ?? 0))}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    fill={t.colors.neutral[400]}
                    fontSize={t.typography.fontSize.xs}
                  >
                    Day {d.day}
                  </text>
                ))}

                {/* Ideal line */}
                <path
                  d={idealPath}
                  fill="none"
                  stroke={t.colors.neutral[300]}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  style={{ transition: `d ${chartCfg.animationDuration}ms ease` }}
                />

                {/* Actual line */}
                <path
                  d={actualPath}
                  fill="none"
                  stroke={t.colors.primaryScale[500]}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: `d ${chartCfg.animationDuration}ms ease` }}
                />

                {/* Actual dots */}
                {chartCfg.showDots && data.map(d => (
                  <circle
                    key={d.day}
                    cx={toX((d.day ?? 0))}
                    cy={toY((d.actual ?? 0))}
                    r={3}
                    fill={t.colors.common.white}
                    stroke={t.colors.primaryScale[500]}
                    strokeWidth={2}
                  />
                ))}

                {/* Current day marker */}
                {daysElapsed < maxDay && (
                  <line
                    x1={toX(daysElapsed)}
                    y1={padding.top}
                    x2={toX(daysElapsed)}
                    y2={chartHeight - padding.bottom}
                    stroke={t.colors.warningScale[400]}
                    strokeWidth={1}
                    strokeDasharray="4 3"
                  />
                )}
              </svg>

              {/* Legend */}
              <Box style={{ display: 'flex', gap: t.spacing[4], justifyContent: 'center', marginTop: t.spacing[3] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Box style={{ width: 16, height: 2, backgroundColor: t.colors.neutral[300], borderRadius: t.borderRadius.full }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Ideal</Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Box style={{ width: 16, height: 2, backgroundColor: t.colors.primaryScale[500], borderRadius: t.borderRadius.full }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Actual</Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Box style={{ width: 16, height: 1, backgroundColor: t.colors.warningScale[400], borderRadius: t.borderRadius.full }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Today</Text>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
