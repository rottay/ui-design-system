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
  I18nProviderProps,
  I18nContextValue,
  TranslateFunction,
  LocaleConfig,
} from '../../types';
import { LOCALE_CONFIGS } from '../../types';
import { es, en, pt, fr, ar } from '../../locales';
import { warnOnceInDev } from '../../../_internal/utils/runtime-logger';

/** Lookup table mapping each supported locale to its translation dictionary. */
const TRANSLATIONS = {
  es,
  en,
  pt,
  fr,
  ar,
};

/** React context carrying the current locale, config, and translate function. */
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/**
 * Resolves a nested value from an object using dot-notation path.
 *
 * @param obj  - Translation dictionary (or nested sub-object)
 * @param path - Dot-separated key, e.g. 'components.avatar.loading'
 * @returns The resolved string, or undefined if the path is invalid
 */
function getValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Replaces `{placeholder}` tokens in a template with provided parameter values.
 *
 * @param template - String containing `{key}` placeholders
 * @param params   - Key/value pairs to substitute
 * @returns The interpolated string
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
}

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
      // 1. Tenant custom translations (highest priority). These are provided by
      // the platform layer and can override any built-in DS string.
      if (customTranslations) {
        const customValue = getValue(customTranslations, key);
        if (customValue) {
          return interpolate(customValue, params);
        }
      }

      // 2. Current locale dictionary
      const currentTranslations = TRANSLATIONS[locale];
      const value = getValue(currentTranslations, key);
      if (value) {
        return interpolate(value, params);
      }

      // 3. Fallback locale. This prevents blank UI when a translation has not
      // yet been added to a newly supported language.
      if (locale !== fallbackLocale) {
        const fallbackTranslations = TRANSLATIONS[fallbackLocale];
        const fallbackValue = getValue(fallbackTranslations, key);
        if (fallbackValue) {
          return interpolate(fallbackValue, params);
        }
      }

      // 4. Return the raw key as a last resort. The dev-only warning helps
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
