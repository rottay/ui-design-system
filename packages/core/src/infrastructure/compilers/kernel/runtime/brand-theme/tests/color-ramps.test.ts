/**
 * Perceptual color ramp derivation, wired into compileBrandTheme (WO-TOK-02).
 *
 * Proves: (1) surface classification is correct for all three real
 * first-party tenants -- now a DECLARED `appearance.defaultMode`, not an
 * inference from which palette fields happen to be set (the old
 * "darkBackgroundColor present -> dark-surface" rule, and the field it read,
 * are both gone; a theme's other mode lives in `modes.dark`/`modes.light`,
 * a sibling object, never a second field on the same palette); (2) every
 * derived ramp is even, gamut-valid, and reaches `compileBrandTheme`'s
 * output, keyed to the SURFACE its caller states rather than one this module
 * infers; (3) a deliberately-failing seed (near-invisible against its own
 * ground) fails an APCA compile-time check, proving the gate WO-TOK-02 step 5
 * wires into `build-vertical-artifacts.mjs` is exercisable and real.
 */
import { describe, expect, it } from 'vitest';

import { apcaContrast } from '@/foundation/kernel/accessibility/branding-contrast';
import { RAMP_STEPS } from '@/foundation/kernel/color/oklch/ramp';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { evntoBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/evnto';
import { rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/rottay';
import type { BrandPalette } from '@/foundation/contracts/composition/tenants/themes';
import { compileBrandTheme, deriveTenantColorRamps, isDarkSurfaceTheme } from '../index';

const ROLES = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'] as const;

// `isDarkSurfacePalette(palette)` -- the old shape-based inference ("declares
// darkBackgroundColor and no backgroundColor") -- is gone along with the
// `BrandPalette.darkBackgroundColor` field it read. A theme now DECLARES its
// mode (`appearance.defaultMode`) instead of it being inferred from which
// fields happen to be set, so the classifier is `isDarkSurfaceTheme(theme)`
// and takes the whole BrandTheme, not a bare palette.
describe('isDarkSurfaceTheme', () => {
  it('rottay is dark-surface (appearance.defaultMode: "dark")', () => {
    expect(rottayBrandTheme.appearance?.defaultMode).toBe('dark');
    expect(isDarkSurfaceTheme(rottayBrandTheme)).toBe(true);
  });

  it('bithire is light-surface (appearance.defaultMode: "light")', () => {
    expect(isDarkSurfaceTheme(bithireBrandTheme)).toBe(false);
  });

  it('evnto is light-surface -- its dark ground lives in modes.dark, not a second field on the same palette', () => {
    // The old test proved evnto was light-surface "even though it ALSO
    // declares darkBackgroundColor" -- a second field on the SAME palette
    // object. That shape no longer exists: a palette authors exactly one
    // mode, and the other mode's ground is a value inside `modes.dark`, a
    // sibling object entirely. There is nothing left to be misled by.
    expect(evntoBrandTheme.appearance?.defaultMode).toBe('light');
    expect(evntoBrandTheme.palette?.backgroundColor).toBeDefined();
    expect('darkBackgroundColor' in (evntoBrandTheme.palette ?? {})).toBe(false);
    expect(evntoBrandTheme.modes?.dark?.palette?.backgroundColor).toBeDefined();
    expect(isDarkSurfaceTheme(evntoBrandTheme)).toBe(false);
  });

  it('classification is purely declarative: a dark-default theme with a light-shaped palette is still dark-surface', () => {
    // The point of retiring the shape-based inference: a theme's mode is
    // whatever it DECLARES, never guessed back from which fields are set.
    expect(
      isDarkSurfaceTheme({
        id: 'declared-dark',
        name: 'Declared Dark',
        appearance: { defaultMode: 'dark' },
        palette: { primaryColor: '#123456', backgroundColor: '#FFFFFF' },
      }),
    ).toBe(true);
  });

  it('a theme with no declared appearance is light-surface (falls to the DS light default)', () => {
    expect(isDarkSurfaceTheme({ id: 'bare', name: 'Bare', palette: { primaryColor: '#123456' } })).toBe(false);
  });

  it('no theme at all is light-surface', () => {
    expect(isDarkSurfaceTheme(undefined)).toBe(false);
  });
});

describe('deriveTenantColorRamps wired into compileBrandTheme', () => {
  it('emits a 50..900 ramp for every role bithire declares a seed for', () => {
    const { cssVariables } = compileBrandTheme({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
    for (const role of ROLES) {
      for (const step of RAMP_STEPS) {
        const value = cssVariables[`--ds-color-${role}-${step}`];
        expect(value, `--ds-color-${role}-${step}`).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it('emits a 50..900 ramp for every role rottay declares a dark seed (or falls back to the light seed) for', () => {
    const { cssVariables } = compileBrandTheme({ brandTheme: rottayBrandTheme, tenantSlug: 'rottay' });
    const authored = rottayBrandTheme.palette?.ramps ?? {};
    for (const role of ROLES) {
      for (const step of RAMP_STEPS) {
        const value = cssVariables[`--ds-color-${role}-${step}`];
        expect(value, `--ds-color-${role}-${step}`).toBeTruthy();
        // Rottay hand-tunes its steps, and an authored step is any CSS color —
        // its success-50 is an alpha tint. Only the DERIVED steps are the
        // gamut-mapped opaque hex the OKLCH ramp produces.
        if (authored[role]?.[step] === undefined) {
          expect(value, `--ds-color-${role}-${step}`).toMatch(/^#[0-9A-F]{6}$/);
        } else {
          expect(value, `--ds-color-${role}-${step}`).toBe(authored[role][step]);
        }
      }
    }
  });

  it("rottay's primary ramp is dark-tuned: step 900 (far from its dark canvas) is high-contrast against step 50 (near canvas)", () => {
    // `deriveTenantColorRamps` no longer infers the surface from the
    // palette's own shape -- that inference is gone along with
    // `isDarkSurfacePalette`. The CALLER now states which ground this ramp is
    // FOR, exactly as `compileBrandTheme` does via `brandThemeRampSurface`.
    // Omitting it here would silently default to 'light', which would clamp
    // rottay's near-black ground into the LIGHT endpoint band and invert the
    // whole ramp's polarity -- so this is not cosmetic, it is the argument
    // that makes the assertion below true.
    const ramp = deriveTenantColorRamps(rottayBrandTheme.palette, 'dark');
    // step 900 is light text on a step-50 (dark) background -- reverse polarity,
    // so APCA reports it as a large-MAGNITUDE NEGATIVE Lc. Assert magnitude, not sign.
    expect(Math.abs(apcaContrast(ramp['--ds-color-primary-900'], ramp['--ds-color-primary-50']))).toBeGreaterThan(60);
  });

  it('passing the wrong surface changes the ramp -- proving the explicit argument is load-bearing', () => {
    // Deliberately NOT one of the shipped first-party palettes. All three
    // hand-author `palette.ramps`, and an authored step overwrites the derived
    // one, so their compiled ramps are byte-identical under either surface --
    // which would make this drill pass vacuously (or, as written against
    // rottay, fail for a reason that has nothing to do with the argument).
    //
    // A seed on a dark ground with NO authored steps is the case the argument
    // actually governs: `rampEndpoints` clamps the ground's lightness into a
    // different band and runs toward the opposite extreme per surface.
    const derivable: BrandPalette = {
      primaryColor: '#3A6FB0',
      backgroundColor: '#0C0C0E',
    };

    const dark = deriveTenantColorRamps(derivable, 'dark');
    const wrongSurface = deriveTenantColorRamps(derivable, 'light');

    const differing = Object.keys(dark).filter((channel) => wrongSurface[channel] !== dark[channel]);
    expect(differing.length, 'the surface argument changed nothing').toBeGreaterThan(0);
    // And the inversion is real, not a rounding wobble: the two surfaces run
    // their ramps toward opposite extremes.
    expect(wrongSurface['--ds-color-primary-900']).not.toBe(dark['--ds-color-primary-900']);
  });

  it("bithire's primary ramp is light-tuned: step 50 near its own light canvas, step 900 near-black", () => {
    const ramp = deriveTenantColorRamps(bithireBrandTheme.palette, 'light');
    expect(ramp['--ds-color-primary-50']).toBeDefined();
    expect(ramp['--ds-color-primary-900']).toBeDefined();
    // Both ends must actually differ -- a flat ramp would defeat the point.
    expect(ramp['--ds-color-primary-50']).not.toBe(ramp['--ds-color-primary-900']);
  });

  it('an empty palette derives no ramp variables', () => {
    expect(deriveTenantColorRamps(undefined)).toEqual({});
  });

  it('surface defaults to light when the caller omits it', () => {
    const explicit = deriveTenantColorRamps(bithireBrandTheme.palette, 'light');
    const defaulted = deriveTenantColorRamps(bithireBrandTheme.palette);
    expect(defaulted).toEqual(explicit);
  });

  it('a role with no declared seed is skipped, not defaulted to a placeholder', () => {
    const ramp = deriveTenantColorRamps({ primaryColor: '#3A6FB0' } as BrandPalette, 'light');
    expect(ramp['--ds-color-primary-500']).toBeDefined();
    expect(ramp['--ds-color-secondary-500']).toBeUndefined();
    expect(ramp['--ds-color-success-500']).toBeUndefined();
  });
});

/**
 * A role's seed color -- the value that reaches `--ds-color-{role}`
 * verbatim (brand-theme/index.ts's existing palette passthrough) -- checked
 * against the tenant's own ground.
 */
function seedGroundFailures(palette: BrandPalette, ground: string): string[] {
  const roles: Array<[string, string | undefined]> = [
    ['primary', palette.primaryColor],
    ['secondary', palette.secondaryColor],
    ['accent', palette.accentColor],
    ['success', palette.successColor],
    ['warning', palette.warningColor],
    ['error', palette.errorColor],
    ['info', palette.infoColor],
  ];
  const failures: string[] = [];
  for (const [name, seed] of roles) {
    if (!seed) continue;
    if (Math.abs(apcaContrast(seed, ground)) < 45) failures.push(`${name} (${seed}) vs ground ${ground}`);
  }
  return failures;
}

describe('APCA scorer proof: a deliberately-failing seed fails it (WO-TOK-02 step 5)', () => {
  it('a seed nearly identical to its own ground FAILS an APCA UI-threshold check', () => {
    // #F8FBFF is bithire's own ground; a "brand color" one shade off it is a
    // stand-in for the class of defect an APCA gate exists to catch -- an
    // off-palette or careless tenant seed that would render as a
    // near-invisible UI element against its own canvas.
    const hostilePalette: BrandPalette = {
      primaryColor: '#F9FCFF', // one step off bithire's own #F8FBFF ground
      backgroundColor: '#F8FBFF',
    };
    const failures = seedGroundFailures(hostilePalette, '#F8FBFF');
    expect(failures).toEqual(['primary (#F9FCFF) vs ground #F8FBFF']);
  });

  it('FINDING: bithire\'s own warningColor already fails this check today, pre-existing and out of WO-TOK-02 scope', () => {
    // Not a regression from this WO's derivation: this is bithire's existing,
    // hand-authored warningColor (#D6A04E) against its existing, hand-authored
    // ground (#F8FBFF) -- unrelated to the new ramp/tint-scale work. It is
    // consistent with the pre-existing `a11y.apcaPairings` counter
    // (engine-token-audit.mjs, baseline 6) whose own doc comment says
    // "dark-surface saturated status colors ... sit below the bar today ...
    // decrease-only, no hard target". Documented here, not silently
    // discovered later, and why the compile-time gate wired into
    // build-vertical-artifacts.mjs (step 5) checks the GENERATED RAMP's own
    // construction rather than hard-failing on every pre-existing seed --
    // doing the latter would break bithire's build today over a color choice
    // this WO has no mandate to change (WO-GAT-04 already owns this exact
    // check as a decrease-only ratchet, not a hard gate; "extend, never
    // fork").
    const failures = seedGroundFailures(bithireBrandTheme.palette as BrandPalette, '#F8FBFF');
    expect(failures).toEqual(['warning (#D6A04E) vs ground #F8FBFF']);
  });
});

describe('compile-time ramp gate (what is actually wired into build-vertical-artifacts.mjs)', () => {
  /**
   * The check WO-TOK-02 step 5 wires into `build-vertical-artifacts.mjs`:
   * per tenant, per role, the ramp's own far-from-ground extreme (the step
   * meant to be usable as readable text/icon color, always step 900 in this
   * derivation regardless of surface -- see ramp.ts) must clear the APCA
   * body-text threshold against the tenant's own ground. This is scoped to
   * what THIS WO generates (the ramp), not a re-check of pre-existing seed
   * colors (see the FINDING above for why that stays out of scope). It is a
   * real regression gate -- it protects the derivation's own contrast
   * guarantee against a future change to the endpoint constants in ramp.ts,
   * not a test that can fail on tenant input, since the far endpoint is
   * anchored to a fixed lightness bound independent of the seed.
   */
  function rampFarExtremeFailures(
    palette: BrandPalette,
    ground: string,
    surface: 'light' | 'dark',
  ): string[] {
    // `surface` must match the tenant's own ground direction (see the
    // "rottay: passing the wrong surface" drill above) -- a caller-supplied
    // argument now, not something this derivation infers from the palette.
    const ramp = deriveTenantColorRamps(palette, surface);
    const failures: string[] = [];
    for (const [name, hex] of Object.entries(ramp)) {
      if (!name.endsWith('-900')) continue;
      if (Math.abs(apcaContrast(hex, ground)) < 60) failures.push(`${name} vs ground ${ground}`);
    }
    return failures;
  }

  it('bithire: every role\'s step-900 clears the body-text threshold against its light ground', () => {
    expect(rampFarExtremeFailures(bithireBrandTheme.palette as BrandPalette, '#F8FBFF', 'light')).toEqual([]);
  });

  it('rottay: only its four hand-tuned status ramps miss the body-text threshold', () => {
    // Rottay authors these four step-900s by hand against its dark canvas, and
    // they do not clear the threshold. They ship today — the values moved from
    // the artifact extension into palette.ramps without changing — so they are
    // recorded in scripts/contrast-baseline/index.json rather
    // than repainted inside an architecture wave. Anything BEYOND this list is
    // a regression and fails here and in the build gate.
    expect(rampFarExtremeFailures(rottayBrandTheme.palette as BrandPalette, '#0C0C0E', 'dark')).toEqual([
      '--ds-color-success-900 vs ground #0C0C0E',
      '--ds-color-warning-900 vs ground #0C0C0E',
      '--ds-color-error-900 vs ground #0C0C0E',
      '--ds-color-info-900 vs ground #0C0C0E',
    ]);
  });

  it('evnto: every role\'s step-900 clears the body-text threshold against its light ground', () => {
    expect(rampFarExtremeFailures(evntoBrandTheme.palette as BrandPalette, '#FFFFFF', 'light')).toEqual([]);
  });
});
