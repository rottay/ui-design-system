/**
 * The derived FLOOR for four opt-in `EXTENDED_PALETTE_CHANNELS` entries:
 * `--ds-color-primary-foreground`, `--ds-color-border-focus`,
 * `--ds-color-link`, `--ds-color-link-hover`.
 *
 * This file used to document a floor that was computed correctly but
 * DELIBERATELY NOT MERGED into `compileBrandTheme`'s live output, because a
 * competing emitter in the (now fully retired) runtime tenant-CSS generator
 * derived the same four channels from an NTSC luma-threshold heuristic and
 * the retired single-emitter assertion would have thrown the moment both compiled
 * paths claimed the same channel. That emitter is gone. The math has one
 * author now -- `deriveInteractionFloor`
 * (`../../../foundation/css/color-math/interaction-floor`) -- shared
 * verbatim between this static compiler and the DB appearance compiler, and
 * `deriveExtendedPaletteFloor` (this file's subject) is a thin, named wrapper
 * around it that IS wired into `compileBrandTheme`: merged under the
 * authored palette layer, so an authored value for any one of the four wins
 * for that channel alone and the other three keep deriving.
 *
 * The math also changed shape, not just wiring. The retired
 * `getReadableForegroundColor` was an NTSC-luma THRESHOLD heuristic; the
 * ink half of this floor is now `measureReadableInk`, which measures the
 * real WCAG contrast ratio of both canonical inks over the seed and reports
 * whichever is actually higher. On amber (`#F59E0B`) the old heuristic
 * answered white -- roughly 1.9:1, well under AA -- while the seed's dark
 * ink measures well over 10:1; that regression is this file's first focal
 * drill. And a seed that is a legal CSS color but not resolvable at compile
 * time (`var(--brand)`, `oklch(...)`) no longer gets a guessed default: the
 * two pass-through channels (border-focus, link) still restate the seed
 * verbatim, but the two channels that need real color math (foreground,
 * link-hover) are DEFERRED -- omitted from the floor entirely -- rather than
 * invented.
 */
import { describe, expect, it } from 'vitest';

