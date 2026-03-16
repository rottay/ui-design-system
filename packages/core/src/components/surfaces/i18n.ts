'use client';

/**
 * @fileoverview Surface translation helper -- Rottay Design System.
 *
 * @description Wraps `useTranslation('components')` to scope all surface
 * translation keys under `surfaces.*`. Keeps call sites short and keys
 * predictable across the surface catalog.
 *
 * All surface components that render user-visible strings should use the
 * `tSurface` function returned by this hook instead of calling `t()`
 * directly. This ensures the `surfaces.` prefix is applied consistently
 * and avoids key collisions with non-surface component translations.
 *
 * @example
 * ```tsx
 * const { tSurface } = useSurfaceTranslations();
 * // resolves to t('components:surfaces.list.emptyTitle')
 * const title = tSurface('list.emptyTitle');
 * // with interpolation: t('components:surfaces.list.showing', { count: 5 })
 * const subtitle = tSurface('list.showing', { count: 5 });
 * ```
 */

import { useTranslation } from '../../i18n';

/**
 * Returns a scoped translation function for surface components.
 *
 * The returned `tSurface` automatically prefixes all keys with `surfaces.`
 * within the `components` i18n namespace, so surfaces can use short keys
 * like `'list.emptyTitle'` instead of the full `'surfaces.list.emptyTitle'`.
 *
 * @returns Object containing the `tSurface` translation function.
 */
export function useSurfaceTranslations(): {
  tSurface: (key: string, params?: Record<string, string | number>) => string;
} {
  const { t } = useTranslation('components');

  // Prefix every key with `surfaces.` so surface components only need to
  // provide the relative key path (e.g., 'list.noResults').
  return {
    tSurface: (key, params) => t(`surfaces.${key}`, params),
  };
}
