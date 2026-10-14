import { scaleBand, scaleLinear } from 'd3';

import {
  DEFAULT_CARTESIAN_INSETS,
  MAX_CARTESIAN_TICKS,
  finiteSize,
  normalizeInsets,
  plotRect,
  zeroAnchoredDomain,
  tickLabel,
  uniqueStrings,
  boundedSample,
  assertUniqueStrings,
  type ChartGeometryInsets,
  type ChartGeometryRect,
  type ChartGeometryTick,
} from '../kernel';

export interface SvgBarDatum {
  readonly id: string;
  readonly category: string;
  readonly value: number;
  readonly valueLabel?: string;
  readonly ariaLabel?: string;
  readonly color?: string;
  /** Optional series display name for multi-series (grouped/stacked) bars. */
  readonly series?: string;
}

export interface SvgBarGeometryDatum extends SvgBarDatum, ChartGeometryRect {
  readonly valueX: number;
  readonly valueY: number;
}

export interface SvgBarGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly orientation: 'vertical' | 'horizontal';
  readonly baseline: number;
  readonly bars: readonly SvgBarGeometryDatum[];
  readonly categoryTicks: readonly ChartGeometryTick[];
  readonly valueTicks: readonly ChartGeometryTick[];
}

export interface BuildSvgBarGeometryOptions {
  readonly data: readonly SvgBarDatum[];
  readonly width: number;
  readonly height: number;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly insets?: ChartGeometryInsets;
  readonly bandPadding?: number;
  readonly maxTicks?: number;
  /**
   * Category-axis-only tick cap. `maxTicks` caps value AND category ticks
   * together (its original contract); this option lets a caller thin crowded
   * category labels from a container measure without disturbing the value
   * axis. When both are finite the smaller cap wins.
   */
  readonly maxCategoryTicks?: number;
}

export function buildSvgBarGeometry({
  data,
  width: widthInput,
  height: heightInput,
  orientation = 'vertical',
  insets: insetsInput,
  bandPadding = 0.2,
  maxTicks,
  maxCategoryTicks,
}: BuildSvgBarGeometryOptions): SvgBarGeometry {
  const width = finiteSize(widthInput, 640);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_CARTESIAN_INSETS);
  const plot = plotRect(width, height, insets);
  const finiteData = data.filter((datum) => Number.isFinite(datum.value));
  assertUniqueStrings(finiteData.map((datum) => datum.id), 'bar datum id');
  assertUniqueStrings(finiteData.map((datum) => datum.category), 'bar category');
  const categories = uniqueStrings(finiteData.map((datum) => datum.category));
  const padding = Number.isFinite(bandPadding)
    ? Math.min(0.95, Math.max(0, bandPadding))
    : 0.2;
  const explicitTickCount =
    typeof maxTicks === 'number' && Number.isSafeInteger(maxTicks)
      ? Math.min(MAX_CARTESIAN_TICKS, Math.max(2, maxTicks))
      : null;
  const explicitCategoryTickCount =
    typeof maxCategoryTicks === 'number' && Number.isSafeInteger(maxCategoryTicks)
      ? Math.max(2, maxCategoryTicks)
      : null;
  const valueTickCount = explicitTickCount ?? 5;
  const categoryTickCount = explicitTickCount !== null && explicitCategoryTickCount !== null
    ? Math.min(explicitTickCount, explicitCategoryTickCount)
    : explicitCategoryTickCount ?? explicitTickCount ?? categories.length;
  const valueScale = scaleLinear()
    .domain(zeroAnchoredDomain(finiteData.map((datum) => datum.value)))
    .nice(valueTickCount)
    .range(
      orientation === 'vertical'
        ? [plot.y + plot.height, plot.y]
        : [plot.x, plot.x + plot.width],
    );
  const categoryScale = scaleBand<string>()
    .domain(categories)
    .range(
      orientation === 'vertical'
        ? [plot.x, plot.x + plot.width]
        : [plot.y, plot.y + plot.height],
    )
    .padding(padding);
  const baseline = valueScale(0);

  const bars = finiteData.map<SvgBarGeometryDatum>((datum) => {
    const categoryPosition = categoryScale(datum.category) ?? 0;
    const endpoint = valueScale(datum.value);

    if (orientation === 'vertical') {
      return {
        ...datum,
        x: categoryPosition,
        y: Math.min(endpoint, baseline),
        width: categoryScale.bandwidth(),
        height: Math.abs(endpoint - baseline),
        valueX: categoryPosition + categoryScale.bandwidth() / 2,
        valueY: datum.value >= 0 ? endpoint - 6 : endpoint + 14,
      };
    }

    return {
      ...datum,
      x: Math.min(endpoint, baseline),
      y: categoryPosition,
      width: Math.abs(endpoint - baseline),
      height: categoryScale.bandwidth(),
      valueX: datum.value >= 0 ? endpoint + 6 : endpoint - 6,
      valueY: categoryPosition + categoryScale.bandwidth() / 2,
    };
  });

  const categoryTicks = boundedSample(categories, categoryTickCount).map<ChartGeometryTick>((category) => {
    const position = (categoryScale(category) ?? 0) + categoryScale.bandwidth() / 2;
    return orientation === 'vertical'
      ? { id: `category-${category}`, label: category, value: category, x: position, y: plot.y + plot.height }
      : { id: `category-${category}`, label: category, value: category, x: plot.x, y: position };
  });
  const valueTicks = boundedSample(valueScale.ticks(valueTickCount), valueTickCount).map<ChartGeometryTick>((value) =>
    orientation === 'vertical'
      ? { id: `value-${value}`, label: tickLabel(value), value, x: plot.x, y: valueScale(value) }
      : { id: `value-${value}`, label: tickLabel(value), value, x: valueScale(value), y: plot.y + plot.height },
  );

  return {
    width,
    height,
    plot,
    orientation,
    baseline,
    bars: Object.freeze(bars),
    categoryTicks: Object.freeze(categoryTicks),
    valueTicks: Object.freeze(valueTicks),
  };
}

