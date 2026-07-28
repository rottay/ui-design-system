/**
 * @fileoverview AD-7 T5/T6 -- single-author law for the legacy tenant CSS
 * generator's light block.
 *
 * T5 pins the shipped palette to the OKLCH compiler for the bug-triggering
 * tenant shape (branding + brandTheme, no appearance): before the fix the flat
 * sRGB scale was spread over the compiled ramp and won every step.
 * T6 drills the fail-closed assertion by planting a second author for a ramp
 * key and for a compiled non-palette channel, with a negative control proving
 * the documented compatibility overrides still pass.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TenantConfig } from '../../../../../../foundation/contracts';
import { deriveTenantColorRamps } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { buildRuntimeScale } from '@/infrastructure/compilers/kernel/foundation/css/color-math';
import { generateTenantCss } from '..';

const PERSONALITY_MODULE = '@/foundation/tokens/ts/runtime/personality';
const BRAND_THEME_MODULE = '@/infrastructure/compilers/kernel/runtime/brand-theme';

/** The seed whose sRGB and OKLCH derivations disagree at every ramp step. */
const PRIMARY_SEED = '#3A6FB0';

/**
 * The bug-triggering shape: legacy `branding` compat fields AND a `brandTheme`,
 * with NO `appearance`. Appearance is what used to mask the defect -- it is the
 * sanctioned last layer, so a tenant that had one never saw the sRGB scale win.
 */
const BRAND_THEME_TENANT: TenantConfig = {
  slug: 'oklch-owner',
  name: 'OKLCH Owner',
  engine: 'modern',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'OKLCH Owner' },
  brandTheme: {
    id: 'oklch-owner-brand',
    name: 'OKLCH Owner Brand',
    palette: {
      primaryColor: PRIMARY_SEED,
      secondaryColor: '#0F766E',
      accentColor: '#8B5CF6',
    },
    surfaces: { densityScale: 0.9, borderRadius: { md: '10px' } },
  },
  tokenOverrides: { densityScale: 1.2, borderRadius: { md: '18px' } },
};

/** Same tenant with no brandTheme: legacy branding is the only palette author. */
const LEGACY_ONLY_TENANT: TenantConfig = {
  ...BRAND_THEME_TENANT,
  slug: 'legacy-only',
  name: 'Legacy Only',
  brandTheme: undefined,
  branding: { companyName: 'Legacy Only', primaryColor: PRIMARY_SEED },
};

/** Parse the first (light) block of a generated stylesheet into a declaration map. */
function readLightBlock(css: string): Record<string, string> {
  const open = css.indexOf('{');
  const close = css.indexOf('}', open);
  const declarations: Record<string, string> = {};
  for (const line of css.slice(open + 1, close).split('\n')) {
    const match = /^\s*(--[\w-]+):\s*(.+);$/.exec(line);
    if (match) declarations[match[1]] = match[2];
  }
  return declarations;
}

