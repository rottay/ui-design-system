/**
 * @fileoverview Shared responsive breakpoint constants - Rottay Design System
 * @description Central source of truth for viewport breakpoints used by hooks,
 * layout primitives, and surface helpers. All responsive code across the design
 * system reads from this single scale to guarantee multi-engine parity.
 *
 * Keeping breakpoints in one file avoids the drift that previously existed
 * between hooks (Tailwind-style values) and Grid engines (older Ant-style
 * values). Multi-engine parity is only credible if all responsive code reads
 * from the same scale.
 *
 * @example Building queries for custom responsive logic
 * ```ts
 * import { buildMinWidthQuery, buildRangeQuery } from '@rottay/design-system';
 *
 * const tabletOnly = buildRangeQuery('sm', 'lg'); // '(min-width: 640px) and (max-width: 1023px)'
 * const desktop = buildMinWidthQuery('lg');        // '(min-width: 1024px)'
 * ```
 *
 * @module System/Hooks/Responsive/Breakpoints
 * @category System
 * @package @rottay/design-system
 */

/**
 * Pixel values for each breakpoint tier, matching Tailwind CSS defaults.
 * `xs` is 0 so it acts as the implicit mobile-first baseline (no media query needed).
 *
 * @remarks Values are `as const` so TypeScript narrows them to literal number types,
 * enabling exhaustive pattern matching in downstream helpers.
 */
export const RESPONSIVE_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/** Union of all valid breakpoint key names. */
export type ResponsiveBreakpointKey = keyof typeof RESPONSIVE_BREAKPOINTS;

/**
 * Breakpoint keys sorted from smallest to largest. Used by cascade logic
 * in useResponsiveValue to resolve the highest matching breakpoint.
 */
export const RESPONSIVE_BREAKPOINT_ORDER: readonly ResponsiveBreakpointKey[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
];

/**
 * Builds a `min-width` media query string from the shared breakpoint scale.
 * Used by useResponsiveValue to create mobile-first media queries for each tier.
 *
 * @param breakpoint - A breakpoint key above `xs` (xs is 0px, so a min-width
 *   query for it would always match and is meaningless).
 * @returns A CSS media query string, e.g. `'(min-width: 768px)'`
 *
 * @example
 * ```ts
 * buildMinWidthQuery('md'); // '(min-width: 768px)'
 * buildMinWidthQuery('xl'); // '(min-width: 1280px)'
 * ```
 */
export function buildMinWidthQuery(breakpoint: Exclude<ResponsiveBreakpointKey, 'xs'>): string {
  return `(min-width: ${RESPONSIVE_BREAKPOINTS[breakpoint]}px)`;
}

/**
 * Builds a bounded (range) media query for detecting a specific breakpoint tier.
 * Used by useBreakpoints to distinguish mobile vs tablet vs desktop exclusively.
 *
 * @remarks The max boundary is `breakpointValue - 1` to avoid overlap between
 * adjacent ranges. When `min` is `'xs'`, only a max-width constraint is emitted
 * since the lower bound is 0px.
 *
 * @param min - Lower breakpoint bound (inclusive). Pass `'xs'` for a range starting at 0.
 * @param max - Upper breakpoint bound (exclusive). The query uses `max - 1` to avoid overlap.
 * @returns A CSS media query string for the bounded range.
 *
 * @example
 * ```ts
 * buildRangeQuery('xs', 'sm');  // '(max-width: 639px)'            -> mobile
 * buildRangeQuery('sm', 'lg');  // '(min-width: 640px) and (max-width: 1023px)' -> tablet
 * ```
 */
export function buildRangeQuery(
  min: Exclude<ResponsiveBreakpointKey, 'xs'> | 'xs',
  max: Exclude<ResponsiveBreakpointKey, 'xs'>
): string {
  const minWidth = RESPONSIVE_BREAKPOINTS[min];
  // Subtract 1 to avoid overlap: if 'sm' starts at 640, 'xs' range ends at 639
  const maxWidth = RESPONSIVE_BREAKPOINTS[max] - 1;

  // When starting from xs (0px), a min-width: 0px constraint is redundant
  if (min === 'xs') {
    return `(max-width: ${maxWidth}px)`;
  }

  return `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`;
}
