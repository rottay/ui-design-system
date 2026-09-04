/**
 * Runtime projection of responsive prop values into scoped CSS properties.
 *
 * This is a productive assembler of CSS declaration text whose output every
 * primitive injects through a `<style dangerouslySetInnerHTML>` sink, so it
 * admits a declaration through the same value authority the theme pipeline's
 * emission layer uses rather than through a second grammar of its own.
 */

import {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  type ResponsiveBreakpointKey,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
import {
  RESPONSIVE_ALIAS_MAP,
  type ResponsiveValue,
  type ResponsiveValueKey,
} from '@/foundation/contracts/kernel/responsive/values';
import { isSafeCssValue } from '@/infrastructure/compilers/kernel/foundation/css/value-safety';

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

/**
 * The property names this assembler may declare.
 *
 * Standard properties and vendor prefixes are `[a-z-]+`; the primitives also
 * project custom properties, whose names carry the `_` and the digits that
 * form cannot spell. Neither branch admits a character that could terminate a
 * declaration, close the rule or leave the `<style>` element.
 */
const SAFE_PROPERTY_NAME = /^(?:[a-z-]+|--[a-z0-9_-]+)$/;

/**
 * The declaration priority flag, which CSS places after the value rather than
 * inside it. It is separated before the value authority judges what remains,
 * so `32px !important` is admitted exactly when `32px` is.
 */
const PRIORITY_FLAG = /\s*!\s*important$/i;

/**
 * True when both halves of a projected declaration are admissible.
 *
 * The value grammar is NOT restated here. `isSafeCssValue` is the same
 * authority the theme pipeline's emission layer consults, so a string that
 * cannot terminate a theme declaration cannot terminate one of these either --
 * and this assembler feeds a `<style dangerouslySetInnerHTML>` sink in every
 * primitive, so it needs exactly that guarantee. The dimension props are typed
 * as free strings and resolved with `String(value)`, which is the shape a
 * hostile value would arrive in.
 *
 * A resolver may also answer with something that is not a string at all: the
 * collectors' token lookups fail closed, but a prototype-inherited member name
 * resolves to a function, and a function body has no business in CSS text.
 *
 * Refuse, never repair: an inadmissible declaration is omitted whole, and an
 * admitted one is emitted byte-for-byte as its resolver produced it.
 */
function admitsDeclaration(property: unknown, value: unknown): value is string {
  if (typeof property !== 'string' || typeof value !== 'string') return false;
  return (
    SAFE_PROPERTY_NAME.test(property) &&
    isSafeCssValue(value.replace(PRIORITY_FLAG, ''))
  );
}

/** A CSS property and its breakpoint-aware source value. */
export interface ResponsivePropEntry<T = string> {
  cssProperty: string;
  value: Partial<Record<ResponsiveValueKey, T>>;
  resolve?: (value: T) => string;
}

function normalizeResponsiveValue<T>(
  value: Partial<Record<ResponsiveValueKey, T>>,
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
export function generateResponsiveCSS<T = string>(
  elementId: string,
  entries: ResponsivePropEntry<T>[],
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

      const declaredValue = resolve(rawValue);
      if (!admitsDeclaration(entry.cssProperty, declaredValue)) continue;

      if (!declarationsByBreakpoint[breakpoint]) {
        declarationsByBreakpoint[breakpoint] = [];
      }
      declarationsByBreakpoint[breakpoint]!.push(
        `  ${entry.cssProperty}: ${declaredValue};`,
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
