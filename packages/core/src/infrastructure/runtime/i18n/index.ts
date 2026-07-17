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
 * import { I18nProvider } from '@rottay/design-system';
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
 * import { useTranslation } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   const { t } = useTranslation('components');
 *   return <button>{t('button.submit')}</button>;
 * }
 */

export * from '@/infrastructure/runtime/i18n/kernel';
export * from '@/infrastructure/runtime/i18n/runtime';
export * from '@/infrastructure/runtime/i18n/composition';

export {
  formatCurrency,
  formatDate,
  formatDateRange,
  formatFileSize,
  formatList,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from '@/foundation/i18n/runtime/formatting';
export { LOCALE_CONFIGS } from '@/foundation/i18n/runtime/catalog/configuration';
export { ar, en, es, fr, pt } from '@/foundation/i18n/runtime/catalog/translations';
export { toSupportedLocale } from '@/foundation/i18n/runtime/resolution/locale';
export type {
  I18nContextValue,
  LocaleConfig,
  LocaleTranslations,
  SupportedLocale,
  TextDirection,
  TranslateFunction,
  TranslationDictionary,
  TranslationNamespace,
} from '@/foundation/i18n/kernel/contracts';
