/**
 * Breakpoint-aware value contracts shared by responsive UI capabilities.
 *
 * These types are supplier-neutral and contain no rendering or CSS behavior.
 * THE contract: one `ResponsiveValue`, one alias map, one pure resolution, read
 * identically by the React hook, by the CSS channel projection and by any
 * container-measured consumer that supplies its own breakpoint.
 */

import {
  RESPONSIVE_BREAKPOINT_ORDER,
  type ResponsiveBreakpointKey,
} from '../breakpoints';

type ResponsiveCanonicalValueKey = ResponsiveBreakpointKey;

/**
 * A value that can vary across responsive breakpoints.
 *
 * Scalar values apply at every viewport. Object values follow a mobile-first
 * cascade and may use either canonical breakpoint names or semantic aliases.
 */
export type ResponsiveValue<T> = T | ResponsiveValueObject<T>;

/** The breakpoint-keyed half of `ResponsiveValue`, without the scalar form. */
export interface ResponsiveValueObject<T> {
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
}

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

const RESPONSIVE_VALUE_KEYS: ReadonlySet<string> = new Set<string>([
  ...RESPONSIVE_BREAKPOINT_ORDER,
  ...Object.keys(RESPONSIVE_ALIAS_MAP),
]);

/**
 * Detects a breakpoint-keyed responsive value object.
 *
 * An object is responsive when it carries at least one governed key and no
 * foreign one: `{ base: 1, md: 2 }` is a ladder, while a domain object that
 * happens to own an `sm` member is not, and treating it as one would silently
 * discard everything else it carries.
 */
export function isResponsiveValue<T>(
  value: unknown,
): value is ResponsiveValueObject<T> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value);
  return (
    keys.length > 0 && keys.every((key) => RESPONSIVE_VALUE_KEYS.has(key))
  );
}

/**
 * Canonicalises alias keys onto the breakpoint ladder.
 *
 * A canonical key always outranks an alias for the same step, so
 * `{ xs: 'a', phone: 'b' }` resolves to `a` deterministically instead of
 * depending on property order.
 */
export function normalizeResponsiveValue<T>(
  value: ResponsiveValueObject<T>,
): Partial<Record<ResponsiveBreakpointKey, T>> {
  const normalized: Partial<Record<ResponsiveBreakpointKey, T>> = {};

  for (const [key, rawValue] of Object.entries(value) as [
    ResponsiveValueKey,
    T | undefined,
  ][]) {
    if (rawValue === undefined) continue;
    const canonical = (RESPONSIVE_ALIAS_MAP[key] ?? key) as ResponsiveBreakpointKey;
    const isAlias = key in RESPONSIVE_ALIAS_MAP && key !== canonical;
    if (canonical in normalized && isAlias) continue;
    normalized[canonical] = rawValue;
  }

  return normalized;
}

/**
 * THE resolution of a `ResponsiveValue` at one breakpoint. Pure: the caller
 * supplies the step, so a viewport hook and a container-measured consumer share
 * one cascade instead of owning two.
 *
 * Mobile-first: the answer is the declared value at the active step, or the
 * nearest declared step below it. `undefined` means the ladder declares nothing
 * at or below that step.
 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
  breakpoint: ResponsiveBreakpointKey,
): T | undefined {
  if (value === undefined) return undefined;
  if (!isResponsiveValue<T>(value)) return value as T;

  const normalized = normalizeResponsiveValue(value);
  const activeIndex = RESPONSIVE_BREAKPOINT_ORDER.indexOf(breakpoint);
  const from = activeIndex < 0 ? RESPONSIVE_BREAKPOINT_ORDER.length - 1 : activeIndex;

  for (let step = from; step >= 0; step -= 1) {
    const candidate = normalized[RESPONSIVE_BREAKPOINT_ORDER[step]];
    if (candidate !== undefined) return candidate;
  }

  return undefined;
}

/** Returns a scalar value, excluding breakpoint-keyed objects. */
export function scalarOrUndefined<T>(
  value: ResponsiveValue<T> | undefined,
): T | undefined {
  if (value === undefined || value === null || isResponsiveValue(value)) {
    return undefined;
  }
  return value as T;
}

/** Returns a scalar value or a fallback when it is responsive/undefined. */
export function scalarOrDefault<T>(
  value: ResponsiveValue<T> | undefined,
  fallback: T,
): T {
  if (value === undefined || isResponsiveValue(value)) {
    return fallback;
  }
  return value as T;
}
