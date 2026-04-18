'use client';

/**
 * @fileoverview Sparkline -- a tiny inline chart that renders a data trend as
 * a simple SVG line with optional area fill, end dot, and min/max markers.
 * Designed for embedding in tables, cards, and text-adjacent contexts where
 * full chart chrome (axes, legends, tooltips) would be excessive.
 *
 * Uses D3 `line()` and `area()` generators with `scaleLinear` for projection,
 * but renders a standalone `<svg>` without ChartScaffold (sparklines are tiny
 * inline elements that do not need the full accessibility scaffold).
 *
 * @example
 * <Sparkline data={[4, 8, 3, 12, 7, 9]} color="var(--ds-color-success)" fill />
 *
 * @example
 * <Sparkline
 *   data={revenueHistory}
 *   width={120}
 *   height={32}
 *   curve="smooth"
 *   showEndDot
 *   showMinMax
 *   fill
 *   fillOpacity={0.1}
 * />
 */

import { memo, useId, useMemo, useRef } from 'react';
import {
  area as d3Area,
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  extent,
  line as d3Line,
  scaleLinear,
} from 'd3';

/** Props for the {@link Sparkline} component. */
export interface SparklineProps {
  /** Data values to plot along the sparkline. */
  data: number[];
  /** Width of the SVG. CSS string or pixel number. Default: 100 */
  width?: number | string;
  /** Height of the SVG in pixels. Default: 24 */
  height?: number;
  /** Line color. Default: var(--ds-color-primary) */
  color?: string;
  /** Show area fill below the line. Default: false */
  fill?: boolean;
  /** Fill opacity when area is shown. Default: 0.15 */
  fillOpacity?: number;
  /** Line stroke width. Default: 1.5 */
  strokeWidth?: number;
  /** Curve interpolation type. Default: 'smooth' */
  curve?: 'sharp' | 'smooth' | 'step';
  /** Show a dot on the last data point. Default: true */
  showEndDot?: boolean;
  /** Show dots on min and max data points. Default: false */
  showMinMax?: boolean;
  /** Animate the line drawing on mount. Default: true */
  animate?: boolean;
  /** Additional CSS class name applied to the root svg element. */
  className?: string;
  /** Inline styles applied to the root svg element. */
  style?: React.CSSProperties;
}

/** Maps curve prop strings to D3 curve factories. */
const CURVE_MAP = {
  sharp: curveLinear,
  smooth: curveMonotoneX,
  step: curveStepAfter,
} as const;

/**
 * Renders a tiny inline sparkline chart as a standalone SVG element.
 *
 * No axes, no legend, no tooltip -- just the data trend line. Area fill,
 * end dot, and min/max markers are optional. Animation uses the
 * stroke-dashoffset drawing trick and respects `prefers-reduced-motion`
 * via a CSS media query on the animation itself (no JS motion query needed
 * since the animation is purely CSS-driven after initial render).
 *
 * @param props - See {@link SparklineProps} for the full option set.
 * @returns An inline `<svg>` element suitable for embedding in tables and cards.
 */
