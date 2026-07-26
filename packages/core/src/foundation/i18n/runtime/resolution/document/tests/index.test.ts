import { describe, expect, it } from 'vitest';

import { SUPPORTED_LOCALES } from '@/foundation/i18n/kernel/contracts';
import { resolveDocumentLocaleAttributes, resolveLocaleDirection } from '..';

describe('resolveDocumentLocaleAttributes', () => {
  it('resolves the html attribute pair for every supported locale', () => {
    expect(resolveDocumentLocaleAttributes('en')).toEqual({ lang: 'en', dir: 'ltr' });
    expect(resolveDocumentLocaleAttributes('es')).toEqual({ lang: 'es', dir: 'ltr' });
    expect(resolveDocumentLocaleAttributes('ar')).toEqual({ lang: 'ar', dir: 'rtl' });
  });

  it('answers for every declared locale without touching the DOM', () => {
    // A server layout calls this before any document exists; it must be pure.
    for (const locale of SUPPORTED_LOCALES) {
      const attributes = resolveDocumentLocaleAttributes(locale);
      expect(attributes.lang).toBe(locale);
      expect(['ltr', 'rtl']).toContain(attributes.dir);
    }
  });

  it('exposes direction on its own for callers that only need the axis', () => {
    expect(resolveLocaleDirection('ar')).toBe('rtl');
    expect(resolveLocaleDirection('fr')).toBe('ltr');
  });
});
