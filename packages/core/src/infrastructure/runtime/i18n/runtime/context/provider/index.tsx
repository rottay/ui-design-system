'use client';

/**
 * @fileoverview I18n React context provider and consumer hook.
 *
 * Manages the active locale, translation function, and document directionality.
 * Translation resolution follows a three-tier fallback chain:
 *   1. Tenant custom translations (passed via `customTranslations` prop)
 *   2. Current locale dictionary
 *   3. Fallback locale dictionary (defaults to 'es')
 * If no match is found, the raw key is returned and a dev-only warning is logged.
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  SupportedLocale,
  I18nContextValue,
  TranslateFunction,
  LocaleConfig,
} from '@/foundation/i18n/kernel/contracts';
import {
  LOCALE_CONFIGS,
  TRANSLATION_CATALOG,
} from '@/foundation/i18n/runtime/catalog';
import { resolveTranslation } from '@/foundation/i18n/runtime/resolution';
import { warnOnceInDev } from '@/infrastructure/runtime/foundation/diagnostics/development-logging';
import type { I18nProviderProps } from '@/infrastructure/runtime/i18n/kernel/contracts';

/** React context carrying the current locale, config, and translate function. */
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/**
 * Wraps the React tree with i18n context providing locale state, a translation
 * function, and automatic `<html lang>` / `<html dir>` synchronization.
 *
 * The provider supports controlled locale changes from a parent (e.g.
 * DesignSystemProvider) while still exposing an imperative `setLocale()` for
 * in-app language switchers.
 */
export function I18nProvider({
  locale: initialLocale = 'es',
  fallbackLocale = 'es',
  customTranslations,
  onLocaleChange,
  children,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale);

  /**
   * The provider can now sit under DesignSystemProvider, so locale may change
   * when a tenant or explicit provider prop changes at runtime. We mirror the
   * controlled prop into local state to keep `setLocale()` working while still
   * honoring upstream updates.
   */
  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  // The translate function follows a three-tier resolution chain. Tenant
  // custom translations are checked first so whitelabel apps can override
  // any DS string without forking the locale dictionaries.
  const t: TranslateFunction = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const resolved = resolveTranslation({
        key,
        params,
        locale,
        fallbackLocale,
        customTranslations,
        catalog: TRANSLATION_CATALOG,
      });

      if (resolved !== undefined) return resolved;

      // Return the raw key as a last resort. The dev-only warning helps
      // translators find missing keys without breaking the UI.
      if (process.env.NODE_ENV !== 'test') {
        warnOnceInDev(
          `i18n:missing:${locale}:${key}`,
          `Translation not found for key: ${key}`
        );
      }
      return key;
    },
    [locale, fallbackLocale, customTranslations]
  );

  // Cambiar locale
  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      setLocaleState(newLocale);
      onLocaleChange?.(newLocale);
    },
    [onLocaleChange]
  );

  // Obtener configuración del locale actual
  const config: LocaleConfig = useMemo(() => LOCALE_CONFIGS[locale], [locale]);

  // Synchronize the HTML element's lang and dir attributes with the active locale.
  // This is necessary for CSS selectors like [dir="rtl"] (used by Arabic layout)
  // and for screen readers that use `lang` to pick the correct pronunciation engine.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = config.code;
      document.documentElement.dir = config.direction;
    }
  }, [config]);

  // Valor del contexto
  const value: I18nContextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      config,
    }),
    [locale, setLocale, t, config]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Reads the i18n context. Throws if called outside an `I18nProvider`.
 *
 * Prefer the narrower `useTranslation` / `useLocale` hooks for component code;
 * this hook is the low-level escape hatch when you need the full context value.
 */
export function useI18nContext(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }

  return context;
}

export { I18nContext };
