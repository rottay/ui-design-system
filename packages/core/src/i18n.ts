/**
 * Internal i18n barrel.
 *
 * The i18n subsystem is exported to consumers through the package root
 * (`@rottay/design-system`), not through a dedicated subpath.
 * There is no public `@rottay/design-system/i18n` export.
 *
 * This file exists as a stable internal entry point for code inside
 * the package that needs i18n without pulling the full root barrel.
 */

export * from './i18n/index';

// Locale normalization utility
export { toSupportedLocale } from './i18n/toSupportedLocale';
