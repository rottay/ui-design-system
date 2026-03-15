/**
 * @fileoverview Shared responsive breakpoint constants
 * @description Central source of truth for viewport breakpoints used by hooks,
 * layout primitives, and surface helpers.
 *
 * Keeping breakpoints in one file avoids the drift that previously existed
 * between hooks (Tailwind-style values) and Grid engines (older Ant-style
 * values). Multi-engine parity is only credible if all responsive code reads
 * from the same scale.
 */

export const RESPONSIVE_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type ResponsiveBreakpointKey = keyof typeof RESPONSIVE_BREAKPOINTS;

export const RESPONSIVE_BREAKPOINT_ORDER: readonly ResponsiveBreakpointKey[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
];

/**
 * Builds a min-width media query from the shared breakpoint scale.
 */
export function buildMinWidthQuery(breakpoint: Exclude<ResponsiveBreakpointKey, 'xs'>): string {
  return `(min-width: ${RESPONSIVE_BREAKPOINTS[breakpoint]}px)`;
}

/**
 * Builds a bounded media query for range-based helpers such as useBreakpoints().
 */
export function buildRangeQuery(
  min: Exclude<ResponsiveBreakpointKey, 'xs'> | 'xs',
  max: Exclude<ResponsiveBreakpointKey, 'xs'>
): string {
  const minWidth = RESPONSIVE_BREAKPOINTS[min];
  const maxWidth = RESPONSIVE_BREAKPOINTS[max] - 1;

  if (min === 'xs') {
    return `(max-width: ${maxWidth}px)`;
  }

  return `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`;
}