/** One value of one series at one category, before layout. */
export interface SvgBarSeriesPoint {
  readonly category: string;
  readonly value: number;
  readonly valueLabel?: string;
  readonly ariaLabel?: string;
}

/** A named categorical series contributing bars to a grouped/stacked layout. */
export interface SvgBarSeriesInput {
  readonly id: string;
  readonly label: string;
  readonly color?: string;
  readonly points: readonly SvgBarSeriesPoint[];
}

export type SvgBarLayout = 'grouped' | 'stacked';

/**
 * A single resolved bar in a multi-series layout. Extends the single-series
 * datum shape so the React renderer can share one marks loop; the extra fields
 * carry series identity and the stack-top flag used for corner-radius rounding.
 */
export interface SvgBarSeriesGeometryDatum extends SvgBarGeometryDatum {
  readonly seriesId: string;
  readonly seriesIndex: number;
  readonly seriesLabel: string;
  readonly isTopOfStack: boolean;
}

export interface SvgBarSeriesGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly orientation: 'vertical' | 'horizontal';
  readonly layout: SvgBarLayout;
  readonly baseline: number;
  readonly seriesCount: number;
  readonly categories: readonly string[];
  readonly bars: readonly SvgBarSeriesGeometryDatum[];
  readonly categoryTicks: readonly ChartGeometryTick[];
  readonly valueTicks: readonly ChartGeometryTick[];
}

export interface BuildSvgBarSeriesGeometryOptions {
  readonly series: readonly SvgBarSeriesInput[];
  readonly width: number;
  readonly height: number;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly layout?: SvgBarLayout;
  readonly insets?: ChartGeometryInsets;
  /** Outer band padding between category groups. */
  readonly bandPadding?: number;
  /** Inner band padding between grouped bars inside one category. */
  readonly groupPadding?: number;
  readonly maxTicks?: number;
  /**
   * Category-axis-only tick cap; see {@link BuildSvgBarGeometryOptions.maxCategoryTicks}.
   * When both caps are finite the smaller one wins.
   */
  readonly maxCategoryTicks?: number;
}

