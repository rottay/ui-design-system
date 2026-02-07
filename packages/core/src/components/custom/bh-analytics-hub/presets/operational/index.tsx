'use client';

/**
 * BhAnalyticsHub - Operational Preset
 * Detailed drill-down analytics with granular filtering,
 * expanded metric cards, stage-level breakdowns,
 * and per-recruiter/per-source detail views.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, createSectionHeaderStyle } from '../../../helpers';
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
/*  Helper: bar width calculation                                     */
/* ------------------------------------------------------------------ */
function valueToBarWidth(value: number, maxValue: number, maxWidth: number): number {
  if (maxValue <= 0) return 0;
  return (value / maxValue) * maxWidth;
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
/*  Operational Preset                                                */
/* ------------------------------------------------------------------ */
export const OperationalBhAnalyticsHub = createPreset<BhAnalyticsHubProps>({
  name: 'BhAnalyticsHub.Operational',
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
    const [activeTab, setActiveTab] = useState<'funnel' | 'recruiters' | 'sources' | 'costs' | 'velocity'>('funnel');

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
    const cardBase = createCardStyle(tokens, { elevation: 'sm', glass: isGlass });
    const hoverStyle = createHoverStyle(tokens);
    const sectionHeader = createSectionHeaderStyle(tokens);
    const chartColors = getChartColors(tokens);

    /* ---------- Max values ---------- */
    const tthMax = useMemo(() => {
      return timeToHireData.length > 0 ? Math.max(...timeToHireData.map((d) => d.avgDays)) : 1;
    }, [timeToHireData]);

    const sourceMax = useMemo(() => {
      return sourceData.length > 0 ? Math.max(...sourceData.map((s) => s.candidateCount)) : 1;
    }, [sourceData]);

    const costMax = useMemo(() => {
      return costData.length > 0 ? Math.max(...costData.map((d) => d.costPerHire)) : 1;
    }, [costData]);

    const velocityMax = useMemo(() => {
      const allVals = velocityData.flatMap((d) => [d.avgDays, d.slaLimit]);
      return allVals.length > 0 ? Math.max(...allVals) : 1;
    }, [velocityData]);

    const barChartBarHeight = 24;

    /* ---------- Tabs ---------- */
    const tabs: { key: typeof activeTab; label: string }[] = [
      { key: 'funnel', label: 'Funnel' },
      { key: 'recruiters', label: 'Recruiters' },
      { key: 'sources', label: 'Sources' },
      { key: 'costs', label: 'Costs' },
      { key: 'velocity', label: 'Velocity' },
    ];

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[5],
          padding: tokens.spacing[6],
          minHeight: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* ========== HEADER + DATE RANGE + EXPORT ========== */}
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
              Operational Analytics
            </Text>

            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              {(['7d', '30d', '90d', 'year', 'custom'] as const).map((range) => (
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
                  {range === 'year' ? '1Y' : range === 'custom' ? 'Custom' : range.toUpperCase()}
                </div>
              ))}
            </div>

            {/* Comparison toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
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
                  transition: `background-color ${tokens.motion.hover}`,
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
                    transition: `left ${tokens.motion.hover}`,
                    boxShadow: tokens.shadows.sm,
                  }}
                />
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                Compare
              </Text>
            </div>
          </div>

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

        {/* ========== SUMMARY KPI ROW ========== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[4] }}>
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[1] }}>Total Pipeline</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xl || '1.25rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
              {funnelData.length > 0 ? formatNumber(funnelData[0].count) : '0'}
            </Text>
          </Box>
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[1] }}>Avg Time-to-Hire</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xl || '1.25rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
              {timeToHireData.length > 0 ? `${Math.round(timeToHireData.reduce((s, d) => s + d.avgDays, 0) / timeToHireData.length)}d` : '0d'}
            </Text>
          </Box>
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[1] }}>Active Sources</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xl || '1.25rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
              {sourceData.length}
            </Text>
          </Box>
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[1] }}>Active Recruiters</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xl || '1.25rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
              {recruiterData.length}
            </Text>
          </Box>
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[1] }}>SLA Breaches</Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl || '1.25rem',
                fontWeight: tokens.typography.fontWeight.bold,
                color: velocityData.filter((v) => v.avgDays > v.slaLimit).length > 0
                  ? tokens.colors.errorScale[600]
                  : tokens.colors.successScale[600],
              }}
            >
              {velocityData.filter((v) => v.avgDays > v.slaLimit).length}
            </Text>
          </Box>
        </div>

        {/* ========== TAB NAVIGATION ========== */}
        <div
          style={{
            display: 'flex',
            gap: tokens.spacing[1],
            borderBottom: `2px solid ${tokens.colors.neutral[200]}`,
            paddingBottom: 0,
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...hoverStyle,
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: activeTab === tab.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                color: activeTab === tab.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                borderBottom: activeTab === tab.key
                  ? `2px solid ${tokens.colors.primaryScale[600]}`
                  : '2px solid transparent',
                marginBottom: -2,
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* ========== TAB CONTENT ========== */}

        {/* ---- Funnel Tab ---- */}
        {activeTab === 'funnel' && (
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Funnel Detail</Text>
            {funnelData.length > 0 ? (
              <div style={{ overflowX: 'auto' as const }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: tokens.typography.fontSize.sm }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${tokens.colors.neutral[200]}` }}>
                      {['Stage', 'Count', 'Conversion', comparisonEnabled ? 'Previous' : null, comparisonEnabled ? 'Change' : null, 'Funnel %'].filter(Boolean).map((col) => (
                        <th
                          key={col!}
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            textAlign: 'left' as const,
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
                    {funnelData.map((stage, i) => {
                      const funnelPct = funnelData[0].count > 0 ? (stage.count / funnelData[0].count) * 100 : 0;
                      const change =
                        stage.prevPeriodCount !== undefined && stage.prevPeriodCount !== 0
                          ? ((stage.count - stage.prevPeriodCount) / stage.prevPeriodCount) * 100
                          : 0;
                      return (
                        <tr
                          key={stage.name}
                          style={{
                            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                            transition: `background-color ${tokens.motion.hover}`,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tokens.colors.neutral[50])}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                              <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: chartColors[i % chartColors.length], flexShrink: 0 }} />
                              <Text style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                                {stage.name}
                              </Text>
                            </div>
                          </td>
                          <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                            {formatNumber(stage.count)}
                          </td>
                          <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[600] }}>
                            {formatPercent(stage.conversionPercent)}
                          </td>
                          {comparisonEnabled && (
                            <>
                              <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[500] }}>
                                {stage.prevPeriodCount !== undefined ? formatNumber(stage.prevPeriodCount) : '\u2014'}
                              </td>
                              <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                                {stage.prevPeriodCount !== undefined ? (
                                  <span style={{ color: change >= 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600], fontWeight: tokens.typography.fontWeight.medium }}>
                                    {change >= 0 ? '\u2191' : '\u2193'} {formatPercent(Math.abs(change))}
                                  </span>
                                ) : (
                                  '\u2014'
                                )}
                              </td>
                            </>
                          )}
                          <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                              <div style={{ width: 80, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${funnelPct}%`,
                                    height: '100%',
                                    borderRadius: tokens.borderRadius.full,
                                    backgroundColor: chartColors[i % chartColors.length],
                                  }}
                                />
                              </div>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                                {funnelPct.toFixed(0)}%
                              </Text>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                No funnel data
              </div>
            )}
          </Box>
        )}

        {/* ---- Recruiters Tab ---- */}
        {activeTab === 'recruiters' && (
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Recruiter Detail</Text>
            {recruiterData.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: tokens.spacing[4] }}>
                {recruiterData.map((recruiter, i) => (
                  <div
                    key={recruiter.name}
                    onClick={() => handleMetricSelect(selectedMetric === recruiter.name ? null : recruiter.name)}
                    style={{
                      ...hoverStyle,
                      padding: tokens.spacing[4],
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: selectedMetric === recruiter.name ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${selectedMetric === recruiter.name ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                    }}
                  >
                    {/* Header with avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.primaryScale[700],
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {recruiter.avatar ? (
                          <img src={recruiter.avatar} alt={recruiter.name} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
                        ) : (
                          recruiter.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <Text style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], fontSize: tokens.typography.fontSize.sm }}>
                          {recruiter.name}
                        </Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          Rank #{i + 1}
                        </Text>
                      </div>
                      {/* Sparkline */}
                      {recruiter.sparkline.length > 0 && (
                        <svg width={60} height={24} viewBox="0 0 60 24" style={{ marginLeft: 'auto' }}>
                          <polyline
                            points={sparklinePoints(recruiter.sparkline, 60, 24, 2)}
                            fill="none"
                            stroke={tokens.colors.primaryScale[400]}
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Metric grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[2] }}>
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Hires</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>
                          {recruiter.hires}
                        </Text>
                      </div>
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Velocity</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>
                          {recruiter.velocity}d
                        </Text>
                      </div>
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Pipeline</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>
                          {formatCurrency(recruiter.pipelineValue)}
                        </Text>
                      </div>
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Satisfaction</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                          <div
                            style={{
                              width: 40,
                              height: 4,
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                No recruiter data
              </div>
            )}
          </Box>
        )}

        {/* ---- Sources Tab ---- */}
        {activeTab === 'sources' && (
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Source Detail</Text>
            {sourceData.length > 0 ? (
              <div style={{ overflowX: 'auto' as const }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: tokens.typography.fontSize.sm }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${tokens.colors.neutral[200]}` }}>
                      {['Source', 'Candidates', 'Quality Score', 'Volume', 'Quality'].map((col) => (
                        <th
                          key={col}
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            textAlign: 'left' as const,
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
                    {sourceData.map((source, i) => (
                      <tr
                        key={source.source}
                        style={{
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          transition: `background-color ${tokens.motion.hover}`,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tokens.colors.neutral[50])}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                          {source.source}
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                          {source.candidateCount}
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                          <span
                            style={{
                              ...createBadgeStyle(tokens, source.qualityScore >= 70 ? 'success' : source.qualityScore >= 50 ? 'warning' : 'error'),
                            }}
                          >
                            {source.qualityScore}
                          </span>
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                          <div style={{ width: 100, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${(source.candidateCount / sourceMax) * 100}%`,
                                height: '100%',
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: chartColors[i % chartColors.length],
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                          <div style={{ width: 60, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${source.qualityScore}%`,
                                height: '100%',
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: source.qualityScore >= 70 ? tokens.colors.successScale[500] : source.qualityScore >= 50 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500],
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                No source data
              </div>
            )}
          </Box>
        )}

        {/* ---- Costs Tab ---- */}
        {activeTab === 'costs' && (
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Cost Breakdown</Text>
            {costData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
                {costData.map((cat, ci) => (
                  <div
                    key={cat.category}
                    onClick={() => handleDrilldown(drilldownEntity === cat.category ? null : cat.category)}
                    style={{
                      ...hoverStyle,
                      padding: tokens.spacing[4],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: drilldownEntity === cat.category ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${drilldownEntity === cat.category ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                      <Text style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], fontSize: tokens.typography.fontSize.sm }}>
                        {cat.category}
                      </Text>
                      <Text style={{ fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], fontSize: tokens.typography.fontSize.sm }}>
                        {formatCurrency(cat.costPerHire)}/hire
                      </Text>
                    </div>

                    {/* Full-width bar */}
                    <div style={{ width: '100%', height: barChartBarHeight, borderRadius: tokens.borderRadius.sm, overflow: 'hidden', display: 'flex' }}>
                      {cat.breakdown.map((b, bi) => {
                        const segmentPct = cat.costPerHire > 0 ? (b.cost / cat.costPerHire) * 100 : 0;
                        return (
                          <div
                            key={b.item}
                            style={{
                              width: `${segmentPct}%`,
                              height: '100%',
                              backgroundColor: chartColors[(ci + bi) % chartColors.length],
                            }}
                            title={`${b.item}: ${formatCurrency(b.cost)}`}
                          />
                        );
                      })}
                    </div>

                    {/* Expanded breakdown */}
                    {drilldownEntity === cat.category && (
                      <div style={{ marginTop: tokens.spacing[3], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                        {cat.breakdown.map((b, bi) => (
                          <div key={b.item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                              <div style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: chartColors[(ci + bi) % chartColors.length] }} />
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{b.item}</Text>
                            </div>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                              {formatCurrency(b.cost)}
                            </Text>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                No cost data
              </div>
            )}
          </Box>
        )}

        {/* ---- Velocity Tab ---- */}
        {activeTab === 'velocity' && (
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Pipeline Velocity Detail</Text>
            {velocityData.length > 0 ? (
              <div style={{ overflowX: 'auto' as const }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: tokens.typography.fontSize.sm }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${tokens.colors.neutral[200]}` }}>
                      {['Stage', 'Avg Days', 'SLA Limit', 'Status', 'Progress'].map((col) => (
                        <th
                          key={col}
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            textAlign: 'left' as const,
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
                    {velocityData.map((stage, i) => {
                      const isOverSla = stage.avgDays > stage.slaLimit;
                      const pct = stage.slaLimit > 0 ? Math.min((stage.avgDays / stage.slaLimit) * 100, 150) : 0;
                      return (
                        <tr
                          key={stage.stage}
                          style={{
                            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                            transition: `background-color ${tokens.motion.hover}`,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tokens.colors.neutral[50])}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                            {stage.stage}
                          </td>
                          <td
                            style={{
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: isOverSla ? tokens.colors.errorScale[600] : tokens.colors.neutral[800],
                            }}
                          >
                            {stage.avgDays}d
                          </td>
                          <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[500] }}>
                            {stage.slaLimit}d
                          </td>
                          <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                            <span style={createBadgeStyle(tokens, isOverSla ? 'error' : 'success')}>
                              {isOverSla ? 'Over SLA' : 'On Track'}
                            </span>
                          </td>
                          <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                              <div
                                style={{
                                  width: 100,
                                  height: 8,
                                  borderRadius: tokens.borderRadius.full,
                                  backgroundColor: tokens.colors.neutral[100],
                                  overflow: 'hidden',
                                  position: 'relative' as const,
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.min(pct, 100)}%`,
                                    height: '100%',
                                    borderRadius: tokens.borderRadius.full,
                                    backgroundColor: isOverSla ? tokens.colors.errorScale[400] : chartColors[i % chartColors.length],
                                  }}
                                />
                              </div>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], whiteSpace: 'nowrap' as const }}>
                                {pct.toFixed(0)}%
                              </Text>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                No velocity data
              </div>
            )}
          </Box>
        )}

        {/* ========== DIVERSITY METRICS (if present) ========== */}
        {diversityData && diversityData.length > 0 && (
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Diversity Overview</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: tokens.spacing[3] }}>
              {diversityData.map((metric, i) => {
                const pct = metric.total > 0 ? (metric.value / metric.total) * 100 : 0;
                return (
                  <div
                    key={metric.category}
                    style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    }}
                  >
                    <svg width={48} height={48} viewBox="0 0 48 48">
                      <circle cx={24} cy={24} r={20} fill="none" stroke={tokens.colors.neutral[100]} strokeWidth={5} />
                      <circle
                        cx={24}
                        cy={24}
                        r={20}
                        fill="none"
                        stroke={chartColors[i % chartColors.length]}
                        strokeWidth={5}
                        strokeLinecap="round"
                        strokeDasharray={`${(pct / 100) * (2 * Math.PI * 20)} ${2 * Math.PI * 20}`}
                        transform="rotate(-90 24 24)"
                      />
                      <text x={24} y={26} textAnchor="middle" fontSize="10" fontWeight="700" fill={tokens.colors.neutral[800]}>
                        {pct.toFixed(0)}%
                      </text>
                    </svg>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], textAlign: 'center' as const }}>
                      {metric.category}
                    </Text>
                  </div>
                );
              })}
            </div>
          </Box>
        )}
      </Box>
    );
  },
});
