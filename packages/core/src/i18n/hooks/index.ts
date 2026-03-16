/**
 * @fileoverview Consumer hooks for the i18n subsystem.
 *
 * - `useTranslation` -- access the `t()` function with optional namespace scoping.
 * - `useLocale`      -- read/write the active locale and its configuration.
 */

export { useTranslation } from './useTranslation';
export type { UseTranslationResult } from './useTranslation';

export { useLocale } from './useLocale';
export type { UseLocaleResult } from './useLocale';
