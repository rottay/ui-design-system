'use client';

/**
 * BhAnalyticsHub - Executive Preset
 * Comprehensive analytics dashboard with hiring funnel, time-to-hire,
 * source effectiveness, recruiter performance, cost analysis,
 * pipeline velocity, diversity metrics, trend comparison, and export controls.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhAnalyticsHubProps,
  DateRangePreset,
  FunnelStage,
  TimeToHireData,
  SourceEffectiveness,
  RecruiterPerformance,
  CostAnalysis,
  PipelineVelocity,
  TrendComparison,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

/* ------------------------------------------------------------------ */
/*  Helper: sparkline polyline points                                 */
/* ------------------------------------------------------------------ */
function sparklinePoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  return data
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

/* ------------------------------------------------------------------ */
/*  Helper: format numbers                                            */
/* ------------------------------------------------------------------ */
function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/* ------------------------------------------------------------------ */
/*  Helper: funnel trapezoid path                                     */
/* ------------------------------------------------------------------ */
function funnelTrapezoid(
  x: number,
  y: number,
  topWidth: number,
  bottomWidth: number,
  height: number,
  centerX: number
): string {
  const topLeft = centerX - topWidth / 2;
  const topRight = centerX + topWidth / 2;
  const bottomLeft = centerX - bottomWidth / 2;
  const bottomRight = centerX + bottomWidth / 2;
  return `M ${topLeft} ${y} L ${topRight} ${y} L ${bottomRight} ${y + height} L ${bottomLeft} ${y + height} Z`;
}

/* ------------------------------------------------------------------ */
/*  Helper: bar chart value to pixel                                  */
/* ------------------------------------------------------------------ */
function valueToBarWidth(value: number, maxValue: number, maxWidth: number): number {
  if (maxValue <= 0) return 0;
  return (value / maxValue) * maxWidth;
}

