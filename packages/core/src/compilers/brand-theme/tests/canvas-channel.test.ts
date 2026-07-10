/**
 * @fileoverview The tenant owns its page ground (WO-TOK-06).
 *
 * `palette.darkBackgroundColor` used to compile only to `--ds-color-dark-bg`,
 * a variable with zero consumers, while the generator's dark block wrote a
 * literal `#0a0a0a`. A tenant could declare a ground and never see it: measured
 * in a browser, torture-dark asked for `#050307` and its canvas painted
 * `#0a0a0a`. There was no clear-mode ground field at all, so a light tenant
 * rendered light components on the design system's dark ground.
 */

import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '../index';
import { tortureDarkBrandTheme, tortureLightBrandTheme } from '../../../tokens/ts/brand-themes/_fixtures/torture';
import { bithireBrandTheme, rottayBrandTheme } from '../../../tokens/ts/brand-themes';

describe('the clear-mode ground is a BrandTheme channel', () => {
  it('a declared backgroundColor reaches --ds-color-bg-primary', () => {
    const { cssVariables } = compileBrandTheme({ brandTheme: tortureLightBrandTheme });
    expect(tortureLightBrandTheme.palette.backgroundColor).toBe('#FDFDFF');
    expect(cssVariables['--ds-color-bg-primary']).toBe('#FDFDFF');
    // The aliases the rest of the system reads must move with it, or a surface
    // that reads --ds-color-bg keeps the old ground.
    expect(cssVariables['--ds-color-bg']).toBe('#FDFDFF');
    expect(cssVariables['--ds-color-background']).toBe('#FDFDFF');
  });

  it('a theme with no clear ground emits none, leaving the DS default in place', () => {
    // Synthetic, not a shipped theme: whether rottay declares a clear ground is
    // a product decision that may change, and an assertion coupled to it would
    // fail for a reason that has nothing to do with the behaviour under test.
    const { palette, ...rest } = rottayBrandTheme;
    const { backgroundColor: _omitted, ...paletteWithoutGround } = palette;
    const { cssVariables } = compileBrandTheme({
      brandTheme: { ...rest, palette: paletteWithoutGround },
    });
    expect(cssVariables['--ds-color-bg-primary']).toBeUndefined();
  });

  it('the dark ground stays on its own channel and does not leak into clear mode', () => {
    const { cssVariables } = compileBrandTheme({ brandTheme: tortureDarkBrandTheme });
    expect(tortureDarkBrandTheme.palette.darkBackgroundColor).toBe('#050307');
    // The dark block is the generator's job: a `[data-theme='dark']` selector
    // exists nowhere else. What must NOT happen is the dark ground landing in
    // the clear-mode variable.
    expect(cssVariables['--ds-color-bg-primary']).toBeUndefined();
  });
});

describe('the ground field is no longer overloaded', () => {
  it('bithire declares a clear ground, not a dark one', () => {
    // `darkBackgroundColor: '#F8FBFF'` was a near-white: the field was being
    // used as "the ground" regardless of mode. Wiring that value into the dark
    // block would have painted bithire's dark mode white.
    expect(bithireBrandTheme.palette.backgroundColor).toBe('#F8FBFF');
    expect(bithireBrandTheme.palette.darkBackgroundColor).toBeUndefined();
  });

  it('a genuinely dark product keeps its dark ground', () => {
    expect(rottayBrandTheme.palette.darkBackgroundColor).toBe('#0C0C0E');
  });
});
