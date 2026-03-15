'use client';

/**
 * BhScoringInsights - Detailed Preset
 * Drill-down focused view with expandable sections, per-dimension deep dives,
 * candidate-level breakdowns, and configurable analysis panels.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Target,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Layers,
  Zap,
  Users,
  AlertTriangle,
  Award,
  Search,
  X,
  PieChart,
  Calendar,
  Eye,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createStaggerDelay,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createDividerStyle,
  createProgressBarStyle,
  createMetadataFieldStyle,
  createStatValueStyle, createStatLabelStyle,
  createTrendStyle, formatScore, ICON_SIZES,
  createPersonalityAccentBar,

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
  ScoringFilter,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function resolveLevelColor(level: LevelDistribution, t: DesignTokens): string {
  if (level.colorKey) {
    const scaleKey = `${level.colorKey}Scale` as const;
    const scale = t.colors[scaleKey as keyof typeof t.colors] as Record<number, string> | undefined;
    return scale?.[500] ?? t.colors.primaryScale[500];
  }
  return level.color || t.colors.primaryScale[500];
}

function getScoreColor(score: number, t: DesignTokens): string {
  if (score >= 80) return t.colors.successScale[600];
  if (score >= 60) return t.colors.warningScale[600];
  if (score >= 40) return t.colors.warningScale[400];
  return t.colors.errorScale[600];
}

function getScoreBg(score: number, t: any): string {
  if (score >= 80) return t.colors.successScale[50];
  if (score >= 60) return t.colors.warningScale[50];
  return t.colors.errorScale[50];
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Adequate';
  if (score >= 40) return 'Below';
  return 'Poor';
}

/* ------------------------------------------------------------------ */
/*  Section config                                                     */
/* ------------------------------------------------------------------ */
type SectionId = 'kpis' | 'distribution' | 'heatmap' | 'knockouts' | 'trends' | 'cohorts' | 'gaps';

interface SectionDef {
  id: SectionId;
  label: string;
  icon: typeof BarChart3;
  description: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'kpis', label: 'Key Performance Indicators', icon: Award, description: '5 core scoring metrics' },
  { id: 'distribution', label: 'Score Distribution', icon: BarChart3, description: 'Candidate score bands' },
  { id: 'heatmap', label: 'Dimension Heatmap', icon: Layers, description: 'Scores by dimension and job' },
  { id: 'knockouts', label: 'Knockout Analysis', icon: AlertTriangle, description: 'Disqualification rates' },
  { id: 'trends', label: 'Scoring Trends', icon: Activity, description: '12-month score trajectory' },
  { id: 'cohorts', label: 'Cohort Comparison', icon: Users, description: 'Department-level benchmarks' },
  { id: 'gaps', label: 'Skill Gap Analysis', icon: Target, description: 'Target vs actual performance' },
];