/* ------------------------------------------------------------------ */
/*  Helper: trend line points for dual-line chart                     */
/* ------------------------------------------------------------------ */
function trendLinePoints(
  data: TrendComparison[],
  width: number,
  height: number,
  padding: number,
  key: 'current' | 'previous'
): string {
  if (!data.length) return '';
  const allValues = data.flatMap((d) => [d.current, d.previous]);
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  return data
    .map((d, i) => {
      const x = padding + i * stepX;
      const val = d[key];
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

/* ------------------------------------------------------------------ */
/*  Chart color palette                                               */
/* ------------------------------------------------------------------ */
function getChartColors(tokens: DesignTokens): string[] {
  return [
    tokens.colors.primaryScale[500],
    tokens.colors.successScale[500],
    tokens.colors.warningScale[500],
    tokens.colors.errorScale[500],
    tokens.colors.infoScale[500],
    tokens.colors.primaryScale[300],
    tokens.colors.successScale[300],
    tokens.colors.warningScale[300],
  ];
}

/* ------------------------------------------------------------------ */
/*  Executive Preset                                                  */
/* ------------------------------------------------------------------ */
export const ExecutiveBhAnalyticsHub = createPreset<BhAnalyticsHubProps>({
  name: 'BhAnalyticsHub.Executive',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhAnalyticsHubProps>) => {
    const { Box, Text } = primitives;

    const {
      dateRange: controlledDateRange,
      onDateRangeChange,
      comparisonPeriod: controlledComparison,
      onComparisonToggle,
      funnelData = [],
      timeToHireData = [],
      sourceData = [],
      recruiterData = [],
      costData = [],
      velocityData = [],
      diversityData,
      trendData = [],
      filters: controlledFilters,
      onFilterChange,
      selectedMetric: controlledSelectedMetric,
      onMetricSelect,
      drilldownEntity: controlledDrilldown,
      onDrilldown,
      exportFormat: controlledExportFormat,
      onExport,
      className,
      style,
    } = props;

    const [localDateRange, setLocalDateRange] = useState<DateRangePreset>('30d');
    const [localComparison, setLocalComparison] = useState(false);
    const [localFilters, setLocalFilters] = useState<Record<string, string>>({});
    const [localSelectedMetric, setLocalSelectedMetric] = useState<string | null>(null);
    const [localDrilldown, setLocalDrilldown] = useState<string | null>(null);
    const [localExportFormat, setLocalExportFormat] = useState<'pdf' | 'csv' | 'email'>('pdf');

    const dateRange = controlledDateRange ?? localDateRange;
    const comparisonEnabled = controlledComparison ?? localComparison;
    const filters = controlledFilters ?? localFilters;
    const selectedMetric = controlledSelectedMetric !== undefined ? controlledSelectedMetric : localSelectedMetric;
    const drilldownEntity = controlledDrilldown !== undefined ? controlledDrilldown : localDrilldown;
    const exportFormat = controlledExportFormat ?? localExportFormat;

    const handleDateRange = (range: DateRangePreset) => {
      setLocalDateRange(range);
      onDateRangeChange?.(range);
    };

    const handleComparison = (enabled: boolean) => {
      setLocalComparison(enabled);
      onComparisonToggle?.(enabled);
    };

    const handleMetricSelect = (metric: string | null) => {
      setLocalSelectedMetric(metric);
      onMetricSelect?.(metric);
    };

    const handleDrilldown = (entity: string | null) => {
      setLocalDrilldown(entity);
      onDrilldown?.(entity);
    };

    const handleExport = (format: 'pdf' | 'csv' | 'email') => {
      setLocalExportFormat(format);
      onExport?.(format);
    };

    const isGlass = engine === 'modern' && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const chartColors = getChartColors(tokens);

    /* ---------- Funnel calculations ---------- */
    const funnelMaxCount = useMemo(() => {
      return funnelData.length > 0 ? Math.max(...funnelData.map((s) => s.count)) : 1;
    }, [funnelData]);

    /* ---------- Source max values ---------- */
    const sourceMax = useMemo(() => {
      return sourceData.length > 0 ? Math.max(...sourceData.map((s) => s.candidateCount)) : 1;
    }, [sourceData]);

    /* ---------- Time-to-hire max ---------- */
    const tthMax = useMemo(() => {
      return timeToHireData.length > 0 ? Math.max(...timeToHireData.map((d) => d.avgDays)) : 1;
    }, [timeToHireData]);

    /* ---------- Cost max ---------- */
    const costMax = useMemo(() => {
      return costData.length > 0 ? Math.max(...costData.map((d) => d.costPerHire)) : 1;
    }, [costData]);

    /* ---------- Velocity max ---------- */
    const velocityMax = useMemo(() => {
      const allVals = velocityData.flatMap((d) => [d.avgDays, d.slaLimit]);
      return allVals.length > 0 ? Math.max(...allVals) : 1;
    }, [velocityData]);

    /* ---------- Chart dimensions ---------- */
    const funnelWidth = 480;
    const funnelHeight = funnelData.length * 56 + 20;
    const barChartWidth = 480;
    const barChartBarHeight = 28;
    const trendWidth = 560;
    const trendHeight = 200;
    const trendPadding = 24;

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[6],
          padding: tokens.spacing[6],
          minHeight: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* ========== DATE RANGE SELECTOR + COMPARISON + EXPORT ========== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap' as const,
            gap: tokens.spacing[3],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl || '1.25rem',
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              Analytics
            </Text>

            {/* Quick pick buttons */}
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              {(['7d', '30d', '90d', 'year'] as const).map((range) => (
                <div
                  key={range}
                  onClick={() => handleDateRange(range)}
                  style={{
                    ...hoverStyle,
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: dateRange === range ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    backgroundColor: dateRange === range ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: dateRange === range ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${dateRange === range ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                  }}
                >
                  {range === 'year' ? '1Y' : range.toUpperCase()}
                </div>
              ))}
              <div
                onClick={() => handleDateRange('custom')}
                style={{
                  ...hoverStyle,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: dateRange === 'custom' ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  backgroundColor: dateRange === 'custom' ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: dateRange === 'custom' ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${dateRange === 'custom' ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                }}
              >
                Custom
              </div>
            </div>

            {/* Comparison toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                paddingLeft: tokens.spacing[2],
                borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              <div
                onClick={() => handleComparison(!comparisonEnabled)}
                style={{
                  ...hoverStyle,
                  width: 36,
                  height: 20,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: comparisonEnabled ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                  position: 'relative' as const,
                  flexShrink: 0,
                  transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.common.white,
                    position: 'absolute' as const,
                    top: 2,
                    left: comparisonEnabled ? 18 : 2,
                    transition: `left ${tokens.transitions?.normal || tokens.motion.hover}`,
                    boxShadow: tokens.shadows.sm,
                  }}
                />
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                Compare
              </Text>
            </div>
          </div>

          {/* Export controls */}
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            {(['pdf', 'csv', 'email'] as const).map((format) => (
              <div
                key={format}
                onClick={() => handleExport(format)}
                style={{
                  ...hoverStyle,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[600],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  textTransform: 'uppercase' as const,
                }}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, { backgroundColor: tokens.colors.neutral[50] })}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, { backgroundColor: tokens.colors.common.white })}
              >
                {format.toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* ========== HIRING FUNNEL ========== */}
        <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
          <Text style={{ ...sectionHeader }}>Hiring Funnel</Text>
          {funnelData.length > 0 ? (
            <div style={{ display: 'flex', gap: tokens.spacing[4], alignItems: 'flex-start' }}>
              <svg
                viewBox={`0 0 ${funnelWidth} ${funnelHeight}`}
                style={{ width: '100%', maxWidth: funnelWidth, height: 'auto' }}
                preserveAspectRatio="xMidYMid meet"
              >
                {funnelData.map((stage, i) => {
                  const stageHeight = 40;
                  const stageGap = 16;
                  const y = 10 + i * (stageHeight + stageGap);
                  const widthPercent = funnelMaxCount > 0 ? stage.count / funnelMaxCount : 0;
                  const nextWidthPercent =
                    i < funnelData.length - 1 && funnelMaxCount > 0
                      ? funnelData[i + 1].count / funnelMaxCount
                      : widthPercent * 0.8;
                  const maxTrapWidth = funnelWidth - 120;
                  const topWidth = Math.max(widthPercent * maxTrapWidth, 60);
                  const bottomWidth = Math.max(nextWidthPercent * maxTrapWidth, 40);
                  const centerX = funnelWidth / 2;
                  const colorIndex = i % chartColors.length;

                  return (
                    <g
                      key={stage.name}
                      onClick={() => handleDrilldown(drilldownEntity === stage.name ? null : stage.name)}
                      style={{ cursor: 'pointer' }}
                    >
                      <path
                        d={funnelTrapezoid(0, y, topWidth, bottomWidth, stageHeight, centerX)}
                        fill={chartColors[colorIndex]}
                        opacity={drilldownEntity === stage.name ? 1 : 0.8}
                        rx={4}
                      />
                      {/* Stage name */}
                      <text
                        x={centerX}
                        y={y + stageHeight / 2 - 4}
                        textAnchor="middle"
                        fontSize={tokens.typography.fontSize.xs}
                        fontWeight={tokens.typography.fontWeight.semibold}
                        fill={tokens.colors.common.white}
                      >
                        {stage.name}
                      </text>
                      {/* Count */}
                      <text
                        x={centerX}
                        y={y + stageHeight / 2 + 12}
                        textAnchor="middle"
                        fontSize={tokens.typography.fontSize.xs}
                        fill={tokens.overlay?.white}
                      >
                        {formatNumber(stage.count)}
                      </text>
                      {/* Conversion % on the right */}
                      <text
                        x={funnelWidth - 10}
                        y={y + stageHeight / 2 + 4}
                        textAnchor="end"
                        fontSize={tokens.typography.fontSize.xs}
                        fontWeight={tokens.typography.fontWeight.medium}
                        fill={tokens.colors.neutral[600]}
                      >
                        {formatPercent(stage.conversionPercent)}
                      </text>
                      {/* Trend vs previous */}
                      {comparisonEnabled && stage.prevPeriodCount !== undefined && (
                        <text
                          x={funnelWidth - 10}
                          y={y + stageHeight / 2 + 18}
                          textAnchor="end"
                          fontSize={tokens.typography.fontSize.xs}
                          fill={
                            stage.count >= stage.prevPeriodCount
                              ? tokens.colors.successScale[500]
                              : tokens.colors.errorScale[500]
                          }
                        >
                          {stage.count >= stage.prevPeriodCount ? '\u2191' : '\u2193'}{' '}
                          {stage.prevPeriodCount !== 0
                            ? formatPercent(
                                Math.abs(((stage.count - stage.prevPeriodCount) / stage.prevPeriodCount) * 100)
                              )
                            : 'N/A'}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 120,
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
              }}
            >
              No funnel data available
            </div>
          )}
        </Box>

        {/* ========== TWO-COLUMN: TIME-TO-HIRE + SOURCE EFFECTIVENESS ========== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[6] }}>
          {/* ---- Time-to-Hire Bar Chart ---- */}
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Time-to-Hire (days)</Text>
            {timeToHireData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                {timeToHireData.map((job, i) => {
                  const barWidth = valueToBarWidth(job.avgDays, tthMax, 220);
                  const isBottleneck = job.stages.some((s) => s.avgDays > job.avgDays * 0.5);
                  return (
                    <div
                      key={job.job}
                      onClick={() => handleDrilldown(drilldownEntity === job.job ? null : job.job)}
                      style={{
                        ...hoverStyle,
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        padding: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: drilldownEntity === job.job ? tokens.colors.primaryScale[50] : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[700],
                          width: 100,
                          flexShrink: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {job.job}
                      </Text>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <div
                          style={{
                            height: barChartBarHeight,
                            width: barWidth,
                            minWidth: 4,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: isBottleneck ? tokens.colors.errorScale[400] : chartColors[i % chartColors.length],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            paddingRight: tokens.spacing[2],
                            transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                          }}
                        >
                          {barWidth > 40 && (
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.semibold }}>
                              {job.avgDays}d
                            </Text>
                          )}
                        </div>
                        {barWidth <= 40 && (
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium }}>
                            {job.avgDays}d
                          </Text>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Drill-down detail */}
                {drilldownEntity && timeToHireData.find((d) => d.job === drilldownEntity) && (
                  <div
                    style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.primaryScale[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                      marginTop: tokens.spacing[2],
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[700], marginBottom: tokens.spacing[2] }}>
                      {drilldownEntity} - Stage Breakdown
                    </Text>
                    {timeToHireData
                      .find((d) => d.job === drilldownEntity)!
                      .stages.map((stg, si) => (
                        <div key={stg.name} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], width: 80 }}>
                            {stg.name}
                          </Text>
                          <div
                            style={{
                              height: 12,
                              width: valueToBarWidth(stg.avgDays, tthMax, 120),
                              minWidth: 2,
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: stg.avgDays > tthMax * 0.4 ? tokens.colors.errorScale[400] : tokens.colors.primaryScale[300],
                            }}
                          />
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                            {stg.avgDays}d
                          </Text>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                No time-to-hire data
              </div>
            )}
          </Box>

          {/* ---- Source Effectiveness ---- */}
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Source Effectiveness</Text>
            {sourceData.length > 0 ? (
              <div style={{ position: 'relative' as const }}>
                {sourceData.map((source, i) => {
                  const barWidth = valueToBarWidth(source.candidateCount, sourceMax, 200);
                  return (
                    <div
                      key={source.source}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        marginBottom: tokens.spacing[3],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[700],
                          width: 90,
                          flexShrink: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {source.source}
                      </Text>
                      <div style={{ flex: 1, position: 'relative' as const }}>
                        {/* Candidate count bar */}
                        <div
                          style={{
                            height: barChartBarHeight,
                            width: barWidth,
                            minWidth: 4,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: chartColors[i % chartColors.length],
                            opacity: 0.7,
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: tokens.spacing[2],
                          }}
                        >
                          {barWidth > 50 && (
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.medium }}>
                              {source.candidateCount}
                            </Text>
                          )}
                        </div>
                        {/* Quality score overlay line */}
                        <div
                          style={{
                            position: 'absolute' as const,
                            top: 0,
                            left: (source.qualityScore / 100) * 200,
                            width: 2,
                            height: barChartBarHeight,
                            backgroundColor: tokens.colors.neutral[800],
                            borderRadius: tokens.borderRadius.full,
                          }}
                          title={`Quality: ${source.qualityScore}%`}
                        />
                      </div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], width: 40, textAlign: 'right' as const }}>
                        Q:{source.qualityScore}
                      </Text>
                    </div>
                  );
                })}
                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginTop: tokens.spacing[2] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <div style={{ width: 12, height: 8, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.primaryScale[500], opacity: 0.7 }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Candidates</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <div style={{ width: 2, height: 12, backgroundColor: tokens.colors.neutral[800], borderRadius: tokens.borderRadius.full }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Quality Score</Text>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                No source data
              </div>
            )}
          </Box>
        </div>

        {/* ========== RECRUITER PERFORMANCE TABLE ========== */}
        <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
          <Text style={{ ...sectionHeader }}>Recruiter Performance</Text>
          {recruiterData.length > 0 ? (
            <div style={{ overflowX: 'auto' as const }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse' as const,
                  fontSize: tokens.typography.fontSize.sm,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                    {['Rank', 'Recruiter', 'Hires', 'Velocity', 'Pipeline', 'Satisfaction', 'Trend'].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          textAlign: col === 'Rank' ? 'center' as const : 'left' as const,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[500],
                          fontSize: tokens.typography.fontSize.xs,
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recruiterData.map((recruiter, i) => (
                    <tr
                      key={recruiter.name}
                      style={{
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tokens.colors.neutral[50])}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onClick={() => handleMetricSelect(selectedMetric === recruiter.name ? null : recruiter.name)}
                    >
                      {/* Rank */}
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'center' as const }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: i < 3 ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100],
                            color: i < 3 ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.bold,
                          }}
                        >
                          {i + 1}
                        </div>
                      </td>
                      {/* Name + Avatar */}
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.primaryScale[100],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.primaryScale[700],
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            {recruiter.avatar ? (
                              <img
                                src={recruiter.avatar}
                                alt={recruiter.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
                              />
                            ) : (
                              recruiter.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <Text
                            style={{
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[800],
                              fontSize: tokens.typography.fontSize.sm,
                            }}
                          >
                            {recruiter.name}
                          </Text>
                        </div>
                      </td>
                      {/* Hires */}
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                        {recruiter.hires}
                      </td>
                      {/* Velocity */}
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[600] }}>
                        {recruiter.velocity}d avg
                      </td>
                      {/* Pipeline Value */}
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[600] }}>
                        {formatCurrency(recruiter.pipelineValue)}
                      </td>
                      {/* Satisfaction */}
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                          <div
                            style={{
                              width: 48,
                              height: 6,
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.neutral[100],
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${recruiter.satisfaction}%`,
                                height: '100%',
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor:
                                  recruiter.satisfaction >= 80
                                    ? tokens.colors.successScale[500]
                                    : recruiter.satisfaction >= 60
                                    ? tokens.colors.warningScale[500]
                                    : tokens.colors.errorScale[500],
                              }}
                            />
                          </div>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                            {recruiter.satisfaction}%
                          </Text>
                        </div>
                      </td>
                      {/* Mini sparkline */}
                      <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                        {recruiter.sparkline.length > 0 && (
                          <svg width={60} height={20} viewBox="0 0 60 20">
                            <polyline
                              points={sparklinePoints(recruiter.sparkline, 60, 20, 2)}
                              fill="none"
                              stroke={tokens.colors.primaryScale[400]}
                              strokeWidth={1.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              No recruiter data
            </div>
          )}
        </Box>

        {/* ========== TWO-COLUMN: COST ANALYSIS + PIPELINE VELOCITY ========== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[6] }}>
          {/* ---- Cost Analysis (Stacked bars) ---- */}
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Cost per Hire</Text>
            {costData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                {costData.map((cat, ci) => {
                  const barWidth = valueToBarWidth(cat.costPerHire, costMax, 220);
                  return (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>
                          {cat.category}
                        </Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                          {formatCurrency(cat.costPerHire)}
                        </Text>
                      </div>
                      {/* Stacked bar */}
                      <div
                        style={{
                          display: 'flex',
                          height: barChartBarHeight,
                          borderRadius: tokens.borderRadius.sm,
                          overflow: 'hidden',
                          width: barWidth,
                          minWidth: 4,
                        }}
                      >
                        {cat.breakdown.map((b, bi) => {
                          const segmentWidth = cat.costPerHire > 0 ? (b.cost / cat.costPerHire) * 100 : 0;
                          return (
                            <div
                              key={b.item}
                              style={{
                                width: `${segmentWidth}%`,
                                height: '100%',
                                backgroundColor: chartColors[(ci + bi) % chartColors.length],
                              }}
                              title={`${b.item}: ${formatCurrency(b.cost)}`}
                            />
                          );
                        })}
                      </div>
                      {/* Breakdown legend */}
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
                        {cat.breakdown.map((b, bi) => (
                          <div key={b.item} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: chartColors[(ci + bi) % chartColors.length],
                              }}
                            />
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                              {b.item}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                No cost data
              </div>
            )}
          </Box>

          {/* ---- Pipeline Velocity with SLA ---- */}
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Pipeline Velocity (days per stage)</Text>
            {velocityData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                {velocityData.map((stage, i) => {
                  const barWidth = valueToBarWidth(stage.avgDays, velocityMax, 220);
                  const slaPosition = valueToBarWidth(stage.slaLimit, velocityMax, 220);
                  const isOverSla = stage.avgDays > stage.slaLimit;
                  return (
                    <div key={stage.stage}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>
                          {stage.stage}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: isOverSla ? tokens.colors.errorScale[600] : tokens.colors.neutral[800],
                          }}
                        >
                          {stage.avgDays}d / {stage.slaLimit}d SLA
                        </Text>
                      </div>
                      <div style={{ position: 'relative' as const, height: barChartBarHeight }}>
                        {/* Bar */}
                        <div
                          style={{
                            height: '100%',
                            width: barWidth,
                            minWidth: 4,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: isOverSla ? tokens.colors.errorScale[400] : chartColors[i % chartColors.length],
                            position: 'absolute' as const,
                            top: 0,
                            left: 0,
                          }}
                        />
                        {/* SLA limit dashed line */}
                        <div
                          style={{
                            position: 'absolute' as const,
                            top: -4,
                            left: slaPosition,
                            width: 2,
                            height: barChartBarHeight + 8,
                            borderLeft: `2px dashed ${tokens.colors.neutral[400]}`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginTop: tokens.spacing[1] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <div style={{ width: 12, height: 8, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.primaryScale[500] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Avg Days</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <div style={{ width: 12, height: 0, borderTop: `2px dashed ${tokens.colors.neutral[400]}` }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>SLA Limit</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <div style={{ width: 12, height: 8, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.errorScale[400] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Over SLA</Text>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                No velocity data
              </div>
            )}
          </Box>
        </div>

        {/* ========== DIVERSITY METRICS (optional) ========== */}
        {diversityData && diversityData.length > 0 && (
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Diversity Metrics</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: tokens.spacing[4] }}>
              {diversityData.map((metric, i) => {
                const pct = metric.total > 0 ? (metric.value / metric.total) * 100 : 0;
                return (
                  <div
                    key={metric.category}
                    style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    }}
                  >
                    {/* Circular progress */}
                    <svg width={64} height={64} viewBox="0 0 64 64">
                      <circle
                        cx={32}
                        cy={32}
                        r={26}
                        fill="none"
                        stroke={tokens.colors.neutral[100]}
                        strokeWidth={6}
                      />
                      <circle
                        cx={32}
                        cy={32}
                        r={26}
                        fill="none"
                        stroke={chartColors[i % chartColors.length]}
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeDasharray={`${(pct / 100) * (2 * Math.PI * 26)} ${2 * Math.PI * 26}`}
                        transform="rotate(-90 32 32)"
                      />
                      <text
                        x={32}
                        y={34}
                        textAnchor="middle"
                        fontSize={tokens.typography.fontSize.xs}
                        fontWeight={tokens.typography.fontWeight.bold}
                        fill={tokens.colors.neutral[800]}
                      >
                        {pct.toFixed(0)}%
                      </text>
                    </svg>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], textAlign: 'center' as const }}>
                      {metric.category}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                      {metric.value}/{metric.total}
                    </Text>
                  </div>
                );
              })}
            </div>
          </Box>
        )}

        {/* ========== TREND COMPARISON ========== */}
        <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
          <Text style={{ ...sectionHeader }}>Trend Comparison</Text>
          {trendData.length > 0 ? (
            <div style={{ width: '100%', overflowX: 'auto' as const }}>
              <svg
                viewBox={`0 0 ${trendWidth} ${trendHeight}`}
                style={{ width: '100%', maxWidth: trendWidth, height: 'auto' }}
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = trendPadding + pct * (trendHeight - trendPadding * 2);
                  return (
                    <line
                      key={i}
                      x1={trendPadding}
                      y1={y}
                      x2={trendWidth - trendPadding}
                      y2={y}
                      stroke={tokens.colors.neutral[100]}
                      strokeWidth={1}
                    />
                  );
                })}
                {/* Current period line (solid) */}
                <polyline
                  points={trendLinePoints(trendData, trendWidth, trendHeight, trendPadding, 'current')}
                  fill="none"
                  stroke={tokens.colors.primaryScale[500]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Previous period line (dashed) */}
                {comparisonEnabled && (
                  <polyline
                    points={trendLinePoints(trendData, trendWidth, trendHeight, trendPadding, 'previous')}
                    fill="none"
                    stroke={tokens.colors.neutral[400]}
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {/* Current data points */}
                {trendData.map((d, i) => {
                  const allValues = trendData.flatMap((t) => [t.current, t.previous]);
                  const max = Math.max(...allValues);
                  const min = Math.min(...allValues);
                  const range = max - min || 1;
                  const stepX = (trendWidth - trendPadding * 2) / (trendData.length - 1 || 1);
                  const x = trendPadding + i * stepX;
                  const y = trendHeight - trendPadding - ((d.current - min) / range) * (trendHeight - trendPadding * 2);
                  return (
                    <g key={d.date}>
                      <circle
                        cx={x}
                        cy={y}
                        r={3}
                        fill={tokens.colors.common.white}
                        stroke={tokens.colors.primaryScale[500]}
                        strokeWidth={2}
                      />
                      <title>{`${d.date}: Current ${formatNumber(d.current)}, Previous ${formatNumber(d.previous)}`}</title>
                    </g>
                  );
                })}
                {/* X-axis labels */}
                {trendData
                  .filter((_, i) => i % Math.max(1, Math.floor(trendData.length / 6)) === 0)
                  .map((d) => {
                    const idx = trendData.indexOf(d);
                    const stepX = (trendWidth - trendPadding * 2) / (trendData.length - 1 || 1);
                    const x = trendPadding + idx * stepX;
                    return (
                      <text
                        key={d.date}
                        x={x}
                        y={trendHeight - 4}
                        textAnchor="middle"
                        fontSize={tokens.typography.fontSize.xs}
                        fill={tokens.colors.neutral[400]}
                      >
                        {d.date.slice(5)}
                      </text>
                    );
                  })}
              </svg>
              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginTop: tokens.spacing[2] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <div style={{ width: 20, height: 2, backgroundColor: tokens.colors.primaryScale[500], borderRadius: tokens.borderRadius.full }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Current Period</Text>
                </div>
                {comparisonEnabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <div style={{ width: 20, height: 0, borderTop: `2px dashed ${tokens.colors.neutral[400]}` }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Previous Period</Text>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              No trend data available
            </div>
          )}
        </Box>
      </Box>
    );
  },
});
