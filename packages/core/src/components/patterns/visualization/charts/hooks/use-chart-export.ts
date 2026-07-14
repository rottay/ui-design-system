'use client';

/**
 * @fileoverview useChartExport hook -- convenience wrapper around the pure
 * `exportChart` utility. Provides `exportPng` and `exportSvg` callbacks
 * bound to a chart SVG ref, plus an `isExporting` loading flag.
 *
 * @example
 * ```tsx
 * function MyChart() {
 *   const svgRef = useRef<SVGSVGElement>(null);
 *   const { exportPng, exportSvg, isExporting } = useChartExport(svgRef);
 *
 *   return (
 *     <>
 *       <svg ref={svgRef}>...</svg>
 *       <button onClick={() => exportPng()} disabled={isExporting}>
 *         Download PNG
 *       </button>
 *       <button onClick={() => exportSvg()} disabled={isExporting}>
 *         Download SVG
 *       </button>
 *     </>
 *   );
 * }
 * ```
 */

import { useCallback, useState } from 'react';

import { exportChart } from '../utils/export';
import type { ChartExportOptions } from '../utils/export';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseChartExportReturn {
  /** Export as PNG (default: 2x retina, white background). */
  exportPng: (options?: Partial<ChartExportOptions>) => Promise<void>;
  /** Export as SVG (default: transparent background). */
  exportSvg: (options?: Partial<ChartExportOptions>) => Promise<void>;
  /** Whether an export operation is currently in progress. */
  isExporting: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provides PNG and SVG export callbacks bound to an SVG element ref.
 *
 * Both callbacks accept an optional partial options object that is merged
 * with sensible defaults. The `isExporting` flag is `true` while the async
 * export operation is in flight, which consumers can use to disable buttons
 * or show a spinner.
 *
 * Errors during export are re-thrown after resetting `isExporting`, so
 * consumers can handle them with try/catch or error boundaries.
 *
 * @param svgRef - A React ref pointing to the chart's root `<svg>` element.
 * @returns An object with `exportPng`, `exportSvg`, and `isExporting`.
 */
export function useChartExport(
  svgRef: React.RefObject<SVGSVGElement | null>,
): UseChartExportReturn {
  const [isExporting, setIsExporting] = useState(false);

  const doExport = useCallback(
    async (overrides: Partial<ChartExportOptions>) => {
      const svg = svgRef.current;
      if (!svg) {
        throw new Error('useChartExport: SVG ref is not attached to an element');
      }

      setIsExporting(true);
      try {
        await exportChart(svg, overrides as ChartExportOptions);
      } finally {
        setIsExporting(false);
      }
    },
    [svgRef],
  );

  const exportPng = useCallback(
    (options?: Partial<ChartExportOptions>) =>
      doExport({
        format: 'png',
        scale: 2,
        filename: 'chart',
        ...options,
      }),
    [doExport],
  );

  const exportSvg = useCallback(
    (options?: Partial<ChartExportOptions>) =>
      doExport({
        format: 'svg',
        filename: 'chart',
        ...options,
      }),
    [doExport],
  );

  return { exportPng, exportSvg, isExporting };
}
