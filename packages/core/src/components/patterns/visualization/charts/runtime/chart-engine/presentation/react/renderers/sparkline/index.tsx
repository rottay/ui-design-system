'use client';

import { useId, useMemo, type CSSProperties } from 'react';

import {
  buildSvgSparklineGeometry,
  type SvgSparklineCurve,
} from '../../../../foundation/renderers/geometry';

export interface SvgSparklineRendererProps {
  readonly data: readonly number[];
  readonly width?: number | string;
  readonly height?: number;
  /** Resolved line/fill paint (already palette- or personality-resolved). */
  readonly color: string;
  readonly fill?: boolean;
  readonly fillOpacity?: number;
  readonly strokeWidth?: number;
  readonly curve?: SvgSparklineCurve;
  readonly showEndDot?: boolean;
  readonly showMinMax?: boolean;
  /** Reduced-motion-resolved animation flag; the caller owns that decision. */
  readonly animate?: boolean;
  readonly animationDuration?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * React-owned micro line renderer for inline sparklines. It intentionally does
 * NOT use {@link ChartRendererSurface}: sparklines are tiny, chrome-free inline
 * elements and keep their standalone `data-part="sparkline"` contract. All
 * projection math lives in the pure `buildSvgSparklineGeometry`; this renderer
 * owns no D3. Returns `null` when there is no finite datum to plot.
 */
export function SvgSparklineRenderer({
  data,
  width = 100,
  height = 24,
  color,
  fill = false,
  fillOpacity = 0.15,
  strokeWidth = 1.5,
  curve = 'smooth',
  showEndDot = true,
  showMinMax = false,
  animate = false,
  animationDuration = 600,
  className,
  style,
}: SvgSparklineRendererProps): React.ReactElement | null {
  const uniqueId = useId();
  const gradientId = `sparkline-fill-${uniqueId}`;
  const numericWidth = typeof width === 'number' ? width : 100;
  const padding = showEndDot || showMinMax ? 4 : 2;

  const geometry = useMemo(
    () => buildSvgSparklineGeometry({
      data: [...data],
      width: numericWidth,
      height,
      curve,
      showEndDot,
      showMinMax,
      showArea: fill,
      paddingX: padding,
      paddingY: 2,
    }),
    [curve, data, fill, height, numericWidth, padding, showEndDot, showMinMax],
  );

  if (!geometry) return null;

  const animationName = `ds-sparkline-draw-${uniqueId.replace(/:/g, '')}`;
  const rangeLabel = `Sparkline: ${geometry.pointCount} data points, range ${geometry.minimum} to ${geometry.maximum}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${numericWidth} ${height}`}
      className={['ds-chart-sparkline', className].filter(Boolean).join(' ')}
      data-part="sparkline"
      data-state="ready"
      data-variant={curve}
      data-fill={fill ? 'true' : 'false'}
      style={{ display: 'inline-block', verticalAlign: 'middle', overflow: 'visible', ...style }}
      role="img"
      aria-label={rangeLabel}
    >
      {animate ? (
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
      ) : null}

      {fill && geometry.areaPath ? (
        <defs data-part="definitions">
          <linearGradient id={gradientId} data-part="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop data-part="area-gradient-stop" data-position="start" offset="0%" stopColor={color} stopOpacity={fillOpacity} />
            <stop data-part="area-gradient-stop" data-position="end" offset="100%" stopColor={color} stopOpacity={fillOpacity * 0.15} />
          </linearGradient>
        </defs>
      ) : null}

      {fill && geometry.areaPath ? (
        <path
          data-part="area"
          d={geometry.areaPath}
          fill={`url(#${gradientId})`}
          stroke="none"
        />
      ) : null}

      <path
        data-part="line"
        d={geometry.linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? animationName : undefined}
        style={animate ? {
          strokeDasharray: 2000,
          strokeDashoffset: 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--sparkline-length' as any]: 2000,
          animation: `${animationName} ${animationDuration}ms ease-out forwards`,
        } : undefined}
      />

      {geometry.endDot ? (
        <circle
          data-part="end-dot"
          cx={geometry.endDot.cx}
          cy={geometry.endDot.cy}
          r={strokeWidth + 1}
          fill={color}
          strokeWidth={1}
        />
      ) : null}

      {geometry.minDot ? (
        <circle
          data-part="min-dot"
          cx={geometry.minDot.cx}
          cy={geometry.minDot.cy}
          r={strokeWidth}
          strokeWidth={1}
        />
      ) : null}

      {geometry.maxDot ? (
        <circle
          data-part="max-dot"
          cx={geometry.maxDot.cx}
          cy={geometry.maxDot.cy}
          r={strokeWidth}
          strokeWidth={1}
        />
      ) : null}
    </svg>
  );
}
