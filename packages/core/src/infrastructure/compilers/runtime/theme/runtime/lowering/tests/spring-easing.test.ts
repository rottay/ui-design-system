import { describe, it, expect } from 'vitest';
import {
  springLinearEasing,
  springLinearEasingGentle,
} from '@/infrastructure/compilers/kernel/foundation/motion/spring-easing';
import { brandThemeToTokenOverrides } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/personality";
import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import { bithireBrandTheme, evntoBrandTheme, rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

/** Parse `linear(0, 0.1, ..., 1)` back into its numeric stops for assertions. */
function parseLinearStops(value: string): number[] {
  const match = /^linear\(([^)]*)\)$/.exec(value.trim());
  expect(match, `expected a linear() function, got: ${value}`).not.toBeNull();
  return match![1].split(',').map((s) => Number(s.trim()));
}

describe('springLinearEasing', () => {
  it('emits a linear() function with steps+1 stops', () => {
    const value = springLinearEasing(170, 26, { steps: 10 });
    expect(value.startsWith('linear(')).toBe(true);
    const stops = parseLinearStops(value);
    expect(stops).toHaveLength(11);
  });

  it('starts at rest (0) and lands exactly on target (1)', () => {
    const stops = parseLinearStops(springLinearEasing(170, 26));
    expect(stops[0]).toBe(0);
    expect(stops[stops.length - 1]).toBe(1);
  });

  it('defaults to 24 steps (25 stops) when unspecified', () => {
    const stops = parseLinearStops(springLinearEasing(170, 26));
    expect(stops).toHaveLength(25);
  });

  it('near-critical damping (rottay: tension 170 / friction 26) stays close to 1 with minimal overshoot', () => {
    const stops = parseLinearStops(springLinearEasing(170, 26));
    const max = Math.max(...stops);
    // Near-critical damping (damping ratio close to but under 1) settles with
    // at most a very small overshoot, not a pronounced bounce.
    expect(max).toBeLessThan(1.05);
    expect(max).toBeGreaterThanOrEqual(1);
  });

  it('underdamped spring (evnto: tension 200 / friction 18) visibly overshoots past 1', () => {
    const stops = parseLinearStops(springLinearEasing(200, 18));
    const max = Math.max(...stops);
    expect(max).toBeGreaterThan(1.05);
  });

  it('heavily underdamped spring (torture: tension 40 / friction 4) oscillates (crosses 1 more than once)', () => {
    const stops = parseLinearStops(springLinearEasing(40, 4, { steps: 60 }));
    let crossings = 0;
    for (let i = 1; i < stops.length; i += 1) {
      if ((stops[i - 1] - 1) * (stops[i] - 1) < 0) crossings += 1;
    }
    expect(crossings).toBeGreaterThan(1);
  });

  it('is deterministic for the same tension/friction pair', () => {
    expect(springLinearEasing(170, 26)).toBe(springLinearEasing(170, 26));
  });

  it('differs across distinct tension/friction pairs', () => {
    expect(springLinearEasing(170, 26)).not.toBe(springLinearEasing(200, 18));
  });

  it('handles non-positive tension without hanging or throwing', () => {
    expect(() => springLinearEasing(0, 26)).not.toThrow();
    const stops = parseLinearStops(springLinearEasing(0, 26));
    expect(stops[stops.length - 1]).toBe(1);
  });

  it('respects maxDurationMs as a safety cap for lightly-damped springs', () => {
    // friction near 0 would oscillate far longer than 3s of real settle time;
    // the cap must still terminate promptly rather than hang.
    const start = Date.now();
    springLinearEasing(170, 0.001, { maxDurationMs: 50 });
    expect(Date.now() - start).toBeLessThan(1000);
  });
});

describe('springLinearEasingGentle', () => {
  it('produces a different (calmer) curve than the primary spring', () => {
    const primary = springLinearEasing(200, 18);
    const gentle = springLinearEasingGentle(200, 18);
    expect(gentle).not.toBe(primary);
  });

  it('reduces or eliminates overshoot relative to the primary curve', () => {
    const primaryMax = Math.max(...parseLinearStops(springLinearEasing(200, 18)));
    const gentleMax = Math.max(...parseLinearStops(springLinearEasingGentle(200, 18)));
    expect(gentleMax).toBeLessThanOrEqual(primaryMax);
  });
});

// ── Compiler wiring ─────────────────────────────────────────

const SPRING_THEME: BrandTheme = {
  id: 'spring-eligible',
  name: 'Spring Eligible',
  motion: {
    useSpring: true,
    springTension: 170,
    springFriction: 26,
  },
};

