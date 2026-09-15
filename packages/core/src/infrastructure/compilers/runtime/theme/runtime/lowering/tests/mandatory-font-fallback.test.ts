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

import { firstPartyFixture, lowerFlatThemeFixture } from "@tests/support/theme-lowering";
import { tortureDarkFlatTheme, tortureLightFlatTheme } from '@tests/fixtures/brand-themes/torture';
import {
  MANDATORY_FALLBACK_FONT_CHANNELS,
  MANDATORY_FONT_FALLBACK_FAMILY,
  assertMandatoryFontFallback,
  hasMandatoryFontFallback,
} from '@/foundation/kernel/typography';

const bithireFlatTheme = firstPartyFixture('bithire');
const evntoFlatTheme = firstPartyFixture('evnto');
const rottayFlatTheme = firstPartyFixture('rottay');

// D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset; only
// bithire's preset authors typefaces, so the sweep runs over the themes that
// actually put a reading stack on the wire. The torture pair is what covers
// `--ds-font-family-display`, which no first-party preset reaches today.
const AUTHORS_TYPEFACES = [
  ['bithire', bithireFlatTheme],
  ['torture-light', tortureLightFlatTheme],
  ['torture-dark', tortureDarkFlatTheme],
] as const;

describe('mandatory font fallback', () => {
  it.each(AUTHORS_TYPEFACES)('%s emits every reading stack it declares with the fallback', (slug, flatTheme) => {
    const { cssVariables } = lowerFlatThemeFixture({ flatTheme, tenantSlug: slug });
    const emitted = MANDATORY_FALLBACK_FONT_CHANNELS.filter(
      (channel) => cssVariables[channel] !== undefined
    );
    // Not vacuous: a theme that emitted no reading stack at all would satisfy
    // the loop below by having nothing to check.
    expect(emitted.length, `${slug} emits no reading stack`).toBeGreaterThan(0);
    for (const channel of emitted) {
      expect(cssVariables[channel]).toContain(MANDATORY_FONT_FALLBACK_FAMILY);
    }
  });

  it('a vertical whose preset authors no typeface puts no reading stack on the wire', () => {
    // D6-2c-ii (2026-09-15): the rottay and evnto presets are structural and
    // author no families, so the foundation's own stacks stand and there is
    // nothing for this guard to hold. Stated rather than left implicit, so the
    // sweep above cannot quietly stop covering a vertical that starts to.
    for (const [slug, flatTheme] of [['rottay', rottayFlatTheme], ['evnto', evntoFlatTheme]] as const) {
      const { cssVariables } = lowerFlatThemeFixture({ flatTheme, tenantSlug: slug });
      for (const channel of MANDATORY_FALLBACK_FONT_CHANNELS) {
        expect(cssVariables[channel], `${slug} ${channel}`).toBeUndefined();
      }
    }
  });

  it('leaves the mono stack alone — a code face renders no Arabic body text', () => {
    // D6-2c-ii (2026-09-15): anchored on bithire, whose preset authors a mono
    // family; evnto's no longer emits one, so it could not carry this claim.
    const { cssVariables } = lowerFlatThemeFixture({ flatTheme: bithireFlatTheme, tenantSlug: 'bithire' });
    expect(MANDATORY_FALLBACK_FONT_CHANNELS).not.toContain('--ds-font-family-mono');
    expect(cssVariables['--ds-font-family-mono']).toBeDefined();
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
    const { cssVariables } = lowerFlatThemeFixture({
      flatTheme: {
        ...evntoFlatTheme,
        typography: { ...evntoFlatTheme.typography, fontFamilyBase: 'Tahoma, sans-serif' },
      },
      tenantSlug: 'evnto',
    });
    expect(cssVariables['--ds-font-family-base']).toBe('Tahoma, sans-serif');
  });
});
