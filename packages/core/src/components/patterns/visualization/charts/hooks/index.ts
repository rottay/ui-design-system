'use client';

/**
 * @fileoverview Chart hooks barrel -- exports useChartDimensions (responsive
 * container measurement via ResizeObserver) and useChartPersonality (personality
 * token resolution for chart rendering behavior).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface ChartDimensions {
  width: number;
  height: number;
}

/**
 * Measures a chart container's width via ResizeObserver and returns
 * reactive dimensions that update when the container resizes.
 *
 * The height is fixed (passed as `defaultHeight`) because most chart
 * layouts pin height and let width flex. The initial width falls back
 * to 600px when `defaultWidth` is a CSS string like `'100%'`, since
 * the observer needs at least one paint cycle to measure the real width.
 *
 * @param defaultWidth - Initial width (number in px, or CSS string like '100%').
 * @param defaultHeight - Fixed chart height in pixels (default 400).
 * @returns A ref to attach to the container div and the current dimensions.
 *
 * @example
 * ```tsx
 * const { containerRef, dimensions } = useChartDimensions('100%', 300);
 * return (
 *   <div ref={containerRef}>
 *     <svg width={dimensions.width} height={dimensions.height} />
 *   </div>
 * );
 * ```
 */
export function useChartDimensions(
  defaultWidth: number | string = '100%',
  defaultHeight: number = 400,
): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  dimensions: ChartDimensions;
} {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: typeof defaultWidth === 'number' ? defaultWidth : 600,
    height: defaultHeight,
  });

  // Attaches a ResizeObserver to the container element. The initial
  // `measure()` call handles the first paint; the observer handles
  // subsequent layout shifts (viewport resize, sidebar collapse, etc.).
  // The guard `rect.width > 0` prevents a zero-width flash before the
  // element is laid out.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0) {
        setDimensions({ width: rect.width, height: defaultHeight });
      }
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [defaultHeight]);

  return { containerRef, dimensions };
}

export { useChartPersonality } from './use-chart-personality';
export type { ChartPersonalityOptions, ResolvedChartPersonality } from './use-chart-personality';

export { useChartCompact } from './use-chart-compact';
export type { UseChartCompactOptions, ResolvedChartCompact } from './use-chart-compact';
