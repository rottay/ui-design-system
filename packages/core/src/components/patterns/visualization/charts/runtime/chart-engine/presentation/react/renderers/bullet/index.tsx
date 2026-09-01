'use client';

import { useMemo, type CSSProperties } from 'react';

import { useReducedMotion } from '@/graphics/motion/react/runtime';
import { useResolvedChartPersonality } from '@/infrastructure/runtime/personality';
import {
  buildSvgBulletGeometry,
  type SvgBulletDatum,
  type SvgBulletOrientation,
  type SvgBulletTier,
} from '../../../../foundation/renderers/geometry';
import { useChartDimensions } from '../../../../runtime/dimensions';
import { ChartRendererSurface } from '..';

export interface SvgBulletRendererProps {
  readonly data: readonly SvgBulletDatum[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number | string;
  readonly height?: number;
  /** Recompute linear geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  /** Uses the resolved tenant personality unless explicitly overridden. */
  readonly animate?: boolean;
  readonly orientation?: SvgBulletOrientation;
  readonly barThickness?: number;
  readonly gap?: number;
  readonly showLabels?: boolean;
  readonly formatValue?: (value: number) => string;
  /** Range band colors ordered [poor, satisfactory, good]. */
  readonly rangeColors?: readonly [string, string, string];
  readonly valueColor?: string;
  readonly targetColor?: string;
  /** Native `<title>` tooltips for non-interactive compatibility views. */
  readonly showTitles?: boolean;
  /** Compact tooltip: value only, no label/target context. */
  readonly compactTooltip?: boolean;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const DEFAULT_RANGE_COLORS: readonly [string, string, string] = [
  'var(--ds-color-primary-200)',
  'var(--ds-color-primary-100)',
  'var(--ds-color-primary-50)',
];

function tierColor(
  tier: SvgBulletTier,
  colors: readonly [string, string, string],
): string {
  return tier === 'poor' ? colors[0] : tier === 'satisfactory' ? colors[1] : colors[2];
}

/**
 * React-owned linear bullet renderer. D3 supplies the linear scale inside the
 * immutable geometry builder; all SVG marks, accessibility and motion are
 * React-owned. Shares the KPI vocabulary with the radial gauge renderer.
 */
export function SvgBulletRenderer({
  data,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 600,
  height = 200,
  responsive = true,
  animate,
  orientation = 'horizontal',
  barThickness = 28,
  gap = 16,
  showLabels = true,
  formatValue,
  rangeColors = DEFAULT_RANGE_COLORS,
  valueColor = 'var(--ds-color-text-primary)',
  targetColor = 'var(--ds-color-error)',
  showTitles = true,
  compactTooltip = false,
  className,
  style,
}: SvgBulletRendererProps): React.ReactElement {
  const chartPersonality = useResolvedChartPersonality();
  const reducedMotion = useReducedMotion();
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive
    ? dimensions.width
    : typeof width === 'number'
      ? width
      : 600;
  const animationDuration = Number.isFinite(chartPersonality.mountDuration)
    ? Math.max(0, chartPersonality.mountDuration)
    : 0;
  const shouldAnimate = !reducedMotion
    && (animate ?? chartPersonality.animateOnMount)
    && animationDuration > 0;
  const geometry = useMemo(
    () => buildSvgBulletGeometry({
      data,
      width: geometryWidth,
      height,
      orientation,
      barThickness,
      gap,
      showLabels,
    }),
    [barThickness, data, gap, geometryWidth, height, orientation, showLabels],
  );
  const formatVal = formatValue ?? ((value: number) => String(value));
  const surfaceStyle: CSSProperties = {
    ...(typeof width === 'string' ? { width } : {}),
    ...style,
  };
  const description = ariaDescribedBy
    ? ariaDescription
    : ariaDescription
      ?? (geometry.fallbackMessage
        ? geometry.fallbackMessage
        : `Bullet chart with ${geometry.items.length} KPI ${geometry.items.length === 1 ? 'item' : 'items'} in ${geometry.orientation} orientation.`);
  const rendererClassName = ['ds-chart-bullet', 'ds-chart-renderer-bullet', className]
    .filter(Boolean)
    .join(' ');

  return (
    <ChartRendererSurface
      rendererId="svg.bullet"
      ariaLabel={ariaLabel}
      ariaDescription={description}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.items.length === 0}
      className={rendererClassName}
      style={surfaceStyle}
      ownerRef={containerRef}
    >
      <g
        data-part="plot-area"
        data-variant="bullet"
        data-orientation={geometry.orientation}
      >
        <g data-part="bullet-motion" data-animate={shouldAnimate ? 'true' : 'false'}>
          {shouldAnimate ? (
            <animate attributeName="opacity" from="0" to="1" dur={`${animationDuration}ms`} fill="freeze" />
          ) : null}
          {geometry.items.map((item) => {
            const tooltipText = compactTooltip
              ? formatVal(item.value)
              : `${item.label}: ${formatVal(item.value)} / ${formatVal(item.target)} target`;
            return (
              <g
                key={item.id}
                data-part="item"
                data-datum-id={item.id}
                data-orientation={geometry.orientation}
                data-domain-min={item.domainMin}
                data-domain-max={item.domainMax}
                role="img"
                aria-label={`${item.label}: ${formatVal(item.value)} of ${formatVal(item.target)} target.`}
              >
                {showTitles ? <title>{tooltipText}</title> : null}
                {item.bands.map((band) => (
                  <rect
                    key={band.id}
                    data-part="range-band"
                    data-tier={band.tier}
                    x={band.x}
                    y={band.y}
                    width={band.width}
                    height={band.height}
                    rx={2}
                    ry={2}
                    fill={tierColor(band.tier, rangeColors)}
                    aria-hidden="true"
                  />
                ))}
                {item.zeroBaseline ? (
                  <line
                    data-part="zero-baseline"
                    x1={item.zeroBaseline.x1}
                    y1={item.zeroBaseline.y1}
                    x2={item.zeroBaseline.x2}
                    y2={item.zeroBaseline.y2}
                    stroke={valueColor}
                    strokeOpacity={0.45}
                    strokeWidth={1}
                    aria-hidden="true"
                  />
                ) : null}
                <rect
                  data-part="value-bar"
                  data-direction={item.valueDirection}
                  x={item.valueBar.x}
                  y={item.valueBar.y}
                  width={item.valueBar.width}
                  height={item.valueBar.height}
                  rx={1}
                  ry={1}
                  fill={valueColor}
                  aria-hidden="true"
                />
                <rect
                  data-part="target-marker"
                  x={item.targetMarker.x}
                  y={item.targetMarker.y}
                  width={item.targetMarker.width}
                  height={item.targetMarker.height}
                  rx={1}
                  fill={targetColor}
                  aria-hidden="true"
                />
                {showLabels ? (
                  <text
                    data-part="item-label"
                    x={item.labelAnchor.x}
                    y={item.labelAnchor.y}
                    textAnchor={geometry.orientation === 'horizontal' ? 'end' : 'middle'}
                    dominantBaseline="middle"
                    style={{ fontSize: '12px', fontWeight: 500, pointerEvents: 'none' }}
                    aria-hidden="true"
                  >
                    {item.label}
                  </text>
                ) : null}
                {showLabels ? (
                  <text
                    data-part="value-label"
                    x={item.valueAnchor.x}
                    y={item.valueAnchor.y}
                    textAnchor={geometry.orientation === 'horizontal' ? 'start' : 'middle'}
                    dominantBaseline="middle"
                    style={{ fontSize: '11px', pointerEvents: 'none' }}
                    aria-hidden="true"
                  >
                    {formatVal(item.value)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </g>
    </ChartRendererSurface>
  );
}
