/**
 * @fileoverview Type definitions for the i18n subsystem.
 *
 * Defines the supported locales, locale configuration shape, translation
 * namespaces, and the provider/context interfaces consumed by hooks and
 * components throughout the design system.
 */

/**
 * Canonical locale set supported by the design system.
 */
export const SUPPORTED_LOCALES = ['es', 'en', 'pt', 'fr', 'ar'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * The design system's configured locale — the answer to "which language do we
 * render when the caller names none?".
 *
 * Every default in the subsystem resolves through this ONE declaration:
 * `I18nProvider`'s `locale` default, its `fallbackLocale` default, and the
 * normalization fallback in `toSupportedLocale`. Before this existed, locale
 * normalization defaulted to `'en'` while translation fell back to `'es'`, so
 * two different implicit languages were in force at once depending on which
 * function you happened to call.
 */
export const DEFAULT_LOCALE: SupportedLocale = 'es';

/**
 * The configured fallback locale, consulted when the active locale has no copy
 * for a key.
 *
 * This is CONFIGURATION, not a universal law: an application that passes
 * `fallbackLocale` to `I18nProvider` overrides it, and the resolution chain
 * honours whatever it is given. The design system never silently hops to
 * English behind a configured fallback — if the configured fallback also has
 * no copy for a key, the lookup MISSES. Anything else would make the
 * application's declared language policy advisory.
 */
export const DEFAULT_FALLBACK_LOCALE: SupportedLocale = DEFAULT_LOCALE;

/**
 * Dirección del texto.
 */
export type TextDirection = 'ltr' | 'rtl';

/**
 * Configuración de locale.
 */
export interface LocaleConfig {
  /** Código del locale (es, en, etc.) */
  code: SupportedLocale;
  /** Nombre del idioma en ese idioma */
  name: string;
  /** Dirección del texto */
  direction: TextDirection;
  /** Locale para formateo de fechas (Intl) */
  dateLocale: string;
  /** Locale para formateo de números (Intl) */
  numberLocale: string;
}

/**
 * Namespace de traducciones.
 */
export type TranslationNamespace = 'common' | 'components' | 'errors' | 'validation';

/**
 * Función de traducción.
 *
 * Returns the raw key when every tier misses. That echo is a legacy rendering
 * contract, not a resolution result: callers that need to KNOW whether a key
 * resolved must use `tOr` or `resolveTranslationEntry`, never a string
 * comparison against the key.
 */
export type TranslateFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;

/**
 * Translation with an explicit caller-owned floor.
 *
 * `fallback` is returned only when the lookup genuinely MISSES every tier —
 * never because the resolved string happens to look like the key. It is
 * interpolated with the same params as a catalog hit, so a floor may carry
 * placeholders.
 */
export type TranslateOrFunction = (
  key: string,
  fallback: string,
  params?: Record<string, string | number>
) => string;

/**
 * Which tier of the resolution chain answered a lookup.
 *
 * - `custom`   — tenant `customTranslations` override
 * - `locale`   — the active locale's dictionary
 * - `fallback` — the CONFIGURED fallback locale's dictionary
 * - `missing`  — no tier had copy for the key
 */
export type TranslationTier = 'custom' | 'locale' | 'fallback' | 'missing';

/**
 * Structured lookup result. The discriminant makes a miss a first-class value
 * instead of a string that has to be sniffed: `tier === 'missing'` is the only
 * correct miss test.
 */
export type TranslationResolution =
  | { readonly tier: Exclude<TranslationTier, 'missing'>; readonly value: string }
  | { readonly tier: 'missing'; readonly value: undefined };

/**
 * Contexto de i18n.
 */
export interface I18nContextValue {
  /** Locale actual */
  locale: SupportedLocale;
  /** The configured fallback locale actually in force for this provider. */
  fallbackLocale: SupportedLocale;
  /** Cambiar locale */
  setLocale: (locale: SupportedLocale) => void;
  /** Función de traducción */
  t: TranslateFunction;
  /** Translation with an explicit floor for a genuine miss. */
  tOr: TranslateOrFunction;
  /** Configuración del locale actual */
  config: LocaleConfig;
  /**
   * The active text direction. Components read direction from here instead of
   * measuring the DOM (`closest('[dir]')` / `getComputedStyle().direction`),
   * which is unavailable during SSR and forces a layout read on the client.
   */
  direction: TextDirection;
}

/**
 * Diccionario de traducciones.
 */
export type TranslationDictionary = Record<string, any>;

/**
 * Colección de traducciones por namespace.
 */
export interface LocaleTranslations {
  common: TranslationDictionary;
  components: TranslationDictionary;
  errors: TranslationDictionary;
  validation: TranslationDictionary;
}
