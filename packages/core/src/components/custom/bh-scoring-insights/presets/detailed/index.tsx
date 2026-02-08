'use client';

/**
 * BhScoringInsights - Detailed Preset
 * Drill-down focused view with expandable sections, per-dimension deep dives,
 * candidate-level breakdowns, and configurable analysis panels.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhScoringInsightsProps,
  ScoringKpi,
  LevelDistribution,
  HeatmapCell,
  KnockoutStat,
  TrendPoint,
  CohortComparison,
  SkillGap,
  ScoringFilter,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Activity,
  Target,
  Filter,
  Calendar,
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
  Eye,
  ExternalLink,
  ArrowRight,
  Info,
  PieChart,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getScoreColor(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[600];
  if (score >= 60) return tokens.colors.successScale[400];
  if (score >= 40) return tokens.colors.warningScale[600];
  if (score >= 20) return tokens.colors.warningScale[400];
  return tokens.colors.errorScale[600];
}

function getScoreBg(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[50];
  if (score >= 60) return tokens.colors.successScale[100];
  if (score >= 40) return tokens.colors.warningScale[50];
  if (score >= 20) return tokens.colors.warningScale[100];
  return tokens.colors.errorScale[100];
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  if (score >= 20) return 'Below';
  return 'Poor';
}

function getTrendColor(trend: number, tokens: DesignTokens): string {
  if (trend > 0) return tokens.colors.successScale[600];
  if (trend < 0) return tokens.colors.errorScale[600];
  return tokens.colors.neutral[500];
}

function formatTrend(trend: number): string {
  if (trend > 0) return `+${trend.toFixed(1)}%`;
  if (trend < 0) return `${trend.toFixed(1)}%`;
  return '0%';
}

/* ------------------------------------------------------------------ */
/*  Section definition                                                 */
/* ------------------------------------------------------------------ */
type SectionId = 'kpis' | 'distribution' | 'heatmap' | 'knockouts' | 'trends' | 'cohorts' | 'gaps';

interface SectionDef {
  id: SectionId;
  label: string;
  icon: typeof BarChart3;
}

