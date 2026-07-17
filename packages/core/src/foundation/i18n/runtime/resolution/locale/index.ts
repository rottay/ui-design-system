/**
 * Normalizes a BCP-47 locale string (e.g. "en-US", "es-AR") to a
 * 2-letter SupportedLocale code ("en", "es").
 *
 * Falls back to the provided default (or "en") when the input is
 * undefined, empty, or not in the supported set.
 */

import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/foundation/i18n/kernel/contracts';

export function toSupportedLocale(
  raw: string | undefined | null,
  fallback: SupportedLocale = 'en',
): SupportedLocale {
  if (!raw) return fallback;
  const prefix = raw.split('-')[0].toLowerCase();
  if (SUPPORTED_LOCALES.includes(prefix as SupportedLocale)) {
    return prefix as SupportedLocale;
  }
  return fallback;
}
