import { useMediaQuery } from '../useMediaQuery';

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
 * Hook para valores responsivos basados en breakpoints.
 * Sigue el sistema mobile-first de Tailwind CSS.
 *
 * Breakpoints (min-width):
 * - base: 0px (siempre aplica)
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 *
 * @param values - Object con valores por breakpoint
 * @returns El valor apropiado para el breakpoint actual
 *
 * @example
 * ```tsx
 * // Columns adaptables
 * const columns = useResponsiveValue({ base: 1, sm: 2, md: 3, lg: 4 });
 *
 * // Spacing adaptable
 * const gap = useResponsiveValue({ base: 8, md: 16, lg: 24 });
 *
 * // Texto adaptable
 * const fontSize = useResponsiveValue({
 *   base: '14px',
 *   md: '16px',
 *   lg: '18px'
 * });
 *
 * return <Grid columns={columns} gap={gap} fontSize={fontSize} />;
 * ```
 */
export function useResponsiveValue<T>(values: ResponsiveValueConfig<T>): T {
  // Check breakpoints from largest to smallest (cascade)
  // This ensures we get the most specific match
  const is2xl = useMediaQuery('(min-width: 1536px)');
  const isXl = useMediaQuery('(min-width: 1280px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isSm = useMediaQuery('(min-width: 640px)');

  // Return the most specific value that matches
  // Fall back to base if no breakpoint matches
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

  // Always return base as fallback
  return values.base;
}
