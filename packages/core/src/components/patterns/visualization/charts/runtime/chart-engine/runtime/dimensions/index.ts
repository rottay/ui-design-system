'use client';

import { useEffect, useRef, useState } from 'react';

export interface ChartDimensions {
  width: number;
  height: number;
}

export interface ChartDimensionsOptions {
  /** Explicit width, or a CSS width whose measured pixels drive the geometry. */
  readonly width?: number | string;
  /** Fixed pixel height, or `'auto'` to observe the container height. */
  readonly height?: number | 'auto';
  /** Derive height from the measured width as `width / aspectRatio`. Wins over `height`. */
  readonly aspectRatio?: number;
  readonly minHeight?: number;
  readonly maxHeight?: number;
  readonly enabled?: boolean;
}

export interface UseChartDimensionsResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  dimensions: ChartDimensions;
}

interface ResolvedDimensionsOptions {
  readonly width: number | string;
  readonly aspectRatio: number | undefined;
  readonly autoHeight: boolean;
  readonly fixedHeight: number;
  readonly minHeight: number | undefined;
  readonly maxHeight: number | undefined;
  readonly enabled: boolean;
}

function isDimensionsOptions(value: unknown): value is ChartDimensionsOptions {
  return typeof value === 'object' && value !== null;
}

function resolveOptions(
  arg1: ChartDimensionsOptions | number | string | undefined,
  arg2: number | undefined,
  arg3: boolean | undefined,
): ResolvedDimensionsOptions {
  if (isDimensionsOptions(arg1)) {
    const height = arg1.height ?? 400;
    return {
      width: arg1.width ?? '100%',
      aspectRatio: arg1.aspectRatio,
      autoHeight: height === 'auto',
      fixedHeight: typeof height === 'number' ? height : 400,
      minHeight: arg1.minHeight,
      maxHeight: arg1.maxHeight,
      enabled: arg1.enabled ?? true,
    };
  }
  return {
    width: arg1 ?? '100%',
    aspectRatio: undefined,
    autoHeight: false,
    fixedHeight: arg2 ?? 400,
    minHeight: undefined,
    maxHeight: undefined,
    enabled: arg3 ?? true,
  };
}

function clampHeight(value: number, minimum: number | undefined, maximum: number | undefined): number {
  let result = value;
  if (minimum !== undefined) result = Math.max(minimum, result);
  if (maximum !== undefined) result = Math.min(maximum, result);
  return result;
}

/**
 * Kernel runtime for measuring a chart container through one ResizeObserver.
 *
 * The positional signature keeps a fixed height because those layouts reflow
 * horizontally. The options signature adds `aspectRatio` (height tracks the
 * measured width), `height: 'auto'` (height is observed too), and height clamps.
 * A commit is skipped when the resolved size is unchanged, so an observed-height
 * layout cannot feed back into an endless measure loop. Disabling measurement
 * keeps the fallback dimensions and constructs no observer while preserving the
 * owner ref.
 */
export function useChartDimensions(options?: ChartDimensionsOptions): UseChartDimensionsResult;
export function useChartDimensions(
  defaultWidth?: number | string,
  defaultHeight?: number,
  enabled?: boolean,
): UseChartDimensionsResult;
export function useChartDimensions(
  arg1?: ChartDimensionsOptions | number | string,
  arg2?: number,
  arg3?: boolean,
): UseChartDimensionsResult {
  const { width, aspectRatio, autoHeight, fixedHeight, minHeight, maxHeight, enabled } =
    resolveOptions(arg1, arg2, arg3);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>(() => {
    const initialWidth = typeof width === 'number' ? width : 600;
    const initialHeight = aspectRatio !== undefined
      ? clampHeight(initialWidth / aspectRatio, minHeight, maxHeight)
      : autoHeight
        ? clampHeight(fixedHeight, minHeight, maxHeight)
        : fixedHeight;
    return { width: initialWidth, height: initialHeight };
  });

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;
      const nextWidth = rect.width;
      const nextHeight = aspectRatio !== undefined
        ? clampHeight(nextWidth / aspectRatio, minHeight, maxHeight)
        : autoHeight
          ? clampHeight(rect.height > 0 ? rect.height : fixedHeight, minHeight, maxHeight)
          : fixedHeight;
      setDimensions((previous) => (
        previous.width === nextWidth && previous.height === nextHeight
          ? previous
          : { width: nextWidth, height: nextHeight }
      ));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);

    return () => observer.disconnect();
  }, [enabled, aspectRatio, autoHeight, fixedHeight, minHeight, maxHeight]);

  return { containerRef, dimensions };
}
