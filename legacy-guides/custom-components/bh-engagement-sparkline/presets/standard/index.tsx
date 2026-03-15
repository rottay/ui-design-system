'use client';

/**
 * BhEngagementSparkline - Standard Preset
 * Pure SVG sparkline with smooth bezier curves, optional area fill,
 * threshold line, dot markers, and entrance animation.
 *
 * No D3 dependency — all path calculations are inline.
 * Colors sourced exclusively from design tokens.
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhEngagementSparklineProps, SparklineDataPoint } from '../../core';
import { n } from '../../core';

/* ------------------------------------------------------------------ */
/*  SVG Path Helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Compute a smooth bezier SVG path string from a set of points.
 * Uses monotone cubic interpolation for a natural sparkline look.
 */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    // Control point tension
    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

/**
 * Builds a closed area path for the fill under the sparkline.
 */
function buildAreaPath(
  points: { x: number; y: number }[],
  height: number
): string {
  if (points.length < 2) return '';
  const linePath = buildSmoothPath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  return `${linePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const StandardBhEngagementSparkline = createPreset<BhEngagementSparklineProps>({
  name: 'BhEngagementSparkline.Standard',
  render: (ctx: PresetContext<BhEngagementSparklineProps>) => {
    const { props, tokens: t } = ctx;

    const {
      dataPoints = [],
      width = 120,
      height = 32,
      color,
      showArea = false,
      showDots = false,
      animate = true,
      threshold,
      thresholdColor,
      className,
      style,
    } = props;

    const pathRef = useRef<SVGPathElement>(null);
    const [animationReady, setAnimationReady] = useState(!animate);

    /* -- Token-derived colors ----------------------------------------- */
    const lineColor = color ?? t.colors.primaryScale[500];
    const dangerColor = thresholdColor ?? t.colors.errorScale[500];
    const areaColor = lineColor;
    const areaDangerColor = dangerColor;
    const dotColor = lineColor;

    /* -- Normalize data points to SVG coordinates --------------------- */
    const padding = showDots ? 4 : 2;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;

    const points = useMemo(() => {
      if (!dataPoints.length) return [];

      const values = dataPoints.map((dp) => n(dp.value));
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const range = maxVal - minVal || 1;

      return dataPoints.map((dp, i) => ({
        x: padding + (i / Math.max(dataPoints.length - 1, 1)) * drawWidth,
        y: padding + drawHeight - ((n(dp.value) - minVal) / range) * drawHeight,
        value: n(dp.value),
      }));
    }, [dataPoints, drawWidth, drawHeight, padding]);

    /* -- Threshold Y position ----------------------------------------- */
    const thresholdY = useMemo(() => {
      if (threshold == null || !dataPoints.length) return null;
      const values = dataPoints.map((dp) => n(dp.value));
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const range = maxVal - minVal || 1;
      return padding + drawHeight - ((threshold - minVal) / range) * drawHeight;
    }, [threshold, dataPoints, drawHeight, padding]);

    /* -- Path strings ------------------------------------------------- */
    const linePath = useMemo(() => buildSmoothPath(points), [points]);
    const areaPath = useMemo(
      () => (showArea ? buildAreaPath(points, height - padding) : ''),
      [showArea, points, height, padding]
    );

    /* -- Determine if any points are below threshold ------------------ */
    const hasBelowThreshold = useMemo(() => {
      if (threshold == null) return false;
      return points.some((p) => p.value < threshold);
    }, [threshold, points]);

    /* -- Entrance animation ------------------------------------------- */
    useEffect(() => {
      if (!animate || !pathRef.current) {
        setAnimationReady(true);
        return;
      }

      const path = pathRef.current;
      const length = path.getTotalLength();

      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      // Force reflow
      path.getBoundingClientRect();

      path.style.transition = 'stroke-dashoffset 0.8s ease-out';
      path.style.strokeDashoffset = '0';

      const timer = setTimeout(() => setAnimationReady(true), 850);
      return () => clearTimeout(timer);
    }, [animate, linePath]);

    /* -- Empty state -------------------------------------------------- */
    if (points.length < 2) {
      return (
        <svg
          className={className}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="No engagement data"
          style={{
            display: 'block',
            ...style,
          }}
        >
          {/* Flat line for empty state */}
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke={t.colors.neutral[200]}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        </svg>
      );
    }

    /* -- Determine effective line color (danger when all below) ------- */
    const effectiveLineColor = hasBelowThreshold && threshold != null
      ? dangerColor
      : lineColor;

    /* -- Unique ID for gradient --------------------------------------- */
    const gradientId = useMemo(
      () => `sparkline-area-${Math.random().toString(36).slice(2, 9)}`,
      []
    );

    return (
      <svg
        className={className}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Engagement sparkline: ${points.length} data points`}
        style={{
          display: 'block',
          overflow: 'visible',
          ...style,
        }}
      >
        {/* Gradient definition for area fill */}
        {showArea && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={hasBelowThreshold ? areaDangerColor : areaColor}
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor={hasBelowThreshold ? areaDangerColor : areaColor}
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
        )}

        {/* Area fill */}
        {showArea && areaPath && (
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
            opacity={animationReady ? 1 : 0}
            style={{ transition: 'opacity 0.3s ease-out' }}
          />
        )}

        {/* Threshold line */}
        {thresholdY != null && (
          <line
            x1={padding}
            y1={thresholdY}
            x2={width - padding}
            y2={thresholdY}
            stroke={dangerColor}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
        )}

        {/* Main sparkline path */}
        <path
          ref={pathRef}
          d={linePath}
          fill="none"
          stroke={effectiveLineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data point dots */}
        {showDots && animationReady && points.map((point, i) => {
          const isBelow = threshold != null && point.value < threshold;
          return (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={2}
              fill={t.colors.common.white}
              stroke={isBelow ? dangerColor : dotColor}
              strokeWidth={1.5}
              style={{
                opacity: animationReady ? 1 : 0,
                transition: `opacity 0.2s ease-out ${i * 0.05}s`,
              }}
            />
          );
        })}

        {/* Last point highlight */}
        {animationReady && points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={2.5}
            fill={effectiveLineColor}
            stroke={t.colors.common.white}
            strokeWidth={1}
            style={{
              opacity: animationReady ? 1 : 0,
              transition: 'opacity 0.3s ease-out 0.6s',
            }}
          />
        )}
      </svg>
    );
  },
});
