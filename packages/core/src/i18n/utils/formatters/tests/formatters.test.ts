import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  formatCurrency,
  formatDate,
  formatDateRange,
  formatFileSize,
  formatList,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from '..';

describe('i18n formatters', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats dates, numbers, currency, percent and file sizes with the requested locale', () => {
    expect(formatDate(new Date('2026-03-13T12:00:00Z'), 'en-US')).toContain('2026');
    expect(formatNumber(12345.67, 'en-US')).toBe('12,345.67');
    expect(formatCurrency(199.99, 'en-US', 'USD')).toContain('$199.99');
    expect(formatPercent(0.245, 'en-US', 1)).toBe('24.5%');
    expect(formatFileSize(1024 * 1024 * 2.5, 'en-US')).toContain('MB');
  });

  it('formats relative time for both immediate and elapsed cases', () => {
    expect(formatRelativeTime(new Date(), 'en-US')).toBe('now');
    expect(formatRelativeTime(new Date(), 'es-ES')).toBe('ahora');
    expect(formatRelativeTime(new Date(), 'pt-BR')).toBe('agora');
    expect(formatRelativeTime(new Date(), 'fr-FR')).toBe('maintenant');

    const ninetyMinutesAgo = new Date(Date.now() - (90 * 60 * 1000));
    expect(formatRelativeTime(ninetyMinutesAgo, 'en-US')).toMatch(/hour|minute/i);
  });

  it('formats lists and date ranges, including the non-formatRange fallback path', () => {
    expect(formatList([], 'en-US')).toBe('');
    expect(formatList(['A'], 'en-US')).toBe('A');
    expect(formatList(['A', 'B'], 'en-US')).toContain('A');
    expect(formatList(['A', 'B', 'C'], 'es-ES')).toContain(' y ');

    const startDate = new Date('2026-03-10T00:00:00Z');
    const endDate = new Date('2026-03-13T00:00:00Z');

    const OriginalDateTimeFormat = Intl.DateTimeFormat;
    const dateTimeFormatSpy = vi.spyOn(Intl, 'DateTimeFormat');
    dateTimeFormatSpy.mockImplementation(((locale: string, options?: Intl.DateTimeFormatOptions) => {
      const formatter = new OriginalDateTimeFormat(locale, options);
      return {
        format: formatter.format.bind(formatter),
      } as Intl.DateTimeFormat;
    }) as typeof Intl.DateTimeFormat);

    const range = formatDateRange(startDate, endDate, 'en-US');
    expect(range).toContain('2026');
    expect(range).toContain('–');
  });

  it('uses locale-specific manual list and date range fallbacks when Intl helpers are unavailable', () => {
    const originalListFormat = (Intl as typeof Intl & { ListFormat?: typeof Intl.ListFormat }).ListFormat;
    const listIntl = Intl as typeof Intl & { ListFormat?: typeof Intl.ListFormat };
    listIntl.ListFormat = undefined;

    expect(formatList(['A', 'B'], 'en-US')).toBe('A and B');
    expect(formatList(['A', 'B'], 'pt-BR')).toBe('A e B');
    expect(formatList(['A', 'B'], 'fr-FR', 'disjunction')).toBe('A ou B');
    expect(formatList(['A', 'B', 'C'], 'es-ES', 'disjunction')).toBe('A, B o C');

    listIntl.ListFormat = originalListFormat;

    const OriginalDateTimeFormat = Intl.DateTimeFormat;
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(((locale: string, options?: Intl.DateTimeFormatOptions) => {
      const formatter = new OriginalDateTimeFormat(locale, options);
      return {
        format: formatter.format.bind(formatter),
      } as Intl.DateTimeFormat;
    }) as typeof Intl.DateTimeFormat);

    const spanishRange = formatDateRange(
      new Date('2026-03-10T00:00:00Z'),
      new Date('2026-03-13T00:00:00Z'),
      'es-ES'
    );
    expect(spanishRange).toContain(' - ');
  });

  it('falls back gracefully when Intl date, number, relative time, range, and list formatters throw', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const numberSpy = vi.spyOn(Intl, 'NumberFormat').mockImplementation((() => {
      throw new Error('number boom');
    }) as typeof Intl.NumberFormat);
    expect(formatNumber(42, 'en-US')).toBe('42');
    expect(formatCurrency(50, 'en-US', 'USD')).toBe('USD 50.00');
    expect(formatPercent(0.5, 'en-US', 0)).toBe('50%');
    numberSpy.mockRestore();

    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation((() => {
      throw new Error('date boom');
    }) as typeof Intl.DateTimeFormat);
    expect(formatDate(new Date('2026-03-13T12:00:00Z'), 'en-US')).toBe(
      new Date('2026-03-13T12:00:00Z').toLocaleDateString()
    );
    expect(
      formatDateRange(
        new Date('2026-03-10T00:00:00Z'),
        new Date('2026-03-13T00:00:00Z'),
        'en-US'
      )
    ).toBe(
      `${new Date('2026-03-10T00:00:00Z').toLocaleDateString()} - ${new Date('2026-03-13T00:00:00Z').toLocaleDateString()}`
    );

    vi.spyOn(Intl, 'RelativeTimeFormat').mockImplementation((() => {
      throw new Error('relative boom');
    }) as typeof Intl.RelativeTimeFormat);
    vi.spyOn(Intl, 'ListFormat').mockImplementation((() => {
      throw new Error('list boom');
    }) as typeof Intl.ListFormat);

    const relativeDate = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000));
    const relativeFallback = formatRelativeTime(relativeDate, 'en-US');
    expect(relativeFallback).toBe(
      formatDate(relativeDate, 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
    expect(formatList(['A', 'B'], 'en-US')).toBe('A, B');
  });

  it('formats zero-byte files through the explicit guard', () => {
    expect(formatFileSize(0, 'en-US')).toBe('0 Bytes');
  });

  it('falls back gracefully when Intl formatters throw', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(Intl, 'NumberFormat').mockImplementation((() => {
      throw new Error('boom');
    }) as typeof Intl.NumberFormat);

    expect(formatCurrency(50, 'en-US', 'USD')).toBe('USD 50.00');
    expect(formatPercent(0.5, 'en-US', 0)).toBe('50%');
  });
});