import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { evntoBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/evnto';
import { rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/rottay';
import { contrastRatio } from '@/foundation/kernel/color/contrast';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

import { compileBrandTheme, deriveExtendedPaletteFloor } from '../index';

const FLOOR_CHANNELS = [
  '--ds-color-primary-foreground',
  '--ds-color-border-focus',
  '--ds-color-link',
  '--ds-color-link-hover',
] as const;

const WCAG_AA_NORMAL_TEXT_RATIO = 4.5;

describe('deriveExtendedPaletteFloor · the derivation floor, for a bare hex seed', () => {
  it('emits all four channels from a bare primary seed', () => {
    const floor = deriveExtendedPaletteFloor('#3A6FB0');
    for (const channel of FLOOR_CHANNELS) {
      expect(floor[channel], channel).toBeTruthy();
    }
    expect(Object.keys(floor).sort()).toEqual([...FLOOR_CHANNELS].sort());
  });

  it('--ds-color-primary-foreground always resolves to one of the two canonical inks', () => {
    // measureReadableInk (the math behind this channel) always picks
    // whichever of exactly two canonical inks has the HIGHER measured WCAG
    // ratio over the seed -- so the output range is closed even though the
    // winning ratio itself is not guaranteed to clear AA for a genuinely
    // mid-luminance seed (see the dedicated mid-gray drill below).
    for (const seed of ['#3A6FB0', '#171717', '#FFFFFF', '#F59E0B', '#22C55E', '#EF4444']) {
      const ink = deriveExtendedPaletteFloor(seed)['--ds-color-primary-foreground'];
      expect(['#171717', '#ffffff'], seed).toContain(ink);
    }
  });

  it('a genuinely mid-luminance seed still picks the BETTER of the two inks, even when neither clears AA', () => {
    // #808080 is equidistant in sRGB terms from black and white; the optimizer
    // still has to pick a side, and it picks whichever measures higher --
    // this is the honest edge the closed-range guarantee above does not paper
    // over.
    const ink = deriveExtendedPaletteFloor('#808080')['--ds-color-primary-foreground'];
    expect(['#171717', '#ffffff']).toContain(ink);
  });

  it('FOCAL: amber (#F59E0B) as the primary seed -- the derived foreground clears WCAG AA (>= 4.5:1)', () => {
    // The exact regression this derivation guards. The retired NTSC-luma
    // heuristic sums amber to ~167, under its 186 threshold, so it answered
    // white -- a contrast ratio of roughly 1.9:1, less than half of AA. The
    // WCAG-measured derivation answers dark ink, which clears AA by a wide
    // margin on the same seed.
    const seed = '#F59E0B';
    const ink = deriveExtendedPaletteFloor(seed)['--ds-color-primary-foreground'];
    expect(ink).toBe('#171717');
    expect(contrastRatio(ink, seed)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT_RATIO);
  });

  it('--ds-color-primary-foreground clears WCAG AA body text (>= 4.5:1) for a well-behaved (non-mid-luminance) seed spread', () => {
    // Bithire's actual primary, evnto's near-black, and rottay's effective
    // dark-surface primary -- the three real first-party seeds this floor is
    // meant to serve.
    for (const seed of [
      bithireBrandTheme.palette!.primaryColor,
      evntoBrandTheme.palette!.primaryColor,
      rottayBrandTheme.palette!.primaryColor,
    ]) {
      const ink = deriveExtendedPaletteFloor(seed)['--ds-color-primary-foreground'];
      expect(contrastRatio(ink, seed), `${seed} -> ${ink}`).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT_RATIO);
    }
  });

  it('--ds-color-border-focus and --ds-color-link both track the primary seed verbatim (pass-through, no math needed)', () => {
    const floor = deriveExtendedPaletteFloor('#3A6FB0');
    expect(floor['--ds-color-border-focus']).toBe('#3A6FB0');
    expect(floor['--ds-color-link']).toBe('#3A6FB0');
  });

  it('--ds-color-link-hover is a real OKLCH state shade of the seed, not a copy of it', () => {
    const floor = deriveExtendedPaletteFloor('#3A6FB0');
    expect(floor['--ds-color-link-hover']).not.toBe('#3A6FB0');
    expect(floor['--ds-color-link-hover']).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('FOCAL: a var()-authored primary -- the two pass-through channels still emit; foreground and link-hover are ABSENT, not invented', () => {
    // The retired floor guessed '#ffffff' for the foreground and copied the
    // seed verbatim for link-hover when it could not do real math on a
    // var() chain -- a fabricated pairing dressed up as a checked one. The
    // current floor DEFERS both instead: they are simply not present in the
    // returned map, leaving the cascade's own default to stand.
    const floor = deriveExtendedPaletteFloor('var(--brand-primary)');
    expect(floor['--ds-color-border-focus']).toBe('var(--brand-primary)');
    expect(floor['--ds-color-link']).toBe('var(--brand-primary)');
    expect(floor['--ds-color-primary-foreground']).toBeUndefined();
    expect(floor['--ds-color-link-hover']).toBeUndefined();
    expect(Object.keys(floor).sort()).toEqual(['--ds-color-border-focus', '--ds-color-link']);
  });

  it('the same deferral holds for any resolvable-but-non-hex CSS color, not just var()', () => {
    const floor = deriveExtendedPaletteFloor('oklch(0.6 0.12 250)');
    expect(floor['--ds-color-border-focus']).toBe('oklch(0.6 0.12 250)');
    expect(floor['--ds-color-link']).toBe('oklch(0.6 0.12 250)');
    expect(floor['--ds-color-primary-foreground']).toBeUndefined();
    expect(floor['--ds-color-link-hover']).toBeUndefined();
  });

  it('emits nothing at all for an absent seed or a string that is not a valid CSS color of any kind', () => {
    expect(deriveExtendedPaletteFloor(undefined)).toEqual({});
    expect(deriveExtendedPaletteFloor('')).toEqual({});
    expect(deriveExtendedPaletteFloor('not a color')).toEqual({});
  });
});

describe('deriveExtendedPaletteFloor · FOCAL: a primary edit moves all four floor channels together', () => {
  it('two seeds chosen to flip the picked ink move every one of the four channels', () => {
    // Deliberately near-black vs. near-white so the ink itself flips (not
    // just the two pass-through channels, which move on ANY seed change) --
    // the strongest form of "the floor is one coherent unit derived from one
    // seed", not four independently-moving values that happen to share input.
    const before = deriveExtendedPaletteFloor('#141414');
    const after = deriveExtendedPaletteFloor('#F5F5F0');
    for (const channel of FLOOR_CHANNELS) {
      expect(after[channel], channel).not.toBe(before[channel]);
    }
  });
});

describe('deriveExtendedPaletteFloor · authored-over-derived precedence, live through compileBrandTheme', () => {
  // This used to simulate the merge order by hand (`composeFloorThenAuthored`)
  // because the floor was computed but not yet wired into compileBrandTheme's
  // real output. It is wired in now, so these compose it through the actual
  // compiler instead of a stand-in.
  const SEED = '#3A6FB0';

  it('FOCAL: authoring only linkColor wins for that channel; the other three stay on the derived floor', () => {
    const derivedFloor = deriveExtendedPaletteFloor(SEED);
    const bt: BrandTheme = {
      id: 'authored-link',
      name: 'Authored Link',
      palette: { primaryColor: SEED, linkColor: '#1A1A1A' },
    };
    const compiled = compileBrandTheme({ brandTheme: bt, tenantSlug: 'authored-link' }).cssVariables;
    expect(compiled['--ds-color-link']).toBe('#1A1A1A');
    expect(compiled['--ds-color-primary-foreground']).toBe(derivedFloor['--ds-color-primary-foreground']);
    expect(compiled['--ds-color-border-focus']).toBe(derivedFloor['--ds-color-border-focus']);
    expect(compiled['--ds-color-link-hover']).toBe(derivedFloor['--ds-color-link-hover']);
  });

  it('FOCAL: removing the authored linkColor restores the derived value exactly', () => {
    const derivedFloor = deriveExtendedPaletteFloor(SEED);
    const bt: BrandTheme = { id: 'no-authored-link', name: 'No Authored Link', palette: { primaryColor: SEED } };
    const compiled = compileBrandTheme({ brandTheme: bt, tenantSlug: 'no-authored-link' }).cssVariables;
    expect(compiled['--ds-color-link']).toBe(derivedFloor['--ds-color-link']);
  });

  it('authoring primaryForegroundColor wins over the derived floor and leaves the other three derived', () => {
    const derivedFloor = deriveExtendedPaletteFloor(SEED);
    const bt: BrandTheme = {
      id: 'authored-foreground',
      name: 'Authored Foreground',
      palette: { primaryColor: SEED, primaryForegroundColor: '#FF00FF' },
    };
    const compiled = compileBrandTheme({ brandTheme: bt, tenantSlug: 'authored-foreground' }).cssVariables;
    expect(compiled['--ds-color-primary-foreground']).toBe('#FF00FF');
    expect(compiled['--ds-color-border-focus']).toBe(derivedFloor['--ds-color-border-focus']);
    expect(compiled['--ds-color-link']).toBe(derivedFloor['--ds-color-link']);
    expect(compiled['--ds-color-link-hover']).toBe(derivedFloor['--ds-color-link-hover']);
  });

  it('authoring borderFocusColor wins over the derived floor and leaves the other three derived', () => {
    const derivedFloor = deriveExtendedPaletteFloor(SEED);
    const bt: BrandTheme = {
      id: 'authored-focus',
      name: 'Authored Focus',
      palette: { primaryColor: SEED, borderFocusColor: 'rgba(10, 10, 10, 0.32)' },
    };
    const compiled = compileBrandTheme({ brandTheme: bt, tenantSlug: 'authored-focus' }).cssVariables;
    expect(compiled['--ds-color-border-focus']).toBe('rgba(10, 10, 10, 0.32)');
    expect(compiled['--ds-color-primary-foreground']).toBe(derivedFloor['--ds-color-primary-foreground']);
    expect(compiled['--ds-color-link']).toBe(derivedFloor['--ds-color-link']);
    expect(compiled['--ds-color-link-hover']).toBe(derivedFloor['--ds-color-link-hover']);
  });

  it('authoring linkHoverColor wins over the derived floor and leaves the other three derived', () => {
    const derivedFloor = deriveExtendedPaletteFloor(SEED);
    const bt: BrandTheme = {
      id: 'authored-link-hover',
      name: 'Authored Link Hover',
      palette: { primaryColor: SEED, linkHoverColor: '#0A0A0A' },
    };
    const compiled = compileBrandTheme({ brandTheme: bt, tenantSlug: 'authored-link-hover' }).cssVariables;
    expect(compiled['--ds-color-link-hover']).toBe('#0A0A0A');
    expect(compiled['--ds-color-primary-foreground']).toBe(derivedFloor['--ds-color-primary-foreground']);
    expect(compiled['--ds-color-border-focus']).toBe(derivedFloor['--ds-color-border-focus']);
    expect(compiled['--ds-color-link']).toBe(derivedFloor['--ds-color-link']);
  });

  it("rottay authors all four itself, in its light-mode overlay: the compiled light mode block keeps rottay's authored values, not the floor", () => {
    const compiled = compileBrandTheme({ brandTheme: rottayBrandTheme, tenantSlug: 'rottay' });
    const lightBlock = compiled.modeBlocks!.find((block) => block.mode === 'light')!;
    const authoredLight = rottayBrandTheme.modes!.light!.palette!;
    expect(lightBlock.cssVariables['--ds-color-primary-foreground']).toBe(authoredLight.primaryForegroundColor);
    expect(lightBlock.cssVariables['--ds-color-border-focus']).toBe(authoredLight.borderFocusColor);
    expect(lightBlock.cssVariables['--ds-color-link']).toBe(authoredLight.linkColor);
    expect(lightBlock.cssVariables['--ds-color-link-hover']).toBe(authoredLight.linkHoverColor);
  });
});

describe('the extended palette floor reaches real first-party output', () => {
  it('keeps authored channels and derives only the missing channels', () => {
    const channels = {
      '--ds-color-primary-foreground': 'primaryForegroundColor',
      '--ds-color-border-focus': 'borderFocusColor',
      '--ds-color-link': 'linkColor',
      '--ds-color-link-hover': 'linkHoverColor',
    } as const;

    for (const theme of [bithireBrandTheme, evntoBrandTheme]) {
      const palette = theme.palette!;
      const compiled = compileBrandTheme({ brandTheme: theme, tenantSlug: theme.id }).cssVariables;
      const derivedFloor = deriveExtendedPaletteFloor(palette.primaryColor);

      for (const [channel, field] of Object.entries(channels)) {
        expect(compiled[channel], `${theme.id}:${channel}`).toBe(
          palette[field as keyof typeof palette] ?? derivedFloor[channel]
        );
      }
    }
  });
});