const SECTIONS: SectionDef[] = [
  { id: 'kpis', label: 'Key Performance Indicators', icon: Award },
  { id: 'distribution', label: 'Score Distribution', icon: BarChart3 },
  { id: 'heatmap', label: 'Dimension Heatmap', icon: Layers },
  { id: 'knockouts', label: 'Knockout Analysis', icon: AlertTriangle },
  { id: 'trends', label: 'Scoring Trends', icon: Activity },
  { id: 'cohorts', label: 'Cohort Comparison', icon: Users },
  { id: 'gaps', label: 'Skill Gap Analysis', icon: Target },
];

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */
export const DetailedBhScoringInsights = createPreset<BhScoringInsightsProps>({
  name: 'BhScoringInsights.Detailed',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhScoringInsightsProps>) => {
    const { Box, Stack } = primitives;

    const {
      kpis = [],
      levelDistribution = [],
      heatmapData = [],
      knockoutStats = [],
      trendData = [],
      cohortComparisons = [],
      skillGaps = [],
      filters: filtersProp,
      onFilterChange,
      dateRange: dateRangeProp,
      onDateRangeChange,
      selectedDimension: selectedDimensionProp,
      onDimensionSelect,
      drilldownEntity: drilldownEntityProp,
      onDrilldown,
      className,
      style,
    } = props;

    const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set(['kpis', 'distribution', 'heatmap']));
    const [internalSelectedDimension, setInternalSelectedDimension] = useState<string | null>(selectedDimensionProp ?? null);
    const [internalDrilldownEntity, setInternalDrilldownEntity] = useState<string | null>(drilldownEntityProp ?? null);
    const [searchQuery, setSearchQuery] = useState('');
    const [internalFilters, setInternalFilters] = useState<ScoringFilter>(filtersProp ?? {});
    const [internalDateRange, setInternalDateRange] = useState<[string, string]>(dateRangeProp ?? ['', '']);

    const filters = filtersProp ?? internalFilters;
    const dateRange = dateRangeProp ?? internalDateRange;
    const selectedDimension = selectedDimensionProp ?? internalSelectedDimension;
    const drilldownEntity = drilldownEntityProp ?? internalDrilldownEntity;

    const toggleSection = useCallback((id: SectionId) => {
      setExpandedSections(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    const handleDimensionSelect = useCallback((dim: string | null) => {
      setInternalSelectedDimension(dim);
      onDimensionSelect?.(dim);
    }, [onDimensionSelect]);

    const handleDrilldown = useCallback((entity: string | null) => {
      setInternalDrilldownEntity(entity);
      onDrilldown?.(entity);
    }, [onDrilldown]);

    const handleFilterChange = useCallback((f: ScoringFilter) => {
      setInternalFilters(f);
      onFilterChange?.(f);
    }, [onFilterChange]);

    const handleDateRangeChange = useCallback((range: [string, string]) => {
      setInternalDateRange(range);
      onDateRangeChange?.(range);
    }, [onDateRangeChange]);

    const glassCard = useMemo(() => createCardStyle(tokens, { glass: true, elevation: 'md' }), [tokens]);
    const surfaceStyle = useMemo(() => createSurfaceStyle(tokens, { elevation: 'sm' }), [tokens]);

    /* ---- Computed data ---- */
    const heatmapDimensions = useMemo(() => [...new Set(heatmapData.map(c => c.dimension))], [heatmapData]);
    const heatmapJobs = useMemo(() => [...new Set(heatmapData.map(c => c.job))], [heatmapData]);
    const heatmapLookup = useMemo(() => {
      const map = new Map<string, number>();
      heatmapData.forEach(c => map.set(`${c.dimension}::${c.job}`, c.avgScore));
      return map;
    }, [heatmapData]);

    const trendMax = useMemo(() => Math.max(...trendData.map(p => p.value), 1), [trendData]);
    const trendMin = useMemo(() => Math.min(...trendData.map(p => p.value), 0), [trendData]);
    const trendRange = trendMax - trendMin || 1;

    const distMax = useMemo(() => Math.max(...levelDistribution.map(l => l.count), 1), [levelDistribution]);
    const knockoutMax = useMemo(() => Math.max(...knockoutStats.map(k => k.knockoutCount), 1), [knockoutStats]);
    const cohortMax = useMemo(() => Math.max(...cohortComparisons.map(c => c.avgScore), 1), [cohortComparisons]);
    const gapMax = useMemo(() => Math.max(...skillGaps.map(s => Math.abs(s.gapFromTarget)), 1), [skillGaps]);

    /* Filtered dimensions/knockouts by search */
    const filteredKnockouts = useMemo(() => {
      if (!searchQuery) return knockoutStats;
      return knockoutStats.filter(k => k.dimension.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [knockoutStats, searchQuery]);

    const filteredSkillGaps = useMemo(() => {
      if (!searchQuery) return skillGaps;
      return skillGaps.filter(g => g.dimension.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [skillGaps, searchQuery]);

    /* ---- Section renderer ---- */
    const renderSectionHeader = (section: SectionDef) => {
      const Icon = section.icon;
      const isExpanded = expandedSections.has(section.id);
      return (
        <button
          onClick={() => toggleSection(section.id)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            border: 'none',
            backgroundColor: isExpanded ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
            cursor: 'pointer',
            fontFamily: 'inherit',
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Icon size={16} color={isExpanded ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500]} />
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: isExpanded ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
            }}>
              {section.label}
            </span>
          </Box>
          {isExpanded ? (
            <ChevronUp size={16} color={tokens.colors.neutral[400]} />
          ) : (
            <ChevronDown size={16} color={tokens.colors.neutral[400]} />
          )}
        </button>
      );
    };

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, fontFamily: 'inherit', ...style }}>

        {/* ===== Header ===== */}
        <Box style={{
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...(tokens.surface.useGlass && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{
              width: tokens.spacing[10],
              height: tokens.spacing[10],
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PieChart size={20} color={tokens.colors.primaryScale[600]} />
            </Box>
            <Box>
              <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                Scoring Insights
              </h2>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                Detailed Analysis
              </span>
            </Box>
          </Box>

          {/* Search + filters */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            {/* Search */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
            }}>
              <Search size={14} color={tokens.colors.neutral[400]} />
              <input
                type="text"
                placeholder="Search dimensions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  fontFamily: 'inherit',
                  backgroundColor: 'transparent',
                  width: 160,
                }}
              
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                  e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                }}
              />
              {searchQuery && (
                <X size={12} color={tokens.colors.neutral[400]} onClick={() => setSearchQuery('')} style={{ cursor: 'pointer' }} />
              )}
            </Box>

            {/* Date range */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
            }}>
              <Calendar size={14} color={tokens.colors.neutral[400]} />
              <input
                type="date"
                value={dateRange[0]}
                onChange={(e) => handleDateRangeChange([e.target.value, dateRange[1]])}
                style={{ border: 'none', outline: 'none', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], fontFamily: 'inherit', backgroundColor: 'transparent' }}
              
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                  e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                }}
              />
              <span style={{ color: tokens.colors.neutral[400] }}>-</span>
              <input
                type="date"
                value={dateRange[1]}
                onChange={(e) => handleDateRangeChange([dateRange[0], e.target.value])}
                style={{ border: 'none', outline: 'none', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], fontFamily: 'inherit', backgroundColor: 'transparent' }}
              
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                  e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* ===== Sidebar + Content Layout ===== */}
        <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* --- Left sidebar: dimension drill-down --- */}
          <Box style={{
            width: 240,
            flexShrink: 0,
            borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            overflow: 'auto',
            backgroundColor: tokens.colors.neutral[50],
          }}>
            <Box style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dimensions
              </span>
            </Box>

            {heatmapDimensions.length > 0 ? heatmapDimensions.map(dim => {
              const isSelected = selectedDimension === dim;
              const dimScores = heatmapData.filter(c => c.dimension === dim);
              const avgScore = dimScores.length > 0 ? dimScores.reduce((sum, c) => sum + c.avgScore, 0) / dimScores.length : 0;
              return (
                <button
                  key={dim}
                  onClick={() => handleDimensionSelect(isSelected ? null : dim)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    border: 'none',
                    backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                    borderLeft: isSelected ? `3px solid ${tokens.colors.primaryScale[500]}` : '3px solid transparent',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
                    fontWeight: isSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {dim}
                  </span>
                  <Box style={{
                    padding: `0 ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: getScoreBg(avgScore, tokens),
                    color: getScoreColor(avgScore, tokens),
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    flexShrink: 0,
                  }}>
                    {Math.round(avgScore)}
                  </Box>
                </button>
              );
            }) : (
              <Box style={{ padding: tokens.spacing[4], textAlign: 'center', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                No dimensions available
              </Box>
            )}

            {/* Drilldown entities */}
            {heatmapJobs.length > 0 && (
              <>
                <Box style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  marginTop: tokens.spacing[2],
                }}>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Jobs
                  </span>
                </Box>
                {heatmapJobs.map(job => {
                  const isActive = drilldownEntity === job;
                  return (
                    <button
                      key={job}
                      onClick={() => handleDrilldown(isActive ? null : job)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        border: 'none',
                        backgroundColor: isActive ? tokens.colors.secondaryScale[50] : 'transparent',
                        borderLeft: isActive ? `3px solid ${tokens.colors.secondaryScale[500]}` : '3px solid transparent',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <span style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: isActive ? tokens.colors.secondaryScale[700] : tokens.colors.neutral[600],
                        fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                      }}>
                        {job}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </Box>

          {/* --- Main content: expandable sections --- */}
          <Box style={{ flex: 1, overflow: 'auto' }}>

            {/* === KPIs Section === */}
            {renderSectionHeader(SECTIONS[0])}
            {expandedSections.has('kpis') && (
              <Box style={{ padding: tokens.spacing[4] }}>
                <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(kpis.length, 3)}, 1fr)`, gap: tokens.spacing[3] }}>
                  {kpis.map((kpi, idx) => {
                    const trendColor = getTrendColor(kpi.trend, tokens);
                    const TrendIcon = kpi.trend > 0 ? TrendingUp : kpi.trend < 0 ? TrendingDown : Minus;
                    return (
                      <Box key={idx} style={{ ...glassCard, padding: tokens.spacing[4] }}>
                        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[2] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {kpi.label}
                          </span>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TrendIcon size={12} color={trendColor} />
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: trendColor, fontWeight: tokens.typography.fontWeight.medium }}>
                              {formatTrend(kpi.trend)}
                            </span>
                          </Box>
                        </Box>
                        <span style={{ display: 'block', fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], marginBottom: tokens.spacing[1] }}>
                          {typeof kpi.value === 'number' && kpi.value % 1 !== 0 ? kpi.value.toFixed(1) : kpi.value}
                        </span>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                            Previous: {typeof kpi.previousValue === 'number' && kpi.previousValue % 1 !== 0 ? kpi.previousValue.toFixed(1) : kpi.previousValue}
                          </span>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* === Distribution Section === */}
            {renderSectionHeader(SECTIONS[1])}
            {expandedSections.has('distribution') && (
              <Box style={{ padding: tokens.spacing[4] }}>
                <Stack direction="vertical" spacing="sm">
                  {levelDistribution.map((level, idx) => {
                    const barWidth = (level.count / distMax) * 100;
                    return (
                      <Box key={idx} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                        <Box style={{
                          width: 12,
                          height: 12,
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: level.color || tokens.colors.primaryScale[400],
                          flexShrink: 0,
                        }} />
                        <span style={{ width: 80, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium, flexShrink: 0 }}>
                          {level.level}
                        </span>
                        <Box style={{ flex: 1, position: 'relative', height: tokens.spacing[6] }}>
                          <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[100] }} />
                          <Box style={{
                            position: 'absolute', top: 0, left: 0, height: '100%',
                            width: `${barWidth}%`,
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: level.color || tokens.colors.primaryScale[400],
                            transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            paddingRight: barWidth > 15 ? tokens.spacing[2] : 0,
                          }}>
                            {barWidth > 15 && (
                              <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white }}>
                                {level.count}
                              </span>
                            )}
                          </Box>
                        </Box>
                        {barWidth <= 15 && (
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], flexShrink: 0 }}>
                            {level.count}
                          </span>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* === Heatmap Section === */}
            {renderSectionHeader(SECTIONS[2])}
            {expandedSections.has('heatmap') && heatmapDimensions.length > 0 && (
              <Box style={{ padding: tokens.spacing[4], overflowX: 'auto' }}>
                {/* Column headers */}
                <Box style={{ display: 'grid', gridTemplateColumns: `120px repeat(${heatmapJobs.length}, minmax(80px, 1fr))`, gap: tokens.spacing[1], marginBottom: tokens.spacing[1] }}>
                  <Box />
                  {heatmapJobs.map(job => (
                    <Box
                      key={job}
                      onClick={() => handleDrilldown(drilldownEntity === job ? null : job)}
                      style={{
                        textAlign: 'center',
                        fontSize: tokens.typography.fontSize.xs,
                        color: drilldownEntity === job ? tokens.colors.secondaryScale[700] : tokens.colors.neutral[500],
                        fontWeight: drilldownEntity === job ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                        padding: tokens.spacing[1],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: drilldownEntity === job ? tokens.colors.secondaryScale[50] : 'transparent',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {job}
                    </Box>
                  ))}
                </Box>

                {/* Rows */}
                {heatmapDimensions.map(dim => {
                  const isSelectedDim = selectedDimension === dim;
                  return (
                    <Box key={dim} style={{ display: 'grid', gridTemplateColumns: `120px repeat(${heatmapJobs.length}, minmax(80px, 1fr))`, gap: tokens.spacing[1], marginBottom: tokens.spacing[1] }}>
                      <Box
                        onClick={() => handleDimensionSelect(isSelectedDim ? null : dim)}
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: isSelectedDim ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                          fontWeight: isSelectedDim ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                          display: 'flex',
                          alignItems: 'center',
                          padding: `0 ${tokens.spacing[1]}px`,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: isSelectedDim ? tokens.colors.primaryScale[50] : 'transparent',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {dim}
                      </Box>
                      {heatmapJobs.map(job => {
                        const score = heatmapLookup.get(`${dim}::${job}`) ?? 0;
                        const isHighlighted = (isSelectedDim || drilldownEntity === job);
                        return (
                          <Box
                            key={job}
                            style={{
                              padding: tokens.spacing[2],
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: getScoreBg(score, tokens),
                              textAlign: 'center',
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: getScoreColor(score, tokens),
                              border: isHighlighted ? `2px solid ${tokens.colors.primaryScale[400]}` : `${tokens.surface.borderWidth} solid transparent`,
                              transition: `all ${tokens.motion.hover}`,
                              minHeight: tokens.spacing[8],
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 2,
                            }}
                          >
                            <span>{Math.round(score)}</span>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.normal as number, color: tokens.colors.neutral[400] }}>
                              {getScoreLabel(score)}
                            </span>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* === Knockouts Section === */}
            {renderSectionHeader(SECTIONS[3])}
            {expandedSections.has('knockouts') && (
              <Box style={{ padding: tokens.spacing[4] }}>
                <Stack direction="vertical" spacing="sm">
                  {filteredKnockouts.map((stat, idx) => {
                    const pct = stat.totalEvaluations > 0 ? (stat.knockoutCount / stat.totalEvaluations) * 100 : 0;
                    const barWidth = (stat.knockoutCount / knockoutMax) * 100;
                    const barColor = pct >= 30 ? tokens.colors.errorScale[500] : pct >= 15 ? tokens.colors.warningScale[500] : tokens.colors.neutral[400];
                    return (
                      <Box key={idx} style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        backgroundColor: tokens.colors.common.white,
                      }}>
                        <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], fontWeight: tokens.typography.fontWeight.medium }}>
                            {stat.dimension}
                          </span>
                          <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
                            <Box style={{
                              ...createBadgeStyle(tokens, pct >= 30 ? 'error' : pct >= 15 ? 'warning' : 'info'),
                            }}>
                              {pct.toFixed(1)}% rate
                            </Box>
                            <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                              {stat.knockoutCount}/{stat.totalEvaluations}
                            </span>
                          </Box>
                        </Box>
                        <Box style={{ position: 'relative', height: tokens.spacing[3] }}>
                          <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100] }} />
                          <Box style={{
                            position: 'absolute', top: 0, left: 0, height: '100%',
                            width: `${barWidth}%`,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: barColor,
                            transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                          }} />
                        </Box>
                      </Box>
                    );
                  })}
                  {filteredKnockouts.length === 0 && (
                    <Box style={{ textAlign: 'center', padding: tokens.spacing[4], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                      No knockout data {searchQuery ? 'matching search' : 'available'}.
                    </Box>
                  )}
                </Stack>
              </Box>
            )}

            {/* === Trends Section === */}
            {renderSectionHeader(SECTIONS[4])}
            {expandedSections.has('trends') && trendData.length > 0 && (
              <Box style={{ padding: tokens.spacing[4] }}>
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width={560} height={180} viewBox="0 0 560 180">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                      const y = 10 + (1 - frac) * 140;
                      const val = (trendMin + frac * trendRange).toFixed(0);
                      return (
                        <g key={frac}>
                          <line x1={35} y1={y} x2={545} y2={y} stroke={tokens.colors.neutral[100]} strokeWidth={1} />
                          <text x={30} y={y + 4} fontSize={9} fill={tokens.colors.neutral[400]} textAnchor="end">{val}</text>
                        </g>
                      );
                    })}

                    {/* Line */}
                    {trendData.length > 1 && (() => {
                      const xStep = 510 / Math.max(trendData.length - 1, 1);
                      const points = trendData.map((p, i) => {
                        const x = 35 + i * xStep;
                        const y = 10 + (1 - (p.value - trendMin) / trendRange) * 140;
                        return `${x},${y}`;
                      });
                      const lineColor = tokens.colors.primaryScale[500];
                      const firstX = 35;
                      const lastX = 35 + (trendData.length - 1) * xStep;
                      const areaPath = `M${points[0]} ${points.slice(1).map(p => `L${p}`).join(' ')} L${lastX},150 L${firstX},150 Z`;
                      return (
                        <g>
                          <path d={areaPath} fill={`${lineColor}15`} />
                          <polyline points={points.join(' ')} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          {trendData.map((p, i) => (
                            <circle key={i} cx={35 + i * xStep} cy={10 + (1 - (p.value - trendMin) / trendRange) * 140} r={3} fill={lineColor} stroke={tokens.colors.common.white} strokeWidth={2} />
                          ))}
                        </g>
                      );
                    })()}

                    {/* X-axis labels */}
                    {trendData.map((p, i) => {
                      if (trendData.length > 10 && i % Math.ceil(trendData.length / 8) !== 0) return null;
                      const x = 35 + i * (510 / Math.max(trendData.length - 1, 1));
                      return (
                        <text key={i} x={x} y={172} fontSize={9} fill={tokens.colors.neutral[400]} textAnchor="middle">
                          {p.date}
                        </text>
                      );
                    })}
                  </svg>
                </Box>
              </Box>
            )}

            {/* === Cohorts Section === */}
            {renderSectionHeader(SECTIONS[5])}
            {expandedSections.has('cohorts') && (
              <Box style={{ padding: tokens.spacing[4] }}>
                <Stack direction="vertical" spacing="sm">
                  {cohortComparisons.map((cohort, idx) => {
                    const barWidth = (cohort.avgScore / cohortMax) * 100;
                    const scoreColor = getScoreColor(cohort.avgScore, tokens);
                    return (
                      <Box
                        key={idx}
                        onClick={() => handleDrilldown(drilldownEntity === cohort.groupName ? null : cohort.groupName)}
                        style={{
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${drilldownEntity === cohort.groupName ? tokens.colors.primaryScale[300] : tokens.colors.neutral[100]}`,
                          backgroundColor: drilldownEntity === cohort.groupName ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Users size={14} color={tokens.colors.neutral[500]} />
                            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], fontWeight: tokens.typography.fontWeight.medium }}>
                              {cohort.groupName}
                            </span>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                              ({cohort.count} candidates)
                            </span>
                          </Box>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                            <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: scoreColor }}>
                              {cohort.avgScore.toFixed(1)}
                            </span>
                            <span style={{
                              fontSize: tokens.typography.fontSize.xs,
                              padding: `0 ${tokens.spacing[1]}px`,
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: getScoreBg(cohort.avgScore, tokens),
                              color: scoreColor,
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}>
                              {getScoreLabel(cohort.avgScore)}
                            </span>
                          </Box>
                        </Box>
                        <Box style={{ position: 'relative', height: tokens.spacing[2] }}>
                          <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100] }} />
                          <Box style={{
                            position: 'absolute', top: 0, left: 0, height: '100%',
                            width: `${barWidth}%`,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: scoreColor,
                            opacity: 0.7,
                            transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                          }} />
                        </Box>
                      </Box>
                    );
                  })}
                  {cohortComparisons.length === 0 && (
                    <Box style={{ textAlign: 'center', padding: tokens.spacing[4], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                      No cohort data available.
                    </Box>
                  )}
                </Stack>
              </Box>
            )}

            {/* === Skill Gaps Section === */}
            {renderSectionHeader(SECTIONS[6])}
            {expandedSections.has('gaps') && (
              <Box style={{ padding: tokens.spacing[4] }}>
                <Stack direction="vertical" spacing="sm">
                  {filteredSkillGaps.map((gap, idx) => {
                    const isPositive = gap.gapFromTarget >= 0;
                    const gapColor = isPositive ? tokens.colors.successScale[600] : tokens.colors.errorScale[600];
                    const gapBg = isPositive ? tokens.colors.successScale[50] : tokens.colors.errorScale[50];
                    return (
                      <Box
                        key={idx}
                        style={{
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          borderLeft: `3px solid ${gapColor}`,
                          backgroundColor: tokens.colors.common.white,
                        }}
                      >
                        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                            {gap.dimension}
                          </span>
                          <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
                            <Box style={{
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: gapBg,
                              color: gapColor,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                            }}>
                              {isPositive ? '+' : ''}{gap.gapFromTarget.toFixed(1)} gap
                            </Box>
                            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                              Avg: {gap.avgScore.toFixed(1)}
                            </span>
                          </Box>
                        </Box>
                        {/* Visual bar from center */}
                        <Box style={{ position: 'relative', height: tokens.spacing[3] }}>
                          <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[50] }} />
                          <Box style={{ position: 'absolute', top: -1, left: '50%', width: 1, height: `calc(100% + 2px)`, backgroundColor: tokens.colors.neutral[300] }} />
                          <Box style={{
                            position: 'absolute',
                            top: 2,
                            height: `calc(100% - 4px)`,
                            left: isPositive ? '50%' : `calc(50% - ${(Math.abs(gap.gapFromTarget) / gapMax) * 50}%)`,
                            width: `${(Math.abs(gap.gapFromTarget) / gapMax) * 50}%`,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: gapColor,
                            opacity: 0.6,
                            transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                          }} />
                        </Box>
                      </Box>
                    );
                  })}
                  {filteredSkillGaps.length === 0 && (
                    <Box style={{ textAlign: 'center', padding: tokens.spacing[4], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                      No skill gap data {searchQuery ? 'matching search' : 'available'}.
                    </Box>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
