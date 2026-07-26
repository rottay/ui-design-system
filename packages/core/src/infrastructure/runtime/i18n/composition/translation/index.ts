"use client";

/**
 * @fileoverview Hook for accessing the translation function with optional namespace scoping.
 *
 * When a namespace is provided, keys are automatically prefixed so component code
 * can use short keys like `t('avatar.loading')` instead of `t('components.avatar.loading')`.
 */

import { useCallback } from "react";
import type {
  TranslateFunction,
  TranslateOrFunction,
  TranslationNamespace,
} from "@/foundation/i18n/kernel/contracts";
import { useI18nContext } from "@/infrastructure/runtime/i18n/runtime/context";

/**
 * Valor de retorno del hook useTranslation
 */
export interface UseTranslationResult {
  /** Función de traducción */
  t: TranslateFunction;
  /**
   * Translation with a caller-owned floor, used when a missing key must never
   * reach the UI — an `aria-label` of `components.rate.label` is worse than an
   * untranslated one.
   *
   * Prefer this over comparing `t()`'s result to the key: the echoed key is a
   * rendering floor, not a miss signal, so that comparison has to guess the
   * namespace prefix and cannot tell a genuine miss from a translation that
   * equals its key.
   */
  tOr: TranslateOrFunction;
  /** Locale actual */
  locale: string;
}

/**
 * Hook para obtener la función de traducción con namespace opcional
 *
 * @example
 * // Sin namespace
 * const { t, locale } = useTranslation();
 * t('common.yes'); // => 'Sí'
 *
 * @example
 * // Con namespace
 * const { t } = useTranslation('components');
 * t('avatar.loading'); // => 'Cargando avatar...'
 *
 * @example
 * // Con interpolación
 * const { t } = useTranslation('components');
 * t('pagination.page', { current: 1, total: 10 }); // => 'Página 1 de 10'
 */
export function useTranslation(
  namespace?: TranslationNamespace
): UseTranslationResult {
  const context = useI18nContext();

  // Prefix the key with the namespace so component code can use short keys
  // (e.g., t('avatar.loading')) while the underlying dictionary is organized
  // by top-level namespace (e.g., 'components.avatar.loading').
  const t: TranslateFunction = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return context.t(fullKey, params);
    },
    [context.t, namespace]
  );

  const tOr: TranslateOrFunction = useCallback(
    (key: string, fallback: string, params?: Record<string, string | number>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return context.tOr(fullKey, fallback, params);
    },
    [context.tOr, namespace]
  );

  return {
    t,
    tOr,
    locale: context.locale,
  };
}

/**
 * Non-throwing translation hook for primitives that retain a standalone
 * rendering contract. Under an I18nProvider it resolves the active locale and
 * tenant overrides exactly like `useTranslation`; without one it returns
 * `null`, allowing the primitive to use its documented English accessibility
 * fallback instead of crashing before an app provider is mounted.
 */
export function useOptionalTranslation(
  namespace?: TranslationNamespace
): UseTranslationResult | null {
  // Keep the hook call unconditional. `useTranslation` only throws when its
  // context is absent, so the catch path is a provider-presence fallback, not
  // conditional hook execution.
  try {
    return useTranslation(namespace);
  } catch {
    return null;
  }
}
