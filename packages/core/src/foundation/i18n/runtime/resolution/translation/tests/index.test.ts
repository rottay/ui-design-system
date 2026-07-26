import { describe, expect, it } from 'vitest';

import { TRANSLATION_CATALOG } from '@/foundation/i18n/runtime/catalog';
import { resolveTranslation, resolveTranslationEntry, resolveTranslationOr } from '..';

describe('resolveTranslation', () => {
  it('prefers tenant copy and interpolates its parameters', () => {
    expect(resolveTranslation({
      key: 'components.pagination.page',
      params: { current: 3, total: 7 },
      locale: 'en',
      fallbackLocale: 'es',
      customTranslations: {
        components: {
          pagination: {
            page: 'Tenant page {current} of {total}',
          },
        },
      },
      catalog: TRANSLATION_CATALOG,
    })).toBe('Tenant page 3 of 7');
  });

  it('resolves the active locale before its fallback', () => {
    expect(resolveTranslation({
      key: 'common.yes',
      locale: 'fr',
      fallbackLocale: 'es',
      catalog: TRANSLATION_CATALOG,
    })).toBe('Oui');
  });

  it('returns undefined when every resolution tier misses', () => {
    expect(resolveTranslation({
      key: 'components.does.not.exist',
      locale: 'en',
      fallbackLocale: 'es',
      catalog: TRANSLATION_CATALOG,
    })).toBeUndefined();
  });

  it('honors an explicit empty-string translation instead of falling through', () => {
    // es/ar land `listToolbar.densitySuffix` as "" (their density adjectives
    // already agree with the noun). An empty catalog string must NOT be
    // treated as a miss that falls through to the fallback locale.
    expect(resolveTranslation({
      key: 'components.listToolbar.densitySuffix',
      locale: 'es',
      fallbackLocale: 'en',
      catalog: TRANSLATION_CATALOG,
    })).toBe('');
  });
});

describe('resolveTranslationEntry', () => {
  it('reports which tier answered', () => {
    expect(resolveTranslationEntry({
      key: 'components.pagination.page',
      locale: 'en',
      fallbackLocale: 'es',
      customTranslations: { components: { pagination: { page: 'Tenant' } } },
      catalog: TRANSLATION_CATALOG,
    }).tier).toBe('custom');

    expect(resolveTranslationEntry({
      key: 'common.yes',
      locale: 'fr',
      fallbackLocale: 'es',
      catalog: TRANSLATION_CATALOG,
    }).tier).toBe('locale');

    // French has no `calendar.navNextMonth`; the configured Spanish fallback does.
    expect(resolveTranslationEntry({
      key: 'components.calendar.navNextMonth',
      locale: 'fr',
      fallbackLocale: 'es',
      catalog: TRANSLATION_CATALOG,
    })).toEqual({ tier: 'fallback', value: 'Mes siguiente' });
  });

  it('marks a miss as a tier rather than encoding it in the string', () => {
    // The defect this closes: callers used to detect a miss by comparing the
    // returned string to the key, which cannot distinguish a genuine miss from
    // a translation and has to guess the namespace prefix.
    expect(resolveTranslationEntry({
      key: 'components.does.not.exist',
      locale: 'en',
      fallbackLocale: 'es',
      catalog: TRANSLATION_CATALOG,
    })).toEqual({ tier: 'missing', value: undefined });
  });

  it('stops at the configured fallback instead of hopping to English', () => {
    // Neither fr nor the configured pt fallback carries the key; English does.
    // Consulting it would overrule the application's declared language policy.
    const resolution = resolveTranslationEntry({
      key: 'components.calendar.navNextMonth',
      locale: 'fr',
      fallbackLocale: 'pt',
      catalog: TRANSLATION_CATALOG,
    });

    expect(resolution.tier).toBe('missing');
    expect(resolution.value).not.toBe('Next month');
  });

  it('reports the locale tier for an explicit empty translation', () => {
    expect(resolveTranslationEntry({
      key: 'components.listToolbar.densitySuffix',
      locale: 'ar',
      fallbackLocale: 'en',
      catalog: TRANSLATION_CATALOG,
    })).toEqual({ tier: 'locale', value: '' });
  });
});

describe('resolveTranslationOr', () => {
  const base = {
    locale: 'en',
    fallbackLocale: 'es',
    catalog: TRANSLATION_CATALOG,
  } as const;

  it('returns the floor only for a genuine miss', () => {
    expect(resolveTranslationOr({ ...base, key: 'common.yes' }, 'Floor')).toBe('Yes');
    expect(resolveTranslationOr({ ...base, key: 'common.nope' }, 'Floor')).toBe('Floor');
  });

  it('keeps an empty translation instead of substituting the floor', () => {
    expect(resolveTranslationOr(
      { ...base, locale: 'es', key: 'components.listToolbar.densitySuffix' },
      'density',
    )).toBe('');
  });

  it('interpolates the floor with the same params as catalog copy', () => {
    expect(resolveTranslationOr(
      { ...base, key: 'components.rate.absent', params: { count: 4 } },
      '{count} stars',
    )).toBe('4 stars');
  });
});
