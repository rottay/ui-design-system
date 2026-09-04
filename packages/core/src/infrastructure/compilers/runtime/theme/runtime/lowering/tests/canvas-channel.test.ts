/**
 * @fileoverview The tenant owns its page ground (WO-TOK-06).
 *
 * `palette.darkBackgroundColor` used to compile only to `--ds-color-dark-bg`,
 * a variable with zero consumers, while the retired runtime generator's dark
 * block wrote a literal `#0a0a0a`. A tenant could declare a ground and never
 * see it: measured in a browser, torture-dark asked for `#050307` and its
 * canvas painted `#0a0a0a`. There was no clear-mode ground field at all, so a
 * light tenant rendered light components on the design system's dark ground.
 *
 * Both halves of that defect are now structurally impossible. There is ONE
 * ground field, `palette.backgroundColor`, and it belongs to the mode its
 * palette is authored for: the theme's `appearance.defaultMode` at the top
 * level, or the overlay's own mode inside `modes.{light,dark}`. So a ground is
 * always on the channel the page actually reads, and the prefixed twin that
 * nothing consumed does not exist to be declared into.
 */

import { describe, expect, it } from 'vitest';

import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import { tortureDarkBrandTheme, tortureLightBrandTheme } from '@tests/fixtures/brand-themes/torture';
import { bithireBrandTheme, rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes';

describe('the clear-mode ground is a BrandTheme channel', () => {
  it('a declared backgroundColor reaches --ds-color-bg-primary', () => {
    const { cssVariables } = lowerBrandThemeFixture({ brandTheme: tortureLightBrandTheme, tenantSlug: 'canvas-probe' });
    expect(tortureLightBrandTheme.palette!.backgroundColor).toBe('#FDFDFF');
    expect(cssVariables['--ds-color-bg-primary']).toBe('#FDFDFF');
    // The aliases the rest of the system reads must move with it, or a surface
    // that reads --ds-color-bg keeps the old ground.
    expect(cssVariables['--ds-color-bg']).toBe('#FDFDFF');
    expect(cssVariables['--ds-color-background']).toBe('#FDFDFF');
  });

  it('global reading ink and neutral borders are first-class BrandTheme channels', () => {
    const { cssVariables } = lowerBrandThemeFixture({ tenantSlug: 'canvas-probe', brandTheme: {
      ...tortureLightBrandTheme,
      palette: {
        ...tortureLightBrandTheme.palette!,
        textPrimaryColor: '#211D18',
        textSecondaryColor: '#51483D',
        textMutedColor: '#716658',
        textDisabledColor: '#8A8176',
        borderPrimaryColor: '#C8BFB3',
        borderSecondaryColor: '#E1DBD2',
      },
    } });

    expect(cssVariables['--ds-color-text-primary']).toBe('#211D18');
    expect(cssVariables['--ds-color-text-secondary']).toBe('#51483D');
    expect(cssVariables['--ds-color-text-muted']).toBe('#716658');
    expect(cssVariables['--ds-color-text-disabled']).toBe('#8A8176');
    expect(cssVariables['--ds-color-border-primary']).toBe('#C8BFB3');
    expect(cssVariables['--ds-color-border-secondary']).toBe('#E1DBD2');
  });

  it('a theme with no clear ground emits none, leaving the DS default in place', () => {
    // Synthetic, not a shipped theme: whether rottay declares a clear ground is
    // a product decision that may change, and an assertion coupled to it would
    // fail for a reason that has nothing to do with the behaviour under test.
    const { palette, ...rest } = rottayBrandTheme;
    const { backgroundColor: _omitted, ...paletteWithoutGround } = palette!;
    const { cssVariables } = lowerBrandThemeFixture({
      tenantSlug: 'canvas-probe',
      brandTheme: { ...rest, palette: paletteWithoutGround },
    });
    expect(cssVariables['--ds-color-bg-primary']).toBeUndefined();
  });

  it('each mode block carries its OWN ground, and neither leaks into the other', () => {
    // The same property, restated on the model that replaced the prefixed
    // field. torture-dark declares `defaultMode: 'dark'`, so its base block IS
    // its dark block and #050307 belongs in the plain ground channel there.
    // Its clear mode is a `modes.light` overlay, and #FDFDFF must appear in
    // THAT block and only there. The old shape could not express this: the
    // dark ground sat in `darkBackgroundColor`, which compiled to a variable
    // nothing read, so a tenant declared a ground and never saw it.
    const compiled = lowerBrandThemeFixture({
      brandTheme: tortureDarkBrandTheme,
      tenantSlug: 'canvas-probe',
    });

    expect(tortureDarkBrandTheme.appearance?.defaultMode).toBe('dark');
    expect(compiled.cssVariables['--ds-color-bg-primary']).toBe('#050307');
    expect(compiled.cssVariables['--ds-color-bg']).toBe('#050307');
    expect(compiled.cssVariables['--ds-color-background']).toBe('#050307');

    const lightBlock = compiled.modeBlocks?.find((block) => block.mode === 'light');
    expect(lightBlock, 'torture-dark authors a light mode overlay').toBeDefined();
    expect(lightBlock!.cssVariables['--ds-color-bg-primary']).toBe('#FDFDFF');

    // The leak the original case guarded against, in both directions.
    expect(lightBlock!.cssVariables['--ds-color-bg-primary']).not.toBe('#050307');
    expect(
      Object.values(compiled.cssVariables).includes('#FDFDFF'),
      'the light ground must not appear in the dark base block',
    ).toBe(false);
  });

  it('emits no `dark`-prefixed ground twin for any theme', () => {
    for (const brandTheme of [tortureDarkBrandTheme, tortureLightBrandTheme, rottayBrandTheme, bithireBrandTheme]) {
      const compiled = lowerBrandThemeFixture({ brandTheme, tenantSlug: 'canvas-probe' });
      const blocks = [compiled.cssVariables, ...(compiled.modeBlocks ?? []).map((b) => b.cssVariables)];
      for (const block of blocks) {
        expect(
          Object.keys(block).filter((name) => name.startsWith('--ds-color-dark-')),
          `${brandTheme.id} emits a dark-prefixed channel`,
        ).toEqual([]);
      }
    }
  });
});

describe('the ground field is no longer overloaded', () => {
  it('bithire declares its clear ground in the plain channel', () => {
    // `darkBackgroundColor: '#F8FBFF'` was once a near-white here: the field
    // was being used as "the ground" regardless of mode. There is now one
    // ground field per palette, and the mode it belongs to is the one the
    // palette is authored for.
    expect(bithireBrandTheme.appearance?.defaultMode).toBe('light');
    expect(bithireBrandTheme.palette!.backgroundColor).toBe('#F4F8FB');
  });

  it('a genuinely dark product declares its dark ground as its ground', () => {
    expect(rottayBrandTheme.appearance?.defaultMode).toBe('dark');
    expect(rottayBrandTheme.palette!.backgroundColor).toBe('#0C0C0E');
    // And it reaches the channel, which is the whole point of WO-TOK-06.
    const { cssVariables } = lowerBrandThemeFixture({
      brandTheme: rottayBrandTheme,
      tenantSlug: 'canvas-probe',
    });
    expect(cssVariables['--ds-color-bg-primary']).toBe('#0C0C0E');
  });
});
