/**
 * @fileoverview Shared D3-imperative crosshair + pointer-position helpers for
 * the D3 chart family. The crosshair lives inside the SAME D3-owned <svg>
 * tree as the rest of a chart's marks -- charts wipe and rebuild their <svg>
 * via `svg.selectAll('*').remove()` on every data change, so the crosshair is
 * created and updated with plain D3 selection calls, never as React-rendered
 * children of that svg. Rendering it as JSX inside the svg would make React's
 * reconciler and D3's direct DOM mutation fight over the same nodes.
 *
 * Pair with `ChartTooltip` (`./index`) for the HTML value readout: the
 * crosshair draws the SVG guide lines + focus dots, `ChartTooltip` renders as
 * a React-owned sibling `<div>` mounted through `ChartScaffold`'s `overlay`
 * slot, so it is unaffected by the svg's imperative rebuilds.
 */

import type { Selection } from 'd3';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single series' focal point at the hovered x: plot-local y (px) and swatch color. */
export interface CrosshairFocusPoint {
  y: number;
  color: string;
}

export interface ChartCrosshairHandle {
  /**
   * Position the crosshair at plot-local pixel `x`. `focusPoints` places one
   * dot per series at that x (multi-series line/area). `horizontalAt` draws
   * the horizontal guide at a single y -- pass it only when one value is
   * unambiguous (bar, scatter, single-series line); omit it for multi-series
   * overlays where a single horizontal reference would be misleading.
   */
  show(x: number, focusPoints: CrosshairFocusPoint[], horizontalAt?: number): void;
  /** Hide the crosshair. */
  hide(): void;
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

/** Guide-line stroke -- a neutral border token, never a data/series color. */
const CROSSHAIR_LINE_COLOR = 'var(--ds-color-border)';
/** Focus-dot ring -- matches the persistent line-chart dot stroke convention. */
const CROSSHAIR_DOT_RING_COLOR = 'var(--ds-color-bg-primary)';

// ---------------------------------------------------------------------------
// Crosshair
// ---------------------------------------------------------------------------

/**
 * Creates a hidden crosshair layer (vertical guide, optional horizontal
 * guide, and a per-series focus-dot pool) inside `g` and returns `show`/`hide`
 * functions a chart calls from its own mousemove/mouseleave handlers.
 *
 * @param g - The D3 group the chart already draws its marks into.
 * @param innerWidth - Plot area width in px (horizontal guide's x2).
 * @param innerHeight - Plot area height in px (vertical guide's y2).
 */
export function createChartCrosshair(
  g: Selection<SVGGElement, unknown, null, undefined>,
  innerWidth: number,
  innerHeight: number,
): ChartCrosshairHandle {
  const layer = g
    .append('g')
    .attr('class', 'chart-crosshair')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('transition', 'opacity var(--ds-motion-fast) var(--ds-motion-ease-out)');

  const vLine = layer
    .append('line')
    .attr('class', 'chart-crosshair-v')
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .attr('stroke', CROSSHAIR_LINE_COLOR)
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3');

  const hLine = layer
    .append('line')
    .attr('class', 'chart-crosshair-h')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('stroke', CROSSHAIR_LINE_COLOR)
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3')
    .style('opacity', 0);

  function show(x: number, focusPoints: CrosshairFocusPoint[], horizontalAt?: number): void {
    layer.style('opacity', 1);

    vLine.attr('x1', x).attr('x2', x);

    hLine.style('opacity', horizontalAt === undefined ? 0 : 1);
    if (horizontalAt !== undefined) {
      hLine.attr('y1', horizontalAt).attr('y2', horizontalAt);
    }

    const dots = layer
      .selectAll<SVGCircleElement, CrosshairFocusPoint>('circle.chart-crosshair-dot')
      .data(focusPoints);

    dots.exit().remove();

    dots
      .enter()
      .append('circle')
      .attr('class', 'chart-crosshair-dot')
      .attr('r', 4)
      .attr('stroke', CROSSHAIR_DOT_RING_COLOR)
      .attr('stroke-width', 2)
      .merge(dots)
      .attr('cx', x)
      .attr('cy', (d) => d.y)
      .attr('fill', (d) => d.color);
  }

  function hide(): void {
    layer.style('opacity', 0);
  }

  return { show, hide };
}

// ---------------------------------------------------------------------------
// Pointer position
// ---------------------------------------------------------------------------

/**
 * Translates a native mouse/pointer event's viewport position into
 * container-relative coordinates for `useChartTooltip`'s `show(x, y, ...)`,
 * which positions the HTML tooltip overlay relative to the chart's outer
 * container div (the same element `useChartDimensions` measures). Returns
 * null when the container ref is not yet attached.
 */
export function pointerToContainerPosition(
  event: { clientX: number; clientY: number },
  container: HTMLElement | null,
): { x: number; y: number } | null {
  if (!container) return null;
  const rect = container.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

/**
 * Computes plot-local pixel coordinates (relative to the chart's inner `g`,
 * which sits at `(margin.left, margin.top)` inside the svg) for a mouse
 * event, via the svg element's own bounding rect rather than `d3.pointer()`'s
 * SVG-CTM math. None of this chart family applies a viewBox or CSS transform
 * to its svg, so a bounding-rect diff is equivalent and, unlike `d3.pointer`,
 * does not depend on `SVGPoint.matrixTransform` -- unimplemented in happy-dom,
 * which is what makes this the test-safe choice, not just the simpler one.
 * Returns null when the svg ref is not yet attached.
 */
export function plotLocalPointerPosition(
  event: { clientX: number; clientY: number },
  svg: SVGSVGElement | null,
  margin: { left: number; top: number },
): { x: number; y: number } | null {
  if (!svg) return null;
  const rect = svg.getBoundingClientRect();
  return { x: event.clientX - rect.left - margin.left, y: event.clientY - rect.top - margin.top };
}

/**
 * Returns the index of the entry in `pixelPositions` closest to `x`. Used to
 * snap a raw mouse pixel onto the nearest data point's already-scaled pixel
 * position (category tick, time/linear projection) for both the crosshair's
 * `x` and the matching tooltip content. Returns 0 for an empty array.
 */
export function nearestIndexByPixel(x: number, pixelPositions: number[]): number {
  let nearest = 0;
  let minDist = Infinity;
  for (let i = 0; i < pixelPositions.length; i += 1) {
    const dist = Math.abs(pixelPositions[i] - x);
    if (dist < minDist) {
      minDist = dist;
      nearest = i;
    }
  }
  return nearest;
}
