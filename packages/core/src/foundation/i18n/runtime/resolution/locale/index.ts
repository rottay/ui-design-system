/**
 * Normalizes a BCP-47 locale string (e.g. "en-US", "es-AR") to a
 * 2-letter SupportedLocale code ("en", "es").
 *
 * Falls back to the provided default when the input is undefined, empty, or
 * not in the supported set. The default comes from `DEFAULT_LOCALE` rather
 * than a language spelled out here: this function previously defaulted to
 * `'en'` while the translation chain fell back to `'es'`, so which language a
 * caller ended up in depended on whether they had normalized a header or
 * looked up a string. Callers with their own policy pass `fallback` explicitly
 * and are unaffected.
 */

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/foundation/i18n/kernel/contracts';

export function toSupportedLocale(
  raw: string | undefined | null,
  fallback: SupportedLocale = DEFAULT_LOCALE,
): SupportedLocale {
  if (!raw) return fallback;
  const prefix = raw.split('-')[0].toLowerCase();
  if (SUPPORTED_LOCALES.includes(prefix as SupportedLocale)) {
    return prefix as SupportedLocale;
  }
  return fallback;
}