export const Sparkline = memo(function Sparkline({
  data,
  width = 100,
  height = 24,
  color = 'var(--ds-color-primary)',
  fill = false,
  fillOpacity = 0.15,
  strokeWidth = 1.5,
  curve = 'smooth',
  showEndDot = true,
  showMinMax = false,
  animate = true,
  className,
  style,
}: SparklineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const uniqueId = useId();
  const gradientId = `sparkline-fill-${uniqueId}`;

  // Padding inside the SVG to prevent line/dot clipping at the edges.
  const padding = { x: showEndDot || showMinMax ? 4 : 2, y: 2 };

  // Resolve the numeric width for scale computation. When width is a CSS
  // string (e.g. '100%'), we use a fallback of 100px for the internal
  // scale domain; the SVG stretches via the width attribute.
  const numericWidth = typeof width === 'number' ? width : 100;

  const curveFactory = CURVE_MAP[curve] ?? curveMonotoneX;

  // Compute scales, line path, and area path once per data/dimension change.
  const computed = useMemo(() => {
    if (!data || data.length === 0) return null;

    const innerWidth = numericWidth - padding.x * 2;
    const innerHeight = height - padding.y * 2;

    const x = scaleLinear()
      .domain([0, data.length - 1])
      .range([padding.x, padding.x + innerWidth]);

    const [yMin, yMax] = extent(data) as [number, number];
    // When all values are equal, create a 1-unit range so the line
    // renders at the vertical center rather than at the edge.
    const y = scaleLinear()
      .domain([yMin === yMax ? yMin - 0.5 : yMin, yMin === yMax ? yMax + 0.5 : yMax])
      .range([padding.y + innerHeight, padding.y]);

    const lineGenerator = d3Line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d))
      .curve(curveFactory);

    const linePath = lineGenerator(data) ?? '';

    let areaPath: string | null = null;
    if (fill) {
      const areaGenerator = d3Area<number>()
        .x((_, i) => x(i))
        .y0(padding.y + innerHeight)
        .y1((d) => y(d))
        .curve(curveFactory);

      areaPath = areaGenerator(data) ?? null;
    }

    // Compute dot positions
    const endDot = showEndDot && data.length > 0
      ? { cx: x(data.length - 1), cy: y(data[data.length - 1]) }
      : null;

    let minDot: { cx: number; cy: number } | null = null;
    let maxDot: { cx: number; cy: number } | null = null;
    if (showMinMax && data.length > 1) {
      let minIdx = 0;
      let maxIdx = 0;
      for (let i = 1; i < data.length; i++) {
        if (data[i] < data[minIdx]) minIdx = i;
        if (data[i] > data[maxIdx]) maxIdx = i;
      }
      // Only show min/max dots if they differ from the end dot index
      // to avoid overlapping markers at the same position.
      if (!showEndDot || minIdx !== data.length - 1) {
        minDot = { cx: x(minIdx), cy: y(data[minIdx]) };
      }
      if (!showEndDot || maxIdx !== data.length - 1) {
        maxDot = { cx: x(maxIdx), cy: y(data[maxIdx]) };
      }
    }

    return { linePath, areaPath, endDot, minDot, maxDot };
  }, [data, numericWidth, height, padding.x, padding.y, curveFactory, fill, showEndDot, showMinMax]);

  if (!computed || !data || data.length === 0) {
    return null;
  }

  // The stroke-dashoffset animation is handled by a CSS @keyframes rule
  // injected via a <style> element scoped to this instance. This avoids
  // D3 transitions (which would require an effect + DOM mutation) and
  // automatically respects prefers-reduced-motion via a media query.
  const animationName = `sparkline-draw-${uniqueId.replace(/:/g, '')}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${numericWidth} ${height}`}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', overflow: 'visible', ...style }}
      role="img"
      aria-label={`Sparkline: ${data.length} data points, range ${Math.min(...data)} to ${Math.max(...data)}`}
    >
      {/* Scoped animation keyframes and reduced-motion override */}
      {animate && (
        <style>{`
          @keyframes ${animationName} {
            from { stroke-dashoffset: var(--sparkline-length); }
            to { stroke-dashoffset: 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            .${animationName} {
              animation: none !important;
              stroke-dashoffset: 0 !important;
            }
          }
        `}</style>
      )}

      {/* Area fill gradient for a top-to-bottom fade effect */}
      {fill && computed.areaPath && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity={fillOpacity * 0.15} />
          </linearGradient>
        </defs>
      )}

      {/* Area fill path */}
      {fill && computed.areaPath && (
        <path
          d={computed.areaPath}
          fill={`url(#${gradientId})`}
          stroke="none"
        />
      )}

      {/* Main line path */}
      <path
        ref={pathRef}
        d={computed.linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? animationName : undefined}
        style={animate ? {
          // The path length is estimated generously; the actual dasharray
          // value only needs to be >= the real path length for the drawing
          // trick to work. 2000 covers any reasonable sparkline width.
          strokeDasharray: 2000,
          strokeDashoffset: 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--sparkline-length' as any]: 2000,
          animation: `${animationName} 800ms ease-out forwards`,
        } : undefined}
      />

      {/* End dot: highlights the most recent value */}
      {computed.endDot && (
        <circle
          cx={computed.endDot.cx}
          cy={computed.endDot.cy}
          r={strokeWidth + 1}
          fill={color}
          stroke="var(--ds-color-bg-primary)"
          strokeWidth={1}
        />
      )}

      {/* Min dot: marks the lowest value */}
      {computed.minDot && (
        <circle
          cx={computed.minDot.cx}
          cy={computed.minDot.cy}
          r={strokeWidth}
          fill="var(--ds-color-error)"
          stroke="var(--ds-color-bg-primary)"
          strokeWidth={1}
        />
      )}

      {/* Max dot: marks the highest value */}
      {computed.maxDot && (
        <circle
          cx={computed.maxDot.cx}
          cy={computed.maxDot.cy}
          r={strokeWidth}
          fill="var(--ds-color-success)"
          stroke="var(--ds-color-bg-primary)"
          strokeWidth={1}
        />
      )}
    </svg>
  );
});
