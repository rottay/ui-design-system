'use client';

import { useMemo, type CSSProperties } from 'react';

import { useReducedMotion } from '@/graphics/motion/react/runtime';
import { useResolvedChartPersonality } from '@/infrastructure/runtime/personality';
import {
  buildSvgTreeMapGeometry,
  type SvgTreeMapNode,
} from '../../../../foundation/renderers/geometry';
import { useChartDimensions } from '../../../../runtime/dimensions';
import { ChartRendererSurface } from '..';

export interface SvgTreeMapRendererProps {
  readonly data: readonly SvgTreeMapNode[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number | string;
  readonly height?: number;
  /** Recompute the squarified layout from the container width. Defaults to true. */
  readonly responsive?: boolean;
  /** Uses the resolved tenant personality unless explicitly overridden. */
  readonly animate?: boolean;
  readonly padding?: number;
  readonly showLabels?: boolean;
  readonly colors?: readonly string[];
  /** Native `<title>` tooltips for non-interactive compatibility views. */
  readonly showTitles?: boolean;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * React-owned hierarchical treemap. D3's hierarchy sum and squarified tiling
 * run inside the immutable geometry builder; all SVG marks and motion are
 * React-owned.
 */
export function SvgTreeMapRenderer({
  data,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 600,
  height = 400,
  responsive = true,
  animate,
  padding = 2,
  showLabels = true,
  colors,
  showTitles = true,
  className,
  style,
}: SvgTreeMapRendererProps): React.ReactElement {
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
    () => buildSvgTreeMapGeometry({
      data,
      width: geometryWidth,
      height,
      padding,
      colors,
    }),
    [colors, data, geometryWidth, height, padding],
  );
  const surfaceStyle: CSSProperties = {
    ...(typeof width === 'string' ? { width } : {}),
    ...style,
  };
  const description = ariaDescribedBy
    ? ariaDescription
    : ariaDescription ?? `Treemap with ${geometry.tiles.length} ${geometry.tiles.length === 1 ? 'tile' : 'tiles'}.`;
  const rendererClassName = ['ds-chart-treemap', 'ds-chart-renderer-treemap', className]
    .filter(Boolean)
    .join(' ');

  return (
    <ChartRendererSurface
      rendererId="svg.treemap"
      ariaLabel={ariaLabel}
      ariaDescription={description}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.tiles.length === 0}
      className={rendererClassName}
      style={surfaceStyle}
      ownerRef={containerRef}
    >
      <g data-part="plot-area" data-variant="treemap">
        <g data-part="treemap-motion" data-animate={shouldAnimate ? 'true' : 'false'}>
          {geometry.tiles.map((tile) => (
            <g
              key={tile.id}
              data-part="tile"
              data-datum-id={tile.id}
              data-mark-index={tile.index % 5}
              transform={`translate(${tile.x},${tile.y})`}
              role="img"
              aria-label={`${tile.name}: ${tile.value}`}
            >
              {showTitles ? <title>{`${tile.name}: ${tile.value}`}</title> : null}
              <rect
                data-part="tile-surface"
                data-color-source={tile.colorSource}
                width={tile.width}
                height={tile.height}
                rx={3}
                fill={tile.color}
                strokeWidth={1}
                aria-hidden="true"
              >
                {shouldAnimate ? (
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin={`${Math.round(tile.index * 30)}ms`}
                    dur={`${animationDuration}ms`}
                    fill="freeze"
                  />
                ) : null}
              </rect>
              {showLabels && tile.showLabel ? (
                <text
                  data-part="tile-label"
                  x={4}
                  y={14}
                  style={{ fontSize: '11px', fontWeight: 500, pointerEvents: 'none' }}
                  aria-hidden="true"
                >
                  {tile.name}
                </text>
              ) : null}
              {showLabels && tile.showValue ? (
                <text
                  data-part="tile-value"
                  x={4}
                  y={26}
                  style={{ fontSize: '10px', pointerEvents: 'none' }}
                  aria-hidden="true"
                >
                  {tile.value}
                </text>
              ) : null}
            </g>
          ))}
        </g>
      </g>
    </ChartRendererSurface>
  );
}
