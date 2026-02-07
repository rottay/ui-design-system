'use client';

/**
 * BhScoringInsights - Dashboard Preset
 * Full analytics dashboard with KPI cards, distribution histograms,
 * dimension heatmap, knockout analysis, trend charts, cohort comparison,
 * skill gap analysis, and a filter bar.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
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
  Layers,
  Zap,
  Users,
  AlertTriangle,
  Award,
  PieChart,
  ArrowRight,
  X,
  BarChart,
  LineChart,
  AreaChart,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getScoreHeatColor(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[500];
  if (score >= 60) return tokens.colors.successScale[200];
  if (score >= 40) return tokens.colors.warningScale[300];
  if (score >= 20) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

function getScoreHeatBg(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[100];
  if (score >= 60) return tokens.colors.successScale[50];
  if (score >= 40) return tokens.colors.warningScale[50];
  if (score >= 20) return tokens.colors.warningScale[100];
  return tokens.colors.errorScale[100];
}

function getScoreHeatText(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[800];
  if (score >= 60) return tokens.colors.successScale[700];
  if (score >= 40) return tokens.colors.warningScale[800];
  if (score >= 20) return tokens.colors.warningScale[700];
  return tokens.colors.errorScale[800];
}

function getTrendIcon(trend: number) {
  if (trend > 0) return TrendingUp;
  if (trend < 0) return TrendingDown;
  return Minus;
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
/*  Preset                                                             */
/* ------------------------------------------------------------------ */
export const DashboardBhScoringInsights = createPreset<BhScoringInsightsProps>({
  name: 'BhScoringInsights.Dashboard',
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
      chartType: chartTypeProp,
      onChartTypeChange,
      className,
      style,
    } = props;

    /* ----- internal state ----- */
    const [internalDateRange, setInternalDateRange] = useState<[string, string]>(dateRangeProp ?? ['', '']);
    const [internalFilters, setInternalFilters] = useState<ScoringFilter>(filtersProp ?? {});
    const [internalSelectedDimension, setInternalSelectedDimension] = useState<string | null>(selectedDimensionProp ?? null);
    const [internalDrilldownEntity, setInternalDrilldownEntity] = useState<string | null>(drilldownEntityProp ?? null);
    const [internalChartType, setInternalChartType] = useState<'bar' | 'line' | 'area'>(chartTypeProp ?? 'line');

    const dateRange = dateRangeProp ?? internalDateRange;
    const filters = filtersProp ?? internalFilters;
    const selectedDimension = selectedDimensionProp ?? internalSelectedDimension;
    const drilldownEntity = drilldownEntityProp ?? internalDrilldownEntity;
    const chartType = chartTypeProp ?? internalChartType;

    const handleDateRangeChange = useCallback((range: [string, string]) => {
      setInternalDateRange(range);
      onDateRangeChange?.(range);
    }, [onDateRangeChange]);

    const handleFilterChange = useCallback((f: ScoringFilter) => {
      setInternalFilters(f);
      onFilterChange?.(f);
    }, [onFilterChange]);

    const handleDimensionSelect = useCallback((dim: string | null) => {
      setInternalSelectedDimension(dim);
      onDimensionSelect?.(dim);
    }, [onDimensionSelect]);

    const handleDrilldown = useCallback((entity: string | null) => {
      setInternalDrilldownEntity(entity);
      onDrilldown?.(entity);
    }, [onDrilldown]);

    const handleChartType = useCallback((type: 'bar' | 'line' | 'area') => {
      setInternalChartType(type);
      onChartTypeChange?.(type);
    }, [onChartTypeChange]);

    const glassCard = createCardStyle(tokens, { glass: true, elevation: 'md' });
    const surfaceStyle = createSurfaceStyle(tokens, { elevation: 'sm' });

    /* ---- Heatmap unique dimensions / jobs ---- */
    const heatmapDimensions = useMemo(() => [...new Set(heatmapData.map(c => c.dimension))], [heatmapData]);
    const heatmapJobs = useMemo(() => [...new Set(heatmapData.map(c => c.job))], [heatmapData]);
    const heatmapLookup = useMemo(() => {
      const map = new Map<string, number>();
      heatmapData.forEach(c => map.set(`${c.dimension}::${c.job}`, c.avgScore));
      return map;
    }, [heatmapData]);

    /* ---- Trend chart bounds ---- */
    const trendMax = useMemo(() => Math.max(...trendData.map(p => p.value), 1), [trendData]);
    const trendMin = useMemo(() => Math.min(...trendData.map(p => p.value), 0), [trendData]);
    const trendRange = trendMax - trendMin || 1;

    /* ---- Distribution max ---- */
    const distMax = useMemo(() => Math.max(...levelDistribution.map(l => l.count), 1), [levelDistribution]);

    /* ---- Knockout max ---- */
    const knockoutMax = useMemo(() => Math.max(...knockoutStats.map(k => k.knockoutCount), 1), [knockoutStats]);

    /* ---- Cohort max ---- */
    const cohortMax = useMemo(() => Math.max(...cohortComparisons.map(c => c.avgScore), 1), [cohortComparisons]);

    /* ---- Skill gap max ---- */
    const gapMax = useMemo(() => Math.max(...skillGaps.map(s => Math.abs(s.gapFromTarget)), 1), [skillGaps]);

    /* ---- Sparkline helper ---- */
    const renderSparkline = (kpi: ScoringKpi) => {
      const points = [kpi.previousValue, kpi.value];
      const max = Math.max(...points, 1);
      const min = Math.min(...points, 0);
      const range = max - min || 1;
      const w = 48;
      const h = 20;
      const x1 = 0;
      const y1 = h - ((points[0] - min) / range) * h;
      const x2 = w;
      const y2 = h - ((points[1] - min) / range) * h;
      const lineColor = kpi.trend >= 0 ? tokens.colors.successScale[500] : tokens.colors.errorScale[500];
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={lineColor} strokeWidth={2} strokeLinecap="round" />
          <circle cx={x2} cy={y2} r={2.5} fill={lineColor} />
        </svg>
      );
    };

    /* ---- Chart type icons ---- */
    const chartTypeOptions: Array<{ type: 'bar' | 'line' | 'area'; icon: typeof BarChart }> = [
      { type: 'bar', icon: BarChart },
      { type: 'line', icon: LineChart },
      { type: 'area', icon: AreaChart },
    ];

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, fontFamily: 'inherit', ...style }}>

        {/* ===== 8. Filter Bar ===== */}
        <Box style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: tokens.colors.neutral[50],
          ...(tokens.surface.useGlass && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Filter size={16} color={tokens.colors.neutral[500]} />
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Filters</span>
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
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}>
              <Calendar size={14} color={tokens.colors.neutral[400]} />
              <input
                type="date"
                value={dateRange[0]}
                onChange={(e) => handleDateRangeChange([e.target.value, dateRange[1]])}
                style={{
                  border: 'none', outline: 'none', fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600], fontFamily: 'inherit', backgroundColor: 'transparent',
                }}
              />
              <span style={{ color: tokens.colors.neutral[400] }}>-</span>
              <input
                type="date"
                value={dateRange[1]}
                onChange={(e) => handleDateRangeChange([dateRange[0], e.target.value])}
                style={{
                  border: 'none', outline: 'none', fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600], fontFamily: 'inherit', backgroundColor: 'transparent',
                }}
              />
            </Box>

            {/* Job filter */}
            <Box style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filters.job ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: filters.job ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: filters.job ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500] }}>
                {filters.job ?? 'All Jobs'}
              </span>
              {filters.job ? (
                <X size={12} color={tokens.colors.primaryScale[500]} onClick={() => handleFilterChange({ ...filters, job: null })} style={{ cursor: 'pointer' }} />
              ) : (
                <ChevronDown size={12} color={tokens.colors.neutral[400]} />
              )}
            </Box>

            {/* Stage filter */}
            <Box style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filters.stage ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: filters.stage ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: filters.stage ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500] }}>
                {filters.stage ?? 'All Stages'}
              </span>
              {filters.stage ? (
                <X size={12} color={tokens.colors.primaryScale[500]} onClick={() => handleFilterChange({ ...filters, stage: null })} style={{ cursor: 'pointer' }} />
              ) : (
                <ChevronDown size={12} color={tokens.colors.neutral[400]} />
              )}
            </Box>

            {/* Team filter */}
            <Box style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filters.team ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: filters.team ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: filters.team ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500] }}>
                {filters.team ?? 'All Teams'}
              </span>
              {filters.team ? (
                <X size={12} color={tokens.colors.primaryScale[500]} onClick={() => handleFilterChange({ ...filters, team: null })} style={{ cursor: 'pointer' }} />
              ) : (
                <ChevronDown size={12} color={tokens.colors.neutral[400]} />
              )}
            </Box>

            {/* Rubric filter */}
            <Box style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filters.rubric ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: filters.rubric ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: filters.rubric ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500] }}>
                {filters.rubric ?? 'All Rubrics'}
              </span>
              {filters.rubric ? (
                <X size={12} color={tokens.colors.primaryScale[500]} onClick={() => handleFilterChange({ ...filters, rubric: null })} style={{ cursor: 'pointer' }} />
              ) : (
                <ChevronDown size={12} color={tokens.colors.neutral[400]} />
              )}
            </Box>
          </Box>

          {/* Chart type selector */}
          <Box style={{ display: 'flex', gap: tokens.spacing[1], padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.md }}>
            {chartTypeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = chartType === opt.type;
              return (
                <button
                  key={opt.type}
                  onClick={() => handleChartType(opt.type)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    border: 'none',
                    backgroundColor: isActive ? tokens.colors.common.white : 'transparent',
                    color: isActive ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: isActive ? tokens.shadows.sm : 'none',
                  }}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </Box>
        </Box>

        {/* ===== Main Scrollable Content ===== */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[5] }}>

          {/* ===== 1. KPI Row ===== */}
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(kpis.length, 6)}, 1fr)`, gap: tokens.spacing[3], marginBottom: tokens.spacing[5] }}>
            {kpis.map((kpi, idx) => {
              const TrendIcon = getTrendIcon(kpi.trend);
              const trendColor = getTrendColor(kpi.trend, tokens);
              return (
                <Box
                  key={idx}
                  style={{
                    ...glassCard,
                    padding: tokens.spacing[4],
                  }}
                >
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[2] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {kpi.label}
                    </span>
                    {renderSparkline(kpi)}
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[2] }}>
                    <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], lineHeight: 1 }}>
                      {typeof kpi.value === 'number' && kpi.value % 1 !== 0 ? kpi.value.toFixed(1) : kpi.value}
                    </span>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                      <TrendIcon size={12} color={trendColor} />
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: trendColor, fontWeight: tokens.typography.fontWeight.medium }}>
                        {formatTrend(kpi.trend)}
                      </span>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* ===== 2. Score Distribution Histogram ===== */}
          {levelDistribution.length > 0 && (
            <Box style={{ ...glassCard, padding: tokens.spacing[5], marginBottom: tokens.spacing[5] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                <BarChart3 size={18} color={tokens.colors.primaryScale[600]} />
                <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                  Score Distribution
                </h3>
              </Box>

              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width={Math.max(levelDistribution.length * 80, 320)} height={200} viewBox={`0 0 ${Math.max(levelDistribution.length * 80, 320)} 200`}>
                  {/* Y-axis grid */}
                  {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const y = 10 + (1 - frac) * 160;
                    const val = Math.round(distMax * frac);
                    return (
                      <g key={frac}>
                        <line x1={40} y1={y} x2={Math.max(levelDistribution.length * 80, 320) - 10} y2={y} stroke={tokens.colors.neutral[100]} strokeWidth={1} />
                        <text x={35} y={y + 4} fontSize={10} fill={tokens.colors.neutral[400]} textAnchor="end">{val}</text>
                      </g>
                    );
                  })}

                  {/* Bars */}
                  {levelDistribution.map((level, idx) => {
                    const barWidth = 48;
                    const x = 50 + idx * 80;
                    const barHeight = (level.count / distMax) * 160;
                    const y = 10 + 160 - barHeight;
                    return (
                      <g key={idx}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx={4}
                          fill={level.color || tokens.colors.primaryScale[400]}
                        />
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          fontSize={11}
                          fill={tokens.colors.neutral[700]}
                          textAnchor="middle"
                          fontWeight={tokens.typography.fontWeight.semibold as number}
                        >
                          {level.count}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={186}
                          fontSize={10}
                          fill={tokens.colors.neutral[500]}
                          textAnchor="middle"
                        >
                          {level.level}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </Box>
            </Box>
          )}

          {/* ===== Grid: Heatmap + Knockout ===== */}
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[5], marginBottom: tokens.spacing[5] }}>

            {/* ===== 3. Dimension Heatmap ===== */}
            {heatmapDimensions.length > 0 && heatmapJobs.length > 0 && (
              <Box style={{ ...glassCard, padding: tokens.spacing[5] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Layers size={18} color={tokens.colors.secondaryScale[600]} />
                  <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                    Dimension Heatmap
                  </h3>
                </Box>

                <Box style={{ overflowX: 'auto' }}>
                  {/* Column headers (jobs) */}
                  <Box style={{ display: 'grid', gridTemplateColumns: `100px repeat(${heatmapJobs.length}, 1fr)`, gap: tokens.spacing[1], marginBottom: tokens.spacing[1] }}>
                    <Box />
                    {heatmapJobs.map(job => (
                      <Box key={job} style={{
                        textAlign: 'center',
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        fontWeight: tokens.typography.fontWeight.medium,
                        padding: tokens.spacing[1],
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {job}
                      </Box>
                    ))}
                  </Box>

                  {/* Rows (dimensions) */}
                  {heatmapDimensions.map(dim => (
                    <Box key={dim} style={{ display: 'grid', gridTemplateColumns: `100px repeat(${heatmapJobs.length}, 1fr)`, gap: tokens.spacing[1], marginBottom: tokens.spacing[1] }}>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        fontWeight: tokens.typography.fontWeight.medium,
                        display: 'flex',
                        alignItems: 'center',
                        padding: `0 ${tokens.spacing[1]}px`,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {dim}
                      </Box>
                      {heatmapJobs.map(job => {
                        const score = heatmapLookup.get(`${dim}::${job}`) ?? 0;
                        return (
                          <Box
                            key={job}
                            onClick={() => handleDimensionSelect(selectedDimension === dim ? null : dim)}
                            style={{
                              padding: tokens.spacing[2],
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: getScoreHeatBg(score, tokens),
                              textAlign: 'center',
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: getScoreHeatText(score, tokens),
                              cursor: 'pointer',
                              border: selectedDimension === dim ? `2px solid ${tokens.colors.primaryScale[400]}` : `1px solid ${getScoreHeatColor(score, tokens)}20`,
                              transition: `all ${tokens.motion.hover}`,
                              minHeight: tokens.spacing[8],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {Math.round(score)}
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* ===== 4. Knockout Analysis ===== */}
            {knockoutStats.length > 0 && (
              <Box style={{ ...glassCard, padding: tokens.spacing[5] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <AlertTriangle size={18} color={tokens.colors.errorScale[600]} />
                  <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                    Knockout Analysis
                  </h3>
                </Box>

                <Stack direction="vertical" spacing="sm">
                  {knockoutStats.map((stat, idx) => {
                    const pct = stat.totalEvaluations > 0 ? (stat.knockoutCount / stat.totalEvaluations) * 100 : 0;
                    const barWidth = (stat.knockoutCount / knockoutMax) * 100;
                    return (
                      <Box key={idx} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                        <span style={{ width: 120, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {stat.dimension}
                        </span>
                        <Box style={{ flex: 1, position: 'relative', height: tokens.spacing[5] }}>
                          <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100] }} />
                          <Box style={{
                            position: 'absolute', top: 0, left: 0, height: '100%',
                            width: `${barWidth}%`,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: pct >= 30 ? tokens.colors.errorScale[400] : pct >= 15 ? tokens.colors.warningScale[400] : tokens.colors.neutral[300],
                            transition: `width ${tokens.motion.hover}`,
                          }} />
                        </Box>
                        <Box style={{ width: 80, textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{stat.knockoutCount}</span>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginLeft: tokens.spacing[1] }}>({pct.toFixed(0)}%)</span>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>

          {/* ===== 5. Trend Charts ===== */}
          {trendData.length > 0 && (
            <Box style={{ ...glassCard, padding: tokens.spacing[5], marginBottom: tokens.spacing[5] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                <Activity size={18} color={tokens.colors.primaryScale[600]} />
                <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                  Score Trends
                </h3>
              </Box>

              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width={600} height={200} viewBox="0 0 600 200">
                  {/* Grid */}
                  {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const y = 15 + (1 - frac) * 160;
                    const val = (trendMin + frac * trendRange).toFixed(0);
                    return (
                      <g key={frac}>
                        <line x1={40} y1={y} x2={580} y2={y} stroke={tokens.colors.neutral[100]} strokeWidth={1} />
                        <text x={35} y={y + 4} fontSize={10} fill={tokens.colors.neutral[400]} textAnchor="end">{val}</text>
                      </g>
                    );
                  })}

                  {/* Line path */}
                  {trendData.length > 1 && (() => {
                    const xStep = 540 / Math.max(trendData.length - 1, 1);
                    const points = trendData.map((p, i) => {
                      const x = 40 + i * xStep;
                      const y = 15 + (1 - (p.value - trendMin) / trendRange) * 160;
                      return `${x},${y}`;
                    });

                    const lineColor = tokens.colors.primaryScale[500];

                    if (chartType === 'area') {
                      const firstX = 40;
                      const lastX = 40 + (trendData.length - 1) * xStep;
                      const areaPath = `M${points[0]} ${points.slice(1).map(p => `L${p}`).join(' ')} L${lastX},175 L${firstX},175 Z`;
                      return (
                        <g>
                          <path d={areaPath} fill={`${lineColor}20`} />
                          <polyline points={points.join(' ')} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          {trendData.map((p, i) => (
                            <circle key={i} cx={40 + i * xStep} cy={15 + (1 - (p.value - trendMin) / trendRange) * 160} r={3} fill={lineColor} stroke={tokens.colors.common.white} strokeWidth={2} />
                          ))}
                        </g>
                      );
                    }

                    if (chartType === 'bar') {
                      const barW = Math.max(xStep * 0.6, 8);
                      return (
                        <g>
                          {trendData.map((p, i) => {
                            const cx = 40 + i * xStep;
                            const y = 15 + (1 - (p.value - trendMin) / trendRange) * 160;
                            const barH = 175 - y;
                            return (
                              <rect key={i} x={cx - barW / 2} y={y} width={barW} height={barH} rx={3} fill={lineColor} opacity={0.7} />
                            );
                          })}
                        </g>
                      );
                    }

                    /* line (default) */
                    return (
                      <g>
                        <polyline points={points.join(' ')} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        {trendData.map((p, i) => (
                          <circle key={i} cx={40 + i * xStep} cy={15 + (1 - (p.value - trendMin) / trendRange) * 160} r={3} fill={lineColor} stroke={tokens.colors.common.white} strokeWidth={2} />
                        ))}
                      </g>
                    );
                  })()}

                  {/* X-axis labels (sampled) */}
                  {trendData.map((p, i) => {
                    if (trendData.length > 10 && i % Math.ceil(trendData.length / 8) !== 0) return null;
                    const x = 40 + i * (540 / Math.max(trendData.length - 1, 1));
                    return (
                      <text key={i} x={x} y={195} fontSize={9} fill={tokens.colors.neutral[400]} textAnchor="middle">
                        {p.date}
                      </text>
                    );
                  })}
                </svg>
              </Box>
            </Box>
          )}

          {/* ===== Grid: Cohort + Skill Gap ===== */}
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[5] }}>

            {/* ===== 6. Cohort Comparison ===== */}
            {cohortComparisons.length > 0 && (
              <Box style={{ ...glassCard, padding: tokens.spacing[5] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Users size={18} color={tokens.colors.infoScale[600]} />
                  <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                    Cohort Comparison
                  </h3>
                </Box>

                <Stack direction="vertical" spacing="sm">
                  {cohortComparisons.map((cohort, idx) => {
                    const barWidth = (cohort.avgScore / cohortMax) * 100;
                    const barColor = getScoreHeatColor(cohort.avgScore, tokens);
                    return (
                      <Box key={idx}>
                        <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium }}>
                            {cohort.groupName}
                          </span>
                          <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
                            <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                              {cohort.avgScore.toFixed(1)}
                            </span>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                              n={cohort.count}
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
                            transition: `width ${tokens.motion.hover}`,
                          }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* ===== 7. Skill Gap Analysis ===== */}
            {skillGaps.length > 0 && (
              <Box style={{ ...glassCard, padding: tokens.spacing[5] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Target size={18} color={tokens.colors.warningScale[600]} />
                  <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                    Skill Gap Analysis
                  </h3>
                </Box>

                <Stack direction="vertical" spacing="sm">
                  {skillGaps.map((gap, idx) => {
                    const isPositive = gap.gapFromTarget >= 0;
                    const barWidth = (Math.abs(gap.gapFromTarget) / gapMax) * 50;
                    const gapColor = isPositive ? tokens.colors.successScale[500] : tokens.colors.errorScale[500];
                    const gapBg = isPositive ? tokens.colors.successScale[50] : tokens.colors.errorScale[50];
                    return (
                      <Box key={idx} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                        <span style={{ width: 100, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {gap.dimension}
                        </span>
                        <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                          {/* Center line = target */}
                          <Box style={{ flex: 1, position: 'relative', height: tokens.spacing[5] }}>
                            <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[50] }} />
                            {/* Center marker */}
                            <Box style={{ position: 'absolute', top: -2, left: '50%', width: 2, height: `calc(100% + 4px)`, backgroundColor: tokens.colors.neutral[300] }} />
                            {/* Gap bar */}
                            <Box style={{
                              position: 'absolute',
                              top: 2,
                              height: `calc(100% - 4px)`,
                              left: isPositive ? '50%' : `calc(50% - ${barWidth}%)`,
                              width: `${barWidth}%`,
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: gapColor,
                              transition: `width ${tokens.motion.hover}`,
                              opacity: 0.7,
                            }} />
                          </Box>
                        </Box>
                        <Box style={{ width: 80, textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: gapColor }}>
                            {isPositive ? '+' : ''}{gap.gapFromTarget.toFixed(1)}
                          </span>
                          <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                            avg: {gap.avgScore.toFixed(1)}
                          </span>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>

                {/* Legend */}
                <Box style={{ display: 'flex', justifyContent: 'center', gap: tokens.spacing[4], marginTop: tokens.spacing[3] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box style={{ width: tokens.spacing[3], height: tokens.spacing[3], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.errorScale[500] }} />
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Below Target</span>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box style={{ width: 2, height: tokens.spacing[3], backgroundColor: tokens.colors.neutral[300] }} />
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Target</span>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box style={{ width: tokens.spacing[3], height: tokens.spacing[3], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.successScale[500] }} />
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Above Target</span>
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
