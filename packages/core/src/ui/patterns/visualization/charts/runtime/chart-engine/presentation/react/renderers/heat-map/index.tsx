'use client';

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import { useChartDimensions } from '../../../../runtime/dimensions';
import {
  PROVIDER_PAINT_ATTRIBUTE_FILTER,
  resolveCssColor,
} from '@/infrastructure/runtime/dom/runtime/css-color-resolution';
import type { ChartInteraction } from '../../../../foundation/interaction';
import { useChartInteraction } from '../../../../runtime/interaction/controller';
import {
  buildSvgHeatMapGeometry,
  type ChartGeometryInsets,
  type SvgHeatMapDatum,
} from '../../../../foundation/renderers/geometry';
import { ChartRendererSurface } from '..';

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
  /** ID of a family- or app-owned description (e.g. the scaffold summary). */
  readonly ariaDescribedBy?: string;
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
  readonly interaction?: ChartInteraction<SvgHeatMapDatum>;
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
        attributeFilter: [...PROVIDER_PAINT_ATTRIBUTE_FILTER],
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
  ariaDescribedBy,
  width = 640,
  height = 360,
  responsive = true,
  xLabels,
  yLabels,
  colorRange = [DEFAULT_LOW_COLOR, DEFAULT_HIGH_COLOR],
  insets,
  cellPadding,
  cellRadius = 3,
  interaction,
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
  const interactionItems = useMemo(() => {
    const columns = new Map(geometry.xTicks.map((tick, index) => [String(tick.value), index]));
    const rows = new Map(geometry.yTicks.map((tick, index) => [String(tick.value), index]));
    return geometry.cells.map((cell) => {
      const label = cell.ariaLabel ?? `${cell.column}, ${cell.row}: ${cell.valueLabel ?? cell.value}`;
      const datum: SvgHeatMapDatum = {
        id: cell.id,
        column: cell.column,
        row: cell.row,
        value: cell.value,
        ...(cell.valueLabel === undefined ? {} : { valueLabel: cell.valueLabel }),
        ...(cell.ariaLabel === undefined ? {} : { ariaLabel: cell.ariaLabel }),
      };
      return {
        key: cell.id,
        label,
        datum,
        x: cell.x + cell.width / 2,
        y: cell.y + cell.height / 2,
        row: rows.get(cell.row),
        column: columns.get(cell.column),
      };
    });
  }, [geometry.cells, geometry.xTicks, geometry.yTicks]);
  const interactionState = useChartInteraction({
    items: interactionItems,
    interaction,
    navigation: 'grid',
  });
  const tooltipId = useId();
  const activeCell = interactionState.activeKey
    ? geometry.cells.find((cell) => cell.id === interactionState.activeKey)
    : undefined;
  const tooltip = interactionState.activeDatum && interaction && interaction.mode !== 'static'
    ? interaction.renderTooltip?.(interactionState.activeDatum)
    : undefined;
  const radius = Number.isFinite(cellRadius) ? Math.max(0, cellRadius) : 3;

  return (
    <ChartRendererSurface
      rendererId="svg.heatmap"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.cells.length === 0}
      className={['ds-chart-renderer-heatmap', className].filter(Boolean).join(' ')}
      style={style}
      ownerRef={containerRef}
      interactionMode={interactionState.mode}
      interactionRootProps={interactionState.rootProps}
      tooltip={tooltip}
      tooltipId={tooltipId}
      tooltipKey={interactionState.activeKey ?? undefined}
      tooltipAnchor={activeCell ? {
        x: activeCell.x + activeCell.width / 2,
        y: activeCell.y,
      } : undefined}
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
          const datumProps = interactionState.getDatumProps(cell.id);
          const interactive = interactionState.mode !== 'static';
          const actionable = interactionState.mode === 'select' || interactionState.mode === 'drill';
          const markLabel = actionable && interaction && interaction.mode !== 'static'
            ? `${accessibleLabel}. ${interaction.actionLabel}`
            : accessibleLabel;

          if (interactive) {
            const hitWidth = Math.max(24, cell.width);
            const hitHeight = Math.max(24, cell.height);
            const hitX = cell.x - (hitWidth - cell.width) / 2;
            const hitY = cell.y - (hitHeight - cell.height) / 2;
            return (
              <g
                key={cell.id}
                data-part="heatmap-cell-mark"
                data-datum-id={cell.id}
                data-chart-datum-key={datumProps['data-chart-datum-key']}
                data-active={datumProps['data-active']}
                data-focused={datumProps['data-focused']}
                data-hovered={datumProps['data-hovered']}
                data-pinned={datumProps['data-pinned']}
                tabIndex={datumProps.tabIndex}
                role={actionable ? 'button' : 'img'}
                aria-label={markLabel}
                aria-describedby={datumProps['data-active'] && tooltip !== undefined && tooltip !== null && tooltip !== false ? tooltipId : undefined}
                style={paintStyle}
              >
                <rect
                  data-part="interaction-target"
                  x={hitX}
                  y={hitY}
                  width={hitWidth}
                  height={hitHeight}
                  pointerEvents="all"
                  aria-hidden="true"
                />
                <rect
                  data-part="interaction-halo"
                  x={hitX}
                  y={hitY}
                  width={hitWidth}
                  height={hitHeight}
                  rx={Math.max(radius, 4)}
                  aria-hidden="true"
                />
                <rect
                  data-part="cell"
                  data-datum-id={cell.id}
                  x={cell.x}
                  y={cell.y}
                  width={cell.width}
                  height={cell.height}
                  rx={radius}
                  aria-hidden="true"
                />
                <text
                  data-part="forced-color-value-label"
                  display="none"
                  x={cell.x + cell.width / 2}
                  y={cell.y + cell.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  aria-hidden="true"
                >
                  {cell.valueLabel ?? cell.value}
                </text>
              </g>
            );
          }

          return (
            <g key={cell.id} data-part="heatmap-cell-static">
              <rect
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
              <text
                data-part="forced-color-value-label"
                display="none"
                x={cell.x + cell.width / 2}
                y={cell.y + cell.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                aria-hidden="true"
              >
                {cell.valueLabel ?? cell.value}
              </text>
            </g>
          );
        })}
      </g>
    </ChartRendererSurface>
  );
}
