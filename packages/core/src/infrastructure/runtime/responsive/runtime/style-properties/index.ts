/**
 * Runtime projection of responsive prop values into scoped CSS properties.
 */

import {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  type ResponsiveBreakpointKey,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
import {
  RESPONSIVE_ALIAS_MAP,
  type ResponsiveValue,
} from '@/foundation/contracts/kernel/responsive/values';

/** Detects a breakpoint-keyed responsive value object. */
export function isResponsiveValue<T>(value: unknown): value is Exclude<ResponsiveValue<T>, T> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const validKeys = new Set([
    ...RESPONSIVE_BREAKPOINT_ORDER,
    'base',
    'phone',
    'tablet',
    'desktop',
  ]);

  return Object.keys(value).some((key) => validKeys.has(key));
}

/** A CSS property and its breakpoint-aware source value. */
export interface ResponsivePropEntry<T = string> {
  cssProperty: string;
  value: Exclude<ResponsiveValue<T>, T>;
  resolve?: (value: T) => string;
}

function normalizeResponsiveValue<T>(
  value: Exclude<ResponsiveValue<T>, T>,
): Partial<Record<ResponsiveBreakpointKey, T>> {
  const normalized: Partial<Record<ResponsiveBreakpointKey, T>> = {};

  for (const [key, rawValue] of Object.entries(value)) {
    if (rawValue === undefined) continue;

    const canonicalKey = RESPONSIVE_ALIAS_MAP[key] ?? key;
    if (!(canonicalKey in normalized) || !(key in RESPONSIVE_ALIAS_MAP)) {
      normalized[canonicalKey as ResponsiveBreakpointKey] = rawValue as T;
    }
  }

  return normalized;
}

/** Generates mobile-first, element-scoped CSS for responsive prop entries. */
export function generateResponsiveCSS(
  elementId: string,
  entries: ResponsivePropEntry<any>[],
): { css: string; attrs: Record<string, string> } {
  if (entries.length === 0) {
    return { css: '', attrs: {} };
  }

  const selector = `[data-responsive-id="${elementId}"]`;
  const attrs: Record<string, string> = { 'data-responsive-id': elementId };
  const declarationsByBreakpoint: Partial<Record<ResponsiveBreakpointKey, string[]>> = {};

  for (const entry of entries) {
    const normalized = normalizeResponsiveValue(entry.value);
    const resolve = entry.resolve ?? ((value: any) => String(value));

    for (const breakpoint of RESPONSIVE_BREAKPOINT_ORDER) {
      const rawValue = normalized[breakpoint];
      if (rawValue === undefined) continue;

      if (!declarationsByBreakpoint[breakpoint]) {
        declarationsByBreakpoint[breakpoint] = [];
      }
      declarationsByBreakpoint[breakpoint]!.push(
        `  ${entry.cssProperty}: ${resolve(rawValue)};`,
      );
    }
  }

  let css = '';
  const baseDeclarations = declarationsByBreakpoint.xs;
  if (baseDeclarations && baseDeclarations.length > 0) {
    css += `${selector} {\n${baseDeclarations.join('\n')}\n}\n`;
  }

  for (const breakpoint of RESPONSIVE_BREAKPOINT_ORDER) {
    if (breakpoint === 'xs') continue;

    const declarations = declarationsByBreakpoint[breakpoint];
    if (!declarations || declarations.length === 0) continue;

    css += `@media (min-width: ${RESPONSIVE_BREAKPOINTS[breakpoint]}px) {\n`;
    css += `  ${selector} {\n  ${declarations.join('\n  ')}\n  }\n`;
    css += '}\n';
  }

  return { css, attrs };
}

/** Returns a scalar prop value, excluding responsive objects. */
export function scalarOrUndefined<T>(
  value: ResponsiveValue<T> | undefined,
): T | undefined {
  if (value === undefined || value === null || isResponsiveValue(value)) {
    return undefined;
  }
  return value as T;
}

/** Returns a scalar prop value or a fallback when it is responsive/undefined. */
export function scalarOrDefault<T>(
  value: ResponsiveValue<T> | undefined,
  fallback: T,
): T {
  if (value === undefined || isResponsiveValue(value)) {
    return fallback;
  }
  return value as T;
}

export { RESPONSIVE_BREAKPOINTS, RESPONSIVE_BREAKPOINT_ORDER };
