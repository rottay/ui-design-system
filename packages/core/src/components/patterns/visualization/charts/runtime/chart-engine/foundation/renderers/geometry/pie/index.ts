import { arc as createArcPath, pie as createPieLayout, type PieArcDatum } from 'd3';

import {
  DEFAULT_RADIAL_INSETS,
  finiteSize,
  normalizeInsets,
  plotRect,
  assertUniqueStrings,
  type ChartGeometryInsets,
  type ChartGeometryRect,
} from '../kernel';

export interface SvgPieDatum {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly valueLabel?: string;
  readonly ariaLabel?: string;
}

export interface SvgPieGeometryDatum extends SvgPieDatum {
  readonly path: string;
  readonly startAngle: number;
  readonly endAngle: number;
  readonly percentage: number;
  readonly centroidX: number;
  readonly centroidY: number;
}

export interface SvgPieGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly centerX: number;
  readonly centerY: number;
  readonly innerRadius: number;
  readonly outerRadius: number;
  readonly total: number;
  readonly slices: readonly SvgPieGeometryDatum[];
}

export interface BuildSvgPieGeometryOptions {
  readonly data: readonly SvgPieDatum[];
  readonly width: number;
  readonly height: number;
  readonly insets?: ChartGeometryInsets;
  readonly innerRadiusRatio?: number;
  readonly padAngle?: number;
  readonly cornerRadius?: number;
  readonly startAngle?: number;
  readonly endAngle?: number;
}

/**
 * Builds deterministic part-to-whole geometry for the React-owned pie/donut
 * renderer. Negative values are rejected because they have no truthful radial
 * area encoding; invalid and zero values cannot create phantom slices.
 */
export function buildSvgPieGeometry({
  data,
  width: widthInput,
  height: heightInput,
  insets: insetsInput,
  innerRadiusRatio = 0,
  padAngle = 0.015,
  cornerRadius = 2,
  startAngle: startAngleInput = -Math.PI / 2,
  endAngle: endAngleInput = (Math.PI * 3) / 2,
}: BuildSvgPieGeometryOptions): SvgPieGeometry {
  const width = finiteSize(widthInput, 360);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_RADIAL_INSETS);
  const plot = plotRect(width, height, insets);
  const finiteData = data.filter((datum) => Number.isFinite(datum.value));
  assertUniqueStrings(finiteData.map((datum) => datum.id), 'pie datum id');

  const negative = finiteData.find((datum) => datum.value < 0);
  if (negative) {
    throw new TypeError(
      `[ChartGeometry] Pie datum ${negative.id} has a negative value (${negative.value}).`,
    );
  }

  const positiveData = finiteData.filter((datum) => datum.value > 0);
  const total = positiveData.reduce((sum, datum) => sum + datum.value, 0);
  const centerX = plot.x + plot.width / 2;
  const centerY = plot.y + plot.height / 2;
  const outerRadius = Math.max(0, Math.min(plot.width, plot.height) / 2);
  const normalizedInnerRatio = Number.isFinite(innerRadiusRatio)
    ? Math.min(0.9, Math.max(0, innerRadiusRatio))
    : 0;
  const innerRadius = outerRadius * normalizedInnerRatio;
  const normalizedPadAngle = Number.isFinite(padAngle)
    ? Math.min(0.08, Math.max(0, padAngle))
    : 0.015;
  const normalizedCornerRadius = Number.isFinite(cornerRadius)
    ? Math.min(Math.max(0, (outerRadius - innerRadius) / 2), Math.max(0, cornerRadius))
    : 2;
  const startAngle = Number.isFinite(startAngleInput) ? startAngleInput : -Math.PI / 2;
  const requestedEndAngle = Number.isFinite(endAngleInput) ? endAngleInput : startAngle + Math.PI * 2;
  const endAngle = requestedEndAngle > startAngle
    ? Math.min(startAngle + Math.PI * 2, requestedEndAngle)
    : startAngle + Math.PI * 2;

  if (total <= 0 || outerRadius <= 0) {
    return {
      width,
      height,
      plot,
      centerX,
      centerY,
      innerRadius,
      outerRadius,
      total: 0,
      slices: Object.freeze([]),
    };
  }

  const layout = createPieLayout<SvgPieDatum>()
    .value((datum) => datum.value)
    .sort(null)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .padAngle(normalizedPadAngle);
  const path = createArcPath<PieArcDatum<SvgPieDatum>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(normalizedCornerRadius);
  const centroid = createArcPath<PieArcDatum<SvgPieDatum>>()
    .innerRadius(innerRadius + (outerRadius - innerRadius) * 0.55)
    .outerRadius(innerRadius + (outerRadius - innerRadius) * 0.55);

  const slices = layout(positiveData).flatMap<SvgPieGeometryDatum>((segment) => {
    const segmentPath = path(segment);
    if (!segmentPath) return [];
    const [relativeX, relativeY] = centroid.centroid(segment);
    return [{
      ...segment.data,
      path: segmentPath,
      startAngle: segment.startAngle,
      endAngle: segment.endAngle,
      percentage: segment.data.value / total,
      centroidX: centerX + relativeX,
      centroidY: centerY + relativeY,
    }];
  });

  return {
    width,
    height,
    plot,
    centerX,
    centerY,
    innerRadius,
    outerRadius,
    total,
    slices: Object.freeze(slices),
  };
}
