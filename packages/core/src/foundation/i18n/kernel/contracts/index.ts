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
 */
export type TranslateFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;

/**
 * Contexto de i18n.
 */
export interface I18nContextValue {
  /** Locale actual */
  locale: SupportedLocale;
  /** Cambiar locale */
  setLocale: (locale: SupportedLocale) => void;
  /** Función de traducción */
  t: TranslateFunction;
  /** Configuración del locale actual */
  config: LocaleConfig;
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
