'use client';

/**
 * BhControlChart - Standard Preset
 * SVG Statistical Process Control (SPC) chart with:
 * - Center line, UCL/LCL, warning limits
 * - Zone shading (A=error, B=warning, C=success)
 * - Connected data points with outlier highlighting
 * - Hover tooltip, axis labels, entrance animation
 * - SPC rule violation detection (runs, trends, beyond 3 sigma)
 *
 * All colors via design tokens. Zero hardcoded values.
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhControlChartProps, ControlChartDataPoint } from '../../core';
import {
  createCardStyle,
  createPersonalitySkeletonStyle,
  getPersonalityTypography,
  getChartConfig,
  formatDate,
  ICON_SIZES,
} from '../../../helpers';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PADDING = { top: 40, right: 30, bottom: 50, left: 55 };
const POINT_RADIUS = 4;
const OUTLIER_RADIUS = 6;
const DASH_PATTERN_CONTROL = '8,4';
const DASH_PATTERN_WARNING = '4,4';

/* ------------------------------------------------------------------ */
/*  SPC Rule Detection                                                 */
/* ------------------------------------------------------------------ */

interface RuleViolation {
  type: 'run' | 'trend' | 'beyond_3sigma';
  startIndex: number;
  endIndex: number;
}

function detectRuleViolations(
  points: ControlChartDataPoint[],
  centerLine: number,
  ucl: number,
  lcl: number
): RuleViolation[] {
  const violations: RuleViolation[] = [];
  if (points.length < 2) return violations;

  // Rule 1: Points beyond 3 sigma (UCL/LCL)
  points.forEach((p, i) => {
    if (p.value > ucl || p.value < lcl) {
      violations.push({ type: 'beyond_3sigma', startIndex: i, endIndex: i });
    }
  });

  // Rule 2: Run of 7+ points on same side of center line
  let runStart = 0;
  let runSide: 'above' | 'below' | null = null;
  for (let i = 0; i < points.length; i++) {
    const side = points[i].value >= centerLine ? 'above' : 'below';
    if (side !== runSide) {
      if (runSide !== null && i - runStart >= 7) {
        violations.push({ type: 'run', startIndex: runStart, endIndex: i - 1 });
      }
      runStart = i;
      runSide = side;
    }
  }
  if (runSide !== null && points.length - runStart >= 7) {
    violations.push({ type: 'run', startIndex: runStart, endIndex: points.length - 1 });
  }

  // Rule 3: Trend of 6+ consecutive increasing or decreasing points
  let trendStart = 0;
  let trendDir: 'up' | 'down' | null = null;
  for (let i = 1; i < points.length; i++) {
    const dir = points[i].value > points[i - 1].value ? 'up' : points[i].value < points[i - 1].value ? 'down' : null;
    if (dir !== trendDir || dir === null) {
      if (trendDir !== null && i - trendStart >= 6) {
        violations.push({ type: 'trend', startIndex: trendStart, endIndex: i - 1 });
      }
      trendStart = i - 1;
      trendDir = dir;
    }
  }
  if (trendDir !== null && points.length - trendStart >= 6) {
    violations.push({ type: 'trend', startIndex: trendStart, endIndex: points.length - 1 });
  }

  return violations;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const StandardBhControlChart = createPreset<BhControlChartProps>({
  name: 'BhControlChart.Standard',
  render: (ctx: PresetContext<BhControlChartProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const {
      data,
      width: svgWidth = 600,
      height: svgHeight = 300,
      showZones = true,
      showLabels = true,
      animate = true,
      onPointClick,
      title,
      className,
      style,
    } = props;

    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const chartConfig = useMemo(() => getChartConfig(t), [t]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [animProgress, setAnimProgress] = useState(animate ? 0 : 1);
    const pathRef = useRef<SVGPathElement | null>(null);

    /* -- Animation -------------------------------------------------- */
    useEffect(() => {
      if (!animate || !chartConfig.animateOnMount) {
        setAnimProgress(1);
        return;
      }
      const duration = chartConfig.animationDuration;
      const startTime = performance.now();
      let rafId: number;

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setAnimProgress(progress);
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };
      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    }, [animate, chartConfig.animateOnMount, chartConfig.animationDuration]);

    /* -- Data processing -------------------------------------------- */
    const dataPoints = data?.dataPoints ?? [];
    const limits = data?.controlLimits;

    if (!limits || dataPoints.length === 0) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm' }),
          display: 'flex', flexDirection: 'column' as const,
          alignItems: 'center', justifyContent: 'center',
          width: svgWidth, height: svgHeight,
          ...style,
        }}>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            color: t.colors.neutral[400],
          }}>
            No data available
          </Text>
        </Box>
      );
    }

    const { ucl, lcl, centerLine, upperWarning, lowerWarning } = limits;
    const effectiveUpperWarning = upperWarning ?? (centerLine + (ucl - centerLine) * 2 / 3);
    const effectiveLowerWarning = lowerWarning ?? (centerLine - (centerLine - lcl) * 2 / 3);

    // Calculate chart area
    const chartWidth = svgWidth - PADDING.left - PADDING.right;
    const chartHeight = svgHeight - PADDING.top - PADDING.bottom;

    // Y-axis range with padding
    const allValues = dataPoints.map(p => p.value);
    const yMin = Math.min(lcl, ...allValues) - 2;
    const yMax = Math.max(ucl, ...allValues) + 2;
    const yRange = yMax - yMin;

    // Scale functions
    const xScale = useCallback((index: number) => {
      if (dataPoints.length <= 1) return PADDING.left + chartWidth / 2;
      return PADDING.left + (index / (dataPoints.length - 1)) * chartWidth;
    }, [dataPoints.length, chartWidth]);

    const yScale = useCallback((value: number) => {
      return PADDING.top + chartHeight - ((value - yMin) / yRange) * chartHeight;
    }, [chartHeight, yMin, yRange]);

    // SPC violations
    const violations = useMemo(
      () => detectRuleViolations(dataPoints, centerLine, ucl, lcl),
      [dataPoints, centerLine, ucl, lcl]
    );

    // Violation index set for highlighting
    const violationIndices = useMemo(() => {
      const set = new Set<number>();
      violations.forEach(v => {
        for (let i = v.startIndex; i <= v.endIndex; i++) set.add(i);
      });
      return set;
    }, [violations]);

    // Build SVG path for data line
    const linePath = useMemo(() => {
      if (dataPoints.length === 0) return '';
      return dataPoints.map((p, i) => {
        const x = xScale(i);
        const y = yScale(p.value);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    }, [dataPoints, xScale, yScale]);

    // Path length for animation
    const [pathLength, setPathLength] = useState(0);
    useEffect(() => {
      if (pathRef.current) {
        setPathLength(pathRef.current.getTotalLength());
      }
    }, [linePath]);

    // Y-axis tick values
    const yTicks = useMemo(() => {
      const ticks: number[] = [];
      const step = yRange / 5;
      for (let i = 0; i <= 5; i++) {
        ticks.push(yMin + step * i);
      }
      return ticks;
    }, [yMin, yRange]);

    // X-axis labels (show every Nth label to avoid crowding)
    const xLabelInterval = Math.max(1, Math.ceil(dataPoints.length / 8));

    /* -- Tooltip ---------------------------------------------------- */
    const tooltipPoint = hoveredIndex !== null ? dataPoints[hoveredIndex] : null;
    const tooltipX = hoveredIndex !== null ? xScale(hoveredIndex) : 0;
    const tooltipY = hoveredIndex !== null ? yScale(dataPoints[hoveredIndex].value) : 0;

    /* -- Render ----------------------------------------------------- */
    return (
      <div
        className={className}
        role="img"
        aria-label={title ? `Control chart: ${title}` : 'Statistical Process Control chart'}
        style={{
          display: 'inline-block',
          position: 'relative' as const,
          ...style,
        }}
      >
        {/* Title */}
        {title && (
          <Text style={{
            display: 'block',
            fontSize: t.typography.fontSize.sm,
            fontWeight: personalityTypo.headingWeight,
            letterSpacing: personalityTypo.headingLetterSpacing,
            color: t.colors.neutral[800],
            marginBottom: t.spacing[2],
          }}>
            {title}
          </Text>
        )}

        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ overflow: 'visible' }}
        >
          {/* Zone shading */}
          {showZones && (
            <g aria-hidden="true">
              {/* Zone A (between warning and control limits) - error shade */}
              <rect
                x={PADDING.left}
                y={yScale(ucl)}
                width={chartWidth}
                height={yScale(effectiveUpperWarning) - yScale(ucl)}
                fill={t.colors.errorScale[50]}
                opacity={0.5}
              />
              <rect
                x={PADDING.left}
                y={yScale(effectiveLowerWarning)}
                width={chartWidth}
                height={yScale(lcl) - yScale(effectiveLowerWarning)}
                fill={t.colors.errorScale[50]}
                opacity={0.5}
              />

              {/* Zone B (between center and warning) - warning shade */}
              <rect
                x={PADDING.left}
                y={yScale(effectiveUpperWarning)}
                width={chartWidth}
                height={yScale(centerLine) - yScale(effectiveUpperWarning)}
                fill={t.colors.warningScale[50]}
                opacity={0.4}
              />
              <rect
                x={PADDING.left}
                y={yScale(centerLine)}
                width={chartWidth}
                height={yScale(effectiveLowerWarning) - yScale(centerLine)}
                fill={t.colors.warningScale[50]}
                opacity={0.4}
              />

              {/* Zone C (near center line) - success shade */}
              {(() => {
                const zoneHalfHeight = (yScale(effectiveLowerWarning) - yScale(effectiveUpperWarning)) * 0.25;
                return (
                  <>
                    <rect
                      x={PADDING.left}
                      y={yScale(centerLine) - zoneHalfHeight}
                      width={chartWidth}
                      height={zoneHalfHeight * 2}
                      fill={t.colors.successScale[50]}
                      opacity={0.5}
                    />
                  </>
                );
              })()}
            </g>
          )}

          {/* Grid lines */}
          <g aria-hidden="true">
            {yTicks.map((tick, i) => (
              <line
                key={`grid-${i}`}
                x1={PADDING.left}
                y1={yScale(tick)}
                x2={PADDING.left + chartWidth}
                y2={yScale(tick)}
                stroke={t.colors.neutral[100]}
                strokeWidth={1}
              />
            ))}
          </g>

          {/* Center line */}
          <line
            x1={PADDING.left}
            y1={yScale(centerLine)}
            x2={PADDING.left + chartWidth}
            y2={yScale(centerLine)}
            stroke={t.colors.neutral[400]}
            strokeWidth={1.5}
            aria-label={`Center line at ${centerLine.toFixed(1)}`}
          />

          {/* UCL / LCL dashed lines */}
          <line
            x1={PADDING.left}
            y1={yScale(ucl)}
            x2={PADDING.left + chartWidth}
            y2={yScale(ucl)}
            stroke={t.colors.errorScale[400]}
            strokeWidth={1}
            strokeDasharray={DASH_PATTERN_CONTROL}
            aria-label={`Upper Control Limit at ${ucl.toFixed(1)}`}
          />
          <line
            x1={PADDING.left}
            y1={yScale(lcl)}
            x2={PADDING.left + chartWidth}
            y2={yScale(lcl)}
            stroke={t.colors.errorScale[400]}
            strokeWidth={1}
            strokeDasharray={DASH_PATTERN_CONTROL}
            aria-label={`Lower Control Limit at ${lcl.toFixed(1)}`}
          />

          {/* Warning limit dotted lines */}
          <line
            x1={PADDING.left}
            y1={yScale(effectiveUpperWarning)}
            x2={PADDING.left + chartWidth}
            y2={yScale(effectiveUpperWarning)}
            stroke={t.colors.warningScale[400]}
            strokeWidth={1}
            strokeDasharray={DASH_PATTERN_WARNING}
          />
          <line
            x1={PADDING.left}
            y1={yScale(effectiveLowerWarning)}
            x2={PADDING.left + chartWidth}
            y2={yScale(effectiveLowerWarning)}
            stroke={t.colors.warningScale[400]}
            strokeWidth={1}
            strokeDasharray={DASH_PATTERN_WARNING}
          />

          {/* Limit labels */}
          {showLabels && (
            <g aria-hidden="true">
              <text
                x={PADDING.left + chartWidth + 4}
                y={yScale(ucl)}
                fill={t.colors.errorScale[500]}
                fontSize={t.typography.fontSize.xs}
                dominantBaseline="middle"
              >
                UCL
              </text>
              <text
                x={PADDING.left + chartWidth + 4}
                y={yScale(lcl)}
                fill={t.colors.errorScale[500]}
                fontSize={t.typography.fontSize.xs}
                dominantBaseline="middle"
              >
                LCL
              </text>
              <text
                x={PADDING.left + chartWidth + 4}
                y={yScale(centerLine)}
                fill={t.colors.neutral[500]}
                fontSize={t.typography.fontSize.xs}
                dominantBaseline="middle"
              >
                CL
              </text>
            </g>
          )}

          {/* Y-axis labels */}
          {showLabels && (
            <g aria-hidden="true">
              {yTicks.map((tick, i) => (
                <text
                  key={`y-label-${i}`}
                  x={PADDING.left - 8}
                  y={yScale(tick)}
                  fill={t.colors.neutral[500]}
                  fontSize={t.typography.fontSize.xs}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {tick.toFixed(0)}
                </text>
              ))}
            </g>
          )}

          {/* X-axis labels */}
          {showLabels && (
            <g aria-hidden="true">
              {dataPoints.map((p, i) => {
                if (i % xLabelInterval !== 0) return null;
                return (
                  <text
                    key={`x-label-${i}`}
                    x={xScale(i)}
                    y={PADDING.top + chartHeight + 16}
                    fill={t.colors.neutral[500]}
                    fontSize={t.typography.fontSize.xs}
                    textAnchor="end"
                    transform={`rotate(-45 ${xScale(i)} ${PADDING.top + chartHeight + 16})`}
                  >
                    {formatDate(p.date, { month: 'short', day: 'numeric' })}
                  </text>
                );
              })}
            </g>
          )}

          {/* Rule violation highlight bands */}
          {violations.map((v, vi) => {
            if (v.type === 'beyond_3sigma') return null;
            const x1 = xScale(v.startIndex) - 4;
            const x2 = xScale(v.endIndex) + 4;
            const fillColor = v.type === 'run' ? t.colors.warningScale[100] : t.colors.errorScale[100];
            return (
              <rect
                key={`violation-${vi}`}
                x={x1}
                y={PADDING.top}
                width={x2 - x1}
                height={chartHeight}
                fill={fillColor}
                opacity={0.3}
                rx={4}
              />
            );
          })}

          {/* Data line */}
          {linePath && (
            <path
              ref={pathRef}
              d={linePath}
              fill="none"
              stroke={t.colors.primaryScale[500]}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={animate && pathLength > 0 ? pathLength : undefined}
              strokeDashoffset={animate && pathLength > 0 ? pathLength * (1 - animProgress) : undefined}
              style={{ transition: 'none' }}
            />
          )}

          {/* Data points */}
          {dataPoints.map((point, i) => {
            const x = xScale(i);
            const y = yScale(point.value);
            const isOutlier = point.isOutlier || point.value > ucl || point.value < lcl;
            const isViolation = violationIndices.has(i);
            const isHovered = hoveredIndex === i;
            const visible = animate ? (i / Math.max(dataPoints.length - 1, 1)) <= animProgress : true;

            if (!visible) return null;

            const pointColor = isOutlier
              ? t.colors.errorScale[600]
              : isViolation
                ? t.colors.warningScale[600]
                : t.colors.primaryScale[500];
            const radius = isOutlier ? OUTLIER_RADIUS : isHovered ? POINT_RADIUS + 2 : POINT_RADIUS;

            return (
              <g key={`point-${i}`}>
                {/* Hit area (larger invisible circle for easier hover/click) */}
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="transparent"
                  style={{ cursor: onPointClick ? 'pointer' : 'default' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onPointClick?.(point, i)}
                  aria-label={`Score ${point.value.toFixed(1)} on ${point.date}${point.label ? ` - ${point.label}` : ''}`}
                  role={onPointClick ? 'button' : undefined}
                  tabIndex={onPointClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onPointClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onPointClick(point, i);
                    }
                  }}
                />
                {/* Visible point */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={t.colors.common.white}
                  stroke={pointColor}
                  strokeWidth={2}
                  style={{
                    transition: `r 150ms ease, stroke 150ms ease`,
                    pointerEvents: 'none',
                  }}
                />
                {/* Outlier ring */}
                {isOutlier && (
                  <circle
                    cx={x}
                    cy={y}
                    r={OUTLIER_RADIUS + 3}
                    fill="none"
                    stroke={t.colors.errorScale[300]}
                    strokeWidth={1}
                    strokeDasharray="3,3"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </g>
            );
          })}

          {/* Tooltip */}
          {tooltipPoint && hoveredIndex !== null && (
            <g style={{ pointerEvents: 'none' }}>
              {/* Tooltip background */}
              <rect
                x={tooltipX - 70}
                y={tooltipY - 60}
                width={140}
                height={tooltipPoint.label ? 52 : 40}
                rx={t.borderRadius.md.replace('px', '') as unknown as number || 6}
                fill={t.colors.neutral[800]}
                opacity={0.95}
              />
              {/* Date */}
              <text
                x={tooltipX}
                y={tooltipY - 44}
                fill={t.colors.neutral[200]}
                fontSize={t.typography.fontSize.xs}
                textAnchor="middle"
              >
                {formatDate(tooltipPoint.date, { month: 'short', day: 'numeric', year: 'numeric' })}
              </text>
              {/* Value */}
              <text
                x={tooltipX}
                y={tooltipY - 28}
                fill={t.colors.common.white}
                fontSize={t.typography.fontSize.sm}
                fontWeight={t.typography.fontWeight.semibold}
                textAnchor="middle"
              >
                Score: {tooltipPoint.value.toFixed(1)}
              </text>
              {/* Label (candidate name) */}
              {tooltipPoint.label && (
                <text
                  x={tooltipX}
                  y={tooltipY - 14}
                  fill={t.colors.neutral[300]}
                  fontSize={t.typography.fontSize.xs}
                  textAnchor="middle"
                >
                  {tooltipPoint.label}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>
    );
  },
});