const NO_SPRING_THEME: BrandTheme = {
  id: 'spring-disabled',
  name: 'Spring Disabled',
  motion: {
    useSpring: false,
    springTension: 170,
    springFriction: 26,
  },
};

const PARTIAL_SPRING_THEME: BrandTheme = {
  id: 'spring-partial',
  name: 'Spring Partial',
  motion: {
    useSpring: true,
    springTension: 170,
    // springFriction intentionally omitted -- must not generate.
  },
};

describe('brandThemeToTokenOverrides: spring wiring', () => {
  it('emits motion.spring as a linear() curve when tension+friction are set and useSpring is not false', () => {
    const result = brandThemeToTokenOverrides(SPRING_THEME);
    expect(result.motion?.spring).toBeDefined();
    expect(result.motion!.spring!.startsWith('linear(')).toBe(true);
    expect(result.motion!.spring).toBe(springLinearEasing(170, 26));
  });

  it('does not emit motion.spring when useSpring is explicitly false', () => {
    const result = brandThemeToTokenOverrides(NO_SPRING_THEME);
    expect(result.motion).toBeUndefined();
  });

  it('does not emit motion.spring when only one of tension/friction is set', () => {
    const result = brandThemeToTokenOverrides(PARTIAL_SPRING_THEME);
    expect(result.motion).toBeUndefined();
  });

  it('still returns {} for a theme with neither surfaces nor motion (no regression)', () => {
    expect(brandThemeToTokenOverrides({ id: 'bare', name: 'Bare' })).toEqual({});
  });
});

describe('compileTheme: spring-gentle CSS variable', () => {
  it('emits --ds-motion-spring-gentle for a spring-eligible theme', () => {
    const result = lowerBrandThemeFixture({ brandTheme: SPRING_THEME, tenantSlug: 'test' });
    expect(result.cssVariables['--ds-motion-spring-gentle']).toBeDefined();
    expect(result.cssVariables['--ds-motion-spring-gentle']!.startsWith('linear(')).toBe(true);
  });

  it('does not emit --ds-motion-spring-gentle when spring is disabled', () => {
    const result = lowerBrandThemeFixture({ brandTheme: NO_SPRING_THEME, tenantSlug: 'test' });
    expect(result.cssVariables['--ds-motion-spring-gentle']).toBeUndefined();
  });
});

// ── End-to-end: real first-party tenants through compileTheme ─────────
//
// This used to run each tenant through the static generator
// (the retired runtime tenant-CSS generator, fully retired) and regex-match the LITERAL
// `--ds-motion-spring: linear(...)` declaration out of its CSS string. That
// generator owned the one conversion from `TenantTokenOverrides.motion.spring`
// (a raw curve string) into a `--ds-motion-spring` custom property; with it
// gone, `compileTheme` itself is the closest a compiler-level test gets
// to that value -- `tokenOverrides.motion.spring` IS the curve the eventual
// CSS declaration is built from (see `--ds-motion-spring-gentle` immediately
// below for the sibling channel this compiler DOES emit as CSS directly).
// The property under test -- each real tenant's own tension/friction produces
// its own correct, distinct curve, and a spring-disabled tenant produces none
// -- still holds at this layer.
describe('compileTheme: real tenants get a derived tokenOverrides.motion.spring', () => {
  it('rottay (useSpring: true, tension 170 / friction 26) derives its own linear() curve', () => {
    const result = lowerBrandThemeFixture({ brandTheme: rottayBrandTheme, tenantSlug: 'rottay' });
    expect(result.tokenOverrides.motion?.spring).toBe(
      springLinearEasing(rottayBrandTheme.motion!.springTension!, rottayBrandTheme.motion!.springFriction!),
    );
  });

  it('evnto (useSpring: true, tension 200 / friction 18) derives its own distinct linear() curve', () => {
    const result = lowerBrandThemeFixture({ brandTheme: evntoBrandTheme, tenantSlug: 'evnto' });
    expect(result.tokenOverrides.motion?.spring).toBe(
      springLinearEasing(evntoBrandTheme.motion!.springTension!, evntoBrandTheme.motion!.springFriction!),
    );
    // rottay and evnto have different tension/friction, so their curves differ.
    const rottayResult = lowerBrandThemeFixture({ brandTheme: rottayBrandTheme, tenantSlug: 'rottay' });
    expect(result.tokenOverrides.motion?.spring).not.toBe(rottayResult.tokenOverrides.motion?.spring);
  });

  it('bithire (useSpring: false) derives no motion.spring override -- falls back to the foundation default', () => {
    const result = lowerBrandThemeFixture({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
    expect(result.tokenOverrides.motion?.spring).toBeUndefined();
  });
});
