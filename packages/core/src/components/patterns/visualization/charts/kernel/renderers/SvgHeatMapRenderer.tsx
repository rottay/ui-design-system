'use client';

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import { useChartDimensions } from '../../hooks/use-chart-dimensions';
import { resolveCssColor } from '../../utils/resolve-css-color';
import {
  buildSvgHeatMapGeometry,
  type ChartGeometryInsets,
  type SvgHeatMapDatum,
} from './ChartGeometry';
import { ChartRendererSurface } from './ChartRendererSurface';

const DEFAULT_LOW_COLOR = 'var(--ds-color-info-bg)';
const DEFAULT_HIGH_COLOR = 'var(--ds-color-primary-500)';
const LOW_COLOR_FALLBACK = '#e5e7eb';
const HIGH_COLOR_FALLBACK = '#0072b2';

type ChartCellPaintStyle = CSSProperties & {
  '--ds-chart-cell-color'?: string;
};

export interface SvgHeatMapRendererProps {
  readonly data: readonly SvgHeatMapDatum[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly xLabels?: readonly string[];
  readonly yLabels?: readonly string[];
  readonly colorRange?: readonly [string, string];
  readonly insets?: ChartGeometryInsets;
  readonly cellPadding?: number;
  readonly cellRadius?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
}

function useProviderResolvedRange(
  ownerRef: RefObject<HTMLDivElement | null>,
  colorRange: readonly [string, string],
): readonly [string, string] {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const owner = ownerRef.current;
    if (!owner) return;

    // Re-render once after the ref is attached so SSR/client first render use
    // the same concrete fallback and provider paint resolves after commit.
    setRevision((current) => current + 1);
    if (typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver(() => {
      setRevision((current) => current + 1);
    });
    let current: Element | null = owner;
    while (current) {
      observer.observe(current, {
        attributes: true,
        attributeFilter: [
          'class',
          'style',
          'data-tenant',
          'data-css-tenant',
          'data-brand-artifact',
          'data-theme',
          'data-engine',
          'data-skin',
        ],
      });
      current = current.parentElement;
    }

    return () => observer.disconnect();
  }, [ownerRef]);

  return useMemo<readonly [string, string]>(() => {
    const owner = ownerRef.current;
    return [
      resolveCssColor(colorRange[0], owner, LOW_COLOR_FALLBACK),
      resolveCssColor(colorRange[1], owner, HIGH_COLOR_FALLBACK),
    ];
    // `revision` is an intentional invalidation signal for computed CSS.
  }, [colorRange, ownerRef, revision]);
}

/**
 * React-owned matrix renderer. Colors resolve from this renderer's provider
 * ancestry, so colocated tenants cannot leak their sequential palette.
 */
export function SvgHeatMapRenderer({
  data,
  ariaLabel,
  ariaDescription,
  width = 640,
  height = 360,
  responsive = true,
  xLabels,
  yLabels,
  colorRange = [DEFAULT_LOW_COLOR, DEFAULT_HIGH_COLOR],
  insets,
  cellPadding,
  cellRadius = 3,
  className,
  style,
}: SvgHeatMapRendererProps): React.ReactElement {
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const resolvedRange = useProviderResolvedRange(containerRef, colorRange);
  const geometry = useMemo(
    () => buildSvgHeatMapGeometry({
      data,
      width: geometryWidth,
      height,
      colorRange: resolvedRange,
      xLabels,
      yLabels,
      insets,
      cellPadding,
    }),
    [cellPadding, data, geometryWidth, height, insets, resolvedRange, xLabels, yLabels],
  );
  const radius = Number.isFinite(cellRadius) ? Math.max(0, cellRadius) : 3;

  return (
    <ChartRendererSurface
      rendererId="svg.heatmap"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.cells.length === 0}
      className={['ds-chart-renderer-heatmap', className].filter(Boolean).join(' ')}
      style={style}
      ownerRef={containerRef}
    >
      <g data-part="axis" data-axis="x" aria-hidden="true">
        {geometry.xTicks.map((tick) => (
          <text
            key={tick.id}
            data-part="axis-tick-label"
            data-axis="x"
            x={tick.x}
            y={tick.y + 18}
            textAnchor="end"
            transform={`rotate(-35 ${tick.x} ${tick.y + 18})`}
          >
            {tick.label}
          </text>
        ))}
      </g>

      <g data-part="axis" data-axis="y" aria-hidden="true">
        {geometry.yTicks.map((tick) => (
          <text
            key={tick.id}
            data-part="axis-tick-label"
            data-axis="y"
            x={tick.x - 8}
            y={tick.y}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {tick.label}
          </text>
        ))}
      </g>

      <g data-part="cells">
        {geometry.cells.map((cell) => {
          const accessibleLabel = cell.ariaLabel
            ?? `${cell.column}, ${cell.row}: ${cell.valueLabel ?? cell.value}`;
          const paintStyle: ChartCellPaintStyle = {
            '--ds-chart-cell-color': cell.cellColor,
          };
          return (
            <rect
              key={cell.id}
              data-part="cell"
              data-datum-id={cell.id}
              x={cell.x}
              y={cell.y}
              width={cell.width}
              height={cell.height}
              rx={radius}
              aria-label={accessibleLabel}
              style={paintStyle}
            >
              <title>{accessibleLabel}</title>
            </rect>
          );
        })}
      </g>
    </ChartRendererSurface>
  );
}
