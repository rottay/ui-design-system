/**
 * Canonical icon token references used by runtime icon helpers.
 *
 * The public `@rottay/design-system/tokens` entry exposes a much broader token
 * catalog for consumers. Runtime code inside the core package should depend on
 * a tiny canonical source instead of importing that public mirror back into the
 * implementation, otherwise the public API becomes an accidental internal
 * dependency and dead-code cleanup gets much harder.
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
