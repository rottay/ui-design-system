'use client';

import { useId } from 'react';

import type { ChartInsightSpec } from '../../../foundation/spec';
import {
  resolveChartInsightGeometry,
  type ChartInsightAxis,
  type ChartInsightCoordinateSpace,
  type ChartInsightPlotRect,
  type ResolvedChartInsight,
} from '..';

export interface ChartInsightLayerProps extends ChartInsightCoordinateSpace {
  readonly insights?: readonly ChartInsightSpec[];
}

interface LabelPosition {
  readonly x: number;
  readonly y: number;
  readonly textAnchor: 'start' | 'end';
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function axisLabelPosition(
  axis: ChartInsightAxis,
  position: number,
  plot: ChartInsightPlotRect,
): LabelPosition {
  if (axis === 'y') {
    return {
      x: plot.x + plot.width - 4,
      y: clamp(position - 6, plot.y + 12, plot.y + plot.height - 4),
      textAnchor: 'end',
    };
  }

  const placeBefore = position > plot.x + plot.width * 0.72;
  return {
    x: clamp(position + (placeBefore ? -6 : 6), plot.x + 4, plot.x + plot.width - 4),
    y: plot.y + 14,
    textAnchor: placeBefore ? 'end' : 'start',
  };
}

function directLabelPosition(
  insight: Extract<ResolvedChartInsight, { type: 'direct-label' }>,
  plot: ChartInsightPlotRect,
): LabelPosition {
  const placeBefore = insight.x > plot.x + plot.width * 0.72;
  const placeBelow = insight.y < plot.y + 18;
  return {
    x: clamp(insight.x + (placeBefore ? -6 : 6), plot.x + 4, plot.x + plot.width - 4),
    y: clamp(insight.y + (placeBelow ? 14 : -6), plot.y + 12, plot.y + plot.height - 4),
    textAnchor: placeBefore ? 'end' : 'start',
  };
}

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function safeReactId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '') || 'root';
}

function stableCollisionRanks(insights: readonly ResolvedChartInsight[]): ReadonlyMap<string, number> {
  const ranks = new Map<string, number>();
  const hashCounts = new Map<string, number>();
  const sortedIds = insights.map((insight) => insight.id).sort();

  for (const id of sortedIds) {
    const hash = stableHash(id);
    const rank = hashCounts.get(hash) ?? 0;
    ranks.set(id, rank);
    hashCounts.set(hash, rank + 1);
  }

  return ranks;
}

function renderRule(
  insight: Extract<ResolvedChartInsight, { type: 'target' | 'event' }>,
  plot: ChartInsightPlotRect,
): React.ReactElement {
  const label = axisLabelPosition(insight.axis, insight.position, plot);
  return (
    <>
      <line
        data-part="insight-rule"
        x1={insight.axis === 'y' ? plot.x : insight.position}
        x2={insight.axis === 'y' ? plot.x + plot.width : insight.position}
        y1={insight.axis === 'y' ? insight.position : plot.y}
        y2={insight.axis === 'y' ? insight.position : plot.y + plot.height}
      />
      <text
        data-part="insight-label"
        x={label.x}
        y={label.y}
        textAnchor={label.textAnchor}
        direction="inherit"
      >
        {insight.label}
      </text>
    </>
  );
}

function renderBand(
  insight: Extract<ResolvedChartInsight, { type: 'band' }>,
  plot: ChartInsightPlotRect,
): React.ReactElement {
  const thickness = Math.max(1, insight.end - insight.start);
  const label = axisLabelPosition(insight.axis, insight.start + thickness / 2, plot);
  return (
    <>
      <rect
        data-part="insight-band"
        x={insight.axis === 'y' ? plot.x : insight.start}
        y={insight.axis === 'y' ? insight.start : plot.y}
        width={insight.axis === 'y' ? plot.width : thickness}
        height={insight.axis === 'y' ? thickness : plot.height}
      />
      <text
        data-part="insight-label"
        x={label.x}
        y={label.y}
        textAnchor={label.textAnchor}
        direction="inherit"
      >
        {insight.label}
      </text>
    </>
  );
}

function renderDirectLabel(
  insight: Extract<ResolvedChartInsight, { type: 'direct-label' }>,
  plot: ChartInsightPlotRect,
): React.ReactElement {
  const label = directLabelPosition(insight, plot);
  return (
    <>
      <circle data-part="insight-anchor" cx={insight.x} cy={insight.y} r={3} />
      <text
        data-part="insight-label"
        x={label.x}
        y={label.y}
        textAnchor={label.textAnchor}
        direction="inherit"
      >
        {insight.label}
      </text>
    </>
  );
}

/** Static React-owned SVG annotations. No event or focus behavior is added. */
export function ChartInsightLayer({
  insights,
  plot,
  valueAxis,
  valueAnchors,
  numericEventAxis,
  numericEventAnchors,
  categoricalEventAxis,
  categoricalEventAnchors,
  datumAnchors,
}: ChartInsightLayerProps): React.ReactElement | null {
  const reactId = safeReactId(useId());
  const resolved = resolveChartInsightGeometry(insights, {
    plot,
    valueAxis,
    valueAnchors,
    numericEventAxis,
    numericEventAnchors,
    categoricalEventAxis,
    categoricalEventAnchors,
    datumAnchors,
  });
  if (resolved.length === 0) return null;

  const clipId = `ds-chart-insight-${reactId}-plot`;
  const collisionRanks = stableCollisionRanks(resolved);
  return (
    <>
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect x={plot.x} y={plot.y} width={plot.width} height={plot.height} />
        </clipPath>
      </defs>
      <g
        data-part="insight-layer"
        clipPath={`url(#${clipId})`}
        pointerEvents="none"
      >
        {resolved.map((insight) => (
          <g
            key={insight.id}
            id={`ds-chart-insight-${reactId}-${collisionRanks.get(insight.id) ?? 0}-${stableHash(insight.id)}`}
            data-part="insight"
            data-insight-id={insight.id}
            data-insight-type={insight.type}
            data-event-kind={insight.type === 'event' ? insight.eventKind : undefined}
            role="note"
            aria-label={insight.label}
          >
            <title>{insight.label}</title>
            {insight.type === 'band'
              ? renderBand(insight, plot)
              : insight.type === 'direct-label'
                ? renderDirectLabel(insight, plot)
                : renderRule(insight, plot)}
          </g>
        ))}
      </g>
    </>
  );
}
