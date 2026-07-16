import type { ChartInsightSpec } from '../spec';
import { isChartInsightSpec } from '../spec';

export type ChartInsightAxis = 'x' | 'y';

export interface ChartInsightPlotRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ChartInsightValueAnchor {
  readonly value: number;
  readonly position: number;
}

export interface ChartInsightKeyAnchor {
  readonly key: string | number;
  readonly position: number;
}

export interface ChartInsightDatumAnchor {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

export interface ChartInsightCoordinateSpace {
  readonly plot: ChartInsightPlotRect;
  readonly valueAxis: ChartInsightAxis;
  readonly valueAnchors: readonly ChartInsightValueAnchor[];
  readonly numericEventAxis: ChartInsightAxis;
  readonly numericEventAnchors: readonly ChartInsightValueAnchor[];
  readonly categoricalEventAxis: ChartInsightAxis;
  readonly categoricalEventAnchors: readonly ChartInsightKeyAnchor[];
  readonly datumAnchors: readonly ChartInsightDatumAnchor[];
}

interface ResolvedInsightBase {
  readonly id: string;
  readonly type: ChartInsightSpec['type'];
  readonly label: string;
}

export interface ResolvedRuleInsight extends ResolvedInsightBase {
  readonly type: 'target' | 'event';
  readonly axis: ChartInsightAxis;
  readonly position: number;
  readonly eventKind?: 'numeric' | 'categorical';
}

export interface ResolvedBandInsight extends ResolvedInsightBase {
  readonly type: 'band';
  readonly axis: ChartInsightAxis;
  readonly start: number;
  readonly end: number;
}

export interface ResolvedDirectLabelInsight extends ResolvedInsightBase {
  readonly type: 'direct-label';
  readonly x: number;
  readonly y: number;
}

export type ResolvedChartInsight =
  | ResolvedRuleInsight
  | ResolvedBandInsight
  | ResolvedDirectLabelInsight;

const POSITION_EPSILON = 0.01;

function finitePlot(plot: ChartInsightPlotRect): boolean {
  return Number.isFinite(plot.x)
    && Number.isFinite(plot.y)
    && Number.isFinite(plot.width)
    && Number.isFinite(plot.height)
    && plot.width >= 0
    && plot.height >= 0;
}

function axisBounds(plot: ChartInsightPlotRect, axis: ChartInsightAxis): readonly [number, number] {
  return axis === 'x'
    ? [plot.x, plot.x + plot.width]
    : [plot.y, plot.y + plot.height];
}

function insideAxis(plot: ChartInsightPlotRect, axis: ChartInsightAxis, position: number): boolean {
  if (!Number.isFinite(position)) return false;
  const [minimum, maximum] = axisBounds(plot, axis);
  return position >= minimum - POSITION_EPSILON && position <= maximum + POSITION_EPSILON;
}

function samePosition(positions: readonly number[]): number | null {
  const first = positions[0];
  if (!Number.isFinite(first)) return null;
  return positions.every(
    (position) => Number.isFinite(position) && Math.abs(position - first) <= POSITION_EPSILON,
  ) ? first : null;
}

function resolveLinearPosition(
  value: number,
  anchors: readonly ChartInsightValueAnchor[],
): number | null {
  if (!Number.isFinite(value)) return null;
  const finiteAnchors = anchors.filter(
    (anchor) => Number.isFinite(anchor.value) && Number.isFinite(anchor.position),
  );
  const exact = finiteAnchors
    .filter((anchor) => Object.is(anchor.value, value) || anchor.value === value)
    .map((anchor) => anchor.position);
  if (exact.length > 0) return samePosition(exact);

  const ordered = [...finiteAnchors].sort((left, right) => left.value - right.value);
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  if (!first || !last || first.value === last.value) return null;

  const position = first.position
    + ((value - first.value) / (last.value - first.value)) * (last.position - first.position);
  return Number.isFinite(position) ? position : null;
}

function resolveKeyPosition(
  key: string | number,
  anchors: readonly ChartInsightKeyAnchor[],
): number | null {
  const matches = anchors
    .filter((anchor) => anchor.key === key)
    .map((anchor) => anchor.position);
  return matches.length > 0 ? samePosition(matches) : null;
}

function resolveUniqueDatum(
  datumId: string,
  anchors: readonly ChartInsightDatumAnchor[],
): ChartInsightDatumAnchor | null {
  const matches = anchors.filter((anchor) => anchor.id === datumId);
  if (matches.length !== 1) return null;
  const match = matches[0];
  return match && Number.isFinite(match.x) && Number.isFinite(match.y) ? match : null;
}

function safeInsightCandidates(value: unknown): readonly ChartInsightSpec[] {
  if (!Array.isArray(value)) return [];
  const result: ChartInsightSpec[] = [];

  try {
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) continue;
      const candidate: unknown = value[index];
      if (isChartInsightSpec(candidate)) result.push(candidate);
    }
  } catch {
    return [];
  }

  return result;
}

/** Resolve JSON-only insight specs into bounded SVG coordinates. */
export function resolveChartInsightGeometry(
  insights: unknown,
  space: ChartInsightCoordinateSpace,
): readonly ResolvedChartInsight[] {
  if (!finitePlot(space.plot)) return [];

  const resolved: ResolvedChartInsight[] = [];
  const seenIds = new Set<string>();

  for (const insight of safeInsightCandidates(insights)) {
    if (seenIds.has(insight.id)) continue;
    seenIds.add(insight.id);

    if (insight.type === 'target') {
      const position = resolveLinearPosition(insight.value, space.valueAnchors);
      if (position === null || !insideAxis(space.plot, space.valueAxis, position)) continue;
      resolved.push({
        id: insight.id,
        type: insight.type,
        label: insight.label,
        axis: space.valueAxis,
        position,
      });
      continue;
    }

    if (insight.type === 'band') {
      const lower = resolveLinearPosition(insight.lower, space.valueAnchors);
      const upper = resolveLinearPosition(insight.upper, space.valueAnchors);
      if (lower === null || upper === null) continue;
      if (!insideAxis(space.plot, space.valueAxis, lower)) continue;
      if (!insideAxis(space.plot, space.valueAxis, upper)) continue;
      resolved.push({
        id: insight.id,
        type: insight.type,
        label: insight.label,
        axis: space.valueAxis,
        start: Math.min(lower, upper),
        end: Math.max(lower, upper),
      });
      continue;
    }

    if (insight.type === 'direct-label') {
      const datum = resolveUniqueDatum(insight.datumId, space.datumAnchors);
      if (!datum) continue;
      if (!insideAxis(space.plot, 'x', datum.x) || !insideAxis(space.plot, 'y', datum.y)) continue;
      resolved.push({
        id: insight.id,
        type: insight.type,
        label: insight.label,
        x: datum.x,
        y: datum.y,
      });
      continue;
    }

    let eventKind: 'numeric' | 'categorical';
    let axis: ChartInsightAxis;
    let position: number | null;
    if (typeof insight.at === 'number') {
      eventKind = 'numeric';
      axis = space.numericEventAxis;
      position = resolveLinearPosition(insight.at, space.numericEventAnchors);
    } else {
      eventKind = 'categorical';
      axis = space.categoricalEventAxis;
      position = resolveKeyPosition(insight.at, space.categoricalEventAnchors);
    }
    if (position === null || !insideAxis(space.plot, axis, position)) continue;
    resolved.push({
      id: insight.id,
      type: insight.type,
      label: insight.label,
      axis,
      position,
      eventKind,
    });
  }

  return Object.freeze(resolved);
}
