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

    // This probe is intentionally absent from both partial catalogs (fr/pt)
    // and present in the mandatory catalogs. Do not couple fallback behavior
    // to a key that translators may legitimately complete.
    expect(resolveTranslationEntry({
      key: 'components.pagination.navigation',
      locale: 'fr',
      fallbackLocale: 'es',
      catalog: TRANSLATION_CATALOG,
    })).toEqual({ tier: 'fallback', value: 'Paginación' });
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

  it('reaches the English floor only after the configured chain misses', () => {
    // Neither fr nor the configured pt fallback carries this key. The previous
    // contract reported `missing` here, which rendered the raw dotted key into
    // production UI. The floor answers instead -- and is reported as its own
    // tier, so "the app's languages had it" and "English rescued it" stay
    // distinguishable.
    const resolution = resolveTranslationEntry({
      key: 'components.pagination.navigation',
      locale: 'fr',
      fallbackLocale: 'pt',
      catalog: TRANSLATION_CATALOG,
    });

    expect(resolution.tier).toBe('floor');
    expect(resolution.value).toBe('Pagination');
  });

  it('lets the configured fallback answer BEFORE the floor is consulted', () => {
    // The property the floor must not destroy: an app that configured `es` has
    // declared a language policy, and Spanish still decides every key Spanish
    // has copy for. The floor is a last resort, never a competitor.
    const resolution = resolveTranslationEntry({
      key: 'components.pagination.navigation',
      locale: 'fr',
      fallbackLocale: 'es',
      catalog: TRANSLATION_CATALOG,
    });

    expect(resolution.tier).toBe('fallback');
    expect(resolution.value).toBe('Paginación');
  });

  it('still reports a miss for a key absent from EVERY catalog', () => {
    // The floor is not a way to make misses disappear. A key no catalog has is
    // an authoring bug and must stay observable.
    expect(resolveTranslationEntry({
      key: 'components.does.not.exist',
      locale: 'fr',
      fallbackLocale: 'pt',
      catalog: TRANSLATION_CATALOG,
    })).toEqual({ tier: 'missing', value: undefined });
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
