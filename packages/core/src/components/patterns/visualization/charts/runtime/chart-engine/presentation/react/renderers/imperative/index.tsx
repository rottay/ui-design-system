'use client';

/**
 * @fileoverview ChartImperativePlot -- the sanctioned bridge for chart bodies
 * that must stay imperative (d3-sankey layouts, force simulations). The
 * surrounding `ChartRendererSurface` owns the SVG element, its accessible
 * `<title>/<desc>`, tooltip anchor variables, and the `data-empty` stamp, so
 * imperative redraws can never erase the accessible name or the shared chart
 * chrome. The imperative body only ever owns the mount `<g>` handed to it.
 */

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from 'react';

import { useResolvedChartPersonality } from '@/infrastructure/runtime/personality';
import type { ChartPersonalityTokens } from '@/foundation/contracts/kernel/tokens/personality';
import { resolveChartSeriesPaint } from '../../../../foundation/grammar/palette';
import { useChartDimensions } from '../../../../runtime/dimensions';
import { ChartRendererSurface } from '..';

/** Everything an imperative body may touch. Nothing outside it is owned. */
export interface ChartImperativePlotContext {
  /** Empty `<g>` mount the body draws into; cleared before every draw. */
  readonly mount: SVGGElement;
  /** Current drawing width in SVG user units. */
  readonly width: number;
  /** Current drawing height in SVG user units. */
  readonly height: number;
  /**
   * Categorical paint expressions from the canonical resolution chain
   * (authored category > generated series > scheme channel > light literal).
   * Bodies assign these strings directly to SVG fill/stroke attributes.
   */
  readonly seriesPaint: readonly string[];
}

/**
 * Imperative drawing procedure. Must be referentially stable (memoized over
 * its data) because identity changes trigger a full clear-and-redraw. An
 * optional returned function runs before the next draw and on unmount, for
 * bodies holding timers or simulations (e.g. d3-force ticks).
 */
export type ChartImperativePlotDraw = (
  context: ChartImperativePlotContext,
) => void | (() => void);

export interface ChartImperativePlotProps {
  readonly rendererId: string;
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  /** ID of app- or family-owned extended description content. */
  readonly ariaDescribedBy?: string;
  readonly width?: number;
  readonly height?: number;
  /** Whether the drawing width follows the measured container. */
  readonly responsive?: boolean;
  /** Stamps `data-empty` on the surface; the body still decides what to draw. */
  readonly empty?: boolean;
  /** Bounded scheme override; defaults to the resolved chart personality. */
  readonly colorScheme?: ChartPersonalityTokens['colorScheme'];
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly draw: ChartImperativePlotDraw;
}

function clearMount(mount: SVGGElement): void {
  while (mount.firstChild) {
    mount.removeChild(mount.firstChild);
  }
}

/**
 * Renders an imperative chart body inside the stable renderer surface.
 *
 * Draw lifecycle: the mount group is emptied, `draw` runs against the current
 * dimensions and palette, and its returned cleanup runs before the next draw
 * and on unmount. Dimension changes therefore redraw from a clean group.
 */
export function ChartImperativePlot({
  rendererId,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 640,
  height = 360,
  responsive = true,
  empty = false,
  colorScheme,
  className,
  style,
  draw,
}: ChartImperativePlotProps): React.ReactElement {
  const chartPersonality = useResolvedChartPersonality();
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const [mount, setMount] = useState<SVGGElement | null>(null);
  const mountRef = useCallback((node: SVGGElement | null) => {
    setMount(node);
  }, []);
  const seriesPaint = resolveChartSeriesPaint(colorScheme ?? chartPersonality.colorScheme);

  useEffect(() => {
    if (!mount) return undefined;

    clearMount(mount);
    const cleanup = draw({
      mount,
      width: dimensions.width,
      height: dimensions.height,
      seriesPaint,
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
      clearMount(mount);
    };
  }, [dimensions.height, dimensions.width, draw, mount, seriesPaint]);

  return (
    <ChartRendererSurface
      rendererId={rendererId}
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      ariaDescribedBy={ariaDescribedBy}
      width={dimensions.width}
      height={dimensions.height}
      responsive={responsive}
      className={className}
      style={style}
      ownerRef={containerRef}
      empty={empty}
    >
      <g ref={mountRef} data-part="imperative-mount" />
    </ChartRendererSurface>
  );
}
