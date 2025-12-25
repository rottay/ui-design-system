'use client';

/**
 * I18n Provider
 * Design System Rottay - Wave 0 - Agente D
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
import { es, en, pt, fr } from '../../locales';

// Mapa de traducciones
const TRANSLATIONS = {
  es,
  en,
  pt,
  fr,
};

/**
 * Contexto de i18n
 */
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/**
 * Obtiene un valor anidado de un objeto usando dot notation
 * Ejemplo: getValue(obj, 'components.avatar.loading')
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
 * Interpola parámetros en un string
 * Ejemplo: interpolate('Hello {name}!', { name: 'World' }) => 'Hello World!'
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
}

/**
 * Provider de internacionalización
 */
export function I18nProvider({
  locale: initialLocale = 'es',
  fallbackLocale = 'es',
  customTranslations,
  onLocaleChange,
  children,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale);

  // Función de traducción memoizada
  const t: TranslateFunction = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      // 1. Buscar en traducciones custom del tenant
      if (customTranslations) {
        const customValue = getValue(customTranslations, key);
        if (customValue) {
          return interpolate(customValue, params);
        }
      }

      // 2. Buscar en el locale actual
      const currentTranslations = TRANSLATIONS[locale];
      const value = getValue(currentTranslations, key);
      if (value) {
        return interpolate(value, params);
      }

      // 3. Fallback al locale de fallback
      if (locale !== fallbackLocale) {
        const fallbackTranslations = TRANSLATIONS[fallbackLocale];
        const fallbackValue = getValue(fallbackTranslations, key);
        if (fallbackValue) {
          return interpolate(fallbackValue, params);
        }
      }

      // 4. Si no se encuentra, devolver la key
      console.warn(`Translation not found for key: ${key}`);
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

  // Actualizar atributos del documento
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
 * Hook para usar el contexto de i18n
 */
export function useI18nContext(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }

  return context;
}

export { I18nContext };
