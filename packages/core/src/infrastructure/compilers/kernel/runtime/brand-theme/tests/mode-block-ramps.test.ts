/**
 * GAP B — a color ramp for the mode a light-surface tenant does NOT default
 * to.
 *
 * This file used to be `dark-color-ramps.test.ts` and tested
 * the retired dark-ramp twin, a standalone function that re-derived the
 * OKLCH ramp a SECOND time, forced onto a tenant's dark ground, into a
 * separate `--ds-color-dark-{role}-{step}` channel family that existed
 * alongside the light one. That function, and the whole `--ds-color-dark-*`
 * channel family it fed (both the stepped ramp and the older un-ramped
 * `--ds-color-dark-primary`-style alias), are gone.
 *
 * The capability did not go with it. A theme's non-default mode is now a
 * typed `modes.{light,dark}` overlay: the compiler merges it over the base
 * theme, re-enters the SAME `deriveTenantColorRamps` used for the default
 * mode -- passed that mode's own surface -- and emits only the channels that
 * differ from the base into a `CompiledBrandModeBlock`. So a light-surface
 * tenant's dark ramp is not a second, parallel channel family any more; it is
 * the ordinary `--ds-color-{role}-{step}` names, scoped to the mode block's
 * own selector (`brandModeSelector`) instead of the base selector. One
 * channel family, one derivation, two grounds.
 */
import { describe, expect, it } from 'vitest';

