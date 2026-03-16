/**
 * @fileoverview Public barrel for the i18n subsystem.
 *
 * @module i18n
 *
 * This barrel exposes the public i18n runtime used by the DS itself and by
 * consuming apps that want locale-aware strings, formatting, and directionality.
 *
 * @example
 * // Setup básico en app
 * import { I18nProvider } from '@rottay/design-system/i18n';
 *
 * function App() {
 *   return (
 *     <I18nProvider locale="es">
 *       <YourApp />
 *     </I18nProvider>
 *   );
 * }
 *
 * @example
 * // Uso en componentes
 * import { useTranslation } from '@rottay/design-system/i18n';
 *
 * function MyComponent() {
 *   const { t } = useTranslation('components');
 *   return <button>{t('button.submit')}</button>;
 * }
 */

// Provider y Context
export { I18nProvider, useI18nContext, I18nContext } from './context';

// Hooks
export { useTranslation, useLocale } from './hooks';
export type { UseTranslationResult, UseLocaleResult } from './hooks';

// Types
export type {
  SupportedLocale,
  TextDirection,
  LocaleConfig,
  TranslationNamespace,
  TranslateFunction,
  I18nProviderProps,
  I18nContextValue,
  TranslationDictionary,
  LocaleTranslations,
} from './types';

export { LOCALE_CONFIGS } from './types';

// Locales
export { es, en, pt, fr, ar } from './locales';

// Utils
export {
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  formatPercent,
  formatDateRange,
  formatFileSize,
  formatList,
} from './utils';
