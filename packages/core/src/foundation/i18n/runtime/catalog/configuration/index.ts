/**
 * Locale metadata catalog used by React and non-React consumers.
 */

import type { LocaleConfig, SupportedLocale } from '@/foundation/i18n/kernel/contracts';

export const LOCALE_CONFIGS: Readonly<Record<SupportedLocale, LocaleConfig>> = {
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
  ar: {
    code: 'ar',
    name: 'العربية',
    direction: 'rtl',
    dateLocale: 'ar-SA',
    numberLocale: 'ar-SA',
  },
};
