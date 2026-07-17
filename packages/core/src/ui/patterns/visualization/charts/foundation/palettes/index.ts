/** Runtime values and operations separated from the public type contract. */

/**
 * Restrained legacy categorical fallback. The React-owned kernel resolves a
 * theme-aware/provider-scoped channel instead; this concrete sequence remains
 * for imperative families and SSR fallbacks while they migrate. It excludes
 * raw black and bright yellow because each disappears on a supported surface.
 */
export const ACCESSIBLE_COLORS = [
  '#2F6B9A',
  '#A23B72',
  '#1F7A55',
  '#9A5700',
  '#355CB5',
  '#7A4595',
  '#5F6368',
  '#006D77',
  '#9B4A5A',
  '#4D6A00',
];

/**
 * Default 10-color palette for a no-config legacy chart. Status tokens are
 * not reused as arbitrary categories. New kernel renderers additionally map
 * the same channel through provider-scoped light/dark variables.
 */
export const DEFAULT_COLORS = ACCESSIBLE_COLORS;

/** Lighter, softer tones for dashboards that favor a calm aesthetic */
export const PASTEL_COLORS = [
  'var(--ds-color-primary-200)',
  'var(--ds-color-info-200)',
  'var(--ds-color-success-200)',
  'var(--ds-color-warning-200)',
  'var(--ds-color-error-200)',
  'var(--ds-color-secondary-200)',
  'var(--ds-color-primary-100)',
  'var(--ds-color-info-100)',
  'var(--ds-color-success-100)',
  'var(--ds-color-secondary-100)',
];

/** High-saturation palette for bold, attention-grabbing charts */
export const VIBRANT_COLORS = [
  'var(--ds-color-primary-700)',
  'var(--ds-color-info-700)',
  'var(--ds-color-success-700)',
  'var(--ds-color-warning-700)',
  'var(--ds-color-error-700)',
  'var(--ds-color-secondary-700)',
  'var(--ds-color-primary-600)',
  'var(--ds-color-info-600)',
  'var(--ds-color-success-600)',
  'var(--ds-color-secondary-600)',
];

/** Single-hue scale derived from the tenant primary color */
export const MONOCHROME_COLORS = [
  'var(--ds-color-primary-900)',
  'var(--ds-color-primary-700)',
  'var(--ds-color-primary-600)',
  'var(--ds-color-primary-500)',
  'var(--ds-color-primary-400)',
  'var(--ds-color-primary-300)',
  'var(--ds-color-primary-200)',
  'var(--ds-color-primary-100)',
  'var(--ds-color-primary-50)',
  'var(--ds-color-primary-800)',
];

/** Map from colorScheme name to the corresponding palette */
export const COLOR_SCHEME_MAP: Record<string, string[]> = {
  default: DEFAULT_COLORS,
  pastel: PASTEL_COLORS,
  vibrant: VIBRANT_COLORS,
  monochrome: MONOCHROME_COLORS,
  accessible: ACCESSIBLE_COLORS,
};
