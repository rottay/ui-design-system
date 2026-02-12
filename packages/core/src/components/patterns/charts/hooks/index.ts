'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ChartDimensions {
  width: number;
  height: number;
}

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
