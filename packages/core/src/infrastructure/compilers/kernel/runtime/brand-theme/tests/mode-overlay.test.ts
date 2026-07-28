/**
 * Strategic tests for the dual-mode BrandTheme contract (Codex C6.1).
 *
 * The defect this closes is duplicate authority: every vertical's non-default
 * mode used to be a hand-written block in its artifact extension, so a channel
 * had one author in light and a different one in dark, and nothing checked that
 * they agreed. These assert the properties that make a single author real —
 * a typed edit reaches the mode block, the mode block carries ONLY what it
 * changes, a theme without modes is untouched, and the default mode cannot be
 * authored twice.
 */
import { describe, expect, it } from 'vitest';

import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { evntoBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/evnto';
import { rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/platform';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

import { compileBrandTheme } from '../index';

const MINIMAL: BrandTheme = {
  id: 'fixture',
  name: 'Fixture',
  appearance: { defaultMode: 'light' },
  palette: { primaryColor: '#336699', backgroundColor: '#FFFFFF' },
};

const compile = (brandTheme: BrandTheme, tenantSlug = 'fixture') =>
  compileBrandTheme({ brandTheme, tenantSlug });

describe('BrandTheme.modes — typed dual-mode contract', () => {
  it('emits no mode block when a theme authors no modes', () => {
    const compiled = compile(MINIMAL);

    expect(compiled.modeBlocks).toBeUndefined();
    expect(compiled.cssString).not.toContain("[data-theme='dark']");
  });

  it('leaves the base block byte-identical when a mode is added', () => {
    const withDark: BrandTheme = {
      ...MINIMAL,
      modes: { dark: { palette: { backgroundColor: '#101014' } } },
    };

    // The base block is the default mode's contract. A second mode must not
    // reach back into it; that was the failure mode of the hand-written blocks.
    expect(compile(withDark).cssVariables).toEqual(compile(MINIMAL).cssVariables);
  });

  it('carries a typed overlay edit into the mode block', () => {
    const compiled = compile({
      ...MINIMAL,
      modes: { dark: { palette: { backgroundColor: '#101014' } } },
    });

    const dark = compiled.modeBlocks?.find((block) => block.mode === 'dark');
    expect(dark?.cssVariables['--ds-color-bg-primary']).toBe('#101014');
    expect(dark?.colorScheme).toBe('dark');
  });

  it('emits ONLY the channels the mode changes', () => {
    const compiled = compile({
      ...MINIMAL,
      modes: { dark: { palette: { backgroundColor: '#101014' } } },
    });
    const dark = compiled.modeBlocks?.find((block) => block.mode === 'dark');

    // Typography is untouched by the overlay, so the base block keeps owning it.
    // A mode block that restated everything would reintroduce the second author.
    expect(dark?.cssVariables['--ds-font-family-base']).toBeUndefined();
    for (const [channel, value] of Object.entries(dark?.cssVariables ?? {})) {
      expect(value).not.toBe(compiled.cssVariables[channel]);
    }
  });

  it('scopes the mode block one attribute above the base block', () => {
    const compiled = compile(
      { ...MINIMAL, modes: { dark: { palette: { backgroundColor: '#101014' } } } },
      'acme',
    );

    expect(compiled.cssString).toContain(
      "html[data-tenant='acme'][data-theme='dark'], html[data-tenant='acme'].dark {",
    );
    expect(compiled.cssString).toContain('  color-scheme: dark;');
  });

  it('merges an overlay leaf without dropping its siblings', () => {
    const base: BrandTheme = {
      ...MINIMAL,
      chrome: { sidebar: { bg: '#FFFFFF', itemColor: '#222222' } },
      modes: { dark: { chrome: { sidebar: { bg: '#101014' } } } },
    };
    const dark = compile(base).modeBlocks?.find((block) => block.mode === 'dark');

    expect(dark?.cssVariables['--ds-sidebar-bg']).toBe('#101014');
    // itemColor was not restated, so it must not have been erased by the merge.
    expect(compile(base).cssVariables['--ds-sidebar-item-color']).toBe('#222222');
  });

  it('refuses a mode overlay for the theme’s own default mode', () => {
    expect(() =>
      compile({
        ...MINIMAL,
        modes: { light: { palette: { backgroundColor: '#EEEEEE' } } },
      }),
    ).toThrow(/defaultMode/);
  });

  it('holds a mode overlay to the mandatory font fallback', () => {
    expect(() =>
      compile({
        ...MINIMAL,
        modes: { dark: { typography: { fontFamilyBase: 'Helvetica' } } },
      }),
    ).not.toThrow();

    // The guard reads the mode block's own emission: a mode may restyle type,
    // but not by shipping a stack the Arabic surface cannot fall back through.
    const compiled = compile({
      ...MINIMAL,
      modes: { dark: { typography: { fontFamilyBase: 'Helvetica' } } },
    });
    const dark = compiled.modeBlocks?.find((block) => block.mode === 'dark');
    expect(dark?.cssVariables['--ds-font-family-base']).toContain('Noto Sans Arabic');
  });
});

describe('BrandPalette.ramps — authored steps over derived ones', () => {
  it('lets an authored step win while the rest of the ramp keeps deriving', () => {
    const derived = compile(MINIMAL).cssVariables;
    const pinned = compile({
      ...MINIMAL,
      palette: { ...MINIMAL.palette!, ramps: { primary: { 500: '#ABCDEF' } } },
    }).cssVariables;

    expect(pinned['--ds-color-primary-500']).toBe('#ABCDEF');
    expect(pinned['--ds-color-primary-400']).toBe(derived['--ds-color-primary-400']);
  });

  it('emits an authored-only role that has no seed to derive from', () => {
    const compiled = compile({
      ...MINIMAL,
      palette: { ...MINIMAL.palette!, ramps: { neutral: { 100: '#0F1520' } } },
    }).cssVariables;

    expect(compiled['--ds-color-neutral-100']).toBe('#0F1520');
    expect(compiled['--ds-color-neutral-200']).toBeUndefined();
  });
});

describe('the three first-party verticals', () => {
  it('each author their non-default mode through the contract', () => {
    for (const [brandTheme, slug, mode] of [
      [bithireBrandTheme, 'bithire', 'dark'],
      [evntoBrandTheme, 'evnto', 'dark'],
      [rottayBrandTheme, 'rottay', 'light'],
    ] as const) {
      const compiled = compile(brandTheme, slug);
      const block = compiled.modeBlocks?.find((candidate) => candidate.mode === mode);

      expect(block, `${slug} must author its ${mode} mode`).toBeDefined();
      expect(Object.keys(block!.cssVariables).length).toBeGreaterThan(0);
      expect(compiled.colorScheme).not.toBe(mode);
    }
  });

  it('gives rottay its hand-tuned ramp instead of the derived one', () => {
    // Rottay's steps are set against its own dark canvas; the even OKLCH
    // derivation is deliberately not what it ships.
    const compiled = compile(rottayBrandTheme, 'rottay');
    expect(compiled.cssVariables['--ds-color-primary-300']).toBe('#2A2A2F');
  });
});
