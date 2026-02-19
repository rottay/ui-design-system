'use client';

/**
 * BhSprintVelocity - Chart Preset
 * Stacked bar chart showing planned vs completed vs carry-over per sprint.
 * Personality-driven, glass-aware. Only uses Box and Text primitives.
 */

import { useState, useMemo, useCallback} from 'react';
import {
  BarChart3, TrendingUp, Zap, AlertTriangle, Activity,
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
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getChartConfig,
  getAccentAwareLayout,

  createDividerStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhSprintVelocityProps, SprintVelocityData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Chart Preset                                                       */
/* ================================================================== */

export const ChartBhSprintVelocity = createPreset<BhSprintVelocityProps>({
  name: 'BhSprintVelocity.Chart',
  render: (ctx: PresetContext<BhSprintVelocityProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass && !!t.glass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const chartCfg = getChartConfig(t);

    const {
      sprints: rawSprints = [],
      averageVelocity,
      activeSprint,
      title = 'Sprint Velocity',
      onSprintClick,
      revenueCurrency = 'USD',
      loading = false,
      className,
      style,
    } = props;

    const sprints = Array.isArray(rawSprints) ? rawSprints : [];

    const [hoveredBar, setHoveredBar] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleSprintClick = useCallback((name: string) => {
      onSprintClick?.(name);
    }, [onSprintClick]);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    const avgVel = useMemo(() => {
      if (averageVelocity !== undefined) return averageVelocity;
      if ((sprints ?? []).length === 0) return 0;
      return Math.round((sprints ?? []).reduce((sum, s) => sum + (s.completed ?? 0), 0) / (sprints ?? []).length);
    }, [averageVelocity, sprints]);

    const maxPlanned = useMemo(() => Math.max(...(sprints ?? []).map(s => s.planned ?? 0), 1), [sprints]);
    const totalCompleted = useMemo(() => (sprints ?? []).reduce((s, d) => s + (d.completed ?? 0), 0), [sprints]);
    const totalCarryOver = useMemo(() => (sprints ?? []).reduce((s, d) => s + (d.carryOver ?? 0), 0), [sprints]);

    /* SVG bar chart */
    const chartWidth = 560;
    const chartHeight = 260;
    const padding = { top: 20, right: 20, bottom: 50, left: 45 };
    const plotW = chartWidth - padding.left - padding.right;
    const plotH = chartHeight - padding.top - padding.bottom;
    const barGroupWidth = useMemo(() => sprints.length > 0 ? plotW / sprints.length : plotW, [sprints, plotW]);
    const barW = useMemo(() => Math.min(barGroupWidth * 0.6, 40), [barGroupWidth]);
    const gap = useMemo(() => (barGroupWidth - barW) / 2, [barGroupWidth, barW]);

    if (loading) {
      return (
        <Box className={className} style={{ ...card, ...animStyle(0), ...accentLayout.outer,
          ...style }}>
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
        aria-label={title}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: t.spacing[5],
          ...style,
        }}
      >
        {/* Header Card */}
        <Box style={{ ...card, ...animStyle(0) }}>
          {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
                <BarChart3 size={20} color={t.colors.primaryScale[600]} />
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
                  {sprints.length} sprints
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Stats Row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: t.spacing[3],
          }}>
            {[
              { label: 'Avg Velocity', value: avgVel, icon: Zap, scale: t.colors.primaryScale },
              { label: 'Total Completed', value: totalCompleted, icon: TrendingUp, scale: t.colors.successScale },
              { label: 'Total Carry-Over', value: totalCarryOver, icon: AlertTriangle, scale: t.colors.warningScale },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Box key={stat.label} role="status" aria-label={`${stat.label}: ${stat.value}`} style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[3],
                  padding: t.spacing[3],
                  borderRadius: t.borderRadius.md,
                  backgroundColor: t.colors.neutral[50],
                }}>
                  <Box style={createIconContainerStyle(t, { size: 32, color: stat.scale[50] })}>
                    <Icon size={14} color={stat.scale[600]} />
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
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
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Active Sprint Info */}
        {activeSprint && (
          <Box style={{ ...card, ...animStyle(1) }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
              <Zap size={14} color={t.colors.primaryScale[500]} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                Active Sprint
              </Text>
            </Box>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[3] }}>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Name</Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
                  {activeSprint.name ?? 'Current Sprint'}
                </Text>
              </Box>
              {activeSprint.positionTarget !== undefined && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Position Target</Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
                    {activeSprint.positionTarget}
                  </Text>
                </Box>
              )}
              {activeSprint.revenueTarget !== undefined && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Revenue Target</Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[600] }}>
                    {revenueCurrency} {Number(activeSprint.revenueTarget).toLocaleString()}
                  </Text>
                </Box>
              )}
              {activeSprint.completionPercentage !== undefined && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Completion</Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[600] }}>
                    {Number(activeSprint.completionPercentage).toFixed(0)}%
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Chart Card */}
        <Box style={{ ...card, ...animStyle(2) }}>
          <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Velocity per Sprint</Text>

          {sprints.length === 0 ? (
            <Box style={createEmptyStateStyle(t)}>
              <BarChart3 size={32} color={t.colors.neutral[300]} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400], marginTop: t.spacing[2] }}>
                No sprint data available
              </Text>
            </Box>
          ) : (
            <Box style={{ width: '100%', overflow: 'hidden' }}>
              <svg
                width="100%"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                role="img"
                aria-label={`Bar chart of sprint velocity across ${sprints.length} sprints`}
                style={{ display: 'block' }}
              >
                {/* Y-axis grid */}
                {Array.from({ length: 5 }, (_, i) => {
                  const val = Math.round((maxPlanned / 4) * i);
                  const y = padding.top + plotH - (val / maxPlanned) * plotH;
                  return (
                    <g key={i}>
                      <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke={t.colors.neutral[100]} strokeDasharray="4 4" />
                      <text x={padding.left - 8} y={y + 4} textAnchor="end" fill={t.colors.neutral[400]} fontSize={10}>{val}</text>
                    </g>
                  );
                })}

                {/* Average velocity line */}
                {avgVel > 0 && (
                  <line
                    x1={padding.left}
                    y1={padding.top + plotH - (avgVel / maxPlanned) * plotH}
                    x2={chartWidth - padding.right}
                    y2={padding.top + plotH - (avgVel / maxPlanned) * plotH}
                    stroke={t.colors.primaryScale[300]}
                    strokeWidth={1}
                    strokeDasharray="6 3"
                  />
                )}

                {/* Bars */}
                {sprints.map((sprint, i) => {
                  const x = padding.left + i * barGroupWidth + gap;
                  const completedH = ((sprint.completed ?? 0) / maxPlanned) * plotH;
                  const carryH = ((sprint.carryOver ?? 0) / maxPlanned) * plotH;
                  const isHovered = hoveredBar === sprint.sprintName;
                  const completedY = padding.top + plotH - completedH;
                  const carryY = completedY - carryH;

                  return (
                    <g key={sprint.sprintName}>
                      {/* Completed bar */}
                      <rect
                        x={x}
                        y={completedY}
                        width={barW}
                        height={completedH}
                        rx={3}
                        fill={isHovered ? t.colors.successScale[500] : t.colors.successScale[400]}
                        style={{
                          transition: `fill ${t.motion.hover}, height ${chartCfg.animationDuration}ms ease, y ${chartCfg.animationDuration}ms ease`,
                          cursor: onSprintClick ? 'pointer' : 'default',
                        }}
                        onMouseEnter={() => setHoveredBar((sprint.sprintName ?? null))}
                        onMouseLeave={() => setHoveredBar(null)}
                        onClick={() => handleSprintClick((sprint.sprintName ?? ''))}
                      />

                      {/* Carry-over bar */}
                      {(sprint.carryOver ?? 0) > 0 && (
                        <rect
                          x={x}
                          y={carryY}
                          width={barW}
                          height={carryH}
                          rx={3}
                          fill={isHovered ? t.colors.warningScale[400] : t.colors.warningScale[300]}
                          style={{
                            transition: `fill ${t.motion.hover}, height ${chartCfg.animationDuration}ms ease, y ${chartCfg.animationDuration}ms ease`,
                            cursor: onSprintClick ? 'pointer' : 'default',
                          }}
                          onMouseEnter={() => setHoveredBar((sprint.sprintName ?? null))}
                          onMouseLeave={() => setHoveredBar(null)}
                          onClick={() => handleSprintClick((sprint.sprintName ?? ''))}
                        />
                      )}

                      {/* Planned line marker */}
                      <line
                        x1={x - 3}
                        y1={padding.top + plotH - ((sprint.planned ?? 0) / maxPlanned) * plotH}
                        x2={x + barW + 3}
                        y2={padding.top + plotH - ((sprint.planned ?? 0) / maxPlanned) * plotH}
                        stroke={t.colors.neutral[500]}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />

                      {/* X label */}
                      <text
                        x={x + barW / 2}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        fill={isHovered ? t.colors.neutral[800] : t.colors.neutral[500]}
                        fontSize={10}
                        fontWeight={isHovered ? 600 : 400}
                      >
                        {(sprint.sprintName ?? '').replace('Sprint ', 'S')}
                      </text>

                      {/* Value label on hover */}
                      {isHovered && (
                        <text
                          x={x + barW / 2}
                          y={completedY - 8}
                          textAnchor="middle"
                          fill={t.colors.neutral[800]}
                          fontSize={11}
                          fontWeight={600}
                        >
                          {sprint.completed}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <Box style={{ display: 'flex', gap: t.spacing[4], justifyContent: 'center', marginTop: t.spacing[3] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Box style={{ width: 12, height: 12, borderRadius: t.borderRadius.sm, backgroundColor: t.colors.successScale[400] }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Completed</Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Box style={{ width: 12, height: 12, borderRadius: t.borderRadius.sm, backgroundColor: t.colors.warningScale[300] }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Carry-Over</Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Box style={{ width: 12, height: 2, backgroundColor: t.colors.neutral[500], borderRadius: t.borderRadius.full }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Planned</Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Box style={{ width: 16, height: 1, backgroundColor: t.colors.primaryScale[300], borderRadius: t.borderRadius.full }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Avg ({avgVel})</Text>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
        </Box>
      </Box>
    );
  },
});
