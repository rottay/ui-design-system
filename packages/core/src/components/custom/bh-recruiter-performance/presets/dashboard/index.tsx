'use client';

/**
 * BhRecruiterPerformance - Dashboard Preset
 * SVG radar chart, metric gauges, and comparison table.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Users, Award, Clock, TrendingUp, Activity, Briefcase,
  ChevronRight,
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
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhRecruiterPerformanceProps, RecruiterMetrics } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_RECRUITERS: RecruiterMetrics[] = [
  { recruiterId: 'r-1', name: 'Alice Morgan', hires: 12, timeToFill: 28, qualityScore: 92, candidateSatisfaction: 88, pipelineVelocity: 85, activePositions: 6 },
  { recruiterId: 'r-2', name: 'Bob Chen', hires: 9, timeToFill: 35, qualityScore: 78, candidateSatisfaction: 82, pipelineVelocity: 72, activePositions: 8 },
  { recruiterId: 'r-3', name: 'Carla Ruiz', hires: 15, timeToFill: 22, qualityScore: 95, candidateSatisfaction: 91, pipelineVelocity: 90, activePositions: 5 },
  { recruiterId: 'r-4', name: 'Dan Patel', hires: 7, timeToFill: 42, qualityScore: 70, candidateSatisfaction: 75, pipelineVelocity: 60, activePositions: 10 },
];

/* ------------------------------------------------------------------ */
/*  Radar Chart (SVG)                                                  */
/* ------------------------------------------------------------------ */

