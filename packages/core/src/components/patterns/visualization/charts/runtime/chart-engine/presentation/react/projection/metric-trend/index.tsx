'use client';

/**
 * @fileoverview Generic metric+trend renderer for the `micro` projection.
 * Data-only and domain-blind: the application supplies every piece of copy
 * and the raw trend values; the design system renders value, delta tone, and
 * a decorative trend line. The trend polyline is a placeholder-grade micro
 * mark; once the sparkline family renderer exists it becomes the delegation
 * target without changing this contract.
 */

import type { CSSProperties, ReactNode } from 'react';

import type { ChartMicroProjectionView } from '../../../../foundation/projection';

/** Registered identifier apps use in `ChartProjectionSpec.rendererId`. */
export const CHART_METRIC_TREND_RENDERER_ID = 'ds.metric-trend';

/** Meaning-bearing delta direction; tones map to status semantics in skin. */
export type ChartMetricTrendTone = 'neutral' | 'positive' | 'negative';

/** App-supplied metric content; all copy is application-owned. */
export interface ChartMetricTrendContent {
  /** Visible metric label. */
  readonly label: ReactNode;
  /** Primary formatted metric value. */
  readonly value: ReactNode;
  /** Optional formatted change copy. */
  readonly delta?: ReactNode;
  /** Semantic direction of the delta; drives status paint, never category paint. */
  readonly deltaTone?: ChartMetricTrendTone;
  /** Raw ordered values behind the decorative trend line. */
  readonly trend?: readonly number[];
  /** Accessible name for the whole metric group. */
  readonly ariaLabel: string;
}

export interface ChartMetricTrendViewProps extends ChartMetricTrendContent {
  /** Resolved projection view; stamps the stable metric identifier. */
  readonly view?: ChartMicroProjectionView;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const TREND_VIEWBOX_WIDTH = 100;
const TREND_VIEWBOX_HEIGHT = 32;
const TREND_VERTICAL_PADDING = 2;

function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Maps raw values onto `0 0 100 32` polyline points. Non-finite values are
 * dropped; fewer than two finite values yield no line; a flat series renders
 * a midline instead of dividing by zero.
 */
export function buildChartTrendPoints(values: readonly number[]): string | null {
  const finite = values.filter((value) => Number.isFinite(value));
  if (finite.length < 2) return null;

  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const range = max - min;
  const drawableHeight = TREND_VIEWBOX_HEIGHT - TREND_VERTICAL_PADDING * 2;

  return finite
    .map((value, index) => {
      const x = (index / (finite.length - 1)) * TREND_VIEWBOX_WIDTH;
      const y = range === 0
        ? TREND_VIEWBOX_HEIGHT / 2
        : TREND_VIEWBOX_HEIGHT - TREND_VERTICAL_PADDING - ((value - min) / range) * drawableHeight;
      return `${roundCoordinate(x)},${roundCoordinate(y)}`;
    })
    .join(' ');
}

/**
 * Phone-first metric projection: label, value, optional delta, optional
 * decorative trend. The trend duplicates data already present as text, so it
 * stays `aria-hidden`; the group carries the app-supplied accessible name.
 */
export function ChartMetricTrendView({
  view,
  label,
  value,
  delta,
  deltaTone = 'neutral',
  trend,
  ariaLabel,
  className,
  style,
}: ChartMetricTrendViewProps): React.ReactElement {
  const trendPoints = trend ? buildChartTrendPoints(trend) : null;
  const rootClassName = ['ds-chart-metric-trend', className].filter(Boolean).join(' ');

  return (
    <div
      className={rootClassName}
      data-part="root"
      data-renderer-id={view?.rendererId ?? CHART_METRIC_TREND_RENDERER_ID}
      data-metric-id={view?.metricId}
      role="group"
      aria-label={ariaLabel}
      style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}
    >
      <div data-part="label" style={{ fontSize: 13 }}>{label}</div>
      <div
        data-part="value"
        style={{
          fontSize: 24,
          fontWeight: 600,
          fontVariantNumeric: 'var(--ds-numeric-tabular)' as CSSProperties['fontVariantNumeric'],
        }}
      >
        {value}
      </div>
      {delta ? (
        <div data-part="delta" data-tone={deltaTone} style={{ fontSize: 13 }}>
          {delta}
        </div>
      ) : null}
      {trendPoints ? (
        <svg
          data-part="trend"
          data-trend-id={view?.trendId}
          viewBox={`0 0 ${TREND_VIEWBOX_WIDTH} ${TREND_VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
          style={{ width: '100%', height: TREND_VIEWBOX_HEIGHT }}
        >
          <polyline
            data-part="trend-line"
            points={trendPoints}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
    </div>
  );
}
