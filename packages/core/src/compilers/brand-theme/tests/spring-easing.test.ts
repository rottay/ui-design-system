import { describe, it, expect } from 'vitest';
import { springLinearEasing, springLinearEasingGentle } from '../spring-easing';
import { brandThemeToTokenOverrides, compileBrandTheme } from '../index';
import { generateTenantCss } from '../../../runtime/tenant/storage/static/generator';
import { bithireBrandTheme, evntoBrandTheme, rottayBrandTheme } from '../../../tokens/ts/brand-themes';
import type { BrandTheme } from '../../../contracts/themes';
import type { TenantConfig } from '../../../contracts';

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

describe('compileBrandTheme: spring-gentle CSS variable', () => {
  it('emits --ds-motion-spring-gentle for a spring-eligible theme', () => {
    const result = compileBrandTheme({ brandTheme: SPRING_THEME, tenantSlug: 'test' });
    expect(result.cssVariables['--ds-motion-spring-gentle']).toBeDefined();
    expect(result.cssVariables['--ds-motion-spring-gentle']!.startsWith('linear(')).toBe(true);
  });

  it('does not emit --ds-motion-spring-gentle when spring is disabled', () => {
    const result = compileBrandTheme({ brandTheme: NO_SPRING_THEME, tenantSlug: 'test' });
    expect(result.cssVariables['--ds-motion-spring-gentle']).toBeUndefined();
  });
});

// ── End-to-end: real first-party tenants through the static generator ──────
// generateTenantCss() is exercised live (not by reading the prebuilt
// tokens/css/artifacts/**/index.css snapshot) so this test is correct
// immediately, without requiring `pnpm build:vertical-css` to have re-run.

describe('generateTenantCss: real tenants get a generated --ds-motion-spring', () => {
  it('rottay (useSpring: true, tension 170 / friction 26) gets a linear() --ds-motion-spring derived from its own theme', () => {
    const config: TenantConfig = {
      slug: 'rottay',
      name: 'Rottay',
      engine: 'classic',
      theme: 'base',
      plan: 'enterprise',
      features: ['*'],
      branding: { companyName: 'Rottay' },
      brandTheme: rottayBrandTheme,
    };
    const css = generateTenantCss(config, { includeDarkSelector: false });
    const match = /--ds-motion-spring:\s*(linear\([^;]*\));/.exec(css);
    expect(match, 'expected a generated --ds-motion-spring: linear(...) declaration').not.toBeNull();
    expect(match![1]).toBe(springLinearEasing(rottayBrandTheme.motion!.springTension!, rottayBrandTheme.motion!.springFriction!));
  });

  it('evnto (useSpring: true, tension 200 / friction 18) gets its own distinct linear() curve', () => {
    const config: TenantConfig = {
      slug: 'evnto',
      name: 'Evnto',
      engine: 'classic',
      theme: 'base',
      plan: 'enterprise',
      features: ['*'],
      branding: { companyName: 'Evnto' },
      vertical: 'evnto',
      brandTheme: evntoBrandTheme,
    };
    const css = generateTenantCss(config, { includeDarkSelector: false });
    const match = /--ds-motion-spring:\s*(linear\([^;]*\));/.exec(css);
    expect(match).not.toBeNull();
    expect(match![1]).toBe(springLinearEasing(evntoBrandTheme.motion!.springTension!, evntoBrandTheme.motion!.springFriction!));
    // rottay and evnto have different tension/friction, so their curves differ.
    expect(match![1]).not.toBe(springLinearEasing(rottayBrandTheme.motion!.springTension!, rottayBrandTheme.motion!.springFriction!));
  });

  it('bithire (useSpring: false) gets NO generated --ds-motion-spring override -- falls back to the foundation default', () => {
    const config: TenantConfig = {
      slug: 'bithire',
      name: 'BitHire',
      engine: 'classic',
      theme: 'base',
      plan: 'enterprise',
      features: ['*'],
      branding: { companyName: 'BitHire' },
      brandTheme: bithireBrandTheme,
    };
    const css = generateTenantCss(config, { includeDarkSelector: false });
    expect(css).not.toMatch(/--ds-motion-spring:/);
  });
});
