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
 * to host loading/empty/error copy, so a non-ready `state` renders nothing
 * (see the component body) instead of displaying the typed-required labels.
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
  // empty, or error copy: a non-ready state renders nothing rather than
  // reserving space for unstyled text (mirrors the renderer's own
  // no-finite-datum null return below).
  if (resolvedState !== 'ready') {
    return null;
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
