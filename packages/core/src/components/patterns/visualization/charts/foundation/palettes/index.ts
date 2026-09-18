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
