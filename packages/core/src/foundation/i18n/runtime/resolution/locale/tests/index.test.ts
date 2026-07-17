import { describe, expect, it } from 'vitest';

import { toSupportedLocale } from '..';

describe('toSupportedLocale', () => {
  it('normalizes supported BCP-47 locales', () => {
    expect(toSupportedLocale('en-US')).toBe('en');
    expect(toSupportedLocale('ES-ar')).toBe('es');
    expect(toSupportedLocale('ar-SA')).toBe('ar');
  });

  it('uses the requested fallback for absent or unsupported values', () => {
    expect(toSupportedLocale(undefined)).toBe('en');
    expect(toSupportedLocale(null, 'pt')).toBe('pt');
    expect(toSupportedLocale('de-DE', 'fr')).toBe('fr');
  });
});
