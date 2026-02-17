'use client';

/**
 * BhPipelineVelocityChart - Line Preset
 * Full line chart with area gradient fill, target line, average line,
 * period selector, and hover tooltips. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  TrendingUp, Calendar, Target, BarChart3, Activity,
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
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  formatDistanceToNow,
  getAccentAwareLayout,
} from '../../../helpers';
import type {
  BhPipelineVelocityChartProps,
  VelocityDataPoint,
  VelocityPeriod,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

function generateMockData(period: VelocityPeriod): VelocityDataPoint[] {
  const data: VelocityDataPoint[] = [];
  const now = new Date();
  for (let i = period - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const base = 8 + Math.floor(Math.random() * 12);
    data.push({
      date: date.toISOString().split('T')[0],
      count: base,
      target: 12,
    });
  }
  return data;
}

const MOCK_DATA_30 = generateMockData(30);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function buildPathD(
  points: { x: number; y: number }[],
  smooth: boolean,
): string {
  if (points.length < 2) return '';
  if (!smooth) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

const PERIODS: VelocityPeriod[] = [30, 60, 90];

/* ================================================================== */
/*  Line Preset                                                        */
/* ================================================================== */

export const LineBhPipelineVelocityChart = createPreset<BhPipelineVelocityChartProps>({
  name: 'BhPipelineVelocityChart.Line',
  render: (ctx: PresetContext<BhPipelineVelocityChartProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      data: dataProp,
      period: periodProp = 30,
      showTarget = true,
      showAverage = true,
      onPeriodChange,
      loading,
      className,
      style,
    } = props;

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activePeriod, setActivePeriod] = useState<VelocityPeriod>(periodProp ?? 30 as VelocityPeriod);
    const svgRef = useRef<SVGSVGElement>(null);

    const data = useMemo(() => dataProp ?? MOCK_DATA_30, [dataProp]);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const handlePeriodChange = useCallback((p: VelocityPeriod) => {
      setActivePeriod(p);
      onPeriodChange?.(p);
    }, [onPeriodChange]);

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg || data.length === 0) return;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const padding = 48;
      const chartWidth = rect.width - padding * 2;
      const idx = Math.round(((x - padding) / chartWidth) * (data.length - 1));
      if (idx >= 0 && idx < data.length) {
        setHoveredIndex(idx);
      }
    }, [data]);

    const handleMouseLeave = useCallback(() => {
      setHoveredIndex(null);
    }, []);

    /* Chart metrics */
    const chartMetrics = useMemo(() => {
      if (data.length === 0) return null;
      const counts = data.map(d => d.count ?? 0);
      const targets = data.filter(d => d.target != null).map(d => d.target ?? 0);
      const allValues = [...counts, ...(showTarget ? targets : [])];
      const maxVal = Math.max(...allValues, 1);
      const minVal = Math.min(...allValues, 0);
      const avg = counts.length > 0 ? counts.reduce((s, c) => s + c, 0) / counts.length : 0;
      const totalProcessed = counts.reduce((s, c) => s + c, 0);
      return { maxVal, minVal, avg, totalProcessed };
    }, [data, showTarget]);

    /* SVG dimensions */
    const svgWidth = 600;
    const svgHeight = 260;
    const padLeft = 48;
    const padRight = 16;
    const padTop = 16;
    const padBottom = 32;
    const chartW = svgWidth - padLeft - padRight;
    const chartH = svgHeight - padTop - padBottom;

    /* Data to SVG points */
    const linePoints = useMemo(() => {
      if (!chartMetrics || data.length === 0) return [];
      const { maxVal } = chartMetrics;
      return data.map((d, i) => ({
        x: padLeft + (i / Math.max(data.length - 1, 1)) * chartW,
        y: padTop + chartH - ((d.count ?? 0) / (maxVal * 1.1)) * chartH,
      }));
    }, [data, chartMetrics, chartW, chartH]);

    const targetPoints = useMemo(() => {
      if (!chartMetrics || !showTarget || data.length === 0) return [];
      const { maxVal } = chartMetrics;
      return data
        .filter(d => d.target != null)
        .map((d, i, arr) => ({
          x: padLeft + (data.indexOf(d) / Math.max(data.length - 1, 1)) * chartW,
          y: padTop + chartH - ((d.target ?? 0) / (maxVal * 1.1)) * chartH,
        }));
    }, [data, chartMetrics, showTarget, chartW, chartH]);

    const avgY = useMemo(() => {
      if (!chartMetrics || !showAverage) return null;
      const { maxVal, avg } = chartMetrics;
      return padTop + chartH - (avg / (maxVal * 1.1)) * chartH;
    }, [chartMetrics, showAverage, chartH]);

    const linePath = useMemo(() => buildPathD(linePoints, true), [linePoints]);
    const areaPath = useMemo(() => {
      if (linePoints.length < 2) return '';
      const base = padTop + chartH;
      return `${linePath} L${linePoints[linePoints.length - 1].x},${base} L${linePoints[0].x},${base} Z`;
    }, [linePath, linePoints, chartH]);

    const targetPath = useMemo(() => buildPathD(targetPoints, false), [targetPoints]);

    /* Y-axis grid lines */
    const yGridLines = useMemo(() => {
      if (!chartMetrics) return [];
      const { maxVal } = chartMetrics;
      const step = Math.ceil(maxVal / 4);
      const lines: { y: number; label: string }[] = [];
      for (let v = 0; v <= maxVal * 1.1; v += step) {
        const y = padTop + chartH - (v / (maxVal * 1.1)) * chartH;
        lines.push({ y, label: String(v) });
      }
      return lines;
    }, [chartMetrics, chartH]);

    /* X-axis labels */
    const xLabels = useMemo(() => {
      if (data.length === 0) return [];
      const labelCount = Math.min(data.length, 6);
      const step = Math.max(1, Math.floor(data.length / labelCount));
      const labels: { x: number; label: string }[] = [];
      for (let i = 0; i < data.length; i += step) {
        labels.push({
          x: padLeft + (i / Math.max(data.length - 1, 1)) * chartW,
          label: formatDateLabel((data[i].date ?? '')),
        });
      }
      return labels;
    }, [data, chartW]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    /* Tooltip data */
    const tooltipData = useMemo(() => {
      if (hoveredIndex == null || !data[hoveredIndex]) return null;
      const d = data[hoveredIndex];
      const pt = linePoints[hoveredIndex];
      if (!pt) return null;
      return { ...d, x: pt.x, y: pt.y };
    }, [hoveredIndex, data, linePoints]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: t.spacing[3],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
              <TrendingUp size={20} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
                display: 'block',
              }}>
                Pipeline Velocity
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Candidates processed per day
              </Text>
            </Box>
          </Box>

          {/* Period Selector */}
          <Box style={{ display: 'flex', gap: t.spacing[1] }} role="tablist" aria-label="Time period selector">
            {PERIODS.map((p) => {
              const isActive = activePeriod === p;
              return (
                <button
                  key={p}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${p} day period`}
                  onClick={() => handlePeriodChange(p)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                    borderRadius: badgeRadius,
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    border: `1px solid ${isActive ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                    backgroundColor: isActive ? t.colors.primaryScale[50] : t.colors.common.white,
                    color: isActive ? t.colors.primaryScale[700] : t.colors.neutral[600],
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  {p}d
                </button>
              );
            })}
          </Box>
        </Box>

        {/* Stats Summary Row */}
        {chartMetrics && (
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 1,
            padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            backgroundColor: t.colors.neutral[50],
          }}>
            {[
              { label: 'Total Processed', value: chartMetrics.totalProcessed, icon: Activity },
              { label: 'Daily Average', value: chartMetrics.avg.toFixed(1), icon: BarChart3 },
              { label: 'Period', value: `${activePeriod} days`, icon: Calendar },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Box key={stat.label} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[1], padding: t.spacing[2] }} role="status" aria-label={`${stat.label}: ${stat.value}`}>
                  <Text style={{
                    fontSize: t.typography.fontSize.lg,
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.neutral[900],
                    display: 'block',
                  }}>
                    {stat.value}
                  </Text>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[1] }}>
                    <Icon size={12} color={t.colors.neutral[400]} />
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
        )}

        {/* Chart Area */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px ${t.spacing[4]}px` }}>
          {data.length === 0 ? (
            <Box style={createEmptyStateStyle(t)}>
              <BarChart3 size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No velocity data available
              </Text>
            </Box>
          ) : (
            <Box style={{ position: 'relative', width: '100%' }}>
              <svg
                ref={svgRef}
                width="100%"
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={`Pipeline velocity chart showing ${data.length} days of data`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ display: 'block' }}
              >
                <defs>
                  <linearGradient id="velocityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.colors.primaryScale[400]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={t.colors.primaryScale[400]} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                {/* Y-axis grid lines */}
                {yGridLines.map((gl, i) => (
                  <g key={i}>
                    <line
                      x1={padLeft}
                      y1={gl.y}
                      x2={svgWidth - padRight}
                      y2={gl.y}
                      stroke={t.colors.neutral[100]}
                      strokeWidth={1}
                    />
                    <text
                      x={padLeft - 8}
                      y={gl.y + 4}
                      textAnchor="end"
                      fill={t.colors.neutral[400]}
                      fontSize={10}
                      fontFamily="inherit"
                    >
                      {gl.label}
                    </text>
                  </g>
                ))}

                {/* X-axis labels */}
                {xLabels.map((xl, i) => (
                  <text
                    key={i}
                    x={xl.x}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    fill={t.colors.neutral[400]}
                    fontSize={10}
                    fontFamily="inherit"
                  >
                    {xl.label}
                  </text>
                ))}

                {/* Area fill */}
                {areaPath && (
                  <path d={areaPath} fill="url(#velocityFill)" />
                )}

                {/* Average line */}
                {avgY != null && showAverage && (
                  <line
                    x1={padLeft}
                    y1={avgY}
                    x2={svgWidth - padRight}
                    y2={avgY}
                    stroke={t.colors.warningScale[400]}
                    strokeWidth={1}
                    strokeDasharray="6 3"
                    opacity={0.7}
                  />
                )}

                {/* Target line (dashed) */}
                {targetPath && showTarget && (
                  <path
                    d={targetPath}
                    fill="none"
                    stroke={t.colors.successScale[500]}
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    opacity={0.7}
                  />
                )}

                {/* Main line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke={t.colors.primaryScale[500]}
                    strokeWidth={2}
                    strokeLinecap="round"
                    style={{ transition: 'all 0.6s ease' }}
                  />
                )}

                {/* Data dots */}
                {linePoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === i ? 5 : 2.5}
                    fill={t.colors.primaryScale[500]}
                    stroke={t.colors.common.white}
                    strokeWidth={hoveredIndex === i ? 2 : 1}
                    style={{ transition: 'r 0.15s ease, stroke-width 0.15s ease' }}
                  />
                ))}

                {/* Hover vertical line */}
                {tooltipData && (
                  <line
                    x1={tooltipData.x}
                    y1={padTop}
                    x2={tooltipData.x}
                    y2={padTop + chartH}
                    stroke={t.colors.neutral[300]}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                )}
              </svg>

              {/* Tooltip */}
              {tooltipData && (
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                  position: 'absolute',
                  left: `${(tooltipData.x / svgWidth) * 100}%`,
                  top: `${(tooltipData.y / svgHeight) * 100 - 12}%`,
                  transform: 'translate(-50%, -100%)',
                  backgroundColor: t.colors.neutral[800],
                  color: t.colors.common.white,
                  padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                  borderRadius: t.borderRadius.md,
                  pointerEvents: 'none',
                  zIndex: 10,
                  whiteSpace: 'nowrap',
                  ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, backgroundColor: 'rgba(0,0,0,0.8)' } : {}),
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, display: 'block', color: t.colors.common.white }}>
                    {tooltipData.count ?? 0} candidates
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300], display: 'block' }}>
                    {tooltipData.date}
                    {tooltipData.target != null && ` | Target: ${tooltipData.target}`}
                  </Text>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Legend */}
        <Box style={{
          padding: `${t.spacing[2]}px ${t.spacing[5]}px ${t.spacing[3]}px`,
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[4],
          flexWrap: 'wrap',
          borderTop: `1px solid ${t.colors.neutral[100]}`,
        }} role="list" aria-label="Chart legend">
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }} role="listitem">
            <Box style={{ width: 16, height: 2, backgroundColor: t.colors.primaryScale[500], borderRadius: t.borderRadius.full }} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Processed</Text>
          </Box>
          {showTarget && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }} role="listitem">
              <Box style={{ width: 16, height: 2, backgroundColor: t.colors.successScale[500], borderRadius: t.borderRadius.full, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, currentColor 3px, currentColor 5px)' }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Target</Text>
            </Box>
          )}
          {showAverage && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }} role="listitem">
              <Box style={{ width: 16, height: 2, backgroundColor: t.colors.warningScale[400], borderRadius: t.borderRadius.full }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Average</Text>
            </Box>
          )}
        </Box>
        </Box>
      </Box>
    );
  },
});
