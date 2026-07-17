'use client';

/**
 * @fileoverview Hook for reading and switching the active locale.
 *
 * Returns the current locale code, its full configuration (name, direction,
 * Intl locale strings), and a setter to change it at runtime.
 */

import type { LocaleConfig, SupportedLocale } from '@/foundation/i18n/kernel/contracts';
import { useI18nContext } from '@/infrastructure/runtime/i18n/runtime/context';

/**
 * Valor de retorno del hook useLocale
 */
export interface UseLocaleResult {
  /** Locale actual */
  locale: SupportedLocale;
  /** Cambiar locale */
  setLocale: (locale: SupportedLocale) => void;
  /** Configuración del locale actual */
  config: LocaleConfig;
}

/**
 * Hook para obtener y cambiar el locale actual
 *
 * @example
 * const { locale, setLocale, config } = useLocale();
 *
 * // Cambiar a inglés
 * setLocale('en');
 *
 * // Usar configuración
 * console.log(config.name); // => 'English'
 * console.log(config.direction); // => 'ltr'
 */
export function useLocale(): UseLocaleResult {
  const context = useI18nContext();

  return {
    locale: context.locale,
    setLocale: context.setLocale,
    config: context.config,
  };
}