const RADAR_METRICS: { key: keyof RecruiterMetrics; label: string; max: number }[] = [
  { key: 'qualityScore', label: 'Quality', max: 100 },
  { key: 'candidateSatisfaction', label: 'Satisfaction', max: 100 },
  { key: 'pipelineVelocity', label: 'Velocity', max: 100 },
  { key: 'hires', label: 'Hires', max: 20 },
  { key: 'activePositions', label: 'Positions', max: 15 },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/* ================================================================== */
/*  Dashboard Preset                                                   */
/* ================================================================== */

export const DashboardBhRecruiterPerformance = createPreset<BhRecruiterPerformanceProps>({
  name: 'BhRecruiterPerformance.Dashboard',
  render: (ctx: PresetContext<BhRecruiterPerformanceProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      recruiters = MOCK_RECRUITERS,
      selectedRecruiterId,
      onRecruiterClick,
      loading,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const handleClick = useCallback((id: string) => { onRecruiterClick?.(id); }, [onRecruiterClick]);

    const selected = useMemo(
      () => recruiters.find(r => r.recruiterId === selectedRecruiterId) || recruiters[0],
      [recruiters, selectedRecruiterId],
    );

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    /* Radar chart points for selected recruiter */
    const radarSize = 200;
    const radarCx = radarSize / 2;
    const radarCy = radarSize / 2;
    const radarR = 70;
    const angleStep = 360 / RADAR_METRICS.length;

    const radarPoints = useMemo(() => {
      if (!selected) return '';
      return RADAR_METRICS.map((m, i) => {
        const val = (selected[m.key] as number) / m.max;
        const pt = polarToCartesian(radarCx, radarCy, radarR * val, i * angleStep);
        return `${pt.x},${pt.y}`;
      }).join(' ');
    }, [selected]);

    const gridLevels = [0.25, 0.5, 0.75, 1.0];

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
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
              <Award size={22} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.xl,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Recruiter Performance
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                Compare recruiter metrics and workload distribution
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[6], marginBottom: t.spacing[6] }}>
            {/* Radar chart */}
            <Box style={{ ...card, ...animStyle(0), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[3], alignSelf: 'flex-start' }}>
                {selected?.name ?? 'Recruiter'} Radar
              </Text>
              <svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`} role="img" aria-label={`Performance radar for ${selected?.name}`}>
                {/* Grid circles */}
                {gridLevels.map(level => {
                  const pts = RADAR_METRICS.map((_, i) => {
                    const pt = polarToCartesian(radarCx, radarCy, radarR * level, i * angleStep);
                    return `${pt.x},${pt.y}`;
                  }).join(' ');
                  return <polygon key={level} points={pts} fill="none" stroke={t.colors.neutral[200]} strokeWidth={1} />;
                })}
                {/* Axis lines */}
                {RADAR_METRICS.map((_, i) => {
                  const pt = polarToCartesian(radarCx, radarCy, radarR, i * angleStep);
                  return <line key={i} x1={radarCx} y1={radarCy} x2={pt.x} y2={pt.y} stroke={t.colors.neutral[200]} strokeWidth={1} />;
                })}
                {/* Data polygon */}
                <polygon points={radarPoints} fill={t.colors.primaryScale[100]} stroke={t.colors.primaryScale[500]} strokeWidth={2} fillOpacity={0.4} style={{ transition: `all ${t.motion.hover}` }} />
                {/* Labels */}
                {RADAR_METRICS.map((m, i) => {
                  const pt = polarToCartesian(radarCx, radarCy, radarR + 18, i * angleStep);
                  return (
                    <text key={m.key} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill={t.colors.neutral[500]}>
                      {m.label}
                    </text>
                  );
                })}
              </svg>
            </Box>

            {/* Metric gauges */}
            <Box style={{ ...card, ...animStyle(1) }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Key Metrics</Text>
              {selected && (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                  {[
                    { label: 'Quality Score', value: selected.qualityScore, max: 100, icon: Award, color: t.colors.successScale },
                    { label: 'Satisfaction', value: selected.candidateSatisfaction, max: 100, icon: Users, color: t.colors.primaryScale },
                    { label: 'Pipeline Velocity', value: selected.pipelineVelocity, max: 100, icon: Activity, color: t.colors.infoScale },
                    { label: 'Time to Fill', value: selected.timeToFill, max: 60, icon: Clock, color: t.colors.warningScale },
                  ].map((metric) => {
                    const pct = (metric.value / metric.max) * 100;
                    const bar = createProgressBarStyle(t, { percent: pct, color: metric.color[500] });
                    const MetricIcon = metric.icon;
                    return (
                      <Box key={metric.label}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                            <MetricIcon size={14} color={metric.color[500]} />
                            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{metric.label}</Text>
                          </Box>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                            {metric.label === 'Time to Fill' ? `${metric.value}d` : metric.value}
                          </Text>
                        </Box>
                        <Box style={bar.track}><Box style={bar.fill} /></Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>

          {/* Comparison table */}
          <Box style={{ ...card, ...animStyle(2), padding: 0 }}>
            <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
              <Text style={{ ...sectionLabel, marginBottom: 0 }}>Team Comparison</Text>
            </Box>
            <Box role="table" aria-label="Recruiter comparison">
              {/* Header row */}
              <Box role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.neutral[50] }}>
                {['Recruiter', 'Hires', 'TTF', 'Quality', 'Satis.', 'Velocity'].map(h => (
                  <Box key={h} role="columnheader">
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                      {h}
                    </Text>
                  </Box>
                ))}
              </Box>
              {/* Data rows */}
              {recruiters.map((r) => {
                const isSelected = r.recruiterId === (selectedRecruiterId || recruiters[0]?.recruiterId);
                return (
                  <Box
                    key={r.recruiterId}
                    role="row"
                    tabIndex={0}
                    aria-label={`${r.name}: ${r.hires} hires, ${r.timeToFill}d TTF, ${r.qualityScore} quality`}
                    onClick={() => handleClick(r.recruiterId)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(r.recruiterId); } }}
                    style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                      padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[50]}`,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>{r.name}</Text></Box>
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{r.hires}</Text></Box>
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{r.timeToFill}d</Text></Box>
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, color: r.qualityScore >= 85 ? t.colors.successScale[600] : t.colors.neutral[700] }}>{r.qualityScore}</Text></Box>
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{r.candidateSatisfaction}</Text></Box>
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{r.pipelineVelocity}</Text></Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
