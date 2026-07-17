/**
 * Breakpoint-aware value contracts shared by responsive UI capabilities.
 *
 * These types are supplier-neutral and contain no rendering or CSS behavior.
 */

type ResponsiveCanonicalValueKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * A value that can vary across responsive breakpoints.
 *
 * Scalar values apply at every viewport. Object values follow a mobile-first
 * cascade and may use either canonical breakpoint names or semantic aliases.
 */
export type ResponsiveValue<T> = T | {
  /** Extra-small/mobile baseline (0px). Alias: `phone`. */
  base?: T;
  /** Extra-small screens (0px), equivalent to `base`. */
  xs?: T;
  /** Small screens (640px+). Alias: `tablet`. */
  sm?: T;
  /** Medium screens (768px+). */
  md?: T;
  /** Large screens (1024px+). Alias: `desktop`. */
  lg?: T;
  /** Extra-large screens (1280px+). */
  xl?: T;
  /** Double-extra-large screens (1536px+). */
  '2xl'?: T;
  /** Semantic alias for the mobile baseline. */
  phone?: T;
  /** Semantic alias for `sm`. */
  tablet?: T;
  /** Semantic alias for `lg`. */
  desktop?: T;
};

/** Every key accepted by a responsive value object. */
export type ResponsiveValueKey =
  | ResponsiveCanonicalValueKey
  | 'base'
  | 'phone'
  | 'tablet'
  | 'desktop';

/** Maps semantic aliases to their canonical breakpoint keys. */
export const RESPONSIVE_ALIAS_MAP: Readonly<Record<string, ResponsiveCanonicalValueKey>> = {
  base: 'xs',
  phone: 'xs',
  tablet: 'sm',
  desktop: 'lg',
};
