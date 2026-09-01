/**
 * @fileoverview Shared Grid responsive utilities
 * @description Reusable responsive helpers consumed by all Grid engines.
 *
 * Grid was carrying near-identical breakpoint and CSS generation logic in
 * three engines. Centralising that logic keeps responsive behaviour aligned
 * across Classic, Modern, and Rustic while still letting each engine decide
 * how non-responsive templates render.
 */

import {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  type ResponsiveBreakpointKey,
} from "@/foundation/contracts/kernel/responsive/breakpoints";
import type { CSSProperties } from "react";
import type { ResponsiveValue } from "../../contracts";

export { RESPONSIVE_BREAKPOINTS as GRID_BREAKPOINTS };
export type GridBreakpointKey = ResponsiveBreakpointKey;

export type ResponsiveGridTemplateValue = number | string | "auto" | "none";

export type ResponsiveGridStyle = CSSProperties & {
  "--_ds-grid-columns-xs"?: string;
  "--_ds-grid-columns-sm"?: string;
  "--_ds-grid-columns-md"?: string;
  "--_ds-grid-columns-lg"?: string;
  "--_ds-grid-columns-xl"?: string;
  "--_ds-grid-columns-2xl"?: string;
  "--_ds-grid-rows-xs"?: string;
  "--_ds-grid-rows-sm"?: string;
  "--_ds-grid-rows-md"?: string;
  "--_ds-grid-rows-lg"?: string;
  "--_ds-grid-rows-xl"?: string;
  "--_ds-grid-rows-2xl"?: string;
};

/**
 * Detects the Grid-specific responsive object shape used by columns/rows.
 */
export function isResponsiveGridValue(
  value: unknown
): value is ResponsiveValue<ResponsiveGridTemplateValue> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const keys = Object.keys(value);
  return keys.some((key) =>
    RESPONSIVE_BREAKPOINT_ORDER.includes(key as ResponsiveBreakpointKey)
  );
}

/**
 * Projects responsive templates into private CSS parameters. The shared layout
 * stylesheet owns the media queries, so every Grid instance stays paint-free.
 */
export function projectResponsiveGrid(
  resolveTemplate: (
    value: ResponsiveGridTemplateValue | undefined
  ) => string | undefined,
  columns?: ResponsiveValue<ResponsiveGridTemplateValue>,
  rows?: ResponsiveValue<ResponsiveGridTemplateValue>
): {
  columns: Partial<Record<ResponsiveBreakpointKey, string>>;
  rows: Partial<Record<ResponsiveBreakpointKey, string>>;
  columnBreakpoints?: string;
  rowBreakpoints?: string;
} {
  const projectedColumns: Partial<Record<ResponsiveBreakpointKey, string>> = {};
  const projectedRows: Partial<Record<ResponsiveBreakpointKey, string>> = {};
  const columnBreakpoints: string[] = [];
  const rowBreakpoints: string[] = [];

  for (const breakpoint of RESPONSIVE_BREAKPOINT_ORDER) {
    const columnValue = resolveTemplate(columns?.[breakpoint]);
    const rowValue = resolveTemplate(rows?.[breakpoint]);

    if (columnValue) {
      projectedColumns[breakpoint] = columnValue;
      columnBreakpoints.push(breakpoint);
    }
    if (rowValue) {
      projectedRows[breakpoint] = rowValue;
      rowBreakpoints.push(breakpoint);
    }
  }

  return {
    columns: projectedColumns,
    rows: projectedRows,
    columnBreakpoints: columnBreakpoints.join(" ") || undefined,
    rowBreakpoints: rowBreakpoints.join(" ") || undefined,
  };
}
