/**
 * @fileoverview Two tenants of one vertical must read as two companies, and
 * still as the same product (WO-ENG-18).
 *
 * Both halves are proven here, not by eye. The commercial promise is that a
 * customer can buy a genuinely customized experience; the architectural promise
 * is that it is still BitHire. A test that only checks the first would pass for
 * a fork, and a test that only checks the second would pass for a hue rotation.
 *
 * The expectation is anchored on the compiled BrandTheme, never on a `--ds-*`
 * variable read back off `<html>`. That read only proves a component consumes
 * the variable: a later, more specific rule can overwrite it and the component
 * and the read move together while the tenant's value is silently gone. That
 * lesson cost this program a whole probe (WO-GAT-03).
 */

import { describe, expect, it } from 'vitest';

import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes';
import { themanagementmiamiBrandTheme } from '@tests/fixtures/brand-themes/themanagementmiami';
import { resolveEngine } from '@/infrastructure/runtime/engines/runtime/resolution';
import { getVerticalPreset } from '@/foundation/presets/verticals';
import type { TenantAppearance, TenantConfig } from '@/foundation/contracts';
import { brandThemeToTenantAppearance } from '@/components/patterns/customization/brand-studio/runtime/file-export';

const bithire = lowerBrandThemeFixture({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
const themanagement = lowerBrandThemeFixture({ brandTheme: themanagementmiamiBrandTheme, tenantSlug: 'themanagementmiami' });
const themanagementProjectedAppearance = brandThemeToTenantAppearance(
  themanagementmiamiBrandTheme
);

/**
 * DB representation of The Management. The BrandTheme fixture above remains
 * the deterministic authoring/migration source, but a customer runtime never
 * receives it via TenantConfig.brandTheme: it receives a bounded tenant theme
 * DOCUMENT layered on top of the BitHire vertical.
 *
 * Authored by hand rather than projected from the BrandTheme, and that is a
 * measurement rather than a convenience: `brandThemeToTenantAppearance` emits
 * `typography.fontFamilyHeading` as a `var(--ds-font-pack-…)` reference and an
 * absent `palette.dark.background`, both of which the document schema refuses
 * by name. The projection is a migration aid; the document below is what the
 * productive door actually admits.
 *
 * `shape.radiusScale` is 0.8 because that is the BitHire envelope's floor. The
 * 0.76 this fixture used to carry never reached a customer: it was only ever
 * lowered by a compatibility compiler that sat outside the document schema.
 */
const themanagementDbDocument = {
  schemaVersion: 1,
  mode: 'simple',
  appearance: {
    palette: {
      primary: '#0F766E',
      secondary: '#8C6D46',
      accent: '#B44F3C',
      background: '#FBF6EC',
      foreground: {
        primary: '#2E261C',
        secondary: '#5C4F3D',
        muted: '#6B5B48',
        disabled: '#74644F',
      },
      border: { primary: '#C8B9A5', secondary: '#E2D9CC' },
    },
    typography: {
      fontFamilyBase: themanagementmiamiBrandTheme.typography?.fontFamilyBase,
      typePairing: 'editorial',
      scale: 1.04,
    },
    shape: { buttonStyle: 'soft', radiusScale: 0.8 },
    density: 'spacious',
    motion: { intensity: 0.62, durationScale: 1.08, ambient: 'subtle' },
    surfaces: { elevation: 'elevated', effectIntensity: 0.45 },
    navigation: { sidebarTone: 'strong' },
  },
} as const;

const themanagementDbTenant = {
  slug: 'themanagementmiami',
  vertical: 'bithire',
  appearance: {
    general: themanagementProjectedAppearance.general,
  } satisfies TenantAppearance,
} satisfies Pick<TenantConfig, 'slug' | 'vertical' | 'appearance'>;

/** The productive DB door: one document, one compile, one artifact. */
const themanagementDbVariables = compileTenantThemeConfig(
  hydrateTenantThemeConfig(themanagementDbDocument, {
    tenantId: 'tenant_themanagementmiami',
    slug: 'themanagementmiami',
    verticalKey: 'bithire',
    rowVersion: 1,
  }),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire')! }
).variables;

/**
 * The bounded channels a tenant owns. Every one must differ, or the tenant is
 * wearing the vertical's clothes.
 *
 * Deliberately spread across the six axes a customer can feel -- colour, corner,
 * type, depth, motion, and surface -- because a divergence that is only colour
 * is a hue rotation, and this program has been burned by counters that were
 * green for the wrong reason.
 */
const BOUNDED_CHANNELS: readonly string[] = [
  // colour
  '--ds-color-primary',
  '--ds-button-primary-bg',
  // corner — the dial operand, which is where authored corner geometry lives
  '--ds-radius-sm-base',
  '--ds-radius-md-base',
  '--ds-radius-lg-base',
  '--ds-radius-xl-base',
  // type
  '--ds-font-family-base',
  '--ds-font-family-heading',
  // depth
  '--ds-shadow-md',
  '--ds-shadow-lg',
  // surface
  '--ds-color-bg-primary',
  '--ds-card-bg',
  '--ds-input-bg',
  // dedicated compact-label microchannel (not inherited from filter pills)
  '--ds-badge-radius',
  '--ds-badge-frame',
  '--ds-badge-surface-hover',
  '--ds-badge-count-radius',
  '--ds-badge-motion-duration',
];

/**
 * Structural strings that MUST match. These are formulas, not values: the tint
 * scale is `color-mix(in oklch, var(--ds-color-primary) N%, var(--ds-color-bg-primary))`,
 * so two tenants share the expression and resolve it differently. If a tenant
 * ever compiled a literal here, the scale would stop deriving from its palette
 * and this assertion is what would catch it.
 */
const DERIVED_FORMULAS: readonly string[] = ['--ds-tint-4', '--ds-tint-12', '--ds-tint-24'];

describe('two tenants of the bithire vertical diverge on every bounded channel', () => {
  it.each(BOUNDED_CHANNELS)('%s differs between bithire and themanagementmiami', (channel) => {
    const left = bithire.cssVariables[channel];
    const right = themanagement.cssVariables[channel];

    // A channel neither tenant declares would pass a naive inequality check by
    // being undefined on both sides. Prove both are present before comparing.
    expect(left, `bithire does not declare ${channel}`).toBeDefined();
    expect(right, `themanagementmiami does not declare ${channel}`).toBeDefined();
    expect(right, `${channel} is identical, so this tenant is wearing the vertical's clothes`).not.toBe(left);
  });

  it('the divergence is not a hue rotation', () => {
    // Colour alone is the cheap kind of different. A customer feels the corner
    // radius, the typeface and the shadow before they name the hue.
    expect(themanagement.cssVariables['--ds-radius-md-base']).not.toBe(bithire.cssVariables['--ds-radius-md-base']);
    expect(themanagement.cssVariables['--ds-font-family-heading']).not.toBe(
      bithire.cssVariables['--ds-font-family-heading']
    );
    expect(themanagement.cssVariables['--ds-shadow-md']).not.toBe(bithire.cssVariables['--ds-shadow-md']);
  });

  it('personality diverges on elevation, border treatment and motion', () => {
    expect(themanagement.personality.card!.defaultElevation).not.toBe(bithire.personality.card!.defaultElevation);
    expect(themanagement.personality.card!.showBorder).not.toBe(bithire.personality.card!.showBorder);
    expect(themanagement.personality.animation!.entrance).not.toBe(bithire.personality.animation!.entrance);
  });

  it('a large majority of the compiled surface actually moves', () => {
    // This guards the quality of the deterministic authoring/migration source.
    // Runtime-path truth is asserted independently below so this large source
    // delta cannot masquerade as evidence that the DB Appearance path ran.
    const keys = new Set([...Object.keys(bithire.cssVariables), ...Object.keys(themanagement.cssVariables)]);
    const differing = [...keys].filter((k) => bithire.cssVariables[k] !== themanagement.cssVariables[k]);
    expect(differing.length / keys.size).toBeGreaterThan(0.5);
  });
});

describe('The Management traverses the bounded DB document path', () => {
  it('does not smuggle a customer theme through the static brandTheme field', () => {
    expect(themanagementDbTenant).not.toHaveProperty('brandTheme');
    expect(themanagementDbTenant.vertical).toBe('bithire');
    expect(themanagementDbDocument.mode).toBe('simple');
  });

  it.each([
    '--ds-color-primary',
    '--ds-font-family-base',
    '--ds-font-family-heading',
    '--ds-radius-button',
    '--ds-radius-scale',
    '--ds-elevation-1',
    '--ds-color-bg-primary',
  ])('%s is emitted by the DB door and overrides the vertical baseline', (channel) => {
    const dbValue = themanagementDbVariables[channel];
    expect(dbValue, `the DB document does not emit ${channel}`).toBeDefined();
    expect(dbValue, `${channel} leaves The Management wearing BitHire defaults`).not.toBe(
      bithire.cssVariables[channel]
    );
  });

  it('does NOT reach card chrome from the Simple tier, and says so', () => {
    // `--ds-card-bg` used to sit in the list above and passed for the wrong
    // reason: the compatibility lowering emitted it from a raw
    // `--ds-color-surface` override that the document schema does not admit,
    // so "differs from bithire" was satisfied by a channel no customer
    // document could ever have written. Card chrome is a Pro-tier control
    // (`visualFoundation.advanced.chrome.cardComponent`); a Simple document
    // leaves it to the vertical baseline, which is the honest outcome.
    expect(themanagementDbVariables['--ds-card-bg']).toBeUndefined();
    expect(bithire.cssVariables['--ds-card-bg']).toBe('var(--ds-surface-card)');
  });

  it('keeps the DB document surface bounded', () => {
    expect(themanagementDbDocument.appearance).not.toHaveProperty('vertical');
    expect(themanagementDbDocument.appearance).not.toHaveProperty('engine');
    expect(themanagementDbDocument.appearance).not.toHaveProperty('productProfile');
    expect(themanagementDbDocument).not.toHaveProperty('visualFoundation');
  });
});

describe('and converge on the identity of the product they both are', () => {
  it.each(DERIVED_FORMULAS)('%s is the same formula for both, so each resolves against its own palette', (channel) => {
    expect(themanagement.cssVariables[channel]).toBe(bithire.cssVariables[channel]);
    expect(bithire.cssVariables[channel]).toContain('color-mix');
  });

  it('both render the engine their vertical declares', () => {
    const vertical = getVerticalPreset('bithire');
    expect(vertical?.engine).toBe('modern');

    for (const slug of ['bithire', 'themanagementmiami']) {
      expect(resolveEngine({ verticalEngine: vertical?.engine, tenantSlug: slug })).toBe('modern');
    }
  });

  it('a tenant cannot move the vertical it belongs to', () => {
    // `vertical`, `engine` and `productProfile` are static-first by law
    // (docs/ARCHITECTURE.md). Neither BrandTheme carries any of them, and the compiler has
    // nowhere to put them: that is the guarantee, and this asserts the shape of
    // it rather than trusting the prose.
    for (const theme of [bithireBrandTheme, themanagementmiamiBrandTheme]) {
      expect(theme).not.toHaveProperty('vertical');
      expect(theme).not.toHaveProperty('engine');
      expect(theme).not.toHaveProperty('productProfile');
    }
    expect(themanagementDbDocument.appearance).not.toHaveProperty('vertical');
    expect(themanagementDbDocument.appearance).not.toHaveProperty('engine');
    expect(themanagementDbDocument.appearance).not.toHaveProperty('productProfile');
  });
});
