/**
 * @fileoverview E-2 — the tenant floor's SECOND half, through the door.
 *
 * The floor re-applies the tenant's posture LAST. For `typePairing` that
 * rewrites five channels, which used to undo the tenant's OWN explicit
 * literals declared in the same document: a tenant that selected `editorial`
 * AND named `'Fraunces', serif` got the pairing's font, byte-identical
 * whatever family it wrote. The pairings contract says the opposite ("applied
 * BEFORE any free-form fontFamilyBase/fontFamilyHeading so an explicit family
 * still wins"), and the tenant rank honours it for every leaf the floor
 * carries.
 *
 * Every case compiles a tenant DOCUMENT through `compileThemeIntent` (ingress,
 * admission, provenance, floors) or through the DB door. The three W-B leaves
 * (mono, heading tracking, display leading) reach a tenant only as sanctioned
 * token overrides; they won against the pairing only once `tenantPostureFloors`
 * carried them.
 */
import { describe, it, expect } from 'vitest';

import { firstPartyFixture } from "@tests/support/theme-lowering";
import { compileThemeIntent } from '@/entrypoints/server';
import {
  compileTenantThemeConfig,
  tenantPostureFloors,
} from '@/infrastructure/compilers/composition/tenant-theme';
import { documentThemeIntent } from '@/infrastructure/compilers/runtime/theme/runtime/ingress/presentation/document';
// The contract owns the version; the compiler barrel only consumes it.
import { TENANT_THEME_SCHEMA_VERSION } from '@/foundation/contracts/composition/tenants/themes/tenant-theme/artifact-protocol';

const bithireFlatTheme = firstPartyFixture('bithire');
const rottayFlatTheme = firstPartyFixture('rottay');
const evntoFlatTheme = firstPartyFixture('evnto');

const HEADING = '--ds-font-family-heading';
const BASE = '--ds-font-family-base';
const MONO = '--ds-font-family-mono';
const HEADING_TRACKING = '--ds-letter-spacing-heading';
const DISPLAY_LEADING = '--ds-line-height-display';

type Vertical = 'bithire' | 'rottay' | 'evnto';

function tenantDocument(
  typography: Record<string, unknown>,
  tokenOverrides: Record<string, string | number> = {}
) {
  return {
    schemaVersion: TENANT_THEME_SCHEMA_VERSION,
    mode: 'advanced',
    visualFoundation: {
      general: { typography },
      ...(Object.keys(tokenOverrides).length > 0 ? { advanced: { tokenOverrides } } : {}),
    },
  } as never;
}

function door(
  typography: Record<string, unknown>,
  tokenOverrides: Record<string, string | number> = {},
  vertical: Vertical = 'bithire'
) {
  return compileThemeIntent(
    documentThemeIntent({ vertical, slug: `probe-tenant-${vertical}`, document: tenantDocument(typography, tokenOverrides) })
  ).compiled;
}

