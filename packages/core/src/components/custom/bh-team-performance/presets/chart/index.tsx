'use client';

/**
 * BhTeamPerformance - Chart Preset
 * SVG bar chart comparing team performance across a selected metric,
 * with metric toggle pills, hover tooltips, and animated bars.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Star,
  Users,
  Loader2,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
  createEmptyStateStyle,
  createFilterPillStyle,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
} from '../../../helpers';
import type { BhTeamPerformanceProps, TeamPerfData } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const METRIC_OPTIONS = [
  { key: 'hires' as const, label: 'Hires', icon: Users },
  { key: 'timeToFill' as const, label: 'Time to Fill', icon: Clock },
  { key: 'qualityScore' as const, label: 'Quality Score', icon: Star },
  { key: 'satisfaction' as const, label: 'Satisfaction', icon: TrendingUp },
];

/* ------------------------------------------------------------------ */
/*  Chart Preset                                                       */
/* ------------------------------------------------------------------ */
export const ChartBhTeamPerformance = createPreset<BhTeamPerformanceProps>({
  name: 'BhTeamPerformance.Chart',
  render: ({ primitives, props, tokens }: PresetContext<BhTeamPerformanceProps>) => {
    const isGlass = tokens.surface.useGlass;
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      teams: teamsProp,
      metric: controlledMetric,
      title = 'Team Performance',
      onTeamClick,
      loading,
      className,
      style,
    } = props;

    const teams = teamsProp?.length ? teamsProp : [];

    const [internalMetric, setInternalMetric] = useState<'hires' | 'timeToFill' | 'qualityScore' | 'satisfaction'>('hires');
    const activeMetric = controlledMetric ?? internalMetric;

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: t.spacing[6] }), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);

    const handleMetricChange = useCallback((metric: typeof activeMetric) => {
      setInternalMetric(metric);
    }, []);

    const handleTeamClick = useCallback((teamName: string) => {
      onTeamClick?.(teamName);
    }, [onTeamClick]);

    /* -- Chart Data ------------------------------------------------ */
    const values = useMemo(() => teams.map((team, i) => team[activeMetric]), [teams, activeMetric]);
    const maxValue = useMemo(() => Math.max(...values, 1), [values]);

    const barColors = useMemo(() => [
      t.colors.primaryScale[500],
      t.colors.successScale[500],
      t.colors.warningScale[500],
      t.colors.infoScale[500],
      t.colors.secondaryScale[500],
      t.colors.errorScale[500],
    ], [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    /* -- SVG Chart dimensions -------------------------------------- */
    const chartW = 560;
    const chartH = 240;
    const barPad = 16;
    const labelH = 24;
    const yAxisW = 40;
    const usableW = chartW - yAxisW;
    const usableH = chartH - labelH;
    const barW = teams.length > 0 ? Math.max((usableW - barPad * (teams.length + 1)) / teams.length, 20) : 40;

    /* -- Loading --------------------------------------------------- */
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    if (loading) {
      return (
        <Box className={className} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[8], ...style }}>
          <Loader2 size={20} style={{ color: t.colors.primaryScale[500], animation: 'spin 1s linear infinite' }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginLeft: t.spacing[2] }}>Loading performance data...</Text>
        </Box>
      );
    }

    if (teams.length === 0) {
      return (
        <Box className={className} style={{ ...card, ...style }}>
          <Box style={emptyStyle}>
            <Box style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }}>
              <BarChart3 size={40} />
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500] }}>No performance data available</Text>
          </Box>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...card, width: '100%', ...entrance.animate, ...style }}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[5] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={{ color: t.colors.primaryScale[500] }}>
              <BarChart3 size={18} />
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: typo.headingWeight, color: t.colors.neutral[900], letterSpacing: typo.headingLetterSpacing }}>
              {title}
            </Text>
          </Box>
        </Box>

        {/* Metric toggle pills */}
        <Box style={{ display: 'flex', gap: t.spacing[2], marginBottom: t.spacing[5], flexWrap: 'wrap' as const }}>
          {METRIC_OPTIONS.map((opt) => {
            const isActive = activeMetric === opt.key;
            const pillStyle = createFilterPillStyle(t, { active: isActive });
            const IconComp = opt.icon;

            return (
              <Box
                key={opt.key}
                role="button"
                tabIndex={0}
                aria-label={`Show ${opt.label} metric`}
                aria-pressed={isActive}
                onClick={() => handleMetricChange(opt.key)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMetricChange(opt.key); }
                }}
                onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                style={{ ...pillStyle, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}
              >
                <IconComp size={12} />
                <Text style={{ fontSize: 'inherit' }}>{opt.label}</Text>
              </Box>
            );
          })}
        </Box>

        {/* SVG Bar Chart */}
        <Box style={{ overflow: 'auto' }}>
          <svg
            width={chartW}
            height={chartH}
            viewBox={`0 0 ${chartW} ${chartH}`}
            style={{ display: 'block', maxWidth: '100%' }}
          >
            {/* Y-axis grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = usableH - pct * usableH;
              const val = Math.round(pct * maxValue);
              return (
                <g key={pct}>
                  <line
                    x1={yAxisW}
                    y1={y}
                    x2={chartW}
                    y2={y}
                    stroke={t.colors.neutral[100]}
                    strokeWidth={1}
                  />
                  <text
                    x={yAxisW - 6}
                    y={y + 4}
                    textAnchor="end"
                    fill={t.colors.neutral[400]}
                    fontSize={t.typography.fontSize.xs}
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {teams.map((team, idx) => {
              const val = team[activeMetric];
              const barH = maxValue > 0 ? (val / maxValue) * usableH : 0;
              const x = yAxisW + barPad + idx * (barW + barPad);
              const y = usableH - barH;
              const color = barColors[idx % barColors.length];

              return (
                <g
                  key={team.teamName}
                  style={{ ...animStyle(idx), cursor: onTeamClick ? 'pointer' : 'default' }}
                  onClick={() => handleTeamClick(team.teamName)}
                >
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx={4}
                    fill={color}
                    opacity={0.85}
                    style={{ transition: `height ${t.motion.hover}, y ${t.motion.hover}` }}
                  />
                  {/* Value label */}
                  <text
                    x={x + barW / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fill={t.colors.neutral[700]}
                    fontSize={t.typography.fontSize.xs}
                    fontWeight={t.typography.fontWeight.semibold}
                  >
                    {val}
                  </text>
                  {/* Team name label */}
                  <text
                    x={x + barW / 2}
                    y={chartH - 4}
                    textAnchor="middle"
                    fill={t.colors.neutral[500]}
                    fontSize={t.typography.fontSize.xs}
                  >
                    {team.teamName}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>

        {/* Legend */}
        <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[3], marginTop: t.spacing[4] }}>
          {teams.map((team, idx) => (
            <Box key={team.teamName} style={{ ...animStyle(idx), display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Box style={{ width: 10, height: 10, borderRadius: t.borderRadius.sm, backgroundColor: barColors[idx % barColors.length], flexShrink: 0 }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{team.teamName}</Text>
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
});
