/**
 * AD-6: the compiler fails closed when a reading font stack loses its Arabic
 * fallback.
 *
 * The evnto artifact shipped `'Inter', …, Roboto, sans-serif` because the
 * extension re-declared both font families without the tail the compiler had
 * appended — Arabic text fell through to a generic sans in production. Deleting
 * that re-declaration fixes today; this makes the stack itself unbreakable.
 */
import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '../index';
import {
  MANDATORY_FALLBACK_FONT_CHANNELS,
  MANDATORY_FONT_FALLBACK_FAMILY,
  assertMandatoryFontFallback,
  hasMandatoryFontFallback,
} from '@/foundation/kernel/typography';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { evntoBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/evnto';
import { rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/platform';

const FIRST_PARTY = [
  ['bithire', bithireBrandTheme],
  ['evnto', evntoBrandTheme],
  ['rottay', rottayBrandTheme],
] as const;

describe('mandatory font fallback', () => {
  it.each(FIRST_PARTY)('%s emits every reading stack with the fallback', (slug, brandTheme) => {
    const { cssVariables } = compileBrandTheme({ brandTheme, tenantSlug: slug });
    for (const channel of MANDATORY_FALLBACK_FONT_CHANNELS) {
      expect(cssVariables[channel]).toContain(MANDATORY_FONT_FALLBACK_FAMILY);
    }
  });

  it('leaves the mono stack alone — a code face renders no Arabic body text', () => {
    const { cssVariables } = compileBrandTheme({ brandTheme: evntoBrandTheme, tenantSlug: 'evnto' });
    expect(MANDATORY_FALLBACK_FONT_CHANNELS).not.toContain('--ds-font-family-mono');
    expect(cssVariables['--ds-font-family-mono']).not.toContain(MANDATORY_FONT_FALLBACK_FAMILY);
  });

  it('drill · an emitted map missing the tail throws', () => {
    // The regression shape verbatim: exactly what the evnto extension used to
    // put on the wire. `withArabicSafeFallback` cannot produce this, which is
    // the point — the guard covers the paths that bypass it.
    expect(() =>
      assertMandatoryFontFallback(
        { '--ds-font-family-base': "'Inter', -apple-system, Roboto, sans-serif" },
        'evnto'
      )
    ).toThrow(/--ds-font-family-base omits the mandatory font fallback "Noto Sans Arabic"/);

    expect(() =>
      assertMandatoryFontFallback({ '--ds-font-family-base': "'Inter', 'Noto Sans Arabic', sans-serif" }, 'evnto')
    ).not.toThrow();
  });

  it('an already Arabic-capable family satisfies the requirement without a second tail', () => {
    expect(hasMandatoryFontFallback('Tahoma, sans-serif')).toBe(true);
    const { cssVariables } = compileBrandTheme({
      brandTheme: {
        ...evntoBrandTheme,
        typography: { ...evntoBrandTheme.typography, fontFamilyBase: 'Tahoma, sans-serif' },
      },
      tenantSlug: 'evnto',
    });
    expect(cssVariables['--ds-font-family-base']).toBe('Tahoma, sans-serif');
  });
});