import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { evntoBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/evnto';
import { rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/rottay';
import { hexToOklch } from '@/foundation/kernel/color/oklch';
import { RAMP_STEPS } from '@/foundation/kernel/color/oklch/ramp';
import type { BrandPalette, BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

import { compileBrandTheme, deriveTenantColorRamps } from '../index';

/**
 * What a channel RESOLVES to while a mode block is active.
 *
 * A mode block carries only the diff: `compileModeBlocks` drops any key whose
 * compiled value already equals the base block's, because the base block still
 * cascades underneath it. So "is the authored dark value the one that paints"
 * is answered by the block first and the base second -- exactly how the
 * browser answers it. Asserting mere PRESENCE in the block would fail for
 * every step whose two modes legitimately agree, which is a property of the
 * palette, not a defect.
 */
const effective = (
  base: Record<string, string>,
  block: Record<string, string>,
  channel: string,
): string | undefined => block[channel] ?? base[channel];

describe('a light-surface tenant compiles a real color ramp for its non-default (dark) mode', () => {
  it('bithire (light-default): compileBrandTheme carries exactly one modeBlocks entry, for dark', () => {
    const compiled = compileBrandTheme({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
    expect(compiled.modeBlocks).toHaveLength(1);
    expect(compiled.modeBlocks![0]).toMatchObject({ mode: 'dark', colorScheme: 'dark' });
  });

  it('bithire: every step its dark overlay authors is what resolves in dark mode', () => {
    const compiled = compileBrandTheme({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
    const darkVars = compiled.modeBlocks![0].cssVariables;
    const authoredDarkRamps = bithireBrandTheme.modes!.dark!.palette!.ramps!;
    for (const role of Object.keys(authoredDarkRamps) as (keyof typeof authoredDarkRamps)[]) {
      for (const step of RAMP_STEPS) {
        const expected = authoredDarkRamps[role]?.[step];
        if (expected === undefined) continue;
        const channel = `--ds-color-${role}-${step}`;
        expect(effective(compiled.cssVariables, darkVars, channel), channel).toBe(expected);
      }
    }
  });

  it('evnto (light-default): its dark overlay also compiles a real ramp block', () => {
    const compiled = compileBrandTheme({ brandTheme: evntoBrandTheme, tenantSlug: 'evnto' });
    expect(compiled.modeBlocks).toHaveLength(1);
    const darkVars = compiled.modeBlocks![0].cssVariables;
    const authoredDarkRamps = evntoBrandTheme.modes!.dark!.palette!.ramps!;
    for (const role of Object.keys(authoredDarkRamps) as (keyof typeof authoredDarkRamps)[]) {
      for (const step of RAMP_STEPS) {
        const expected = authoredDarkRamps[role]?.[step];
        if (expected === undefined) continue;
        const channel = `--ds-color-${role}-${step}`;
        expect(effective(compiled.cssVariables, darkVars, channel), channel).toBe(expected);
      }
    }
    // Not vacuous: the block must actually carry ramp steps of its own, or the
    // assertion above would be satisfied entirely by the base block. The count
    // is deliberately not pinned -- how MANY steps move is a property of how
    // far evnto's two palettes sit apart, which is a design decision, not a
    // compiler guarantee.
    expect(
      Object.keys(darkVars).filter((name) => /^--ds-color-[a-z]+-\d+$/.test(name)).length,
    ).toBeGreaterThan(0);
  });

  it('bithire: the dark overlay moves real ramp steps, and carries nothing that agrees with the base', () => {
    const compiled = compileBrandTheme({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
    const lightVars = compiled.cssVariables;
    const darkVars = compiled.modeBlocks![0].cssVariables;
    const authoredDarkRamps = bithireBrandTheme.modes!.dark!.palette!.ramps!;
    // Every authored role, including `neutral` -- which has no seed of its
    // own and exists ONLY as a hand-authored ramp, so it is not in `ROLES`
    // (the seeded subset `rampRoleSpecs` derives) but is still a real channel
    // family this mode block must restate.
    //
    // NOT per step, and not even per role. A mode block carries the diff, so a
    // step whose two modes legitimately agree is correctly absent -- and a
    // whole ROLE can agree: bithire authors the same accent ramp for both
    // modes. Demanding movement anywhere in particular would assert a property
    // of the palette's colour choices, not of the compiler.
    //
    // The two compiler guarantees are: the block is a real diff (something
    // moved), and it is ONLY a diff (nothing it carries agrees with the base).
    // The second is the one that catches a broken filter, and it is checked
    // over every carried channel rather than a sampled one.
    let moved = 0;
    for (const role of Object.keys(authoredDarkRamps) as (keyof typeof authoredDarkRamps)[]) {
      const authoredSteps = authoredDarkRamps[role];
      if (!authoredSteps) continue;
      for (const step of RAMP_STEPS) {
        const channel = `--ds-color-${role}-${step}`;
        if (darkVars[channel] === undefined) continue;
        expect(darkVars[channel], channel).not.toBe(lightVars[channel]);
        moved += 1;
      }
    }
    expect(moved, 'the dark overlay moved no authored ramp step at all').toBeGreaterThan(0);
  });
});

describe('a dark-surface tenant (rottay): its non-default (light) mode compiles its own ramp too', () => {
  it('rottay compiles exactly one modeBlocks entry, for light', () => {
    const compiled = compileBrandTheme({ brandTheme: rottayBrandTheme, tenantSlug: 'rottay' });
    expect(compiled.modeBlocks).toHaveLength(1);
    expect(compiled.modeBlocks![0]).toMatchObject({ mode: 'light', colorScheme: 'light' });
  });

  it('the light mode block carries rottay\'s own hand-authored light ramp, distinct from the dark base', () => {
    const compiled = compileBrandTheme({ brandTheme: rottayBrandTheme, tenantSlug: 'rottay' });
    const darkVars = compiled.cssVariables; // rottay's base IS dark (its declared default)
    const lightVars = compiled.modeBlocks![0].cssVariables;
    const authoredLightRamps = rottayBrandTheme.modes!.light!.palette!.ramps!;
    for (const role of Object.keys(authoredLightRamps) as (keyof typeof authoredLightRamps)[]) {
      const authoredSteps = authoredLightRamps[role];
      if (!authoredSteps) continue;
      let moved = 0;
      for (const step of RAMP_STEPS) {
        const expected = authoredSteps[step];
        if (expected === undefined) continue;
        const channel = `--ds-color-${role}-${step}`;
        // Same diff semantics as bithire's dark block above: the authored
        // value must be what RESOLVES in light mode, and the block itself
        // carries only the steps that actually move off the dark base.
        expect(effective(darkVars, lightVars, channel), channel).toBe(expected);
        if (lightVars[channel] !== undefined) {
          expect(lightVars[channel], channel).not.toBe(darkVars[channel]);
          moved += 1;
        }
      }
      expect(moved, `${role}: no step moved off the dark base ramp`).toBeGreaterThan(0);
    }
  });
});

describe('no --ds-color-dark-* channel survives anywhere in a compiled theme', () => {
  // The full family this WO's predecessor added -- the stepped
  // `--ds-color-dark-{role}-{step}` ramp AND the older un-ramped
  // `--ds-color-dark-primary`-style alias -- is deleted, not merely unused.
  const DARK_PREFIXED = /^--ds-color-dark-/;
  // The CSS-string check needs its own pattern. `DARK_PREFIXED` is `^`-anchored
  // with no `m` flag, which is right for testing a property NAME but vacuous
  // against `compiled.cssString`: that string always starts with the tenant
  // selector `html[data-tenant=...`, so the assertion could never fail no
  // matter what the compiler emitted mid-string. This one matches a
  // declaration wherever it appears.
  const DARK_PREFIXED_DECLARATION = /(^|[\s;{])--ds-color-dark-[a-z0-9-]*\s*:/m;

  it.each([
    ['bithire', bithireBrandTheme],
    ['evnto', evntoBrandTheme],
    ['rottay', rottayBrandTheme],
  ] as const)('%s: base cssVariables and every mode block are clean', (_name, theme) => {
    const compiled = compileBrandTheme({ brandTheme: theme, tenantSlug: theme.id });
    const baseOffenders = Object.keys(compiled.cssVariables).filter((key) => DARK_PREFIXED.test(key));
    expect(baseOffenders).toEqual([]);
    for (const block of compiled.modeBlocks ?? []) {
      const offenders = Object.keys(block.cssVariables).filter((key) => DARK_PREFIXED.test(key));
      expect(offenders, `${theme.id} ${block.mode} block`).toEqual([]);
    }
    expect(compiled.cssString).not.toMatch(DARK_PREFIXED_DECLARATION);
  });

  it('drill · the cssString assertion can actually fail', () => {
    // A negative assertion that never had a way to fire is not evidence. This
    // proves the replacement pattern catches a mid-string declaration in the
    // exact shape the compiler would emit one.
    const compiled = compileBrandTheme({
      brandTheme: rottayBrandTheme,
      tenantSlug: rottayBrandTheme.id,
    });
    const planted = compiled.cssString.replace(
      '{\n',
      '{\n  --ds-color-dark-primary: #FFFFFF;\n',
    );
    expect(planted).not.toBe(compiled.cssString);
    expect(planted).toMatch(DARK_PREFIXED_DECLARATION);
    // ...and the retired anchored pattern still would not have caught it.
    expect(planted).not.toMatch(DARK_PREFIXED);
  });
});

describe('deriveTenantColorRamps · a genuinely DERIVED (not hand-authored) dark ramp is monotonic and reachable', () => {
  // Bithire/evnto/rottay all hand-author every step of their non-default
  // mode's ramp today (see the fixtures), so their shipped ramps do not
  // exercise the OKLCH derivation's own lightness ordering. A synthetic
  // palette with no `ramps` override does, and is the honest place to prove
  // the "one seed, one full evenly-stepped ramp" property that used to be
  // asserted against bithire's (then-derived, now hand-tuned) dark twin.
  const SYNTHETIC: BrandPalette = {
    primaryColor: '#3A6FB0',
    secondaryColor: '#5B7C99',
    backgroundColor: '#0A0A0A',
  };

  it('is monotonic in OKLCH lightness from step 50 (near the dark ground) to step 900 (far, near-white)', () => {
    const ramp = deriveTenantColorRamps(SYNTHETIC, 'dark');
    const lightnessOf = (hex: string) => hexToOklch(hex).l;
    for (const role of ['primary', 'secondary'] as const) {
      const lightnesses = RAMP_STEPS.map((step) => lightnessOf(ramp[`--ds-color-${role}-${step}`]));
      for (let i = 1; i < lightnesses.length; i += 1) {
        expect(
          lightnesses[i],
          `${role}: step ${RAMP_STEPS[i]} (${lightnesses[i].toFixed(4)}) should be lighter than step ${RAMP_STEPS[i - 1]} (${lightnesses[i - 1].toFixed(4)})`,
        ).toBeGreaterThan(lightnesses[i - 1]);
      }
    }
  });

  it('is wired into compileBrandTheme through the mode-block path exactly like the hand-authored cases above', () => {
    const bt: BrandTheme = {
      id: 'synthetic-dark-mode',
      name: 'Synthetic Dark Mode',
      appearance: { defaultMode: 'light' },
      palette: { primaryColor: '#3A6FB0', backgroundColor: '#FFFFFF' },
      modes: { dark: { palette: { backgroundColor: '#0A0A0A' } } },
    };
    const compiled = compileBrandTheme({ brandTheme: bt, tenantSlug: 'synthetic-dark-mode' });
    const expected = deriveTenantColorRamps(
      { primaryColor: '#3A6FB0', backgroundColor: '#0A0A0A' },
      'dark',
    );
    for (const step of RAMP_STEPS) {
      const channel = `--ds-color-primary-${step}`;
      expect(compiled.modeBlocks![0].cssVariables[channel], channel).toBe(expected[channel]);
    }
  });
});
