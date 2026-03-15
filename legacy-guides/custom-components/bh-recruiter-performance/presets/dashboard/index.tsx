'use client';

/**
 * BhRecruiterPerformance - Dashboard Preset
 * SVG radar chart, metric gauges, and comparison table.
 * Personality-driven, glass-aware.
 */

import { useMemo, useCallback } from 'react';
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
  createPersonalityAccentBar,

  createDividerStyle,
} from '../../../helpers';
import type { BhRecruiterPerformanceProps, RecruiterPerformanceItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Radar Chart (SVG)                                                  */
/* ------------------------------------------------------------------ */

const RADAR_METRICS: { key: keyof RecruiterPerformanceItem; label: string; max: number }[] = [
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
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      recruiters: rawRecruiters = [],
      selectedRecruiterId,
      onRecruiterClick,
      loading,
      className,
      style,
    } = props;

    const recruiters = Array.isArray(rawRecruiters) ? rawRecruiters : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

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
        const val = ((selected[m.key] as number) ?? 0) / m.max;
        const pt = polarToCartesian(radarCx, radarCy, radarR * val, i * angleStep);
        return `${pt.x},${pt.y}`;
      }).join(' ');
    }, [selected]);

    const gridLevels = [0.25, 0.5, 0.75, 1.0];

    const divider = useMemo(() => createDividerStyle(t), [t]);

    return (
      <Box
        className={className}
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
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
        {accentBar && <Box style={accentBar} />}
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
                    { label: 'Quality Score', value: selected.qualityScore ?? 0, max: 100, icon: Award, color: t.colors.successScale },
                    { label: 'Satisfaction', value: selected.candidateSatisfaction ?? 0, max: 100, icon: Users, color: t.colors.primaryScale },
                    { label: 'Pipeline Velocity', value: selected.pipelineVelocity ?? 0, max: 100, icon: Activity, color: t.colors.infoScale },
                    { label: 'Time to Fill', value: selected.timeToFill ?? 0, max: 60, icon: Clock, color: t.colors.warningScale },
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
                    aria-label={`${r.name ?? ''}: ${r.hires ?? 0} hires, ${r.timeToFill ?? 0}d TTF, ${r.qualityScore ?? 0} quality`}
                    onClick={() => handleClick((r.recruiterId ?? ''))}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick((r.recruiterId ?? '')); } }}
                    style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                      padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[50]}`,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>{r.name ?? ''}</Text></Box>
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{r.hires ?? 0}</Text></Box>
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{r.timeToFill ?? 0}d</Text></Box>
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, color: (r.qualityScore ?? 0) >= 85 ? t.colors.successScale[600] : t.colors.neutral[700] }}>{r.qualityScore ?? 0}</Text></Box>
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{r.candidateSatisfaction ?? 0}</Text></Box>
                    <Box role="cell"><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{r.pipelineVelocity ?? 0}</Text></Box>
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