const doorVars = (...args: Parameters<typeof door>) => door(...args).cssVariables;

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
  it('document door: an explicit family wins over the tenant\'s own pairing', () => {
    const fraunces = doorVars({ typePairing: 'editorial', fontFamilyHeading: "'Fraunces', serif" });
    // Byte-exact to the literal WITH its script fallback: the wrapper the body
    // uses, not the raw string.
    expect(fraunces[HEADING]).toBe('\'Fraunces\', "Noto Sans Arabic", serif');
    // And it discriminates: a different family gives a different channel.
    const playfair = doorVars({ typePairing: 'editorial', fontFamilyHeading: "'Playfair Display', serif" });
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

  it('W-A: the floors carry every leaf a pairing rewrites, and only the leaves the patch states', () => {
    const floors = tenantPostureFloors({
      typography: {
        typePairing: 'editorial',
        fontFamilyBase: 'A',
        fontFamilyHeading: 'B',
        fontFamilyMono: 'C',
        letterSpacing: { heading: '0.09em', body: '0.01em' },
        lineHeight: { display: 1.42, body: 1.5 },
      },
    } as never);
    expect(floors.typography?.fontFamilyBase).toBe('A');
    expect(floors.typography?.fontFamilyHeading).toBe('B');
    expect(floors.typography?.fontFamilyMono).toBe('C');
    // Only the leaf the pairing contests crosses, never its siblings.
    expect(floors.typography?.letterSpacing).toEqual({ heading: '0.09em' });
    expect(floors.typography?.lineHeight).toEqual({ display: 1.42 });
    // A patch that states none of them grows no container.
    const bare = tenantPostureFloors({ typography: { typePairing: 'editorial' } } as never);
    expect(bare.typography?.letterSpacing).toBeUndefined();
    expect(bare.typography?.lineHeight).toBeUndefined();
    // The simple DB schema still refuses the three in `appearance.typography`:
    // they reach a tenant only as sanctioned token overrides.
    for (const typography of [
      { fontFamilyMono: '"IBM Plex Mono", monospace' },
      { letterSpacing: { heading: '0.09em' } },
      { lineHeight: { display: 1.42 } },
    ]) {
      expect(() => dbDoor(typography)).toThrow(/not part of TenantThemeConfig v1/);
    }
  });

  it('W-B (i): `technical` + an explicit mono — the only stop that tunes mono — on every vertical', () => {
    for (const vertical of ['bithire', 'rottay', 'evnto'] as const) {
      const plex = doorVars({ typePairing: 'technical' }, { [MONO]: '"IBM Plex Mono", monospace' }, vertical);
      // mono keeps the body's treatment: NO script fallback wrapper.
      expect({ vertical, mono: plex[MONO] }).toEqual({ vertical, mono: '"IBM Plex Mono", monospace' });
      const jet = doorVars({ typePairing: 'technical' }, { [MONO]: '"JetBrains Mono", monospace' }, vertical);
      expect(jet[MONO]).not.toBe(plex[MONO]);
    }
    // Without the literal the pairing still states its pack.
    expect(doorVars({ typePairing: 'technical' })[MONO]).toContain('--ds-font-pack-plex-mono');
  });

  it('W-B (ii): `editorial` + letterSpacing.heading and lineHeight.display, on every vertical', () => {
    for (const vertical of ['bithire', 'rottay', 'evnto'] as const) {
      const vars = doorVars(
        { typePairing: 'editorial' },
        { [HEADING_TRACKING]: '0.09em', [DISPLAY_LEADING]: 1.42 },
        vertical
      );
      // Measured before the fix, through this door: 0.09em -> 0 and 1.42 -> 1.2.
      expect({ vertical, tracking: vars[HEADING_TRACKING] }).toEqual({ vertical, tracking: '0.09em' });
      expect({ vertical, leading: vars[DISPLAY_LEADING] }).toEqual({ vertical, leading: '1.42' });
    }
    const pairingOnly = doorVars({ typePairing: 'editorial' }, {}, 'rottay');
    expect(pairingOnly[HEADING_TRACKING]).toBe('0');
    expect(pairingOnly[DISPLAY_LEADING]).toBe('1.2');
  });

  it('negative: a channel the pairing never rewrites is not contested (a role weight override stands either way)', () => {
    const weight = '--ds-type-section-title-font-weight';
    expect(doorVars({})[weight]).not.toBe('300');
    expect(doorVars({ typePairing: 'editorial' }, { [weight]: '300' })[weight]).toBe('300');
    expect(doorVars({}, { [weight]: '300' })[weight]).toBe('300');
  });

  it('(iii) F4B-11 preserved: a tenant pairing still outranks the VERTICAL literal', () => {
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset.
    // rottay and evnto are structural presets that author no heading family at
    // all, and bithire's preset authors a `typePairing` of its own beside its
    // literal. So the contest is measured on bithire, and it is the STRONGER
    // claim -- the tenant's pairing outranks the vertical's literal AND the
    // vertical's own pairing.
    expect(bithireFlatTheme.typography?.typePairing).toBe('technical');
    expect(bithireFlatTheme.typography?.fontFamilyHeading).toBeTruthy();
    for (const flatTheme of [rottayFlatTheme, evntoFlatTheme]) {
      expect(flatTheme.typography?.typePairing).toBeUndefined();
      expect(flatTheme.typography?.fontFamilyHeading).toBeUndefined();
    }

    const withTenantPairing = doorVars({ typePairing: 'editorial' });
    // The tenant's pairing governs: the vertical's literal never travels in
    // the patch, so the floor has nothing of the tenant's to re-apply.
    expect(withTenantPairing[HEADING]).toContain('--ds-font-pack-editorial-display');
    expect(withTenantPairing[HEADING]).not.toContain('--ds-font-pack-grotesk-display');
  });

  it('(iv) the ISOLATED case is byte-identical — the re-application is same-value', () => {
    const isolated = doorVars({ fontFamilyHeading: "'Fraunces', serif" });
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
    const compiled = door(
      { typePairing: 'editorial', fontFamilyHeading: "'Fraunces', serif" },
      {},
      'rottay'
    );
    for (const block of compiled.modeBlocks ?? []) {
      const emitted = block.cssVariables[HEADING];
      // A block that restates the channel must restate the tenant's literal,
      // not the pairing it also selected.
      if (emitted !== undefined) expect(emitted).toContain('Fraunces');
    }
  });
});
