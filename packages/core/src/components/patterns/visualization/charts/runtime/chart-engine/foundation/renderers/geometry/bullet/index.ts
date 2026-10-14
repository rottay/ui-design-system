import { scaleLinear } from 'd3';

import { finiteSize, type ChartGeometryRect } from '../kernel';

// ---------------------------------------------------------------------------
// Bullet (linear KPI gauge) geometry
// ---------------------------------------------------------------------------

/** A single KPI datum rendered as one bullet lane. */
export interface SvgBulletDatum {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly target: number;
  readonly ranges?: readonly [number, number, number];
  readonly max?: number;
}

export type SvgBulletOrientation = 'horizontal' | 'vertical';
export type SvgBulletTier = 'poor' | 'satisfactory' | 'good';

export interface SvgBulletBand extends ChartGeometryRect {
  readonly id: string;
  readonly tier: SvgBulletTier;
}

export interface SvgBulletItemGeometry {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly target: number;
  readonly domainMin: number;
  readonly domainMax: number;
  /** Bands ordered widest-first (good, satisfactory, poor) so overlap is correct. */
  readonly bands: readonly SvgBulletBand[];
  readonly valueBar: ChartGeometryRect;
  readonly valueDirection: 'positive' | 'negative' | 'zero';
  readonly targetMarker: ChartGeometryRect;
  readonly zeroBaseline:
    | { readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number }
    | null;
  readonly labelAnchor: { readonly x: number; readonly y: number };
  readonly valueAnchor: { readonly x: number; readonly y: number };
}

export interface SvgBulletGeometry {
  readonly width: number;
  readonly height: number;
  readonly orientation: SvgBulletOrientation;
  readonly showLabels: boolean;
  readonly fallbackMessage: string | null;
  readonly items: readonly SvgBulletItemGeometry[];
}

export interface BuildSvgBulletGeometryOptions {
  readonly data: readonly SvgBulletDatum[];
  readonly width: number;
  readonly height: number;
  readonly orientation?: SvgBulletOrientation;
  readonly barThickness?: number;
  readonly gap?: number;
  readonly showLabels?: boolean;
}

/** Horizontal label column and value gutter, preserved from the legacy family. */
const BULLET_LABEL_WIDTH = 100;
const BULLET_VALUE_MARGIN = 60;

function bulletItemFinite(item: SvgBulletDatum): boolean {
  return Number.isFinite(item.value)
    && Number.isFinite(item.target)
    && (item.max === undefined || Number.isFinite(item.max))
    && (item.ranges === undefined || item.ranges.every(Number.isFinite));
}

function bulletRangesOrdered(item: SvgBulletDatum): boolean {
  return item.ranges === undefined
    || (item.ranges[0] <= item.ranges[1] && item.ranges[1] <= item.ranges[2]);
}

interface BulletDomain {
  readonly domain: [number, number];
  readonly ranges: [number, number, number];
}

/** Builds a truthful domain that always contains zero, actual, target and ranges. */
function resolveBulletDomain(item: SvgBulletDatum): BulletDomain {
  const candidates = [0, item.value, item.target];
  if (item.ranges) candidates.push(...item.ranges);
  if (item.max !== undefined) candidates.push(item.max);

  let domainMin = Math.min(...candidates);
  let domainMax = Math.max(...candidates);

  if (domainMin === domainMax) {
    const padding = Math.abs(domainMin) * 0.1 || 1;
    domainMin -= padding;
    domainMax += padding;
  } else if (item.max === undefined) {
    const span = domainMax - domainMin;
    if (domainMin < 0) domainMin -= span * 0.1;
    if (domainMax > 0) domainMax += span * 0.1;
  }

  const ranges: [number, number, number] = item.ranges
    ? [item.ranges[0], item.ranges[1], item.ranges[2]]
    : domainMin < 0
      ? [
          domainMin + (domainMax - domainMin) * 0.5,
          domainMin + (domainMax - domainMin) * 0.75,
          domainMax,
        ]
      : [item.target * 0.5, item.target * 0.75, domainMax];

  return { domain: [domainMin, domainMax], ranges };
}

function bulletDirection(value: number): 'positive' | 'negative' | 'zero' {
  return value < 0 ? 'negative' : value > 0 ? 'positive' : 'zero';
}

/**
 * Deterministic linear bullet geometry. All marks are returned in absolute SVG
 * coordinates so the React renderer performs no scale math; D3 contributes the
 * linear scale only. Invalid input yields no items plus a fallback message,
 * preserving the family's status-overlay contract.
 */
