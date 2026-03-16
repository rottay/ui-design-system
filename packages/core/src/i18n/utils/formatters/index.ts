/**
 * @fileoverview Locale-aware formatting utilities built on the Intl API.
 *
 * Every formatter accepts an explicit locale string (from `config.dateLocale`
 * or `config.numberLocale`) so it can be used both inside and outside React.
 * All functions include try/catch guards with dev-only error logging and
 * sensible plaintext fallbacks to avoid crashing on unsupported locales.
 */

import { errorInDev } from '../../../utils/runtime-logger';

/**
 * Formats a Date object into a locale-aware string using `Intl.DateTimeFormat`.
 * Defaults to `{ year: 'numeric', month: 'long', day: 'numeric' }`.
 *
 * @param date    - The date to format
 * @param locale  - BCP 47 locale string (e.g. 'es-ES', 'en-US')
 * @param options - Optional `Intl.DateTimeFormatOptions` overrides
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  } catch (error) {
    errorInDev('Error formatting date:', error);
    return date.toLocaleDateString();
  }
}

/**
 * Formats a number using `Intl.NumberFormat` with locale-specific grouping and decimals.
 *
 * @param value   - Numeric value
 * @param locale  - BCP 47 locale string
 * @param options - Optional `Intl.NumberFormatOptions` overrides
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    errorInDev('Error formatting number:', error);
    return value.toString();
  }
}

/**
 * Formats a monetary value with the appropriate currency symbol and grouping.
 *
 * @param value    - Monetary amount
 * @param locale   - BCP 47 locale string
 * @param currency - ISO 4217 currency code (defaults to 'USD')
 * @returns Formatted currency string (e.g. '$1,234.56' or '1.234,56 US$')
 */
export function formatCurrency(
  value: number,
  locale: string,
  currency: string = 'USD'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch (error) {
    errorInDev('Error formatting currency:', error);
    return `${currency} ${value.toFixed(2)}`;
  }
}

/**
 * Produces a human-readable relative time string (e.g. "5 minutes ago").
 *
 * Picks the largest fitting unit from year down to second, then delegates to
 * `Intl.RelativeTimeFormat`. Falls back to a hardcoded "now" string for
 * zero-second differences.
 *
 * @param date   - The reference point in time
 * @param locale - BCP 47 locale string
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: Date,
  locale: string
): string {
  try {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Calcular la unidad apropiada
    const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'week', seconds: 604800 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 },
    ];

    // Walk from largest unit (year) to smallest (second) and use the first
    // unit where the quotient is non-zero. This gives "3 hours ago" instead
    // of "10800 seconds ago".
    for (const { unit, seconds } of units) {
      const value = Math.floor(diffInSeconds / seconds);
      if (value !== 0) {
        // Negative value because we are looking backward in time.
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        return rtf.format(-value, unit);
      }
    }

    // Zero-second difference. Intl.RelativeTimeFormat with numeric:'auto'
    // does not always produce a user-friendly "now" string, so we hardcode
    // the most common locale prefixes as a fallback.
    return locale.startsWith('es') ? 'ahora' :
           locale.startsWith('pt') ? 'agora' :
           locale.startsWith('fr') ? 'maintenant' :
           'now';
  } catch (error) {
    errorInDev('Error formatting relative time:', error);
    return formatDate(date, locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

/**
 * Formats a decimal value as a percentage string (e.g. 0.75 -> '75%').
 *
 * @param value    - Decimal value (0-1 scale; 0.5 = 50%)
 * @param locale   - BCP 47 locale string
 * @param decimals - Fraction digits to display (default: 0)
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number,
  locale: string,
  decimals: number = 0
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    errorInDev('Error formatting percent:', error);
    return `${(value * 100).toFixed(decimals)}%`;
  }
}

/**
 * Formats a start/end date pair as a locale-aware range string.
 *
 * Uses `Intl.DateTimeFormat.formatRange` when available; otherwise falls back
 * to joining two individually formatted dates with an en-dash separator.
 *
 * @param startDate - Range start
 * @param endDate   - Range end
 * @param locale    - BCP 47 locale string
 * @param options   - Optional `Intl.DateTimeFormatOptions` overrides
 * @returns Formatted date range string
 */
export function formatDateRange(
  startDate: Date,
  endDate: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };

    // formatRange produces smart ranges like "Jan 5 - 12" (sharing the month)
    // instead of "Jan 5 - Jan 12". It is available in modern browsers but not
    // in all server runtimes, so we feature-detect and fall back to manual join.
    const formatter = new Intl.DateTimeFormat(locale, defaultOptions) as any;

    if (typeof formatter.formatRange === 'function') {
      return formatter.formatRange(startDate, endDate);
    }

    const start = formatter.format(startDate);
    const end = formatter.format(endDate);
    const separator = locale.startsWith('es') || locale.startsWith('pt') ? ' - ' : ' – ';
    return `${start}${separator}${end}`;
  } catch (error) {
    errorInDev('Error formatting date range:', error);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }
}

/**
 * Converts a byte count into a human-readable file size string (KB, MB, GB, etc.).
 *
 * Uses binary units (1 KB = 1024 bytes) with locale-aware number formatting.
 *
 * @param bytes    - File size in bytes
 * @param locale   - BCP 47 locale string
 * @param decimals - Fraction digits (default: 2)
 * @returns Formatted file size string (e.g. '1,23 MB')
 */
export function formatFileSize(
  bytes: number,
  locale: string,
  decimals: number = 2
): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${formatNumber(value, locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${sizes[i]}`;
}

/**
 * Joins an array of strings into a grammatically correct list using
 * `Intl.ListFormat` when available, with a manual fallback for older runtimes.
 *
 * @param items  - Strings to join
 * @param locale - BCP 47 locale string
 * @param type   - 'conjunction' ("A, B, and C") or 'disjunction' ("A, B, or C")
 * @returns Formatted list string
 */
export function formatList(
  items: string[],
  locale: string,
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  try {
    // Intl.ListFormat puede no estar disponible en todos los entornos
    if (typeof (Intl as any).ListFormat === 'function') {
      const ListFormat = (Intl as any).ListFormat;
      return new ListFormat(locale, {
        style: 'long',
        type,
      }).format(items);
    }

    // Fallback manual
    const separator = type === 'conjunction' ?
      (locale.startsWith('es') ? ' y ' :
       locale.startsWith('pt') ? ' e ' :
       locale.startsWith('fr') ? ' et ' : ' and ') :
      (locale.startsWith('es') || locale.startsWith('pt') ? ' o ' :
       locale.startsWith('fr') ? ' ou ' : ' or ');

    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return items.join(separator);

    return items.slice(0, -1).join(', ') + separator + items[items.length - 1];
  } catch (error) {
    errorInDev('Error formatting list:', error);
    return items.join(', ');
  }
}
