import { arc as createArcPath } from 'd3';

import { finiteSize } from '../foundation';

/** One threshold band in a radial gauge. An explicitly empty color is valid. */
export interface SvgGaugeSegment {
  readonly from: number;
  readonly to: number;
  readonly color?: string;
  readonly label?: string;
}

export type SvgGaugeTone = 'error' | 'warning' | 'success' | 'custom';

export interface SvgGaugeGeometrySegment extends SvgGaugeSegment {
  readonly id: string;
  readonly path: string;
  readonly startRadians: number;
  readonly endRadians: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly active: boolean;
  readonly colorSource: 'default' | 'custom';
  readonly tone: SvgGaugeTone;
}

export interface SvgGaugeGeometry {
  readonly width: number;
  readonly height: number;
  readonly rangeMin: number;
  readonly rangeMax: number;
  readonly value: number;
  /** Compatibility-facing degree values retained for the public gauge contract. */
  readonly startAngle: number;
  readonly endAngle: number;
  readonly startRadians: number;
  readonly endRadians: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly outerRadius: number;
  readonly innerRadius: number;
  readonly trackPath: string;
  readonly needleRotation: number;
  readonly needlePath: string;
  readonly needleCapRadius: number;
  readonly valueY: number;
  readonly labelY: number;
  readonly valueFontSize: number;
  readonly labelFontSize: number;
  readonly segments: readonly SvgGaugeGeometrySegment[];
}

export interface BuildSvgGaugeGeometryOptions {
  readonly value: number;
  readonly width: number;
  readonly height: number;
  readonly min?: number;
  readonly max?: number;
  readonly segments?: readonly SvgGaugeSegment[];
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly innerRadiusRatio?: number;
  readonly trackCornerRadius?: number;
  readonly segmentCornerRadius?: number;
}

const DEFAULT_GAUGE_TONES: readonly SvgGaugeTone[] = [
  'error',
  'warning',
  'success',
];

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function resolveGaugeRange(min: number | undefined, max: number | undefined): readonly [number, number] {
  const finiteMin = Number.isFinite(min) ? min as number : 0;
  const finiteMax = Number.isFinite(max) ? max as number : 100;
  if (finiteMin === finiteMax) return [finiteMin, finiteMin + 1];
  return finiteMin < finiteMax ? [finiteMin, finiteMax] : [finiteMax, finiteMin];
}

function resolveGaugeAngles(
  startValue: number | undefined,
  endValue: number | undefined,
): readonly [number, number] {
  const rawStart = Number.isFinite(startValue) ? startValue as number : -120;
  const rawEnd = Number.isFinite(endValue) ? endValue as number : 120;
  const normalizedStart = rawStart % 360;
  const start = Object.is(normalizedStart, -0) ? 0 : normalizedStart;
  const rawSpan = rawEnd - rawStart;
  if (!Number.isFinite(rawSpan) || rawSpan === 0) return [start, start + 240];
  const span = Math.max(-360, Math.min(360, rawSpan));
  return [start, start + span];
}

function defaultGaugeSegments(rangeMin: number, rangeMax: number): readonly SvgGaugeSegment[] {
  const third = (rangeMax - rangeMin) / 3;
  return [
    { from: rangeMin, to: rangeMin + third, label: 'Low' },
    { from: rangeMin + third, to: rangeMin + third * 2, label: 'Medium' },
    { from: rangeMin + third * 2, to: rangeMax, label: 'High' },
  ];
}

function normalizedGaugeCornerRadius(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, value as number) : fallback;
}

function buildGaugeArcPath(
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  cornerRadius: number,
): string {
  const datum = { innerRadius, outerRadius, startAngle, endAngle };
  return createArcPath<typeof datum>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .cornerRadius(cornerRadius)(datum) ?? '';
}

function radialPoint(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
): readonly [number, number] {
  // d3.arc starts at twelve o'clock, therefore x follows sin and y follows -cos.
  return [
    centerX + Math.sin(angle) * radius,
    centerY - Math.cos(angle) * radius,
  ];
}

/**
 * Builds deterministic radial-gauge geometry for React-owned SVG rendering.
 * D3 contributes only path math; it never receives or owns a DOM node here.
 */
