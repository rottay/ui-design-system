/**
 * Public i18n entrypoint.
 *
 * This keeps the package surface explicit and gives consumers a stable import
 * path for locale helpers without having to reach into theme internals.
 */

export * from './i18n/index';

// Locale normalization utility
export { toSupportedLocale } from './i18n/toSupportedLocale';
