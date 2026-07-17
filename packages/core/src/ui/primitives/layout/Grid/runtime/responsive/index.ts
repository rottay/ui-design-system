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
} from '@/foundation/contracts/kernel/responsive/breakpoints';
import type { ResponsiveValue } from '../../contracts';

export { RESPONSIVE_BREAKPOINTS as GRID_BREAKPOINTS };
export type GridBreakpointKey = ResponsiveBreakpointKey;

export type ResponsiveGridTemplateValue = number | string | 'auto' | 'none';

/**
 * Detects the Grid-specific responsive object shape used by columns/rows.
 */
export function isResponsiveGridValue(
  value: unknown
): value is ResponsiveValue<ResponsiveGridTemplateValue> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const keys = Object.keys(value);
  return keys.some((key) => RESPONSIVE_BREAKPOINT_ORDER.includes(key as ResponsiveBreakpointKey));
}

/**
 * Generates mobile-first CSS for responsive grid templates.
 *
 * The caller supplies the template resolver because each engine can decide how
 * to represent template values, but the breakpoint loop remains shared.
 */
export function generateResponsiveGridCSS(
  gridId: string,
  resolveTemplate: (value: ResponsiveGridTemplateValue | undefined) => string | undefined,
  columns?: ResponsiveValue<ResponsiveGridTemplateValue>,
  rows?: ResponsiveValue<ResponsiveGridTemplateValue>
): string {
  let css = '';

  const xsColumns = resolveTemplate(columns?.xs);
  const xsRows = resolveTemplate(rows?.xs);

  if (xsColumns || xsRows) {
    css += `[data-grid-id="${gridId}"] {\n`;
    if (xsColumns) {
      css += `  grid-template-columns: ${xsColumns};\n`;
    }
    if (xsRows) {
      css += `  grid-template-rows: ${xsRows};\n`;
    }
    css += '}\n';
  }

  for (const breakpoint of RESPONSIVE_BREAKPOINT_ORDER) {
    if (breakpoint === 'xs') {
      continue;
    }

    const columnValue = resolveTemplate(columns?.[breakpoint]);
    const rowValue = resolveTemplate(rows?.[breakpoint]);

    if (!columnValue && !rowValue) {
      continue;
    }

    css += `@media (min-width: ${RESPONSIVE_BREAKPOINTS[breakpoint]}px) {\n`;
    css += `  [data-grid-id="${gridId}"] {\n`;
    if (columnValue) {
      css += `    grid-template-columns: ${columnValue};\n`;
    }
    if (rowValue) {
      css += `    grid-template-rows: ${rowValue};\n`;
    }
    css += '  }\n';
    css += '}\n';
  }

  return css;
}
