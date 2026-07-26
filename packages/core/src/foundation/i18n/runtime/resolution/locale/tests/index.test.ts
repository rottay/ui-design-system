import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE } from '@/foundation/i18n/kernel/contracts';
import { toSupportedLocale } from '..';

describe('toSupportedLocale', () => {
  it('normalizes supported BCP-47 locales', () => {
    expect(toSupportedLocale('en-US')).toBe('en');
    expect(toSupportedLocale('ES-ar')).toBe('es');
    expect(toSupportedLocale('ar-SA')).toBe('ar');
  });

  it('uses the requested fallback for absent or unsupported values', () => {
    expect(toSupportedLocale(null, 'pt')).toBe('pt');
    expect(toSupportedLocale('de-DE', 'fr')).toBe('fr');
  });

  it('defaults to the single declared locale, not a second implicit language', () => {
    // This used to hardcode 'en' while the translation chain fell back to 'es',
    // so which language a caller landed in depended on which of the two
    // functions they happened to call.
    expect(toSupportedLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(toSupportedLocale('de-DE')).toBe(DEFAULT_LOCALE);
  });
});
