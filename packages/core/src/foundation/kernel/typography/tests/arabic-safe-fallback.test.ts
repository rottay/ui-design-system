import { describe, expect, it } from 'vitest';

import { withArabicSafeFallback } from '../index';

describe('withArabicSafeFallback', () => {
  it('preserves the tenant family first and inserts the safe face before a generic', () => {
    expect(withArabicSafeFallback('"Tenant Sans", sans-serif')).toBe(
      '"Tenant Sans", "Noto Sans Arabic", sans-serif'
    );
  });

  it('is idempotent for every accepted Arabic-capable family form', () => {
    for (const stack of [
      '"Tenant Sans", "Noto Sans Arabic", sans-serif',
      '"Noto Kufi Arabic", sans-serif',
      'Tahoma, sans-serif',
      '"Geeza Pro", serif',
    ]) {
      expect(withArabicSafeFallback(withArabicSafeFallback(stack))).toBe(stack);
    }
  });

  it('adds a generic fallback when the tenant supplied no generic family', () => {
    expect(withArabicSafeFallback('"Tenant Display"')).toBe(
      '"Tenant Display", "Noto Sans Arabic", sans-serif'
    );
  });

  it('does not rewrite an empty authored value', () => {
    expect(withArabicSafeFallback('   ')).toBe('   ');
  });
});