/* ================================================================== */
/*  Preset                                                             */
/* ================================================================== */
export const DetailedBhScoringInsights = createPreset<BhScoringInsightsProps>({
  name: 'BhScoringInsights.Detailed',
  render: ({ primitives, props, tokens }: PresetContext<BhScoringInsightsProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;
    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      kpis: kpisProp,
      levelDistribution: distProp,
      heatmapData: heatProp,
      knockoutStats: koProp,
      trendData: trendProp,
      cohortComparisons: cohortProp,
      skillGaps: gapsProp,
      selectedDimension: selectedDimensionProp,
      onDimensionSelect,
      drilldownEntity: drilldownEntityProp,
      onDrilldown,
      className,
      style,
    } = props;

    const kpis = kpisProp?.length ? kpisProp : [];
    const levelDistribution = distProp?.length ? distProp : [];
    const heatmapData = heatProp?.length ? heatProp : [];
    const knockoutStats = koProp?.length ? koProp : [];
    const trendData = trendProp?.length ? trendProp : [];
    const cohortComparisons = cohortProp?.length ? cohortProp : [];
    const skillGaps = gapsProp?.length ? gapsProp : [];

    /* ---- State ---- */
    const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
      new Set(['kpis', 'distribution', 'heatmap']),
    );
    const [selectedDimension, setSelectedDimension] = useState<string | null>(
      selectedDimensionProp ?? null,
    );
    const [drilldownEntity, setDrilldownEntity] = useState<string | null>(
      drilldownEntityProp ?? null,
    );
    const [searchQuery, setSearchQuery] = useState('');

    const toggleSection = useCallback((id: SectionId) => {
      setExpandedSections(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }, []);

    const handleDimSelect = useCallback((dim: string | null) => {
      setSelectedDimension(dim);
      onDimensionSelect?.(dim);
    }, [onDimensionSelect]);

    const handleDrilldown = useCallback((entity: string | null) => {
      setDrilldownEntity(entity);
      onDrilldown?.(entity);
    }, [onDrilldown]);

    /* ---- Computed ---- */
    const heatmapDimensions = useMemo(() => [...new Set(heatmapData.map(c => c.dimension))], [heatmapData]);
    const heatmapJobs = useMemo(() => [...new Set(heatmapData.map(c => c.job))], [heatmapData]);
    const heatmapLookup = useMemo(() => {
      const m = new Map<string, number>();
      heatmapData.forEach(c => m.set(`${c.dimension}::${c.job}`, c.avgScore));
      return m;
    }, [heatmapData]);

    const distMax = useMemo(() => Math.max(...levelDistribution.map(l => l.count), 1), [levelDistribution]);
    const knockoutMax = useMemo(() => Math.max(...knockoutStats.map(k => k.knockoutCount), 1), [knockoutStats]);
    const cohortMax = useMemo(() => Math.max(...cohortComparisons.map(c => c.avgScore), 1), [cohortComparisons]);
    const gapMax = useMemo(() => Math.max(...skillGaps.map(s => Math.abs(s.gapFromTarget)), 1), [skillGaps]);
    const trendMin = useMemo(() => Math.min(...trendData.map(p => p.value), 0), [trendData]);
    const trendMax = useMemo(() => Math.max(...trendData.map(p => p.value), 1), [trendData]);
    const trendRange = trendMax - trendMin || 1;

    const filteredKnockouts = useMemo(() => {
      if (!searchQuery) return knockoutStats;
      return knockoutStats.filter(k => (k.dimension || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }, [knockoutStats, searchQuery]);

    const filteredGaps = useMemo(() => {
      if (!searchQuery) return skillGaps;
      return skillGaps.filter(g => (g.dimension || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }, [skillGaps, searchQuery]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    /* ---- Styles ---- */
    const card = createCardStyle(t, { padding: t.spacing[7], glass: isGlass });
    const hoverStyles = createCardHoverStyles(t);
    const sectionLabel = createPersonalitySectionHeaderStyle(t);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    /* ---- Reusable components ---- */
    const SectionHeader = ({ section }: { section: SectionDef }) => {
      const Icon = section.icon;
      const isOpen = expandedSections.has(section.id);
      return (
        <Box
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          aria-controls={`section-content-${section.id}`}
          onClick={() => toggleSection(section.id)}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection(section.id); } }}
          onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
          onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
            cursor: 'pointer',
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            backgroundColor: isOpen ? t.colors.primaryScale[50] : 'transparent',
            transition: `background-color ${t.motion.hover}`,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 32, color: isOpen ? t.colors.primaryScale[100] : t.colors.neutral[100] })}>
              <Icon size={ICON_SIZES.section} color={isOpen ? t.colors.primaryScale[600] : t.colors.neutral[500]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: isOpen ? t.colors.primaryScale[700] : t.colors.neutral[800], letterSpacing: ptypo.headingLetterSpacing }}>
                {section.label}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400]}}>
                {section.description}
              </Text>
            </Box>
          </Box>
          {isOpen ? <ChevronUp size={16} color={t.colors.neutral[400]} /> : <ChevronDown size={16} color={t.colors.neutral[400]} />}
        </Box>
      );
    };

    const KpiCard = ({ kpi }: { kpi: ScoringKpi }) => {
      const isUp = (kpi.trend ?? 0) > 0;
      const TrendIcon = isUp ? TrendingUp : (kpi.trend ?? 0) < 0 ? TrendingDown : Minus;
      const trendColor = isUp ? t.colors.successScale[600] : (kpi.trend ?? 0) < 0 ? t.colors.errorScale[600] : t.colors.neutral[500];
      return (
        <Box style={{ ...card, ...hoverStyles.base }}>
          <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>{kpi.label}</Text>
          <Box style={{ display: 'flex', alignItems: 'baseline', gap: t.spacing[2] }}>
            <Text style={createStatValueStyle(t, { size: '2xl' })}>
              {typeof kpi.value === 'number' && (kpi.value ?? 0) % 1 !== 0 ? formatScore(kpi.value) : kpi.value ?? 0}
            </Text>
            <Box style={createTrendStyle(t, kpi.trend ?? 0).container}>
              <TrendIcon size={ICON_SIZES.label} color={trendColor} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: trendColor, fontWeight: t.typography.fontWeight.medium }}>
                {isUp ? '+' : ''}{typeof kpi.trend === 'number' && (kpi.trend ?? 0) % 1 !== 0 ? (kpi.trend ?? 0).toFixed(1) : kpi.trend ?? 0}%
              </Text>
            </Box>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginTop: t.spacing[1] }}>
            Previously: {typeof kpi.previousValue === 'number' && (kpi.previousValue ?? 0) % 1 !== 0 ? (kpi.previousValue ?? 0).toFixed(1) : kpi.previousValue ?? 0}
          </Text>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER                                                          */
    /* ================================================================ */
    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, width: '100%', height: '100%', backgroundColor: t.colors.neutral[50], ...style }}>
        {accentBar && <Box style={accentBar} />}

        {/* === Header === */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[200]}`,
          ...(isGlass && t.glass ? {
            backdropFilter: t.glass.blur,
            WebkitBackdropFilter: t.glass.blur,
            backgroundColor: t.glass.bg,
          } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[100] })}>
                <PieChart size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing }}>
                  Scoring Insights
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  Detailed Analysis  --  {kpis.length} KPIs across {heatmapDimensions.length} dimensions
                </Text>
              </Box>
            </Box>

            {/* Search */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.spacing[2],
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.neutral[200]}`,
              backgroundColor: t.colors.common.white,
              minWidth: 220,
            }}>
              <Search size={14} color={t.colors.neutral[400]} />
              <input
                type="text"
                placeholder="Search dimensions..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                aria-label="Search dimensions"
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: t.typography.fontSize.sm,
                  color: t.colors.neutral[700],
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
              {searchQuery && (
                <Box onClick={() => setSearchQuery('')} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSearchQuery(''); } }} tabIndex={0} style={{ cursor: 'pointer', flexShrink: 0 }} role="button" aria-label="Clear search">
                  <X size={14} color={t.colors.neutral[400]} />
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* === Body: Sidebar + Content === */}
        <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* --- Left sidebar: dimensions --- */}
          <Box role="navigation" aria-label="Dimension and job navigation" style={{
            width: 240,
            flexShrink: 0,
            borderRight: `1px solid ${t.colors.neutral[200]}`,
            overflow: 'auto',
            backgroundColor: t.colors.common.white,
            ...(isGlass && t.glass ? {
              backdropFilter: t.glass.blur,
              WebkitBackdropFilter: t.glass.blur,
              backgroundColor: t.glass.bg,
            } : {}),
          }}>
            <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[4]}px ${t.spacing[2]}px` }}>
              <Text style={{ ...sectionLabel }}>Dimensions</Text>
            </Box>

            {heatmapDimensions.map(dim => {
              const isSelected = selectedDimension === dim;
              const dimScores = heatmapData.filter(c => c.dimension === dim);
              const avgScore = dimScores.length > 0 ? dimScores.reduce((s, c) => s + c.avgScore, 0) / dimScores.length : 0;
              return (
                <Box
                  key={dim}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`Filter by dimension: ${dim}`}
                  onClick={() => handleDimSelect(isSelected ? null : dim)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDimSelect(isSelected ? null : dim); } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? t.colors.primaryScale[50] : 'transparent',
                    borderLeft: isSelected ? `3px solid ${t.colors.primaryScale[500]}` : '3px solid transparent',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    color: isSelected ? t.colors.primaryScale[700] : t.colors.neutral[700],
                    fontWeight: isSelected ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal as number,
                  }}>
                    {dim}
                  </Text>
                  <Box style={{
                    padding: `2px ${t.spacing[2]}px`,
                    borderRadius: badgeRadius,
                    backgroundColor: getScoreBg(avgScore, t),
                    color: getScoreColor(avgScore, t),
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.semibold,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: getScoreColor(avgScore, t), fontWeight: t.typography.fontWeight.semibold }}>
                      {Math.round(avgScore)}
                    </Text>
                  </Box>
                </Box>
              );
            })}

            {/* Jobs sub-section */}
            {heatmapJobs.length > 0 && (
              <>
                <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[4]}px ${t.spacing[2]}px`, marginTop: t.spacing[2], borderTop: `1px solid ${t.colors.neutral[100]}` }}>
                  <Text style={{ ...sectionLabel }}>Jobs</Text>
                </Box>
                {heatmapJobs.map(job => {
                  const isActive = drilldownEntity === job;
                  return (
                    <Box
                      key={job}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      onClick={() => handleDrilldown(isActive ? null : job)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDrilldown(isActive ? null : job); } }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: t.spacing[2],
                        padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                        cursor: 'pointer',
                        backgroundColor: isActive ? t.colors.secondaryScale[50] : 'transparent',
                        borderLeft: isActive ? `3px solid ${t.colors.secondaryScale[500]}` : '3px solid transparent',
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        color: isActive ? t.colors.secondaryScale[700] : t.colors.neutral[600],
                        fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal as number,
                      }}>
                        {job}
                      </Text>
                    </Box>
                  );
                })}
              </>
            )}
          </Box>

          {/* --- Main content: accordion sections --- */}
          <Box style={{ flex: 1, overflow: 'auto' }}>

            {/* KPIs */}
            <SectionHeader section={SECTIONS[0]} />
            {expandedSections.has('kpis') && (
              <Box role="region" id="section-content-kpis" aria-label="Key Performance Indicators" style={{ padding: t.spacing[5], display: 'grid', gridTemplateColumns: `repeat(${Math.min(kpis.length, 5)}, 1fr)`, gap: t.spacing[4] }}>
                {kpis.map((kpi, i) => {
                  return (
                    <Box key={i} style={{ ...animStyle(i), ...entrance.animate, transition: entrance.transition }}>
                      <KpiCard kpi={kpi} />
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Distribution */}
            <SectionHeader section={SECTIONS[1]} />
            {expandedSections.has('distribution') && (
              <Box role="region" id="section-content-distribution" aria-label="Score Distribution" style={{ padding: `${t.spacing[5]}px ${t.spacing[6]}px` }}>
                {levelDistribution.map((level, idx) => {
                  const barPct = (level.count / distMax) * 100;
                  const barColor = resolveLevelColor(level, t);
                  return (
                    <Box key={idx} style={{ ...animStyle(idx), display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3], ...entrance.animate, transition: entrance.transition }}>
                      <Box style={{ width: 12, height: 12, borderRadius: t.borderRadius.sm, backgroundColor: barColor, flexShrink: 0 }} />
                      <Text style={{ width: 140, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium, flexShrink: 0 }}>
                        {level.level}
                      </Text>
                      <Box style={{ flex: 1, position: 'relative' as const, height: 24 }}>
                        <Box style={{ position: 'absolute' as const, inset: 0, borderRadius: t.borderRadius.md, backgroundColor: t.colors.neutral[100] }} />
                        <Box style={{
                          position: 'absolute' as const,
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${barPct}%`,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: barColor,
                          transition: `width ${t.motion.hover}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: barPct > 20 ? t.spacing[2] : 0,
                        }}>
                          {barPct > 20 && (
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white }}>
                              {level.count}
                            </Text>
                          )}
                        </Box>
                      </Box>
                      {barPct <= 20 && (
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], flexShrink: 0 }}>
                          {level.count}
                        </Text>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Heatmap */}
            <SectionHeader section={SECTIONS[2]} />
            {expandedSections.has('heatmap') && heatmapDimensions.length > 0 && (
              <Box role="region" id="section-content-heatmap" aria-label="Dimension Heatmap" style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], padding: t.spacing[5], overflowX: 'auto' as const }}>
                <Box style={{ display: 'grid', gridTemplateColumns: `140px repeat(${heatmapJobs.length}, minmax(90px, 1fr))`, gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                  <Box />
                  {heatmapJobs.map(job => (
                    <Box
                      key={job}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select job: ${job}`}
                      onClick={() => handleDrilldown(drilldownEntity === job ? null : job)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDrilldown(drilldownEntity === job ? null : job); } }}
                      style={{
                        textAlign: 'center' as const,
                        padding: t.spacing[1],
                        cursor: 'pointer',
                        borderRadius: t.borderRadius.sm,
                        backgroundColor: drilldownEntity === job ? t.colors.secondaryScale[50] : 'transparent',
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: drilldownEntity === job ? t.colors.secondaryScale[700] : t.colors.neutral[500],
                        fontWeight: drilldownEntity === job ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                      }}>
                        {job}
                      </Text>
                    </Box>
                  ))}
                </Box>

                {heatmapDimensions.map(dim => {
                  const isDimSel = selectedDimension === dim;
                  return (
                    <Box key={dim} style={{ display: 'grid', gridTemplateColumns: `140px repeat(${heatmapJobs.length}, minmax(90px, 1fr))`, gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                      <Box
                        role="button"
                        tabIndex={0}
                        aria-label={`Filter by dimension: ${dim}`}
                        onClick={() => handleDimSelect(isDimSel ? null : dim)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDimSelect(isDimSel ? null : dim); } }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: `0 ${t.spacing[1]}px`,
                          cursor: 'pointer',
                          borderRadius: t.borderRadius.sm,
                          backgroundColor: isDimSel ? t.colors.primaryScale[50] : 'transparent',
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          color: isDimSel ? t.colors.primaryScale[700] : t.colors.neutral[600],
                          fontWeight: isDimSel ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                        }}>
                          {dim}
                        </Text>
                      </Box>
                      {heatmapJobs.map(job => {
                        const score = heatmapLookup.get(`${dim}::${job}`) ?? 0;
                        const isHighlighted = isDimSel || drilldownEntity === job;
                        return (
                          <Box
                            key={job}
                            style={{
                              padding: t.spacing[2],
                              borderRadius: t.borderRadius.sm,
                              backgroundColor: getScoreBg(score, t),
                              textAlign: 'center' as const,
                              border: isHighlighted ? `2px solid ${t.colors.primaryScale[400]}` : '2px solid transparent',
                              transition: `all ${t.motion.hover}`,
                              display: 'flex',
                              flexDirection: 'column' as const,
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 44,
                              gap: t.spacing[0],
                            }}
                          >
                            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: getScoreColor(score, t) }}>
                              {Math.round(score)}
                            </Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              {getScoreLabel(score)}
                            </Text>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Knockouts */}
            <SectionHeader section={SECTIONS[3]} />
            {expandedSections.has('knockouts') && (
              <Box role="region" id="section-content-knockouts" aria-label="Knockout Analysis" style={{ padding: `${t.spacing[5]}px ${t.spacing[6]}px` }}>
                {filteredKnockouts.map((stat, idx) => {
                  const pct = stat.totalEvaluations > 0 ? (stat.knockoutCount / stat.totalEvaluations) * 100 : 0;
                  const barW = (stat.knockoutCount / knockoutMax) * 100;
                  const barColor = pct >= 5 ? t.colors.errorScale[500] : pct >= 2 ? t.colors.warningScale[500] : t.colors.neutral[400];
                  return (
                    <Box key={idx} style={{ ...animStyle(idx), ...card, marginBottom: t.spacing[3], ...entrance.animate, transition: entrance.transition }}>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], fontWeight: t.typography.fontWeight.medium }}>
                          {stat.dimension}
                        </Text>
                        <Box style={{ display: 'flex', gap: t.spacing[2], alignItems: 'center' }}>
                          <Box style={createBadgeStyle(t, pct >= 5 ? 'error' : pct >= 2 ? 'warning' : 'info')}>
                            <Text style={{ fontSize: t.typography.fontSize.xs }}>{pct.toFixed(1)}% rate</Text>
                          </Box>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                            {stat.knockoutCount}/{stat.totalEvaluations}
                          </Text>
                        </Box>
                      </Box>
                      <Box style={{ position: 'relative' as const, height: 8 }}>
                        <Box style={{ position: 'absolute' as const, inset: 0, borderRadius: t.borderRadius.sm, backgroundColor: t.colors.neutral[100] }} />
                        <Box style={{
                          position: 'absolute' as const,
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${barW}%`,
                          borderRadius: t.borderRadius.sm,
                          backgroundColor: barColor,
                          transition: `width ${t.motion.hover}`,
                        }} />
                      </Box>
                    </Box>
                  );
                })}
                {filteredKnockouts.length === 0 && (
                  <Text style={{ textAlign: 'center' as const, padding: t.spacing[4], color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>
                    No knockout data {searchQuery ? 'matching search' : 'available'}.
                  </Text>
                )}
              </Box>
            )}

            {/* Trends */}
            <SectionHeader section={SECTIONS[4]} />
            {expandedSections.has('trends') && trendData.length > 1 && (
              <Box role="region" id="section-content-trends" aria-label="Scoring Trends" style={{ padding: t.spacing[5], display: 'flex', justifyContent: 'center' }}>
                <svg width="100%" viewBox="0 0 580 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Score trend chart showing monthly score progression">
                  {[0, 0.25, 0.5, 0.75, 1].map(frac => {
                    const y = 16 + (1 - frac) * 150;
                    const val = (trendMin + frac * trendRange).toFixed(0);
                    return (
                      <g key={frac}>
                        <line x1={40} y1={y} x2={560} y2={y} stroke={t.colors.neutral[100]} strokeWidth={1} />
                        <text x={36} y={y + 4} fontSize={10} fill={t.colors.neutral[400]} textAnchor="end">{val}</text>
                      </g>
                    );
                  })}
                  {(() => {
                    const xStep = 520 / Math.max(trendData.length - 1, 1);
                    const points = trendData.map((p, i) => ({
                      x: 40 + i * xStep,
                      y: 16 + (1 - (p.value - trendMin) / trendRange) * 150,
                    }));
                    const lineColor = t.colors.primaryScale[500];
                    const areaPath = `M${points[0].x},${points[0].y} ${points.slice(1).map(p => `L${p.x},${p.y}`).join(' ')} L${points[points.length - 1].x},166 L${points[0].x},166 Z`;
                    return (
                      <g>
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={lineColor} stopOpacity={0.15} />
                            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill="url(#trendGrad)" />
                        <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        {points.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={lineColor} stroke={t.colors.common.white} strokeWidth={2} />
                        ))}
                      </g>
                    );
                  })()}
                  {trendData.map((p, i) => {
                    if (trendData.length > 10 && i % Math.ceil(trendData.length / 8) !== 0) return null;
                    const x = 40 + i * (520 / Math.max(trendData.length - 1, 1));
                    return (
                      <text key={i} x={x} y={190} fontSize={10} fill={t.colors.neutral[400]} textAnchor="middle">{p.date}</text>
                    );
                  })}
                </svg>
              </Box>
            )}

            {/* Cohorts */}
            <SectionHeader section={SECTIONS[5]} />
            {expandedSections.has('cohorts') && (
              <Box role="region" id="section-content-cohorts" aria-label="Cohort Comparison" style={{ padding: `${t.spacing[5]}px ${t.spacing[6]}px` }}>
                {cohortComparisons.map((cohort, idx) => {
                  const barW = (cohort.avgScore / cohortMax) * 100;
                  const scoreColor = getScoreColor(cohort.avgScore, t);
                  return (
                    <Box
                      key={idx}
                      role="button"
                      tabIndex={0}
                      aria-label={`Cohort: ${cohort.groupName}`}
                      onClick={() => handleDrilldown(drilldownEntity === cohort.groupName ? null : cohort.groupName)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDrilldown(drilldownEntity === cohort.groupName ? null : cohort.groupName); } }}
                      style={{
                        ...animStyle(idx),
                        ...card,
                        marginBottom: t.spacing[3],
                        cursor: 'pointer',
                        ...entrance.animate,
                        border: drilldownEntity === cohort.groupName
                          ? `2px solid ${t.colors.primaryScale[300]}`
                          : `1px solid ${t.colors.neutral[200]}`,
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                          <Users size={14} color={t.colors.neutral[500]} />
                          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], fontWeight: t.typography.fontWeight.medium }}>
                            {cohort.groupName}
                          </Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                            ({cohort.count} candidates)
                          </Text>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: scoreColor }}>
                            {formatScore(cohort.avgScore)}
                          </Text>
                          <Box style={{
                            padding: `2px ${t.spacing[2]}px`,
                            borderRadius: badgeRadius,
                            backgroundColor: getScoreBg(cohort.avgScore, t),
                          }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: scoreColor, fontWeight: t.typography.fontWeight.medium }}>
                              {getScoreLabel(cohort.avgScore)}
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                      <Box style={{ position: 'relative' as const, height: 6 }}>
                        <Box style={{ position: 'absolute' as const, inset: 0, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100] }} />
                        <Box style={{
                          position: 'absolute' as const,
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${barW}%`,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: scoreColor,
                          opacity: 0.7,
                          transition: `width ${t.motion.hover}`,
                        }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Skill Gaps */}
            <SectionHeader section={SECTIONS[6]} />
            {expandedSections.has('gaps') && (
              <Box role="region" id="section-content-gaps" aria-label="Skill Gap Analysis" style={{ padding: `${t.spacing[5]}px ${t.spacing[6]}px` }}>
                {filteredGaps.map((gap, idx) => {
                  const isPositive = gap.gapFromTarget >= 0;
                  const gapColor = isPositive ? t.colors.successScale[600] : t.colors.errorScale[600];
                  const gapBg = isPositive ? t.colors.successScale[50] : t.colors.errorScale[50];
                  return (
                    <Box
                      key={idx}
                      style={{
                        ...animStyle(idx),
                        ...card,
                        marginBottom: t.spacing[3],
                        borderLeft: `3px solid ${gapColor}`,
                        ...entrance.animate,
                        transition: entrance.transition,
                      }}
                    >
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                          {gap.dimension}
                        </Text>
                        <Box style={{ display: 'flex', gap: t.spacing[2], alignItems: 'center' }}>
                          <Box style={{
                            padding: `2px ${t.spacing[2]}px`,
                            borderRadius: badgeRadius,
                            backgroundColor: gapBg,
                          }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: gapColor }}>
                              {isPositive ? '+' : ''}{(gap.gapFromTarget ?? 0).toFixed(1)} gap
                            </Text>
                          </Box>
                          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                            Avg: {(gap.avgScore ?? 0).toFixed(1)}
                          </Text>
                        </Box>
                      </Box>
                      {/* Center-origin bar */}
                      <Box style={{ position: 'relative' as const, height: 10 }}>
                        <Box style={{ position: 'absolute' as const, inset: 0, borderRadius: t.borderRadius.sm, backgroundColor: t.colors.neutral[50] }} />
                        <Box style={{ position: 'absolute' as const, top: -1, left: '50%', width: 1, height: 'calc(100% + 2px)', backgroundColor: t.colors.neutral[300] }} />
                        <Box style={{
                          position: 'absolute' as const,
                          top: 2,
                          height: 'calc(100% - 4px)',
                          left: isPositive ? '50%' : `calc(50% - ${(Math.abs(gap.gapFromTarget) / gapMax) * 50}%)`,
                          width: `${(Math.abs(gap.gapFromTarget) / gapMax) * 50}%`,
                          borderRadius: t.borderRadius.sm,
                          backgroundColor: gapColor,
                          opacity: 0.6,
                          transition: `width ${t.motion.hover}`,
                        }} />
                      </Box>
                    </Box>
                  );
                })}
                {filteredGaps.length === 0 && (
                  <Text style={{ textAlign: 'center' as const, padding: t.spacing[4], color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>
                    No skill gap data {searchQuery ? 'matching search' : 'available'}.
                  </Text>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
