/**
 * @fileoverview Shared responsive CSS generator for layout primitives
 * @description Generates mobile-first @media query CSS from ResponsiveValue<T>
 * prop objects. Used by Box, Flex, and Stack engines to inject scoped <style>
 * blocks when responsive props are detected.
 *
 * The pattern mirrors Grid's existing responsive.ts approach:
 * 1. Detect which props carry ResponsiveValue objects
 * 2. Generate scoped CSS keyed by a unique data attribute
 * 3. Inject a <style> tag alongside the element
 *
 * @module Layout/Shared/ResponsiveProps
 * @category Layout
 * @package @rottay/design-system
 */

import {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  type ResponsiveBreakpointKey,
} from '../../../../hooks/responsive/breakpoints';
import type { ResponsiveValue } from './types';
import { RESPONSIVE_ALIAS_MAP } from './types';

/**
 * Type guard that detects whether a value is a responsive object (not a
 * plain scalar). Checks for the presence of any valid breakpoint or alias
 * key in the object.
 */
export function isResponsiveValue<T>(value: unknown): value is Exclude<ResponsiveValue<T>, T> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value);
  const validKeys = new Set([
    ...RESPONSIVE_BREAKPOINT_ORDER,
    'base',
    'phone',
    'tablet',
    'desktop',
  ]);
  return keys.some((k) => validKeys.has(k));
}

/**
 * A single CSS property -> ResponsiveValue mapping that the generator
 * iterates over.
 */
export interface ResponsivePropEntry<T = string> {
  /** The CSS property name (e.g. 'padding', 'flex-direction') */
  cssProperty: string;
  /** The responsive value object from the component prop */
  value: Exclude<ResponsiveValue<T>, T>;
  /** Optional resolver to convert a prop value to a CSS value string */
  resolve?: (v: T) => string;
}

/**
 * Normalises a responsive value object by resolving aliases (base, phone,
 * tablet, desktop) into their canonical breakpoint keys (xs, sm, lg).
 * Canonical keys take precedence over aliases when both are present.
 */
function normaliseResponsiveValue<T>(
  value: Exclude<ResponsiveValue<T>, T>
): Partial<Record<ResponsiveBreakpointKey, T>> {
  const normalised: Partial<Record<ResponsiveBreakpointKey, T>> = {};

  for (const [key, val] of Object.entries(value)) {
    if (val === undefined) continue;
    const canonical = RESPONSIVE_ALIAS_MAP[key] ?? key;
    // Only set if the canonical key hasn't already been set directly
    if (!(canonical in normalised) || !(key in RESPONSIVE_ALIAS_MAP)) {
      normalised[canonical as ResponsiveBreakpointKey] = val as T;
    }
  }

  return normalised;
}

/**
 * Generates mobile-first CSS with @media queries for a set of responsive props.
 *
 * @param elementId - Unique identifier used in the CSS selector
 *   (e.g. `[data-responsive-id="<elementId>"]`)
 * @param entries - Array of CSS property / responsive value pairs
 * @returns An object with:
 *   - `css`: The generated CSS string (empty if no responsive props)
 *   - `attrs`: Data attributes to place on the target element
 */
export function generateResponsiveCSS(
  elementId: string,
  entries: ResponsivePropEntry<any>[]
): { css: string; attrs: Record<string, string> } {
  if (entries.length === 0) {
    return { css: '', attrs: {} };
  }

  const selector = `[data-responsive-id="${elementId}"]`;
  const attrs: Record<string, string> = { 'data-responsive-id': elementId };

  // Group resolved CSS declarations by breakpoint
  const declarationsByBreakpoint: Partial<Record<ResponsiveBreakpointKey, string[]>> = {};

  for (const entry of entries) {
    const normalised = normaliseResponsiveValue(entry.value);
    const resolve = entry.resolve ?? ((v: any) => String(v));

    for (const bp of RESPONSIVE_BREAKPOINT_ORDER) {
      const rawValue = normalised[bp];
      if (rawValue === undefined) continue;
      const cssValue = resolve(rawValue);
      if (!declarationsByBreakpoint[bp]) {
        declarationsByBreakpoint[bp] = [];
      }
      declarationsByBreakpoint[bp]!.push(`  ${entry.cssProperty}: ${cssValue};`);
    }
  }

  let css = '';

  // xs (base) declarations go without a media query
  const xsDecls = declarationsByBreakpoint.xs;
  if (xsDecls && xsDecls.length > 0) {
    css += `${selector} {\n${xsDecls.join('\n')}\n}\n`;
  }

  // Remaining breakpoints wrapped in @media (min-width: ...)
  for (const bp of RESPONSIVE_BREAKPOINT_ORDER) {
    if (bp === 'xs') continue;
    const decls = declarationsByBreakpoint[bp];
    if (!decls || decls.length === 0) continue;
    css += `@media (min-width: ${RESPONSIVE_BREAKPOINTS[bp]}px) {\n`;
    css += `  ${selector} {\n  ${decls.join('\n  ')}\n  }\n`;
    css += '}\n';
  }

  return { css, attrs };
}

export { RESPONSIVE_BREAKPOINTS, RESPONSIVE_BREAKPOINT_ORDER };
