'use client';

/**
 * BhScoringInsights - Dashboard Preset
 * Scoring analytics overview with KPI cards, score distribution,
 * heatmap, knockout stats, trend chart, and cohort comparisons.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  Filter,
  ChevronDown,
  Users,
  Layers,
  Zap,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createIconContainerStyle,
  createEntranceAnimation,
  createStaggerDelay,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createMetadataFieldStyle, createMetadataGridStyle,
  createMetadataLabelStyle, createMetadataValueStyle,
  createStatValueStyle, createStatLabelStyle,
  createTrendStyle, formatScore, ICON_SIZES,
  createPersonalityAccentBar,

  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { DesignTokens } from '../../../../../core/types/tokens';
import type {
  BhScoringInsightsProps,
  ScoringKpi,
  LevelDistribution,
  HeatmapCell,
  KnockoutStat,
  TrendPoint,
  CohortComparison,
  SkillGapSummary,
  ModelPerformance,
  TokenUsageTrend,
  ScoreDistributionBucket,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Color resolution helper                                            */
/* ------------------------------------------------------------------ */
function resolveLevelColor(level: LevelDistribution, t: DesignTokens): string {
  if (level.colorKey) {
    const scaleKey = `${level.colorKey}Scale` as const;
    const scale = t.colors[scaleKey as keyof typeof t.colors] as Record<number, string> | undefined;
    return scale?.[500] ?? t.colors.primaryScale[500];
  }
  return level.color || t.colors.primaryScale[500];
}

