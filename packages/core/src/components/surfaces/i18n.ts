'use client';

/**
 * Small translation helper for the surface layer.
 *
 * Surfaces all live under the same namespace inside `components.json`, so this
 * wrapper keeps call sites short and makes the translation keys predictable.
 */

import { useTranslation } from '../../theme/i18n';

export function useSurfaceTranslations(): {
  tSurface: (key: string, params?: Record<string, string | number>) => string;
} {
  const { t } = useTranslation('components');

  return {
    tSurface: (key, params) => t(`surfaces.${key}`, params),
  };
}
