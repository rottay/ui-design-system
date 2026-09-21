'use client';

/**
 * @fileoverview Formatting bound to the provider's locale.
 *
 * The Intl formatters in `foundation/i18n/runtime/formatting` all take an
 * EXPLICIT locale string, which is right for the non-React callers they also
 * serve and wrong as the only door a component has. A component that wants a
 * formatted date has to reach for `useLocale()`, remember that dates read
 * `config.dateLocale` while numbers read `config.numberLocale`, and thread the
 * string through by hand — three steps, each of which can be skipped. What
 * actually happened is that they were skipped: `date.toLocaleDateString()`
 * with no argument appears at 34 call sites in this package, every one of them
 * formatting in the SERVER's locale (or the visitor's browser locale) rather
 * than in the language the surrounding UI is rendering.
 *
 * This is the one-step door. `useFormatter()` reads the active locale from the
 * same context `useTranslation` does, so a formatted value and the copy around
 * it can never disagree about what language the page is in.
 */

import { useMemo } from 'react';
import type { SupportedLocale } from '@/foundation/i18n/kernel/contracts';
import { DEFAULT_LOCALE } from '@/foundation/i18n/kernel/contracts';
import { LOCALE_CONFIGS } from '@/foundation/i18n/runtime/catalog/configuration';
import {
  formatCurrency,
  formatDate,
  formatDateRange,
  formatFileSize,
  formatList,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  formatTime,
} from '@/foundation/i18n/runtime/formatting';
import { useI18nContext } from '@/infrastructure/runtime/i18n/runtime/context';

export interface UseFormatterResult {
  /** The active locale, the same value `useLocale()` and `useTranslation()` report. */
  readonly locale: SupportedLocale;
  /** The BCP 47 tag these formatters pass to Intl for dates and text. */
  readonly dateLocale: string;
  /** The BCP 47 tag these formatters pass to Intl for numbers. */
  readonly numberLocale: string;
  readonly date: (value: Date, options?: Intl.DateTimeFormatOptions) => string;
  readonly time: (value: Date, options?: Intl.DateTimeFormatOptions) => string;
  readonly dateRange: (
    start: Date,
    end: Date,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  readonly relativeTime: (value: Date) => string;
  readonly number: (value: number, options?: Intl.NumberFormatOptions) => string;
  readonly percent: (value: number, decimals?: number) => string;
  readonly currency: (value: number, currency?: string) => string;
  readonly fileSize: (value: number, decimals?: number) => string;
  readonly list: (
    items: string[],
    type?: 'conjunction' | 'disjunction',
  ) => string;
}

function buildFormatter(
  locale: SupportedLocale,
  dateLocale: string,
  numberLocale: string,
): UseFormatterResult {
  return {
    locale,
    dateLocale,
    numberLocale,
    date: (value, options) => formatDate(value, dateLocale, options),
    time: (value, options) => formatTime(value, dateLocale, options),
    dateRange: (start, end, options) =>
      formatDateRange(start, end, dateLocale, options),
    relativeTime: (value) => formatRelativeTime(value, dateLocale),
    number: (value, options) => formatNumber(value, numberLocale, options),
    percent: (value, decimals) => formatPercent(value, numberLocale, decimals),
    currency: (value, currency) => formatCurrency(value, numberLocale, currency),
    fileSize: (value, decimals) => formatFileSize(value, numberLocale, decimals),
    // A joined list is grammar, not arithmetic -- "y" / "et" / "and" come from
    // the language tag, so it reads the date (text) locale, never the numeric one.
    list: (items, type) => formatList(items, dateLocale, type),
  };
}

const STANDALONE_FORMATTER = buildFormatter(
  DEFAULT_LOCALE,
  LOCALE_CONFIGS[DEFAULT_LOCALE].dateLocale,
  LOCALE_CONFIGS[DEFAULT_LOCALE].numberLocale,
);

/**
 * Locale-aware formatting for component code.
 *
 * Every method is the corresponding `format*` helper with the active locale
 * already applied, so a call site names WHAT it is formatting and never which
 * language to format it in.
 *
 * @example
 * const format = useFormatter();
 * format.date(startsAt, { month: 'short', day: 'numeric' });
 * format.number(total);
 */
export function useFormatter(): UseFormatterResult {
  const { locale, config } = useI18nContext();

  return useMemo(
    () => buildFormatter(locale, config.dateLocale, config.numberLocale),
    [locale, config.dateLocale, config.numberLocale],
  );
}

/**
 * Non-throwing formatter for primitives that keep a standalone rendering
 * contract. Without an `I18nProvider` it formats in `DEFAULT_LOCALE`, matching
 * the documented standalone behavior of `useOptionalTranslation` and
 * `useOptionalDirection`, so the primitive renders a formatted value rather
 * than crashing before an app provider is mounted.
 */
export function useOptionalFormatter(): UseFormatterResult {
  // The hook call stays unconditional. `useI18nContext` only throws when its
  // context is absent, so the catch path is a provider-presence fallback, not
  // conditional hook execution.
  try {
    return useFormatter();
  } catch {
    return STANDALONE_FORMATTER;
  }
}