/* ================================================================== */
/*  Dashboard Preset                                                   */
/* ================================================================== */
export const DashboardBhScoringInsights = createPreset<BhScoringInsightsProps>({
  name: 'BhScoringInsights.Dashboard',
  render: (ctx: PresetContext<BhScoringInsightsProps>) => {
    const { primitives: { Box, Flex, Stack, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      kpis: rawKpis = [],
      levelDistribution: rawLevelDistribution = [],
      heatmapData: rawHeatmapData = [],
      knockoutStats: rawKnockoutStats = [],
      trendData: rawTrendData = [],
      cohortComparisons: rawCohortComparisons = [],
      skillGaps: rawSkillGaps = [],
      modelPerformance: rawModelPerformance = [],
      tokenUsageTrends: rawTokenUsageTrends = [],
      totalTokensUsed,
      totalScoringCost,
      avgLatencyMs,
      scoreDistributionBuckets: rawScoreDistributionBuckets = [],
      dateRange: dateRangeProp,
      chartType: chartTypeProp,
      filters,
      onFilterChange,
      className,
      style,
    } = props;

    const kpis = Array.isArray(rawKpis) ? rawKpis : [];
    const levelDistribution = Array.isArray(rawLevelDistribution) ? rawLevelDistribution : [];
    const heatmapData = Array.isArray(rawHeatmapData) ? rawHeatmapData : [];
    const knockoutStats = Array.isArray(rawKnockoutStats) ? rawKnockoutStats : [];
    const trendData = Array.isArray(rawTrendData) ? rawTrendData : [];
    const cohortComparisons = Array.isArray(rawCohortComparisons) ? rawCohortComparisons : [];
    const skillGaps = Array.isArray(rawSkillGaps) ? rawSkillGaps : [];
    const modelPerformance = Array.isArray(rawModelPerformance) ? rawModelPerformance : [];
    const tokenUsageTrends = Array.isArray(rawTokenUsageTrends) ? rawTokenUsageTrends : [];
    const scoreDistributionBuckets = Array.isArray(rawScoreDistributionBuckets) ? rawScoreDistributionBuckets : [];

    const [activeSection, setActiveSection] = useState<'overview' | 'heatmap' | 'gaps' | 'models'>('overview');
    const handleSetActiveSection = useCallback((key: 'overview' | 'heatmap' | 'gaps' | 'models') => {
      setActiveSection(key);
    }, []);

    const card = useMemo(() => createCardStyle(t, { padding: t.spacing[7], glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    /* Memoized computed values */
    const maxCount = useMemo(() => Math.max(...levelDistribution.map((l, i) => l.count), 1), [levelDistribution]);
    const dimensions = useMemo(() => [...new Set(heatmapData.map((h, i) => h.dimension))], [heatmapData]);
    const jobs = useMemo(() => [...new Set(heatmapData.map((h, i) => h.job))], [heatmapData]);
    const sortedCohorts = useMemo(() => [...cohortComparisons].sort((a, b) => b.avgScore - a.avgScore), [cohortComparisons]);
    const sortedGaps = useMemo(() => [...skillGaps].sort((a, b) => a.gapFromTarget - b.gapFromTarget), [skillGaps]);

    const getHeatmapColor = useCallback((score: number) => {
      if (score >= 80) return { bg: t.colors.successScale[100], text: t.colors.successScale[800] };
      if (score >= 65) return { bg: t.colors.warningScale[100], text: t.colors.warningScale[800] };
      if (score >= 50) return { bg: t.colors.warningScale[50], text: t.colors.warningScale[700] };
      return { bg: t.colors.errorScale[100], text: t.colors.errorScale[800] };
    }, [t]);

    /* Entrance animations */
    const headerEntrance = useMemo(() => createEntranceAnimation(t, { index: 0 }), [t]);
    const kpiEntrance = useCallback((idx: number) => createEntranceAnimation(t, { index: idx + 1 }), [t]);

    /* Glass-aware header style */
    const headerStyle = useMemo(() => ({
      marginBottom: t.spacing[7],
      ...(isGlass && t.glass ? {
        backdropFilter: t.glass.blur,
        WebkitBackdropFilter: t.glass.blur,
      } : {}),
    }), [t, isGlass]);

    /* Section title component (memoized definition) */
    const SectionTitle = useMemo(() => {
      const Comp = ({ children, action }: { children: string; action?: React.ReactNode }) => (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[5] }}>
          <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing }}>{children}</Text>
          {action}
        </Box>
      );
      return Comp;
    }, [Box, Text, t, ptypo]);

    /* Tab definitions */
    const TABS = useMemo(() => {
      const tabs: { key: 'overview' | 'heatmap' | 'gaps' | 'models'; label: string; icon: typeof BarChart3 }[] = [
        { key: 'overview', label: 'Distribution', icon: BarChart3 },
        { key: 'heatmap', label: 'Heatmap', icon: Layers },
        { key: 'gaps', label: 'Skill Gaps', icon: Zap },
      ];
      if (modelPerformance.length > 0 || tokenUsageTrends.length > 0) {
        tabs.push({ key: 'models', label: 'Model Perf', icon: Target });
      }
      return tabs;
    }, [modelPerformance.length, tokenUsageTrends.length]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], width: '100%', height: '100%', overflow: 'auto', backgroundColor: t.colors.neutral[50], padding: t.spacing[7], ...style }}>
        {accentBar && <Box style={accentBar} />}

        {/* -- Header -- */}
        <Flex align="center" justify="between" style={{ ...headerStyle, ...headerEntrance.animate, transition: headerEntrance.transition }}>
          <Stack gap={1}>
            <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing }}>Scoring Insights</Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>Candidate evaluation analytics and quality metrics</Text>
          </Stack>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            {dateRangeProp && dateRangeProp.length === 2 && (
              <Box style={{
                display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.infoScale[50],
                color: t.colors.infoScale[700],
                fontSize: t.typography.fontSize.xs,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{dateRangeProp[0]} - {dateRangeProp[1]}</Text>
              </Box>
            )}
            {chartTypeProp && (
              <Box style={{
                display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.primaryScale[50],
                color: t.colors.primaryScale[700],
                fontSize: t.typography.fontSize.xs,
              }}>
                <BarChart3 size={12} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{chartTypeProp}</Text>
              </Box>
            )}
            <Box
              role="button"
              aria-label="Open filters"
              style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], cursor: 'pointer' }}
            >
              <Filter size={14} /> <Text style={{ fontSize: t.typography.fontSize.xs }}>Filters</Text> <ChevronDown size={12} />
            </Box>
          </Box>
        </Flex>

        {/* -- KPI Cards -- */}
        <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: t.spacing[4], marginBottom: t.spacing[7] }}>
          {kpis.map((kpi, idx) => {
            const isPositive = (kpi.trend ?? 0) > 0;
            const invertedMetric = kpi.label.includes('Knockout') || kpi.label.includes('Variance');
            const trendColor = invertedMetric ? (isPositive ? t.colors.errorScale[600] : t.colors.successScale[600]) : (isPositive ? t.colors.successScale[600] : t.colors.errorScale[600]);
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;
            const icons = [Target, Award, AlertTriangle, BarChart3];
            const Icon = icons[idx % icons.length];
            const colorScales = [t.colors.primaryScale, t.colors.successScale, t.colors.warningScale, t.colors.infoScale];
            const cs = colorScales[idx % colorScales.length];
            return (
              <Box
                key={kpi.label}
                style={{ ...animStyle(idx), ...card, ...hoverStyles.base, ...entrance.animate, transition: entrance.transition }}
                onMouseEnter={(e: any) => Object.assign(e.currentTarget.style, hoverStyles.hover)}
                onMouseLeave={(e: any) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = card.boxShadow || 'none'; }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                  <Box style={createIconContainerStyle(t, { size: 40, color: cs[50] })}>
                    <Icon size={ICON_SIZES.feature} color={cs[600]} />
                  </Box>
                  <Box style={createTrendStyle(t, kpi.trend ?? 0).container}>
                    <TrendIcon size={ICON_SIZES.label} color={trendColor} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: trendColor }}>{Math.abs(kpi.trend ?? 0).toFixed(1)}%</Text>
                  </Box>
                </Box>
                <Text style={createStatValueStyle(t, { size: '2xl' })}>{typeof kpi.value === 'number' ? formatScore(kpi.value) : kpi.value}</Text>
                <Text style={{ ...createStatLabelStyle(t), marginTop: t.spacing[1] }}>{kpi.label}</Text>
              </Box>
            );
          })}
        </Box>

        {/* -- Tab Nav -- */}
        <Box role="tablist" aria-label="Scoring insights sections" style={{ display: 'flex', gap: t.spacing[1], marginBottom: t.spacing[6], padding: t.spacing[1], borderRadius: t.borderRadius.lg, backgroundColor: t.colors.neutral[100] }}>
          {TABS.map((tab, i) => {
            const TabIcon = tab.icon;
            const isActive = activeSection === tab.key;
            return (
              <Box
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleSetActiveSection(tab.key)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSetActiveSection(tab.key); } }}
                style={{ ...animStyle(i), display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, backgroundColor: isActive ? t.colors.common.white : 'transparent', color: isActive ? t.colors.neutral[900] : t.colors.neutral[500], fontSize: t.typography.fontSize.sm, fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}`, boxShadow: isActive ? t.shadows.sm : 'none', flex: 1, justifyContent: 'center' }}
              >
                <TabIcon size={16} /> <Text style={{ fontSize: t.typography.fontSize.sm }}>{tab.label}</Text>
              </Box>
            );
          })}
        </Box>

        {/* -- Overview Tab -- */}
        {activeSection === 'overview' && (
          <Box role="tabpanel" id="tabpanel-overview" aria-label="Distribution overview" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[6] }}>
            {/* Distribution */}
            <Box style={card}>
              <SectionTitle>Score Distribution</SectionTitle>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                {levelDistribution.map((level, idx) => {
                  const barColor = resolveLevelColor(level, t);
                  return (
                    <Box key={level.level} style={{ ...animStyle(idx), ...entrance.animate, transition: entrance.transition }}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>{level.level}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{level.count}</Text>
                      </Box>
                      <Box style={{ height: 16, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden' }}>
                        <Box style={{ height: '100%', width: `${(level.count / maxCount) * 100}%`, backgroundColor: barColor, borderRadius: t.borderRadius.sm, transition: 'width 400ms ease' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Score Distribution Buckets */}
            {scoreDistributionBuckets.length > 0 && (
              <Box style={card}>
                <SectionTitle>Score Buckets</SectionTitle>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  {scoreDistributionBuckets.map((bucket, idx) => {
                    const maxPct = Math.max(...scoreDistributionBuckets.map(b => b.percentage ?? 0), 1);
                    const barWidth = (bucket.percentage ?? 0) / maxPct * 100;
                    const bucketColor = (bucket.rangeMax ?? 0) >= 80 ? t.colors.successScale[400] : (bucket.rangeMax ?? 0) >= 60 ? t.colors.warningScale[400] : t.colors.errorScale[400];
                    return (
                      <Box key={`${bucket.rangeMin}-${bucket.rangeMax}`} style={{ ...animStyle(idx), ...entrance.animate, transition: entrance.transition }}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>{bucket.rangeMin}-{bucket.rangeMax}</Text>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{bucket.count}</Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{(bucket.percentage ?? 0).toFixed(1)}%</Text>
                          </Box>
                        </Box>
                        <Box style={{ height: 10, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden' }}>
                          <Box style={{ height: '100%', width: `${barWidth}%`, backgroundColor: bucketColor, borderRadius: t.borderRadius.sm, transition: 'width 400ms ease' }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Cohort Comparison */}
            <Box style={card}>
              <SectionTitle action={<Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}><Users size={12} /> By Source</Box>}>Cohort Comparison</SectionTitle>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                {sortedCohorts.map((cohort, i) => {
                  const cs = cohort.avgScore >= 75 ? t.colors.successScale : cohort.avgScore >= 65 ? t.colors.warningScale : t.colors.errorScale;
                  return (
                    <Box key={cohort.groupName} style={{ ...animStyle(i), display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: i === 0 ? cs[50] : t.colors.neutral[50], ...entrance.animate, transition: entrance.transition }}>
                      <Box style={{ width: 28, height: 28, borderRadius: t.borderRadius.full, backgroundColor: cs[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: cs[700] }}>{i + 1}</Text>
                      </Box>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{cohort.groupName}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{cohort.count} candidates</Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: cs[700] }}>{formatScore(cohort.avgScore)}</Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Trend Chart */}
            <Box style={card}>
              <SectionTitle>Score Trend</SectionTitle>
              {trendData.length > 0 && (() => {
                const cW = 480; const cH = 180; const pad = 32;
                const vals = trendData.map((d, i) => d.value);
                const maxV = Math.max(...vals); const minV = Math.min(...vals); const range = maxV - minV || 1;
                const stepX = (cW - pad * 2) / (trendData.length - 1 || 1);
                const pts = trendData.map((d, i) => ({ x: pad + i * stepX, y: cH - pad - ((d.value - minV) / range) * (cH - pad * 2) }));
                return (
                  <svg width="100%" viewBox={`0 0 ${cW} ${cH}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Score trend chart showing score progression over time" style={{ display: 'block' }}>
                    {[0, 0.5, 1].map((p) => { const y = cH - pad - p * (cH - pad * 2); return <line key={p} x1={pad} y1={y} x2={cW - pad} y2={y} stroke={t.colors.neutral[100]} />; })}
                    {trendData.map((d, i) => <text key={i} x={pad + i * stepX} y={cH - 8} textAnchor="middle" fill={t.colors.neutral[400]} fontSize="10">{d.date}</text>)}
                    <defs><linearGradient id="score-trend-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={t.colors.primaryScale[500]} stopOpacity="0.12" /><stop offset="100%" stopColor={t.colors.primaryScale[500]} stopOpacity="0" /></linearGradient></defs>
                    <polygon points={`${pts[0].x},${cH - pad} ${pts.map((p) => `${p.x},${p.y}`).join(' ')} ${pts[pts.length - 1].x},${cH - pad}`} fill="url(#score-trend-g)" />
                    <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={t.colors.primaryScale[500]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={t.colors.common.white} stroke={t.colors.primaryScale[500]} strokeWidth="2" />)}
                  </svg>
                );
              })()}
            </Box>

            {/* Knockout Stats */}
            <Box style={card}>
              <SectionTitle>Knockout Analysis</SectionTitle>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                {knockoutStats.map((k, idx) => {
                  const rate = ((k.knockoutCount / k.totalEvaluations) * 100).toFixed(1);
                  const isHigh = k.knockoutCount > 10;
                  return (
                    <Box key={k.dimension} style={{ ...animStyle(idx), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: isHigh ? t.colors.errorScale[50] : t.colors.neutral[50], ...entrance.animate, transition: entrance.transition }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        {isHigh && <AlertTriangle size={16} color={t.colors.errorScale[500]} />}
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{k.dimension}</Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>{k.knockoutCount} / {k.totalEvaluations}</Text>
                        <Box style={{ ...createBadgeStyle(t, isHigh ? 'error' : 'success'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>{rate}%</Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}

        {/* -- Heatmap Tab -- */}
        {activeSection === 'heatmap' && (
          <Box role="tabpanel" id="tabpanel-heatmap" aria-label="Dimension heatmap" style={card}>
            <SectionTitle>Dimension x Job Heatmap</SectionTitle>
            <Box role="img" aria-label="Heatmap grid showing average scores by dimension and job" style={{ display: 'grid', gridTemplateColumns: `150px repeat(${jobs.length}, 1fr)`, gap: t.spacing[1] }}>
              <Box />
              {jobs.map((j, i) => <Text key={j} style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textAlign: 'center' as const, padding: t.spacing[2] }}>{j}</Text>)}
              {dimensions.map((dim) => (
                <>
                  <Text key={dim} style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], padding: t.spacing[2], display: 'flex', alignItems: 'center' }}>{dim}</Text>
                  {jobs.map((job, ji) => {
                    const cell = heatmapData.find((h) => h.dimension === dim && h.job === job);
                    const score = cell?.avgScore ?? 0;
                    const hc = getHeatmapColor(score);
                    return (
                      <Box key={`${dim}-${job}`} style={{ ...animStyle(ji), backgroundColor: hc.bg, borderRadius: t.borderRadius.sm, padding: t.spacing[3], textAlign: 'center' as const, transition: `all ${t.motion.hover}` }}>
                        <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: hc.text }}>{score}</Text>
                      </Box>
                    );
                  })}
                </>
              ))}
            </Box>
          </Box>
        )}

        {/* -- Skill Gaps Tab -- */}
        {activeSection === 'gaps' && (
          <Box role="tabpanel" id="tabpanel-gaps" aria-label="Skill gap analysis" style={card}>
            <SectionTitle>Skill Gap Analysis</SectionTitle>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
              {sortedGaps.map((gap, idx) => {
                const severity = Math.abs(gap.gapFromTarget) > 15 ? 'error' : Math.abs(gap.gapFromTarget) > 8 ? 'warning' : 'success';
                const barColor = severity === 'error' ? t.colors.errorScale[500] : severity === 'warning' ? t.colors.warningScale[500] : t.colors.successScale[500];
                return (
                  <Box key={gap.dimension} style={{ ...animStyle(idx), ...entrance.animate, transition: entrance.transition }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{gap.dimension}</Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{gap.avgScore}</Text>
                        <Box style={{ ...createBadgeStyle(t, severity), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>{gap.gapFromTarget > 0 ? '+' : ''}{gap.gapFromTarget}</Box>
                      </Box>
                    </Box>
                    <Box style={{ height: 12, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.full, overflow: 'hidden', position: 'relative' as const }}>
                      <Box style={{ position: 'absolute' as const, left: '80%', top: 0, width: 2, height: '100%', backgroundColor: t.colors.neutral[400] }} />
                      <Box style={{ height: '100%', width: `${gap.avgScore}%`, backgroundColor: barColor, borderRadius: t.borderRadius.full, transition: 'width 400ms ease' }} />
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginTop: t.spacing[1] }}>Target: 80</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* -- Model Performance Tab -- */}
        {activeSection === 'models' && (
          <Box role="tabpanel" id="tabpanel-models" aria-label="Model performance" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[6] }}>
            {/* Model Performance Table */}
            <Box style={card}>
              <SectionTitle>Model Performance</SectionTitle>
              {modelPerformance.length > 0 && (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                  {modelPerformance.map((mp, idx) => {
                    const latencyColor = mp.avgLatencyMs < 3000 ? t.colors.successScale : mp.avgLatencyMs < 8000 ? t.colors.warningScale : t.colors.errorScale;
                    const errorColor = mp.errorRate < 0.02 ? t.colors.successScale : mp.errorRate < 0.1 ? t.colors.warningScale : t.colors.errorScale;
                    return (
                      <Box key={mp.model} style={{
                        ...animStyle(idx),
                        padding: t.spacing[3],
                        borderRadius: t.borderRadius.md,
                        backgroundColor: t.colors.neutral[50],
                        ...entrance.animate,
                        transition: entrance.transition,
                      }}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{mp.model}</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{mp.totalScorecards} scorecards</Text>
                        </Box>
                        <Box style={{ display: 'flex', gap: t.spacing[3] }}>
                          <Box style={createMetadataFieldStyle(t)}>
                            <Text style={createMetadataLabelStyle(t)}>Avg Latency</Text>
                            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: latencyColor[700] }}>
                              {(mp.avgLatencyMs / 1000).toFixed(1)}s
                            </Text>
                          </Box>
                          <Box style={createMetadataFieldStyle(t)}>
                            <Text style={createMetadataLabelStyle(t)}>Avg Tokens</Text>
                            <Text style={createMetadataValueStyle(t, { weight: 'bold' })}>
                              {mp.avgTokensUsed.toLocaleString()}
                            </Text>
                          </Box>
                          <Box style={createMetadataFieldStyle(t)}>
                            <Text style={createMetadataLabelStyle(t)}>Error Rate</Text>
                            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: errorColor[700] }}>
                              {(mp.errorRate * 100).toFixed(1)}%
                            </Text>
                          </Box>
                          <Box style={createMetadataFieldStyle(t)}>
                            <Text style={createMetadataLabelStyle(t)}>Avg Score</Text>
                            <Text style={createMetadataValueStyle(t, { weight: 'bold' })}>
                              {formatScore(mp.avgScore)}
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Token Usage Summary */}
            <Box style={card}>
              <SectionTitle>Token Usage</SectionTitle>
              {/* Summary stats */}
              {(totalTokensUsed !== undefined || totalScoringCost !== undefined || avgLatencyMs !== undefined) && (
                <Box style={{
                  display: 'flex',
                  gap: t.spacing[3],
                  marginBottom: t.spacing[4],
                  flexWrap: 'wrap' as const,
                }}>
                  {totalTokensUsed !== undefined && (
                    <Box style={{
                      ...createMetadataFieldStyle(t),
                      padding: t.spacing[3],
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.primaryScale[50],
                      flex: 1,
                      minWidth: 100,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.primaryScale[600] }}>Total Tokens</Text>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primaryScale[800] }}>
                        {totalTokensUsed.toLocaleString()}
                      </Text>
                    </Box>
                  )}
                  {totalScoringCost !== undefined && (
                    <Box style={{
                      ...createMetadataFieldStyle(t),
                      padding: t.spacing[3],
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.warningScale[50],
                      flex: 1,
                      minWidth: 100,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[600] }}>Total Cost</Text>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.warningScale[800] }}>
                        ${totalScoringCost.toFixed(2)}
                      </Text>
                    </Box>
                  )}
                  {avgLatencyMs !== undefined && (
                    <Box style={{
                      ...createMetadataFieldStyle(t),
                      padding: t.spacing[3],
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.infoScale[50],
                      flex: 1,
                      minWidth: 100,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.infoScale[600] }}>Avg Latency</Text>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.infoScale[800] }}>
                        {(avgLatencyMs / 1000).toFixed(1)}s
                      </Text>
                    </Box>
                  )}
                </Box>
              )}

              {/* Token usage trend bars */}
              {tokenUsageTrends.length > 0 && (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], marginBottom: t.spacing[1] }}>
                    Daily Token Usage
                  </Text>
                  {tokenUsageTrends.map((tu, idx) => {
                    const maxTokens = Math.max(...tokenUsageTrends.map(x => x.totalTokens), 1);
                    return (
                      <Box key={tu.date} style={{ ...animStyle(idx), ...entrance.animate, transition: entrance.transition }}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{tu.date}</Text>
                          <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{tu.totalTokens.toLocaleString()}</Text>
                            {tu.cost !== undefined && (
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[600] }}>${tu.cost.toFixed(2)}</Text>
                            )}
                          </Box>
                        </Box>
                        <Box style={{ display: 'flex', height: 8, borderRadius: t.borderRadius.full, overflow: 'hidden', backgroundColor: t.colors.neutral[100] }}>
                          <Box style={{
                            height: '100%',
                            width: `${(tu.inputTokens / maxTokens) * 100}%`,
                            backgroundColor: t.colors.primaryScale[400],
                            transition: 'width 400ms ease',
                          }} />
                          <Box style={{
                            height: '100%',
                            width: `${(tu.outputTokens / maxTokens) * 100}%`,
                            backgroundColor: t.colors.infoScale[400],
                            transition: 'width 400ms ease',
                          }} />
                        </Box>
                      </Box>
                    );
                  })}
                  <Box style={{ display: 'flex', gap: t.spacing[3], marginTop: t.spacing[2] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[400] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Input</Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.infoScale[400] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Output</Text>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
