'use client';

/**
 * @fileoverview I18n React context provider and consumer hook.
 *
 * Manages the active locale, translation functions, and directionality.
 *
 * Translation resolution follows a three-tier chain — tenant overrides, the
 * active locale, then the CONFIGURED fallback locale — implemented once in
 * `resolveTranslationEntry`. When every tier misses, `t()` echoes the raw key
 * (a rendering floor, kept for compatibility) while `tOr()` returns the
 * caller's own floor. There is no fourth tier: the design system never hops to
 * English behind a configured fallback.
 *
 * DIRECTIONALITY. `<html>` owns direction, and `<html>` belongs to the
 * application: only it exists in the server HTML before React runs, and only
 * it makes UA chrome (scrollbar side, native controls, `:dir()` across the
 * whole document) follow the locale. Applications therefore spread
 * `resolveDocumentLocaleAttributes(locale)` onto their own `<html>` in a
 * server layout — that, not this provider, is what removes the LTR-first-paint
 * flip. This provider then:
 *   - carries `direction` in context so components stop re-deriving it from
 *     the DOM (`closest('[dir]')` / `getComputedStyle().direction`), neither of
 *     which exists during SSR;
 *   - can render its own direction scope element (`directionScope="element"`)
 *     for the cases `<html>` cannot serve: a design system mounted inside a
 *     shell it does not control, or a locale ISLAND whose direction differs
 *     from the document's;
 *   - keeps syncing `documentElement` so a client-side locale switch, and an
 *     application that has not wired its `<html>` yet, still converge.
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  SupportedLocale,
  I18nContextValue,
  TranslateFunction,
  TranslateOrFunction,
  LocaleConfig,
} from '@/foundation/i18n/kernel/contracts';
import {
  DEFAULT_FALLBACK_LOCALE,
  DEFAULT_LOCALE,
} from '@/foundation/i18n/kernel/contracts';
import {
  LOCALE_CONFIGS,
  TRANSLATION_CATALOG,
} from '@/foundation/i18n/runtime/catalog';
import {
  interpolateTranslation,
  resolveTranslationEntry,
} from '@/foundation/i18n/runtime/resolution';
import { warnOnceInDev } from '@/infrastructure/runtime/foundation/diagnostics/development-logging';
import type { I18nProviderProps } from '@/infrastructure/runtime/i18n/kernel/contracts';

/** React context carrying the current locale, config, direction, and translate functions. */
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/**
 * Layout-transparent: the scope element exists to carry `dir`/`lang` into the
 * server HTML, not to introduce a box. `display: contents` keeps its children
 * in the parent's flex/grid formatting context, and inheritance of `direction`
 * and language is unaffected by it.
 */
const DIRECTION_SCOPE_STYLE = { display: 'contents' } as const;

/**
 * Wraps the React tree with i18n context providing locale state, translation
 * functions, the active text direction, and `<html lang>` / `<html dir>`
 * synchronization.
 *
 * The provider supports controlled locale changes from a parent (e.g.
 * DesignSystemProvider) while still exposing an imperative `setLocale()` for
 * in-app language switchers.
 */
export function I18nProvider({
  locale: initialLocale = DEFAULT_LOCALE,
  fallbackLocale = DEFAULT_FALLBACK_LOCALE,
  customTranslations,
  onLocaleChange,
  directionScope = 'none',
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

  // Tenant custom translations are checked first so whitelabel apps can
  // override any DS string without forking the locale dictionaries.
  const resolve = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      resolveTranslationEntry({
        key,
        params,
        locale,
        fallbackLocale,
        customTranslations,
        catalog: TRANSLATION_CATALOG,
      }),
    [locale, fallbackLocale, customTranslations]
  );

  const t: TranslateFunction = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const resolution = resolve(key, params);
      if (resolution.tier !== 'missing') return resolution.value;

      // Return the raw key as a last resort. The dev-only warning helps
      // translators find missing keys without breaking the UI. Callers that
      // need to DETECT this case must use `tOr` — the echoed key is a
      // rendering floor, not a miss signal, and cannot be told apart from a
      // translation by inspecting the string.
      if (process.env.NODE_ENV !== 'test') {
        warnOnceInDev(
          `i18n:missing:${locale}:${key}`,
          `Translation not found for key: ${key}`
        );
      }
      return key;
    },
    [locale, resolve]
  );

  const tOr: TranslateOrFunction = useCallback(
    (key: string, fallback: string, params?: Record<string, string | number>) => {
      const resolution = resolve(key, params);
      return resolution.tier === 'missing'
        ? interpolateTranslation(fallback, params)
        : resolution.value;
    },
    [resolve]
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

  // Converge the HTML element with the active locale. With the application's
  // server layout already emitting the same pair, this is a no-op on first
  // paint and only does real work on a client-side locale switch.
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
      fallbackLocale,
      setLocale,
      t,
      tOr,
      config,
      direction: config.direction,
    }),
    [locale, fallbackLocale, setLocale, t, tOr, config]
  );

  // Rendered identically on server and client — both derive `lang`/`dir` from
  // the same `locale` prop — so the scope element never causes a hydration
  // mismatch.
  const scoped =
    directionScope === 'element' ? (
      <div lang={config.code} dir={config.direction} style={DIRECTION_SCOPE_STYLE}>
        {children}
      </div>
    ) : (
      children
    );

  return (
    <I18nContext.Provider value={value}>
      {scoped}
    </I18nContext.Provider>
  );
}

/**
 * Reads the i18n context. Throws if called outside an `I18nProvider`.
 *
 * Prefer the narrower `useTranslation` / `useLocale` / `useDirection` hooks for
 * component code; this hook is the low-level escape hatch when you need the
 * full context value.
 */
export function useI18nContext(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }

  return context;
}

export { I18nContext };
