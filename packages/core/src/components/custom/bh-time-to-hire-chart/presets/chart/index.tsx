'use client';

/**
 * BhTimeToHireChart - Chart Preset
 * Full multi-line SVG chart showing time-to-hire by department,
 * with rolling average overlay and target line. Glass-aware, personality-driven.
 */

import { useState, useMemo, useCallback} from 'react';
import {
  Clock, TrendingUp, Target, BarChart3,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getChartConfig,
  createEmptyStateStyle,
  getAccentAwareLayout,

  createDividerStyle,
  createPersonalitySectionHeaderStyle,
} from '../../../helpers';
import type { BhTimeToHireChartProps, TimeToHireDataPoint, DepartmentConfig } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDeptColor(index: number, t: DesignTokens, customColor?: string): string {
  if (customColor) return customColor;
  const palette = [
    t.colors.primaryScale[500],
    t.colors.successScale[500],
    t.colors.warningScale[500],
    t.colors.infoScale[500],
    t.colors.errorScale[400],
  ];
  return palette[index % palette.length];
}

function computeRollingAvg(values: number[], window: number): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

/* ================================================================== */
/*  Chart Preset                                                       */
/* ================================================================== */

export const ChartBhTimeToHireChart = createPreset<BhTimeToHireChartProps>({
  name: 'BhTimeToHireChart.Chart',
  render: (ctx: PresetContext<BhTimeToHireChartProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const chartCfg = getChartConfig(t);

    const {
      data: rawData = [],
      departments: rawDepartments = [],
      targetDays = 30,
      rollingAvgWindow = 3,
      title = 'Time to Hire',
      onDataPointClick,
      benchmark,
      period,
      loading,
      className,
      style,
    } = props;

    const data = Array.isArray(rawData) ? rawData : [];
    const departments = Array.isArray(rawDepartments) ? rawDepartments : [];

    const [hoveredDept, setHoveredDept] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    /* Organize data by department */
    const chartData = useMemo(() => {
      const dates = [...new Set(data.map(d => d.date))].sort();
      const deptMap = new Map<string, Map<string, number>>();

      departments.forEach(dept => {
        const dateMap = new Map<string, number>();
        data.filter(d => d.department === dept.name).forEach(d => {
          dateMap.set((d.date ?? ''), d.days ?? 0);
        });
        deptMap.set((dept.name ?? ''), dateMap);
      });

      return { dates, deptMap };
    }, [data, departments]);

    /* SVG dimensions */
    const width = 560;
    const height = 280;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    /* Scale calculations */
    const allDays = useMemo(() => data.map(d => d.days ?? 0), [data]);
    const maxDays = useMemo(() => Math.max(...allDays, targetDays, 1), [allDays, targetDays]);
    const yMax = useMemo(() => Math.ceil(maxDays / 10) * 10 + 5, [maxDays]);

    const xScale = useCallback((i: number) => {
      return padding.left + (i / Math.max(chartData.dates.length - 1, 1)) * plotW;
    }, [chartData.dates.length, plotW]);

    const yScale = useCallback((val: number) => {
      return padding.top + plotH - (val / yMax) * plotH;
    }, [plotH, yMax]);

    /* Build path strings for each department */
    const deptPaths = useMemo(() => {
      return departments.map((dept, di) => {
        const dateMap = chartData.deptMap.get((dept.name ?? ''));
        if (!dateMap) return { dept, path: '', rollingPath: '', points: [] as Array<{ x: number; y: number; val: number; date: string }> };

        const values: number[] = [];
        const points: Array<{ x: number; y: number; val: number; date: string }> = [];

        chartData.dates.forEach((date, i) => {
          const val = dateMap.get((date ?? ''));
          if (val !== undefined) {
            values.push(val);
            points.push({ x: xScale(i), y: yScale(val), val, date: date ?? '' });
          }
        });

        const pathParts = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`);
        const path = pathParts.join(' ');

        const rolling = computeRollingAvg(values, rollingAvgWindow);
        const rollingPoints = rolling.map((val, i) => ({
          x: points[i]?.x ?? 0,
          y: yScale(val),
        }));
        const rollingPath = rollingPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        return { dept, path, rollingPath, points };
      });
    }, [departments, chartData, xScale, yScale, rollingAvgWindow]);

    /* Y-axis ticks */
    const yTicks = useMemo(() => {
      const ticks: number[] = [];
      for (let i = 0; i <= yMax; i += 10) ticks.push(i);
      return ticks;
    }, [yMax]);

    /* Avg time per department */
    const deptAvgs = useMemo(() => {
      return departments.map(dept => {
        const deptData = data.filter(d => d.department === dept.name);
        const avg = deptData.length > 0
          ? deptData.reduce((s, d) => s + (d.days ?? 0), 0) / deptData.length
          : 0;
        return { name: dept.name, avg: Math.round(avg) };
      });
    }, [departments, data]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);


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
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
                <Clock size={20} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  {title}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                  Days from application to hire by department
                </Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              {period && (
                <Box style={{
                  ...createBadgeStyle(t, 'secondary'),
                  borderRadius: badgeRadius,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, textTransform: 'uppercase' as const }}>{period}</Text>
                </Box>
              )}
              <Box style={{
                ...createBadgeStyle(t, 'info'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: t.spacing[1],
              }}>
                <Target size={12} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>Target: {targetDays}d</Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Chart */}
        <Box style={{ padding: t.spacing[5] }}>
          {data.length === 0 ? (
            <Box style={createEmptyStateStyle(t)}>
              <BarChart3 size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No time-to-hire data available
              </Text>
            </Box>
          ) : (
            <Box style={{ width: '100%', overflow: 'auto' }}>
              <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label={`Time to hire chart. ${departments.map((d, i) => `${d.name}: avg ${deptAvgs[i]?.avg ?? 0} days`).join(', ')}`}
                style={{ display: 'block', maxWidth: '100%' }}
              >
                {/* Grid lines */}
                {yTicks.map(tick => (
                  <line
                    key={tick}
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={yScale(tick)}
                    y2={yScale(tick)}
                    stroke={t.colors.neutral[100]}
                    strokeWidth={1}
                  />
                ))}

                {/* Target line */}
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={yScale(targetDays)}
                  y2={yScale(targetDays)}
                  stroke={t.colors.errorScale[400]}
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                />
                <text
                  x={width - padding.right + 4}
                  y={yScale(targetDays) + 4}
                  fill={t.colors.errorScale[500]}
                  fontSize={10}
                  fontWeight={600}
                >
                  Target
                </text>

                {/* Benchmark line */}
                {benchmark !== undefined && benchmark > 0 && (
                  <>
                    <line
                      x1={padding.left}
                      x2={width - padding.right}
                      y1={yScale(benchmark)}
                      y2={yScale(benchmark)}
                      stroke={t.colors.infoScale[400]}
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={yScale(benchmark) - 6}
                      fill={t.colors.infoScale[500]}
                      fontSize={9}
                      fontWeight={600}
                      textAnchor="end"
                    >
                      Benchmark
                    </text>
                  </>
                )}

                {/* Y-axis labels */}
                {yTicks.map(tick => (
                  <text
                    key={tick}
                    x={padding.left - 8}
                    y={yScale(tick) + 4}
                    fill={t.colors.neutral[400]}
                    fontSize={10}
                    textAnchor="end"
                  >
                    {tick}d
                  </text>
                ))}

                {/* X-axis labels */}
                {chartData.dates.map((date, i) => (
                  <text
                    key={date}
                    x={xScale(i)}
                    y={height - padding.bottom + 20}
                    fill={t.colors.neutral[400]}
                    fontSize={10}
                    textAnchor="middle"
                  >
                    {date?.slice(5)}
                  </text>
                ))}

                {/* Department lines */}
                {deptPaths.map(({ dept, path, rollingPath, points }, di) => {
                  const color = getDeptColor(di, t, dept.color);
                  const isActive = hoveredDept === null || hoveredDept === dept.name;
                  const opacity = isActive ? 1 : 0.2;

                  return (
                    <g key={dept.name} style={{ transition: `opacity ${t.motion.hover}` }} opacity={opacity}>
                      {/* Main line */}
                      <path
                        d={path}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transition: `stroke-dashoffset ${chartCfg.animationDuration}ms ease` }}
                      />

                      {/* Rolling avg (dashed) */}
                      {rollingPath && (
                        <path
                          d={rollingPath}
                          fill="none"
                          stroke={color}
                          strokeWidth={1.5}
                          strokeDasharray="4 3"
                          strokeLinecap="round"
                          opacity={0.5}
                        />
                      )}

                      {/* Data points */}
                      {chartCfg.showDots && points.map((p, pi) => (
                        <circle
                          key={pi}
                          cx={p.x}
                          cy={p.y}
                          r={4}
                          fill={t.colors.common.white}
                          stroke={color}
                          strokeWidth={2}
                          style={{ cursor: 'pointer', transition: `r ${t.motion.hover}` }}
                        />
                      ))}
                    </g>
                  );
                })}
              </svg>
            </Box>
          )}

          {/* Legend + Stats */}
          <Box style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: t.spacing[4],
            marginTop: t.spacing[4],
            paddingTop: t.spacing[4],
            borderTop: `1px solid ${t.colors.neutral[100]}`,
          }}>
            {departments.map((dept, di) => {
              const color = getDeptColor(di, t, dept.color);
              const avg = deptAvgs[di]?.avg ?? 0;
              const isActive = hoveredDept === null || hoveredDept === dept.name;

              return (
                <Box
                  key={dept.name}
                  tabIndex={0}
                  role="button"
                  aria-label={`Toggle ${dept.name} department`}
                  onMouseEnter={() => setHoveredDept((dept.name ?? null))}
                  onMouseLeave={() => setHoveredDept(null)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setHoveredDept((prev => prev === dept.name ? null : dept.name ?? null));
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[2],
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0.4,
                    transition: `opacity ${t.motion.hover}`,
                  }}
                >
                  <Box style={{
                    width: 10,
                    height: 10,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: color,
                    flexShrink: 0,
                  }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                    {dept.name}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.bold,
                    color: avg > targetDays ? t.colors.errorScale[600] : t.colors.successScale[600],
                  }}>
                    {avg}d avg
                  </Text>
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
