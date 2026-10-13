import { DEFAULT_COLORS } from '../../../../../../foundation/palettes';

import { finiteSize, normalizeInsets, type ChartGeometryInsets } from '../foundation';

/** A categorical stage in a tapering funnel. */
export interface SvgFunnelDatum {
  readonly label: string;
  readonly value: number;
  readonly color?: string;
}

export type SvgFunnelOrientation = 'vertical' | 'horizontal';
export type SvgFunnelSegmentPosition = 'first' | 'middle' | 'last';

/** An immutable funnel segment ready for React/SVG presentation. */
export interface SvgFunnelGeometrySegment extends SvgFunnelDatum {
  readonly id: string;
  readonly index: number;
  readonly color: string;
  readonly colorSource: 'palette' | 'custom';
  readonly position: SvgFunnelSegmentPosition;
  readonly polygonPoints: string;
  readonly centerX: number;
  readonly centerY: number;
  readonly labelX: number;
  readonly labelY: number;
  readonly valueX: number;
  readonly valueY: number;
  readonly percentage: number;
  readonly percentageLabel: string;
  readonly conversionLabel?: string;
  readonly conversionX?: number;
  readonly conversionY?: number;
}

/**
 * Deterministic taper geometry for a funnel. Invalid input becomes an empty
 * mark set with a fallback message, allowing compatibility adapters to retain
 * their existing status overlay without imperative cleanup.
 */
export interface SvgFunnelGeometry {
  readonly width: number;
  readonly height: number;
  readonly orientation: SvgFunnelOrientation;
  readonly margin: ChartGeometryInsets;
  readonly innerWidth: number;
  readonly innerHeight: number;
  readonly maxValue: number;
  readonly fallbackMessage: string | null;
  readonly segments: readonly SvgFunnelGeometrySegment[];
}

export interface BuildSvgFunnelGeometryOptions {
  readonly data: readonly SvgFunnelDatum[];
  readonly width: number;
  readonly height: number;
  readonly orientation?: SvgFunnelOrientation;
  readonly colors?: readonly string[];
  readonly margin?: ChartGeometryInsets;
}

/** Preserves the historic funnel padding while making it an explicit engine token. */
export const DEFAULT_FUNNEL_INSETS: ChartGeometryInsets = Object.freeze({
  top: 20,
  right: 20,
  bottom: 40,
  left: 50,
});

function funnelFallbackMessage(data: readonly SvgFunnelDatum[]): string | null {
  if (data.length === 0) return 'No data to display.';
  if (data.some((item) => !Number.isFinite(item.value))) {
    return 'Funnel charts require finite values.';
  }
  if (data.some((item) => item.value < 0)) {
    return 'Funnel charts cannot represent negative stages.';
  }
  const maxValue = data.reduce((currentMax, item) => Math.max(currentMax, item.value), 0);
  return maxValue <= 0 ? 'Funnel chart has no positive stages.' : null;
}

function funnelPosition(index: number, length: number): SvgFunnelSegmentPosition {
  if (index === 0) return 'first';
  if (index === length - 1) return 'last';
  return 'middle';
}

function funnelConversionLabel(value: number, previousValue: number): string {
  const rawRate = previousValue > 0 ? (value / previousValue) * 100 : null;
  if (rawRate !== null && Number.isFinite(rawRate)) return `${rawRate.toFixed(1)}%`;
  return value === 0 ? '0.0%' : 'N/A';
}

/**
 * Builds immutable funnel polygons using only arithmetic. The returned mark
 * coordinates are local to the supplied margin so React can own the SVG tree
 * with a single translated plot group.
 */
export function buildSvgFunnelGeometry({
  data,
  width: widthInput,
  height: heightInput,
  orientation = 'vertical',
  colors,
  margin: marginInput,
}: BuildSvgFunnelGeometryOptions): SvgFunnelGeometry {
  const width = finiteSize(widthInput, 600);
  const height = finiteSize(heightInput, 400);
  const margin = normalizeInsets(marginInput, DEFAULT_FUNNEL_INSETS);
  const innerWidth = Math.max(1, width - margin.left - margin.right);
  const innerHeight = Math.max(1, height - margin.top - margin.bottom);
  const fallbackMessage = funnelFallbackMessage(data);
  const maxValue = fallbackMessage === null
    ? data.reduce((currentMax, item) => Math.max(currentMax, item.value), 0)
    : 0;

  if (fallbackMessage !== null) {
    return {
      width,
      height,
      orientation,
      margin,
      innerWidth,
      innerHeight,
      maxValue,
      fallbackMessage,
      segments: Object.freeze([]),
    };
  }

  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  const segmentExtent = orientation === 'vertical'
    ? innerHeight / data.length
    : innerWidth / data.length;
  // Keep seams legible without allowing tiny containers to invert a polygon.
  const gap = Math.min(2, Math.max(0, segmentExtent / 3));
  const segments = data.map<SvgFunnelGeometrySegment>((item, index) => {
    const ratio = item.value / maxValue;
    const nextValue = data[index + 1]?.value;
    const nextRatio = nextValue === undefined ? ratio * 0.8 : nextValue / maxValue;
    const color = item.color ?? palette[index % palette.length] ?? 'currentColor';
    const percentage = ratio * 100;
    const base = {
      id: `funnel-segment-${index}`,
      index,
      label: item.label,
      value: item.value,
      color,
      colorSource: item.color === undefined ? 'palette' as const : 'custom' as const,
      position: funnelPosition(index, data.length),
      percentage,
      percentageLabel: `${percentage.toFixed(0)}%`,
      ...(index > 0 ? {
        conversionLabel: funnelConversionLabel(item.value, data[index - 1]?.value ?? 0),
      } : {}),
    };

    if (orientation === 'vertical') {
      const topWidth = innerWidth * ratio;
      const bottomWidth = innerWidth * nextRatio;
      const topX = (innerWidth - topWidth) / 2;
      const bottomX = (innerWidth - bottomWidth) / 2;
      const y = index * segmentExtent;
      const centerY = y + segmentExtent / 2;
      return {
        ...base,
        polygonPoints: [
          [topX, y + gap],
          [topX + topWidth, y + gap],
          [bottomX + bottomWidth, y + segmentExtent - gap],
          [bottomX, y + segmentExtent - gap],
        ].map((point) => point.join(',')).join(' '),
        centerX: innerWidth / 2,
        centerY,
        labelX: innerWidth / 2,
        labelY: centerY - 6,
        valueX: innerWidth / 2,
        valueY: centerY + 10,
        ...(index > 0 ? {
          conversionX: innerWidth + 8,
          conversionY: y + 4,
        } : {}),
      };
    }

    const leftHeight = innerHeight * ratio;
    const rightHeight = innerHeight * nextRatio;
    const leftY = (innerHeight - leftHeight) / 2;
    const rightY = (innerHeight - rightHeight) / 2;
    const x = index * segmentExtent;
    return {
      ...base,
      polygonPoints: [
        [x + gap, leftY],
        [x + segmentExtent - gap, rightY],
        [x + segmentExtent - gap, rightY + rightHeight],
        [x + gap, leftY + leftHeight],
      ].map((point) => point.join(',')).join(' '),
      centerX: x + segmentExtent / 2,
      centerY: innerHeight / 2,
      labelX: x + segmentExtent / 2,
      labelY: innerHeight / 2,
      valueX: x + segmentExtent / 2,
      valueY: innerHeight / 2,
    };
  });

  return {
    width,
    height,
    orientation,
    margin,
    innerWidth,
    innerHeight,
    maxValue,
    fallbackMessage: null,
    segments: Object.freeze(segments),
  };
}
