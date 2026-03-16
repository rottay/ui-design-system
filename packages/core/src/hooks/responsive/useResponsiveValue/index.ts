/**
 * @fileoverview useResponsiveValue Hook - Rottay Design System
 * @description React hook for getting breakpoint-specific values using
 * Tailwind CSS mobile-first conventions.
 *
 * @remarks
 * Returns the appropriate value based on current viewport:
 * - Values cascade up (smaller values apply until overridden)
 * - SSR-safe (returns base value on server)
 * - Supports any value type (numbers, strings, objects, etc.)
 *
 * Breakpoints (min-width):
 * - base: 0px (required, always applies)
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 *
 * @example Responsive columns
 * ```tsx
 * const cols = useResponsiveValue({ base: 1, sm: 2, md: 3, lg: 4 });
 * ```
 *
 * @module System/Hooks/Responsive/useResponsiveValue
 * @category System
 * @package @rottay/design-system
 */
import { useMediaQuery } from '../useMediaQuery';
import { buildMinWidthQuery } from '../breakpoints';

/**
 * Responsive value configuration object
 */
export interface ResponsiveValueConfig<T> {
  /** Base value (always applies, mobile-first) */
  base: T;
  /** Value for small screens (640px+) */
  sm?: T;
  /** Value for medium screens (768px+) */
  md?: T;
  /** Value for large screens (1024px+) */
  lg?: T;
  /** Value for extra large screens (1280px+) */
  xl?: T;
  /** Value for 2x extra large screens (1536px+) */
  '2xl'?: T;
}

/**
 * Hook for responsive values based on viewport breakpoints.
 *
 * Follows Tailwind CSS mobile-first breakpoint system. Values cascade up,
 * meaning smaller breakpoint values apply until a larger breakpoint overrides them.
 * SSR-safe: returns the base value on the server.
 *
 * Breakpoints (min-width):
 * - base: 0px (always applies, required)
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 *
 * @example
 * ```tsx
 * import { useResponsiveValue } from '@rottay/design-system';
 *
 * function ResponsiveGrid() {
 *   // Adaptive columns: 1 on mobile, 2 on small, 3 on medium, 4 on large
 *   const columns = useResponsiveValue({ base: 1, sm: 2, md: 3, lg: 4 });
 *
 *   // Adaptive spacing
 *   const gap = useResponsiveValue({ base: 8, md: 16, lg: 24 });
 *
 *   // Adaptive font size
 *   const fontSize = useResponsiveValue({
 *     base: '14px',
 *     md: '16px',
 *     lg: '18px'
 *   });
 *
 *   return (
 *     <Grid columns={columns} gap={gap} style={{ fontSize }}>
 *       {children}
 *     </Grid>
 *   );
 * }
 * ```
 *
 * @param values - Object mapping breakpoint names to values. The `base` key is required.
 * @returns {T} The value for the current viewport breakpoint
 */
export function useResponsiveValue<T>(values: ResponsiveValueConfig<T>): T {
  // All five hooks MUST be called unconditionally to satisfy React's Rules of
  // Hooks (no conditional hook calls). Each hook subscribes to a min-width
  // media query, so on a 1400px viewport both isSm and isMd and isLg will
  // be true simultaneously. The if-chain below resolves this by checking
  // largest-first.
  const is2xl = useMediaQuery(buildMinWidthQuery('2xl'));
  const isXl = useMediaQuery(buildMinWidthQuery('xl'));
  const isLg = useMediaQuery(buildMinWidthQuery('lg'));
  const isMd = useMediaQuery(buildMinWidthQuery('md'));
  const isSm = useMediaQuery(buildMinWidthQuery('sm'));

  // Resolve the largest matching breakpoint that has a user-defined value.
  // This implements mobile-first cascade: if only `base` and `lg` are defined,
  // the `lg` value applies to xl and 2xl as well because those tiers lack an
  // explicit override. The `!== undefined` check allows falsy values like 0
  // or empty string to be valid breakpoint values.
  if (is2xl && values['2xl'] !== undefined) {
    return values['2xl'];
  }

  if (isXl && values.xl !== undefined) {
    return values.xl;
  }

  if (isLg && values.lg !== undefined) {
    return values.lg;
  }

  if (isMd && values.md !== undefined) {
    return values.md;
  }

  if (isSm && values.sm !== undefined) {
    return values.sm;
  }

  // `base` is always the final fallback and is required in the config type.
  // During SSR all media queries return false, so this guarantees a
  // deterministic server-side value that matches the mobile-first baseline.
  return values.base;
}
