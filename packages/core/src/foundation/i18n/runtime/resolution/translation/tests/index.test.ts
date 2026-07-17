import { describe, expect, it } from 'vitest';

import { TRANSLATION_CATALOG } from '@/foundation/i18n/runtime/catalog';
import { resolveTranslation } from '..';

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
});