describe('T5 -- the OKLCH compiler owns the shipped palette', () => {
  it('ships the compiled OKLCH ramp, not the legacy sRGB scale, for a brandTheme tenant', () => {
    const light = readLightBlock(
      generateTenantCss(BRAND_THEME_TENANT, {
        includeDarkSelector: false,
        includeSystemDarkSelector: false,
      }),
    );

    // Pinned literal: the value `deriveTenantColorRamps` produces for this seed
    // against the default light ground. Pinned AND cross-checked, so a change
    // in the derivation is reported rather than silently adopted.
    expect(light['--ds-color-primary-500']).toBe('#386DAD');
    expect(light['--ds-color-primary-500']).toBe(
      deriveTenantColorRamps(BRAND_THEME_TENANT.brandTheme!.palette)['--ds-color-primary-500'],
    );

    // The value that used to ship: `buildRuntimeScale(seed)[500]`.
    expect(light['--ds-color-primary-500']).not.toBe(buildRuntimeScale(PRIMARY_SEED)[500]);
  });

  it('gives every ramp step of every seeded role to the compiler', () => {
    const light = readLightBlock(
      generateTenantCss(BRAND_THEME_TENANT, {
        includeDarkSelector: false,
        includeSystemDarkSelector: false,
      }),
    );
    const compiled = deriveTenantColorRamps(BRAND_THEME_TENANT.brandTheme!.palette);

    expect(Object.keys(compiled).length).toBe(30);
    for (const [name, value] of Object.entries(compiled)) {
      expect(light[name]).toBe(value);
    }
  });

  it('leaves the four legacy-only channels to the legacy scale', () => {
    const light = readLightBlock(
      generateTenantCss(BRAND_THEME_TENANT, {
        includeDarkSelector: false,
        includeSystemDarkSelector: false,
      }),
    );
    const scale = buildRuntimeScale(PRIMARY_SEED);

    // The brand compiler emits none of these; dropping them with the ramp
    // would have removed a tenant's link and focus-ring colors outright.
    expect(light['--ds-color-primary-foreground']).toBe('#ffffff');
    expect(light['--ds-color-link']).toBe(scale[500]);
    expect(light['--ds-color-link-hover']).toBe(scale[600]);
    expect(light['--ds-color-border-focus']).toBe(scale[500]);
  });

  it('keeps the legacy sRGB palette for a tenant the compiler cannot serve', () => {
    const light = readLightBlock(
      generateTenantCss(LEGACY_ONLY_TENANT, {
        includeDarkSelector: false,
        includeSystemDarkSelector: false,
      }),
    );
    const scale = buildRuntimeScale(PRIMARY_SEED);

    // No brandTheme means no compiled ramp: suppressing the legacy scale here
    // would repaint the tenant in the design system's default palette.
    expect(light['--ds-color-primary']).toBe(scale[500]);
    expect(light['--ds-color-primary-500']).toBe(scale[500]);
    expect(light['--ds-color-primary-900']).toBe(scale[900]);
  });
});

describe('T6 -- planted second emitter fails the composition closed', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock(PERSONALITY_MODULE);
    vi.doUnmock(BRAND_THEME_MODULE);
    vi.resetModules();
  });

  it('throws when a base layer re-declares a compiled ramp key', async () => {
    vi.doMock(PERSONALITY_MODULE, async () => {
      const actual = await vi.importActual<Record<string, unknown>>(PERSONALITY_MODULE);
      return {
        ...actual,
        resolvePartialPersonalityCssVariables: () => ({
          '--ds-color-primary-500': '#BADBAD',
        }),
      };
    });

    const { generateTenantCss: generate } = await import('..');

    expect(() => generate(BRAND_THEME_TENANT)).toThrow(/--ds-color-primary-500/);
    expect(() => generate(BRAND_THEME_TENANT)).toThrow(/more than one author/);
  });

  it('throws when a compiled channel collides with the exclusive legacy branding layer', async () => {
    vi.doMock(BRAND_THEME_MODULE, async () => {
      const actual = await vi.importActual<Record<string, unknown>>(BRAND_THEME_MODULE);
      const compile = actual.compileBrandTheme as (input: unknown) => { cssVariables: Record<string, string> };
      return {
        ...actual,
        compileBrandTheme: (input: unknown) => {
          const compiled = compile(input);
          return {
            ...compiled,
            // A channel the compiler does not own today. The legacy layer
            // writes it unconditionally, so the moment the compiler claims it
            // there are two authors and the merge must refuse.
            cssVariables: { ...compiled.cssVariables, '--ds-color-link': '#123456' },
          };
        },
      };
    });

    const { generateTenantCss: generate } = await import('..');

    expect(() => generate(BRAND_THEME_TENANT)).toThrow(/--ds-color-link/);
  });

  it('does not fire on the documented compatibility overrides (negative control)', async () => {
    vi.doMock(PERSONALITY_MODULE, async () => {
      const actual = await vi.importActual<Record<string, unknown>>(PERSONALITY_MODULE);
      return {
        ...actual,
        // A structural channel the compiled BrandTheme also authors. The
        // resolver deep-merges tenant fields over compiled ones on purpose, so
        // this is precedence, not a second author.
        resolvePartialPersonalityCssVariables: () => ({ '--ds-radius-md': '99px' }),
      };
    });

    const { generateTenantCss: generate } = await import('..');

    expect(() => generate(BRAND_THEME_TENANT)).not.toThrow();
  });

  it('keeps the real tenant shapes green', () => {
    expect(() => generateTenantCss(BRAND_THEME_TENANT)).not.toThrow();
    expect(() => generateTenantCss(LEGACY_ONLY_TENANT)).not.toThrow();
  });
});
