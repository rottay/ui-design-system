/**
 * Sistema de Internacionalización (i18n)
 * Design System Rottay - Wave 0 - Agente D
 */

import type { ReactNode } from 'react';

/**
 * Locales soportados por el Design System Rottay.
 */
export type SupportedLocale = 'es' | 'en' | 'pt' | 'fr';

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
 * Configuración del proveedor i18n.
 */
export interface I18nProviderProps {
  /** Locale inicial */
  locale: SupportedLocale;
  /** Locale de fallback si falta una traducción */
  fallbackLocale?: SupportedLocale;
  /** Traducciones personalizadas del tenant */
  customTranslations?: Record<string, Record<string, string>>;
  /** Callback cuando cambia el locale */
  onLocaleChange?: (locale: SupportedLocale) => void;
  children: ReactNode;
}

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
 * Configuración de locales soportados.
 */
export const LOCALE_CONFIGS: Record<SupportedLocale, LocaleConfig> = {
  es: {
    code: 'es',
    name: 'Español',
    direction: 'ltr',
    dateLocale: 'es-ES',
    numberLocale: 'es-ES',
  },
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    dateLocale: 'en-US',
    numberLocale: 'en-US',
  },
  pt: {
    code: 'pt',
    name: 'Português',
    direction: 'ltr',
    dateLocale: 'pt-BR',
    numberLocale: 'pt-BR',
  },
  fr: {
    code: 'fr',
    name: 'Français',
    direction: 'ltr',
    dateLocale: 'fr-FR',
    numberLocale: 'fr-FR',
  },
};

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
