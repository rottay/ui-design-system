'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  PROVIDER_PAINT_ATTRIBUTE_FILTER,
  resolveCssColor,
} from '@/infrastructure/runtime/dom/runtime/css-color-resolution';
import {
  buildSvgCalendarHeatMapGeometry,
} from '../../../../foundation/renderers/geometry';
import type { ChartInteraction } from '../../../../foundation/interaction';
import { useChartDimensions } from '../../../../runtime/dimensions';
import { useChartInteraction } from '../../../../runtime/interaction/controller';
import { ChartPaintProvider, useChartPaintRoot } from '../../../../../theming/composition/react/paint';
import { ChartRendererSurface } from '..';

const DEFAULT_LOW_COLOR = 'var(--ds-color-bg-tertiary)';
const DEFAULT_HIGH_COLOR = 'var(--ds-color-primary-500)';
const LOW_COLOR_FALLBACK = '#e5e7eb';
const HIGH_COLOR_FALLBACK = '#0072b2';
const CELL_ACTION_LABEL = 'Select date';

interface CalendarCellDatum {
  readonly dateKey: string;
  readonly value: number;
}

export interface SvgCalendarHeatMapRendererProps {
  readonly startDate: Date;
  readonly endDate: Date;
  /** YYYY-MM-DD -> aggregated value. */
  readonly values: ReadonlyMap<string, number>;
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number | string;
  readonly height?: number;
  /** Grow to the measured container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly colorRange?: readonly [string, string];
  readonly colorSteps?: number;
  readonly cellSize?: number;
  readonly cellGap?: number;
  readonly showMonthLabels?: boolean;
  readonly showDayLabels?: boolean;
  readonly showTitles?: boolean;
  readonly formatTooltip?: (dateKey: string, value: number) => string;
  readonly onCellClick?: (dateKey: string, value: number) => void;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * Re-render after the ref is attached, then whenever a provider paint attribute
 * mutates, so tenant-scoped CSS colors resolve to concrete values without
 * leaking across colocated roots. Mirrors the heat-map renderer's resolution.
 */
function useProviderResolvedRange(
  ownerRef: RefObject<HTMLDivElement | null>,
  colorRange: readonly [string, string],
): readonly [string, string] {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const owner = ownerRef.current;
    if (!owner) return;

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
 * React-owned calendar contribution grid. D3 supplies calendar math and the
 * quantize scale inside the immutable geometry builder; colors resolve from
 * this renderer's provider ancestry so colocated tenants stay isolated.
 */
export function SvgCalendarHeatMapRenderer({
  startDate,
  endDate,
  values,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 900,
  height = 180,
  responsive = true,
  colorRange = [DEFAULT_LOW_COLOR, DEFAULT_HIGH_COLOR],
  colorSteps = 5,
  cellSize = 14,
  cellGap = 2,
  showMonthLabels = true,
  showDayLabels = true,
  showTitles = true,
  formatTooltip,
  onCellClick,
  className,
  style,
}: SvgCalendarHeatMapRendererProps): React.ReactElement {
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const measuredWidth = responsive ? dimensions.width : undefined;
  const resolvedRange = useProviderResolvedRange(containerRef, colorRange);
  const geometry = useMemo(
    () => buildSvgCalendarHeatMapGeometry({
      startDate,
      endDate,
      values,
      colorRange: resolvedRange,
      colorSteps,
      cellSize,
      cellGap,
      measuredWidth,
      responsive,
      showMonthLabels,
      showDayLabels,
    }),
    [
      cellGap,
      cellSize,
      colorSteps,
      endDate,
      measuredWidth,
      resolvedRange,
      responsive,
      showDayLabels,
      showMonthLabels,
      startDate,
      values,
    ],
  );
  const tooltipFor = useCallback((dateKey: string, value: number, state: 'empty' | 'filled'): string => (formatTooltip
    ? formatTooltip(dateKey, value)
    : state === 'filled'
      ? `${dateKey}: ${value}`
      : `${dateKey}: No activity`), [formatTooltip]);
  const interaction = useMemo<ChartInteraction<CalendarCellDatum> | undefined>(
    () => (onCellClick
      ? {
        mode: 'select',
        actionLabel: CELL_ACTION_LABEL,
        onAction: ({ datum }) => onCellClick(datum.dateKey, datum.value),
      }
      : undefined),
    [onCellClick],
  );
  const interactionItems = useMemo(() => {
    const origin = geometry.cells[0];
    const pitch = cellSize + cellGap;
    return geometry.cells.map((cell) => ({
      key: cell.id,
      label: tooltipFor(cell.dateKey, cell.value ?? 0, cell.state),
      datum: { dateKey: cell.dateKey, value: cell.value ?? 0 },
      x: cell.x + cell.width / 2,
      y: cell.y + cell.height / 2,
      ...(origin && pitch > 0
        ? { row: Math.round((cell.y - origin.y) / pitch), column: Math.round((cell.x - origin.x) / pitch) }
        : {}),
    }));
  }, [cellGap, cellSize, geometry.cells, tooltipFor]);
  const interactionState = useChartInteraction({
    items: interactionItems,
    interaction,
    navigation: 'grid',
  });
  const surfaceStyle: CSSProperties = {
    ...(typeof width === 'string' ? { width } : {}),
    ...style,
  };
  const description = ariaDescribedBy
    ? ariaDescription
    : ariaDescription
      ?? `Calendar heatmap from ${geometry.startDateKey} to ${geometry.endDateKey}.`;
  const rendererClassName = ['ds-chart-calendar-heatmap', 'ds-chart-renderer-calendar-heatmap', className]
    .filter(Boolean)
    .join(' ');

  const paint = useChartPaintRoot('calendar-heat-map');
  const surface = (
    <ChartRendererSurface
      rendererId="svg.calendar-heatmap"
      ariaLabel={ariaLabel}
      ariaDescription={description}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.cells.length === 0}
      className={rendererClassName}
      style={surfaceStyle}
      ownerRef={containerRef}
      interactionMode={interactionState.mode}
      interactionRootProps={interactionState.rootProps}
    >
      {showDayLabels ? (
        <g data-part="day-labels" aria-hidden="true">
          {geometry.dayLabels.map((label) => (
            <text
              key={label.id}
              data-part="day-label"
              x={label.x}
              y={label.y}
              dy="0.35em"
              textAnchor="end"
            >
              {label.label}
            </text>
          ))}
        </g>
      ) : null}

      {showMonthLabels ? (
        <g data-part="month-labels" aria-hidden="true">
          {geometry.monthLabels.map((label) => (
            <text
              key={label.id}
              data-part="month-label"
              x={label.x}
              y={label.y}
              textAnchor="start"
            >
              {label.label}
            </text>
          ))}
        </g>
      ) : null}

      <g data-part="cells">
        {geometry.cells.map((cell) => {
          const tooltip = tooltipFor(cell.dateKey, cell.value ?? 0, cell.state);
          const rect = (
            <rect
              key={cell.id}
              data-part="cell"
              data-datum-id={cell.id}
              data-state={cell.state}
              x={cell.x}
              y={cell.y}
              width={cell.width}
              height={cell.height}
              rx={2}
              ry={2}
              fill={cell.fill}
              style={{ cursor: onCellClick ? 'pointer' : 'default' }}
            >
              {showTitles ? <title>{tooltip}</title> : null}
            </rect>
          );
          if (interactionState.mode === 'static') return rect;
          const datumProps = interactionState.getDatumProps(cell.id);
          const hitWidth = Math.max(24, cell.width);
          const hitHeight = Math.max(24, cell.height);
          const hitX = cell.x - (hitWidth - cell.width) / 2;
          const hitY = cell.y - (hitHeight - cell.height) / 2;
          return (
            <g
              key={cell.id}
              data-part="calendar-cell-mark"
              data-datum-id={cell.id}
              data-chart-datum-key={datumProps['data-chart-datum-key']}
              data-active={datumProps['data-active']}
              data-focused={datumProps['data-focused']}
              data-hovered={datumProps['data-hovered']}
              data-pinned={datumProps['data-pinned']}
              tabIndex={datumProps.tabIndex}
              role="button"
              aria-label={`${tooltip}. ${CELL_ACTION_LABEL}`}
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
                rx={4}
                aria-hidden="true"
              />
              {rect}
            </g>
          );
        })}
      </g>
    </ChartRendererSurface>
  );

  return <ChartPaintProvider decision={paint}>{surface}</ChartPaintProvider>;
}
