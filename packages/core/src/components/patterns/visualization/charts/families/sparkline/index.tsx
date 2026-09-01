'use client';

/**
 * @fileoverview Sparkline -- a tiny inline chart that renders a data trend as
 * a simple SVG line with optional area fill, end dot, and min/max markers.
 * Designed for embedding in tables, cards, and text-adjacent contexts where
 * full chart chrome (axes, legends, tooltips) would be excessive.
 *
 * This adapter resolves the tenant/brand chart personality and delegates all
 * SVG ownership to the engine `SvgSparklineRenderer`, whose projection math
 * lives in the pure `buildSvgSparklineGeometry` builder. The standalone
 * `data-part="sparkline"` contract is preserved.
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

import { memo } from 'react';

import { useChartPersonality } from '../../runtime';
import type { ChartColorScheme, ChartStateProps } from '../../contracts';
import { resolveChartScaffoldState } from '../../presentation/scaffold';
import { SvgSparklineRenderer } from '../../runtime/chart-engine/presentation/react/renderers/sparkline';

/** Own props for the {@link Sparkline} component (state copy is composed below). */
interface SparklineOwnProps {
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
  /** Named palette resolved from the active tenant/brand chart personality */
  colorScheme?: ChartColorScheme;
}

/**
 * Props for the {@link Sparkline} component. Sparkline has no scaffold chrome
 * to host loading/empty/error copy, so a non-ready `state` renders a
 * same-footprint inline placeholder (see the component body) instead of the
 * typed-required labels: the copy still reaches assistive technology through
 * the placeholder's `<title>`.
 */
export type SparklineProps = SparklineOwnProps & ChartStateProps;

/**
 * Renders a tiny inline sparkline chart as a standalone SVG element.
 *
 * No axes, no legend, no tooltip -- just the data trend line. Area fill,
 * end dot, and min/max markers are optional. Animation respects
 * `prefers-reduced-motion` (the resolved personality forces it off).
 *
 * @param props - See {@link SparklineProps} for the full option set.
 * @returns An inline `<svg>` element, or `null` when there is no finite datum.
 */
export const Sparkline = memo(function Sparkline({
  data,
  width = 100,
  height = 24,
  color,
  fill,
  fillOpacity = 0.15,
  strokeWidth = 1.5,
  curve,
  showEndDot,
  showMinMax = false,
  animate,
  state,
  emptyLabel,
  errorLabel,
  className,
  style,
  colorScheme,
}: SparklineProps) {
  const chartPersonality = useChartPersonality({ animate, colorScheme });
  const resolvedColor = color ?? chartPersonality.colors[0] ?? 'var(--ds-color-primary)';
  const resolvedFill = fill ?? chartPersonality.useGradientFill;
  const resolvedCurve = curve ?? chartPersonality.lineMode;
  const resolvedShowEndDot = showEndDot ?? chartPersonality.showDots;
  // The personality resolver already folds the explicit prop and the system
  // reduced-motion prohibition into one decision; re-applying `animate` here
  // would let `animate={true}` bypass that accessibility outcome.
  const resolvedAnimate = chartPersonality.animate;

  const resolvedState = resolveChartScaffoldState({
    state,
    dataCount: data.filter((value) => Number.isFinite(value)).length,
    emptyLabel,
  });
  // Sparkline is a chrome-less inline mark with no surface to host loading,
  // empty, or error copy: a non-ready state renders a same-footprint inline
  // placeholder instead of reserving space for unstyled text or collapsing to
  // `null` (which would shift surrounding inline content). The mark language
  // stays color-independent by construction: loading is a neutral track bar,
  // empty a dashed midline, error a dotted midline, all painted by the
  // `.ds-chart-sparkline` skin section, and the app-supplied copy reaches
  // assistive technology through the SVG `<title>`.
  if (resolvedState !== 'ready') {
    const numericWidth = typeof width === 'number' ? width : 100;
    const stateCopy =
      resolvedState === 'loading'
        ? chartPersonality.loadingLabel
        : resolvedState === 'error'
          ? errorLabel
          : emptyLabel;
    const midY = height / 2;
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${numericWidth} ${height}`}
        className={['ds-chart-sparkline', className].filter(Boolean).join(' ')}
        data-part="sparkline"
        data-state={resolvedState}
        role="img"
        style={style}
      >
        <title>{stateCopy}</title>
        {resolvedState === 'loading' ? (
          <rect
            data-part="state-track"
            x={0}
            y={midY - 2}
            width={numericWidth}
            height={4}
            rx={2}
          />
        ) : (
          <line
            data-part="state-baseline"
            x1={1}
            y1={midY}
            x2={numericWidth - 1}
            y2={midY}
            strokeWidth={1.5}
          />
        )}
      </svg>
    );
  }

  return (
    <SvgSparklineRenderer
      data={data}
      width={width}
      height={height}
      color={resolvedColor}
      fill={resolvedFill}
      fillOpacity={fillOpacity}
      strokeWidth={strokeWidth}
      curve={resolvedCurve}
      showEndDot={resolvedShowEndDot}
      showMinMax={showMinMax}
      animate={resolvedAnimate}
      animationDuration={chartPersonality.animationDuration}
      className={className}
      style={style}
    />
  );
});