/**
 * Deterministic grouped/stacked multi-series bar layout. Pure arithmetic and
 * d3 scales only; no DOM. Single-series callers keep {@link buildSvgBarGeometry};
 * this builder owns the mode matrix (grouped | stacked, vertical | horizontal).
 * Stacking accumulates positive and negative values away from a shared zero
 * baseline (diverging), so signed data never overlaps at the origin.
 */
export function buildSvgBarSeriesGeometry({
  series,
  width: widthInput,
  height: heightInput,
  orientation = 'vertical',
  layout = 'grouped',
  insets: insetsInput,
  bandPadding = 0.2,
  groupPadding = 0.05,
  maxTicks,
  maxCategoryTicks,
}: BuildSvgBarSeriesGeometryOptions): SvgBarSeriesGeometry {
  const width = finiteSize(widthInput, 640);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_CARTESIAN_INSETS);
  const plot = plotRect(width, height, insets);
  const vertical = orientation === 'vertical';
  const outerPadding = Number.isFinite(bandPadding)
    ? Math.min(0.95, Math.max(0, bandPadding))
    : 0.2;
  const innerPadding = Number.isFinite(groupPadding)
    ? Math.min(0.95, Math.max(0, groupPadding))
    : 0.05;
  const explicitTickCount =
    typeof maxTicks === 'number' && Number.isSafeInteger(maxTicks)
      ? Math.min(MAX_CARTESIAN_TICKS, Math.max(2, maxTicks))
      : null;
  const explicitCategoryTickCount =
    typeof maxCategoryTicks === 'number' && Number.isSafeInteger(maxCategoryTicks)
      ? Math.max(2, maxCategoryTicks)
      : null;
  const valueTickCount = explicitTickCount ?? 5;

  // Keep only finite points; preserve first-seen category order across series.
  const cleanSeries = series.map((currentSeries) => ({
    ...currentSeries,
    points: currentSeries.points.filter((point) => Number.isFinite(point.value)),
  }));
  const categories: string[] = [];
  const seen = new Set<string>();
  for (const currentSeries of cleanSeries) {
    for (const point of currentSeries.points) {
      if (!seen.has(point.category)) {
        seen.add(point.category);
        categories.push(point.category);
      }
    }
  }
  const seriesCount = cleanSeries.length;
  const categoryTickCount = explicitTickCount !== null && explicitCategoryTickCount !== null
    ? Math.min(explicitTickCount, explicitCategoryTickCount)
    : explicitCategoryTickCount ?? explicitTickCount ?? categories.length;

  // Resolve the value domain. Grouped keeps zero visible over raw values;
  // stacked accumulates per-category positive and negative extents.
  let valueValues: number[];
  if (layout === 'stacked') {
    // Collect every finite cumulative endpoint in the same series order the
    // bar pass uses, so a finite intermediate stack level still bounds the
    // domain even when the running total later overflows to a non-finite value.
    valueValues = [0];
    for (const category of categories) {
      let positive = 0;
      let negative = 0;
      for (const currentSeries of cleanSeries) {
        const point = currentSeries.points.find((candidate) => candidate.category === category);
        if (!point) continue;
        if (point.value >= 0) {
          positive += point.value;
          if (Number.isFinite(positive)) valueValues.push(positive);
        } else {
          negative += point.value;
          if (Number.isFinite(negative)) valueValues.push(negative);
        }
      }
    }
  } else {
    valueValues = cleanSeries.flatMap((currentSeries) => currentSeries.points.map((point) => point.value));
  }

  const valueScale = scaleLinear()
    .domain(zeroAnchoredDomain(valueValues))
    .nice(valueTickCount)
    .range(vertical ? [plot.y + plot.height, plot.y] : [plot.x, plot.x + plot.width]);
  const categoryScale = scaleBand<string>()
    .domain(categories)
    .range(vertical ? [plot.x, plot.x + plot.width] : [plot.y, plot.y + plot.height])
    .padding(outerPadding);
  const groupScale = scaleBand<string>()
    .domain(cleanSeries.map((_, index) => `series-${index}`))
    .range([0, categoryScale.bandwidth()])
    .padding(innerPadding);
  const baseline = valueScale(0);

  const bars: SvgBarSeriesGeometryDatum[] = [];
  // Stack cursors per category, tracked in value space.
  const positiveCursor = new Map<string, number>();
  const negativeCursor = new Map<string, number>();

  cleanSeries.forEach((currentSeries, seriesIndex) => {
    const isLastSeries = seriesIndex === seriesCount - 1;
    currentSeries.points.forEach((point) => {
      const categoryPosition = categoryScale(point.category) ?? 0;
      let start: number;
      let end: number;
      if (layout === 'stacked') {
        if (point.value >= 0) {
          start = positiveCursor.get(point.category) ?? 0;
          end = start + point.value;
          positiveCursor.set(point.category, end);
        } else {
          start = negativeCursor.get(point.category) ?? 0;
          end = start + point.value;
          negativeCursor.set(point.category, end);
        }
      } else {
        start = 0;
        end = point.value;
      }
      // A stacked cumulative sum can overflow to a non-finite magnitude; such a
      // segment has no honest pixel span, so it is dropped rather than rendered
      // with an Infinity/NaN geometry.
      if (!Number.isFinite(start) || !Number.isFinite(end)) return;
      const startPixel = valueScale(start);
      const endPixel = valueScale(end);
      const groupOffset = layout === 'grouped' ? groupScale(`series-${seriesIndex}`) ?? 0 : 0;
      const thickness = layout === 'grouped' ? groupScale.bandwidth() : categoryScale.bandwidth();
      const along = categoryPosition + groupOffset;
      const isTopOfStack = layout === 'stacked' ? isLastSeries : true;

      if (vertical) {
        bars.push({
          id: `${currentSeries.id}::${point.category}`,
          seriesId: currentSeries.id,
          seriesIndex,
          seriesLabel: currentSeries.label,
          series: currentSeries.label,
          category: point.category,
          value: point.value,
          ...(point.valueLabel === undefined ? {} : { valueLabel: point.valueLabel }),
          ...(point.ariaLabel === undefined ? {} : { ariaLabel: point.ariaLabel }),
          ...(currentSeries.color === undefined ? {} : { color: currentSeries.color }),
          x: along,
          y: Math.min(startPixel, endPixel),
          width: thickness,
          height: Math.abs(endPixel - startPixel),
          valueX: along + thickness / 2,
          valueY: point.value >= 0 ? endPixel - 6 : endPixel + 14,
          isTopOfStack,
        });
      } else {
        bars.push({
          id: `${currentSeries.id}::${point.category}`,
          seriesId: currentSeries.id,
          seriesIndex,
          seriesLabel: currentSeries.label,
          series: currentSeries.label,
          category: point.category,
          value: point.value,
          ...(point.valueLabel === undefined ? {} : { valueLabel: point.valueLabel }),
          ...(point.ariaLabel === undefined ? {} : { ariaLabel: point.ariaLabel }),
          ...(currentSeries.color === undefined ? {} : { color: currentSeries.color }),
          x: Math.min(startPixel, endPixel),
          y: along,
          width: Math.abs(endPixel - startPixel),
          height: thickness,
          valueX: point.value >= 0 ? endPixel + 6 : endPixel - 6,
          valueY: along + thickness / 2,
          isTopOfStack,
        });
      }
    });
  });

  const categoryTicks = boundedSample(categories, categoryTickCount).map<ChartGeometryTick>((category) => {
    const position = (categoryScale(category) ?? 0) + categoryScale.bandwidth() / 2;
    return vertical
      ? { id: `category-${category}`, label: category, value: category, x: position, y: plot.y + plot.height }
      : { id: `category-${category}`, label: category, value: category, x: plot.x, y: position };
  });
  const valueTicks = boundedSample(valueScale.ticks(valueTickCount), valueTickCount).map<ChartGeometryTick>((value) =>
    vertical
      ? { id: `value-${value}`, label: tickLabel(value), value, x: plot.x, y: valueScale(value) }
      : { id: `value-${value}`, label: tickLabel(value), value, x: valueScale(value), y: plot.y + plot.height },
  );

  return {
    width,
    height,
    plot,
    orientation,
    layout,
    baseline,
    seriesCount,
    categories: Object.freeze(categories),
    bars: Object.freeze(bars),
    categoryTicks: Object.freeze(categoryTicks),
    valueTicks: Object.freeze(valueTicks),
  };
}