export function buildSvgGaugeGeometry({
  value,
  width: widthInput,
  height: heightInput,
  min,
  max,
  segments: providedSegments,
  startAngle: startAngleInput,
  endAngle: endAngleInput,
  innerRadiusRatio = 0.7,
  trackCornerRadius,
  segmentCornerRadius,
}: BuildSvgGaugeGeometryOptions): SvgGaugeGeometry {
  const width = finiteSize(widthInput, 400);
  const height = finiteSize(heightInput, 300);
  const [rangeMin, rangeMax] = resolveGaugeRange(min, max);
  const normalizedValue = Number.isFinite(value)
    ? Math.max(rangeMin, Math.min(rangeMax, value))
    : rangeMin;
  const [startAngle, endAngle] = resolveGaugeAngles(startAngleInput, endAngleInput);
  const startRadians = degreesToRadians(startAngle);
  const endRadians = degreesToRadians(endAngle);
  const totalRadians = endRadians - startRadians;
  const normalizedInnerRatio = Number.isFinite(innerRadiusRatio)
    ? Math.min(0.95, Math.max(0, innerRadiusRatio))
    : 0.7;
  const outerRadius = Math.max(0, Math.min(width, height) / 2 - 20);
  const innerRadius = outerRadius * normalizedInnerRatio;
  const centerX = width / 2;
  const centerY = height / 2 + (
    startAngle < 0 && endAngle > 0 ? outerRadius * 0.1 : 0
  );
  const sourceSegments = providedSegments ?? defaultGaugeSegments(rangeMin, rangeMax);
  const usesDefaultSegments = providedSegments === undefined;
  const normalizedSegments = sourceSegments.flatMap((segment, index) => {
    if (!Number.isFinite(segment.from) || !Number.isFinite(segment.to)) return [];
    const from = Math.max(rangeMin, segment.from);
    const to = Math.min(rangeMax, segment.to);
    if (to <= from) return [];
    return [{ ...segment, from, to, sourceIndex: index }];
  });
  const activeIndex = normalizedSegments.findIndex((segment) => (
    normalizedValue >= segment.from && normalizedValue <= segment.to
  ));
  const range = rangeMax - rangeMin;
  const resolvedTrackCornerRadius = normalizedGaugeCornerRadius(trackCornerRadius, 2);
  const resolvedSegmentCornerRadius = normalizedGaugeCornerRadius(segmentCornerRadius, 1);
  const middleRadius = innerRadius + (outerRadius - innerRadius) / 2;
  const segments = normalizedSegments.map<SvgGaugeGeometrySegment>((segment, index) => {
    const startFraction = Math.max(0, (segment.from - rangeMin) / range);
    const endFraction = Math.min(1, (segment.to - rangeMin) / range);
    const segmentStartRadians = startRadians + totalRadians * startFraction;
    const segmentEndRadians = startRadians + totalRadians * endFraction;
    const [segmentCenterX, segmentCenterY] = radialPoint(
      centerX,
      centerY,
      middleRadius,
      segmentStartRadians + (segmentEndRadians - segmentStartRadians) / 2,
    );
    return {
      id: `gauge-segment-${segment.sourceIndex}`,
      from: segment.from,
      to: segment.to,
      ...(segment.color === undefined ? {} : { color: segment.color }),
      ...(segment.label === undefined ? {} : { label: segment.label }),
      path: buildGaugeArcPath(
        innerRadius,
        outerRadius,
        segmentStartRadians,
        segmentEndRadians,
        resolvedSegmentCornerRadius,
      ),
      startRadians: segmentStartRadians,
      endRadians: segmentEndRadians,
      centerX: segmentCenterX,
      centerY: segmentCenterY,
      active: index === activeIndex,
      colorSource: usesDefaultSegments ? 'default' : 'custom',
      tone: usesDefaultSegments
        ? DEFAULT_GAUGE_TONES[index % DEFAULT_GAUGE_TONES.length] ?? 'error'
        : 'custom',
    };
  });
  const valueFraction = (normalizedValue - rangeMin) / range;
  const needleRadians = startRadians + totalRadians * valueFraction;
  const needleRotation = (needleRadians * 180) / Math.PI;
  const needleLength = outerRadius * 0.88;
  const needleBaseWidth = 4;

  return {
    width,
    height,
    rangeMin,
    rangeMax,
    value: normalizedValue,
    startAngle,
    endAngle,
    startRadians,
    endRadians,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    trackPath: buildGaugeArcPath(
      innerRadius,
      outerRadius,
      startRadians,
      endRadians,
      resolvedTrackCornerRadius,
    ),
    needleRotation,
    needlePath: [
      `M ${-needleBaseWidth} 0`,
      `L 0 ${-needleLength}`,
      `L ${needleBaseWidth} 0`,
      'Z',
    ].join(' '),
    needleCapRadius: needleBaseWidth + 2,
    valueY: 8,
    labelY: 32,
    valueFontSize: Math.max(16, outerRadius * 0.22),
    labelFontSize: Math.max(11, outerRadius * 0.11),
    segments: Object.freeze(segments),
  };
}
