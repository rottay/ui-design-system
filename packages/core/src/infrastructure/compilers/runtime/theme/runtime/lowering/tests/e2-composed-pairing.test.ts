/**
 * @fileoverview E-2 — the tenant floor's SECOND half.
 *
 * The floor re-applies the tenant's posture LAST. For `typePairing` that
 * rewrites five channels, which used to undo the tenant's OWN explicit
 * literals declared in the same document: a tenant that selected `editorial`
 * AND named `'Fraunces', serif` got the pairing's font, byte-identical
 * whatever family it wrote. The pairings contract says the opposite ("applied
 * BEFORE any free-form fontFamilyBase/fontFamilyHeading so an explicit family
 * still wins"), and the body honours it; only the floor did not.
 *
 * The fence below is the one the preaudit fixed: the composed case through
 * BOTH doors, the three W-B channels, F4B-11 preserved, and the isolated case
 * byte-identical (the re-application is same-value, not a new write).
 */
import { describe, it, expect } from 'vitest';

import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/rottay';
import { evntoBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/evnto';
import {
  compileTenantThemeConfig,
  tenantPostureFloors,
} from '@/infrastructure/compilers/composition/tenant-theme';
// The contract owns the version; the compiler barrel only consumes it.
import { TENANT_THEME_SCHEMA_VERSION } from '@/foundation/contracts/composition/tenants/themes/tenant-theme/artifact-protocol';

const HEADING = '--ds-font-family-heading';
const BASE = '--ds-font-family-base';

function statik(
  tenantPatch: Record<string, unknown>,
  paths: string[],
  brandTheme = bithireBrandTheme
): Record<string, string> {
  // `tenantPatch` / `tenantAuthoredPaths` live on the implementation's
  // `BrandCompilerProvenanceInput`, not on the public `BrandCompilerInput` that
  // types `compileTheme` — so the per-VALUE casts do not silence the
  // excess-property check on the literal. Cast the literal itself, exactly as
  // the sibling drill does (`brand-compiler.test.ts`, B-1 `lower()`), instead of
  // widening the public contract for a test.
  return lowerBrandThemeFixture({
    brandTheme,
    tenantSlug: 'bithire',
    tenantPatch: tenantPatch as never,
    tenantAuthoredPaths: new Set(paths) as never,
  } as Parameters<typeof lowerBrandThemeFixture>[0]).cssVariables;
}

function dbDoor(typography: Record<string, unknown>, vertical = 'bithire') {
  return compileTenantThemeConfig({
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    mode: 'simple',
    appearance: { typography },
    tenantId: `probe-tenant-${vertical}`,
    slug: `probe-tenant-${vertical}`,
    verticalKey: vertical,
    rowVersion: 1,
  } as never).variables;
}

describe('E-2: the composed case — the tenant literal beats the tenant pairing', () => {
  it('STATIC door: an explicit family wins over the tenant\'s own pairing', () => {
    const fraunces = statik(
      { typography: { typePairing: 'editorial', fontFamilyHeading: "'Fraunces', serif" } },
      ['typography.typePairing', 'typography.fontFamilyHeading']
    );
    // Byte-exact to the literal WITH its script fallback: the wrapper the body
    // uses, not the raw string.
    expect(fraunces[HEADING]).toBe('\'Fraunces\', "Noto Sans Arabic", serif');
    // And it discriminates: a different family gives a different channel.
    const playfair = statik(
      { typography: { typePairing: 'editorial', fontFamilyHeading: "'Playfair Display', serif" } },
      ['typography.typePairing', 'typography.fontFamilyHeading']
    );
    expect(playfair[HEADING]).not.toBe(fraunces[HEADING]);
  });

  it('DB door: the same, end to end through compileTenantThemeConfig (W-A)', () => {
    const fraunces = dbDoor({ typePairing: 'editorial', fontFamilyHeading: "'Fraunces', serif" });
    expect(fraunces[HEADING]).toBe('\'Fraunces\', "Noto Sans Arabic", serif');
    const playfair = dbDoor({ typePairing: 'editorial', fontFamilyHeading: "'Playfair Display', serif" });
    expect(playfair[HEADING]).not.toBe(fraunces[HEADING]);
    // base too — the pairing rewrites both families
    const withBase = dbDoor({ typePairing: 'editorial', fontFamilyBase: "'Fraunces', serif" });
    expect(withBase[BASE]).toBe('\'Fraunces\', "Noto Sans Arabic", serif');
  });

  it('W-A: the projection carries exactly the two fields schema v1 admits', () => {
    const floors = tenantPostureFloors({
      typography: {
        typePairing: 'editorial',
        fontFamilyBase: 'A',
        fontFamilyHeading: 'B',
      },
    } as never);
    expect(floors.typography?.fontFamilyBase).toBe('A');
    expect(floors.typography?.fontFamilyHeading).toBe('B');
    // And the three the schema rejects are refused at the door, so the
    // projection has nothing to carry for them.
    for (const typography of [
      { fontFamilyMono: '"IBM Plex Mono", monospace' },
      { letterSpacing: { heading: '0.09em' } },
      { lineHeight: { display: 1.42 } },
    ]) {
      expect(() => dbDoor(typography)).toThrow(/not part of TenantThemeConfig v1/);
    }
  });

  it('W-B (i): `technical` + an explicit mono — the only stop that tunes mono', () => {
    const plex = statik(
      { typography: { typePairing: 'technical', fontFamilyMono: '"IBM Plex Mono", monospace' } },
      ['typography.typePairing', 'typography.fontFamilyMono']
    );
    // mono keeps the body's treatment: NO script fallback wrapper.
    expect(plex['--ds-font-family-mono']).toBe('"IBM Plex Mono", monospace');
  });

  it('W-B (ii): `editorial` + letterSpacing.heading and lineHeight.display', () => {
    const vars = statik(
      {
        typography: {
          typePairing: 'editorial',
          letterSpacing: { heading: '0.09em' },
          lineHeight: { display: 1.42 },
        },
      },
      ['typography.typePairing', 'typography.letterSpacing.heading', 'typography.lineHeight.display'],
      rottayBrandTheme
    );
    // Measured before the fix: 0.09em -> 0 and 1.42 -> 1.2.
    expect(vars['--ds-letter-spacing-heading']).toBe('0.09em');
    expect(vars['--ds-line-height-display']).toBe('1.42');
  });

  it('(iii) F4B-11 preserved: a tenant pairing still outranks the VERTICAL literal', () => {
    // Every first-party vertical authors an explicit heading family and NONE
    // authors a typePairing, so this is the real production shape.
    for (const brandTheme of [rottayBrandTheme, bithireBrandTheme, evntoBrandTheme]) {
      expect(brandTheme.typography?.typePairing).toBeUndefined();
      expect(brandTheme.typography?.fontFamilyHeading).toBeTruthy();
      const withTenantPairing = lowerBrandThemeFixture({
        brandTheme,
        tenantSlug: 'probe',
        tenantPatch: { typography: { typePairing: 'editorial' } } as never,
        tenantAuthoredPaths: new Set(['typography.typePairing']) as never,
      } as Parameters<typeof lowerBrandThemeFixture>[0]).cssVariables;
      // The tenant's pairing governs: the vertical's literal never travels in
      // the patch, so the floor has nothing of the tenant's to re-apply.
      expect(withTenantPairing[HEADING]).toContain('--ds-font-pack-editorial-display');
    }
  });

  it('(iv) the ISOLATED case is byte-identical — the re-application is same-value', () => {
    const isolated = statik(
      { typography: { fontFamilyHeading: "'Fraunces', serif" } },
      ['typography.fontFamilyHeading']
    );
    expect(isolated[HEADING]).toBe('\'Fraunces\', "Noto Sans Arabic", serif');
    expect(dbDoor({ fontFamilyHeading: "'Fraunces', serif" })[HEADING]).toBe(
      '\'Fraunces\', "Noto Sans Arabic", serif'
    );
  });

  it('negative: a pairing with NO explicit family still lowers the pairing', () => {
    const pairingOnly = dbDoor({ typePairing: 'editorial' });
    expect(pairingOnly[HEADING]).toContain('--ds-font-pack-editorial-display');
    expect(pairingOnly[BASE]).toContain('--ds-font-pack-editorial-text');
  });

  it('the mode overlay re-runs BOTH halves of the floor', () => {
    const compiled = lowerBrandThemeFixture({
      brandTheme: rottayBrandTheme,
      tenantSlug: 'probe',
      tenantPatch: {
        typography: { typePairing: 'editorial', fontFamilyHeading: "'Fraunces', serif" },
      } as never,
      tenantAuthoredPaths: new Set([
        'typography.typePairing',
        'typography.fontFamilyHeading',
      ]) as never,
    } as Parameters<typeof lowerBrandThemeFixture>[0]);
    for (const block of compiled.modeBlocks ?? []) {
      const emitted = block.cssVariables[HEADING];
      // A block that restates the channel must restate the tenant's literal,
      // not the pairing it also selected.
      if (emitted !== undefined) expect(emitted).toContain('Fraunces');
    }
  });
});
