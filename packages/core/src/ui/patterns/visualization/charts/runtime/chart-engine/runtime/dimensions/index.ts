'use client';

import { useEffect, useRef, useState } from 'react';

interface ChartDimensions {
  width: number;
  height: number;
}

/**
 * Kernel runtime for measuring a chart container through one ResizeObserver.
 *
 * Height remains fixed because chart layouts reflow horizontally. Disabling
 * measurement keeps the explicit fallback dimensions and does not construct an
 * observer, while preserving the owner ref for other renderer concerns.
 */
export function useChartDimensions(
  defaultWidth: number | string = '100%',
  defaultHeight = 400,
  enabled = true,
): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  dimensions: ChartDimensions;
} {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: typeof defaultWidth === 'number' ? defaultWidth : 600,
    height: defaultHeight,
  });

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0) {
        setDimensions({ width: rect.width, height: defaultHeight });
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);

    return () => observer.disconnect();
  }, [defaultHeight, enabled]);

  return { containerRef, dimensions };
}
