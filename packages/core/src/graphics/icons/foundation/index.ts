/**
 * @fileoverview Canonical icon token references used by runtime icon helpers.
 *
 * The package-internal `src/foundation/tokens/` module holds a much broader token catalog,
 * but runtime code inside the core package should depend on a tiny canonical
 * source instead of importing the broader catalog back into the implementation.
 * Otherwise the catalog becomes an accidental dependency cycle and dead-code
 * cleanup gets much harder.
 */

export const ICON_SIZE_TOKENS = {
  xs: 'var(--ds-icon-xs-size)',
  sm: 'var(--ds-icon-sm-size)',
  md: 'var(--ds-icon-md-size)',
  lg: 'var(--ds-icon-lg-size)',
  xl: 'var(--ds-icon-xl-size)',
  '2xl': 'var(--ds-icon-2xl-size)',
} as const;

export type IconSizeToken = keyof typeof ICON_SIZE_TOKENS;