export function buildSvgBulletGeometry({
  data,
  width: widthInput,
  height: heightInput,
  orientation = 'horizontal',
  barThickness: barThicknessInput = 28,
  gap: gapInput = 16,
  showLabels = true,
}: BuildSvgBulletGeometryOptions): SvgBulletGeometry {
  const width = finiteSize(widthInput, 600);
  const height = finiteSize(heightInput, 200);
  const barThickness = Number.isFinite(barThicknessInput) ? Math.max(1, barThicknessInput) : 28;
  const gap = Number.isFinite(gapInput) ? Math.max(0, gapInput) : 16;

  const fallbackMessage = data.length === 0
    ? 'No data to display.'
    : data.some((item) => !bulletItemFinite(item))
      ? 'Bullet charts require finite values.'
      : data.some((item) => !bulletRangesOrdered(item))
        ? 'Bullet chart ranges must be ordered from low to high.'
        : null;

  if (fallbackMessage !== null) {
    return { width, height, orientation, showLabels, fallbackMessage, items: [] };
  }

  const tierOf = (index: number): SvgBulletTier =>
    index === 0 ? 'good' : index === 1 ? 'satisfactory' : 'poor';

  if (orientation === 'horizontal') {
    const labelW = showLabels ? BULLET_LABEL_WIDTH : 0;
    const valueW = showLabels ? BULLET_VALUE_MARGIN : 0;
    const barAreaWidth = Math.max(1, width - labelW - valueW);

    const items = data.map<SvgBulletItemGeometry>((item, i) => {
      const { domain, ranges } = resolveBulletDomain(item);
      const yOffset = 12 + i * (barThickness + gap);
      const scale = scaleLinear().domain(domain).range([0, barAreaWidth]).clamp(true);
      const domainStartX = scale(domain[0]);
      const zeroX = scale(0);

      // Widest first: good, satisfactory, poor.
      const bands = [ranges[2], ranges[1], ranges[0]].map<SvgBulletBand>((upper, bandIndex) => {
        const bandEndX = scale(upper);
        return {
          id: `${item.id}-band-${tierOf(bandIndex)}`,
          tier: tierOf(bandIndex),
          x: labelW + Math.min(domainStartX, bandEndX),
          y: yOffset,
          width: Math.abs(bandEndX - domainStartX),
          height: barThickness,
        };
      });

      const valueBarHeight = barThickness * 0.4;
      const valueX = scale(item.value);
      const valueBar: ChartGeometryRect = {
        x: labelW + Math.min(zeroX, valueX),
        y: yOffset + (barThickness - valueBarHeight) / 2,
        width: Math.abs(valueX - zeroX),
        height: valueBarHeight,
      };

      const markerHeight = barThickness * 0.7;
      const targetX = scale(item.target);
      const targetMarker: ChartGeometryRect = {
        x: labelW + targetX - 1.5,
        y: yOffset + (barThickness - markerHeight) / 2,
        width: 3,
        height: markerHeight,
      };

      return {
        id: item.id,
        label: item.label,
        value: item.value,
        target: item.target,
        domainMin: domain[0],
        domainMax: domain[1],
        bands,
        valueBar,
        valueDirection: bulletDirection(item.value),
        targetMarker,
        zeroBaseline: domain[0] < 0
          ? { x1: labelW + zeroX, y1: yOffset, x2: labelW + zeroX, y2: yOffset + barThickness }
          : null,
        labelAnchor: { x: labelW - 8, y: yOffset + barThickness / 2 },
        valueAnchor: { x: labelW + barAreaWidth + 8, y: yOffset + barThickness / 2 },
      };
    });

    return { width, height, orientation, showLabels, fallbackMessage: null, items: Object.freeze(items) };
  }

  // Vertical orientation.
  const labelH = showLabels ? 24 : 0;
  const valueH = showLabels ? 20 : 0;
  const barAreaHeight = Math.max(1, height - labelH - valueH - 24);
  const barWidth = barThickness;
  const totalWidth = data.length * barWidth + (data.length - 1) * gap;
  const startX = (width - totalWidth) / 2;

  const items = data.map<SvgBulletItemGeometry>((item, i) => {
    const { domain, ranges } = resolveBulletDomain(item);
    const xOffset = startX + i * (barWidth + gap);
    const scale = scaleLinear().domain(domain).range([barAreaHeight, 0]).clamp(true);
    const domainStartY = scale(domain[0]);
    const zeroY = scale(0);
    const barTop = labelH;

    const bands = [ranges[2], ranges[1], ranges[0]].map<SvgBulletBand>((upper, bandIndex) => {
      const bandEndY = scale(upper);
      return {
        id: `${item.id}-band-${tierOf(bandIndex)}`,
        tier: tierOf(bandIndex),
        x: xOffset,
        y: barTop + Math.min(domainStartY, bandEndY),
        width: barWidth,
        height: Math.abs(domainStartY - bandEndY),
      };
    });

    const valueBarWidth = barWidth * 0.4;
    const valueY = scale(item.value);
    const valueBar: ChartGeometryRect = {
      x: xOffset + (barWidth - valueBarWidth) / 2,
      y: barTop + Math.min(zeroY, valueY),
      width: valueBarWidth,
      height: Math.abs(valueY - zeroY),
    };

    const markerWidth = barWidth * 0.7;
    const targetY = scale(item.target);
    const targetMarker: ChartGeometryRect = {
      x: xOffset + (barWidth - markerWidth) / 2,
      y: barTop + targetY - 1.5,
      width: markerWidth,
      height: 3,
    };

    return {
      id: item.id,
      label: item.label,
      value: item.value,
      target: item.target,
      domainMin: domain[0],
      domainMax: domain[1],
      bands,
      valueBar,
      valueDirection: bulletDirection(item.value),
      targetMarker,
      zeroBaseline: domain[0] < 0
        ? { x1: xOffset, y1: barTop + zeroY, x2: xOffset + barWidth, y2: barTop + zeroY }
        : null,
      labelAnchor: { x: xOffset + barWidth / 2, y: barTop + barAreaHeight + 16 },
      valueAnchor: { x: xOffset + barWidth / 2, y: barTop - 8 },
    };
  });

  return { width, height, orientation, showLabels, fallbackMessage: null, items: Object.freeze(items) };
}
