/**
 * `surfaces.effect-intensity` — WHERE THE TWO INGRESS DOORS ARE NOT SYMMETRIC,
 * measured rather than assumed.
 *
 * `governance/manifest/controls/surfaces/effect-intensity/index.json` declares three normalized
 * stops — `mate` (0), `sobrio` (0.6), `estandar` (1) — and annotates the third
 * as VERTICAL-AUTHORSHIP BY CONSTRUCTION: the per-vertical tenant envelope is
 * `{0, 0.65}` for rottay and bithire and `{0, 0.75}` for evnto, enforced by
 * REJECTION rather than by a clamp.
 *
 * That makes this control the opposite case to `spacing.rhythm`. There, the
 * discharge was that both doors agree on every stop. Here the contract itself
 * says one stop is reachable through exactly one door, so a test that proved
 * "static and DB agree everywhere" would be proving the contract is violated.
 * What must be proven instead is the asymmetry, in the exact shape the
 * contract states it:
 *
 * 1. `mate` and `sobrio` are accepted by BOTH doors, in all three verticals,
 *    and land on the same channel with the same bytes.
 * 2. `estandar` is accepted by the STATIC door (a vertical authors its own
 *    floor) and REFUSED by the DB door in all three verticals, with
 *    `invalid_value` at `$.appearance.surfaces.effectIntensity` — a refusal,
 *    never a clamp to 0.65/0.75, because a clamp would silently give the
 *    tenant a different product from the one they asked for.
 * 3. A value below the floor and a value above the global cap are refused too,
 *    so the envelope is a closed interval rather than a one-sided ceiling.
 *
 * The DB door under test is `compileTenantThemeConfig` and only that. The
 * retired lowerings (`compileAppearanceVariables`,
 * `appearanceGeneralToVariables`, ...) each still lower this field to a
 * plausible number, so binding one would go green while measuring a door no
 * customer theme travels through.
 */
import { describe, expect, it } from 'vitest';

import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';
import type { TenantThemeDocument } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { TENANT_THEME_EFFECT_INTENSITY_BOUNDS } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
// The roster union's OWNER is `contracts/kernel/verticals`; the tenants barrel
// re-exports the capability contracts and never owned this symbol (verified:
// `git log -S FirstPartyVerticalId` over that barrel is empty). The import was
// therefore wrong from the day it was authored, not broken by a later retirement.
import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';

import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  TenantThemeValidationError,
} from '../index';

/** The one channel this control declares. */
const CHANNEL = '--ds-effect-intensity';

/** The three normalized stops, from the control manifest. */
const STOPS = { mate: 0, sobrio: 0.6, estandar: 1 } as const;

/**
 * The verticals under test, and each one's OWN ceiling — read from the live
 * envelope rather than restated, so a change to the canon moves this test with
 * it instead of silently disagreeing with it.
 */
const VERTICALS: readonly FirstPartyVerticalId[] = ['rottay', 'bithire', 'evnto'];

const ceilingOf = (vertical: FirstPartyVerticalId): number => {
  const max = getTenantThemeVerticalEnvelope(vertical)?.ranges?.effectIntensity?.max;
  if (typeof max !== 'number') {
    throw new Error(`no effectIntensity ceiling is registered for ${vertical}`);
  }
  return max;
};

/** The static ingress, at `surfaces.effectIntensity`. */
const staticVariables = (
  vertical: FirstPartyVerticalId,
  effectIntensity?: unknown
): Record<string, string> =>
  lowerBrandThemeFixture({
    brandTheme: {
      id: `ei-${vertical}`,
      name: 'Effect Intensity',
      palette: { primaryColor: '#0F766E' },
      surfaces: effectIntensity === undefined ? {} : { effectIntensity },
    } as unknown as BrandTheme,
    tenantSlug: vertical,
  }).cssVariables;

/**
 * The DB ingress, at `appearance.general.surfaces.effectIntensity`.
 *
 * The slug is a CUSTOMER slug on purpose: `assertTenantIdentityAllowed`
 * reserves the first-party ones, because the DB door belongs to customer
 * tenants while `verticalKey` still selects the code-owned envelope they are
 * measured against. That pairing is the whole point of this file.
 */
const dbDocument = (effectIntensity?: unknown): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: 'simple',
    appearance: {
      palette: { primary: '#0F766E' },
      ...(effectIntensity === undefined ? {} : { surfaces: { effectIntensity } }),
    },
  }) as unknown as TenantThemeDocument;

type DbOutcome =
  | { accepted: true; value: string | undefined }
  | { accepted: false; issues: readonly { code: string; path: string }[] };

const dbOutcome = (
  vertical: FirstPartyVerticalId,
  effectIntensity?: unknown
): DbOutcome => {
  try {
    const config = hydrateTenantThemeConfig(dbDocument(effectIntensity), {
      tenantId: `probe-tenant-${vertical}`,
      slug: `probe-tenant-${vertical}`,
      verticalKey: vertical,
      rowVersion: 1,
    });
    return { accepted: true, value: compileTenantThemeConfig(config).variables[CHANNEL] };
  } catch (error) {
    if (!(error instanceof TenantThemeValidationError)) throw error;
    return {
      accepted: false,
      issues: error.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    };
  }
};

describe('surfaces.effect-intensity · the two doors agree inside the envelope', () => {
  it.each(VERTICALS)('lowers mate and sobrio identically on both doors (%s)', (vertical) => {
    for (const stop of ['mate', 'sobrio'] as const) {
      const value = STOPS[stop];
      expect(value).toBeLessThanOrEqual(ceilingOf(vertical));

      const fromStatic = staticVariables(vertical, value)[CHANNEL];
      const fromDb = dbOutcome(vertical, value);

      expect(fromDb.accepted, `${stop} must be inside the ${vertical} envelope`).toBe(true);
      expect(fromStatic, `${stop} must reach ${CHANNEL} on the static door`).toBeDefined();
      // Equal BYTES on the same channel. "Both non-empty" would pass on two
      // different numbers, which is the claim this assertion exists to refuse.
      expect(fromStatic).toBe((fromDb as { value: string | undefined }).value);
      expect(fromStatic).toBe(String(value));
    }
  });

  it('lowers 0 as a real stop rather than treating it as absent', () => {
    // The single most interesting stop this control has is also the one a
    // truthiness test anywhere on the path would erase.
    expect(staticVariables('rottay', 0)[CHANNEL]).toBe('0');
    expect(dbOutcome('rottay', 0)).toEqual({ accepted: true, value: '0' });
    // ... and an ABSENT input is not the same thing as 0: it is the DS default.
    expect(staticVariables('rottay', undefined)[CHANNEL]).toBe('1');
  });
});

describe('surfaces.effect-intensity · estandar is vertical authorship, by rejection', () => {
  it.each(VERTICALS)('accepts estandar on the STATIC door (%s)', (vertical) => {
    expect(staticVariables(vertical, STOPS.estandar)[CHANNEL]).toBe('1');
  });

  it.each(VERTICALS)('REFUSES estandar on the DB door, fail-closed (%s)', (vertical) => {
    const ceiling = ceilingOf(vertical);
    // The premise of the whole assertion: 1 really is above this vertical's
    // ceiling. Without this line the test would pass vacuously if a future
    // envelope widened to 1.
    expect(STOPS.estandar).toBeGreaterThan(ceiling);

    const outcome = dbOutcome(vertical, STOPS.estandar);
    expect(outcome.accepted, `${vertical} must not accept 1 through the DB door`).toBe(false);
    expect((outcome as { issues: readonly { code: string; path: string }[] }).issues).toEqual([
      { code: 'invalid_value', path: '$.appearance.surfaces.effectIntensity' },
    ]);
  });

  it.each(VERTICALS)('refuses rather than CLAMPS to the ceiling (%s)', (vertical) => {
    // A clamp and a rejection are both "the tenant does not get 1". They are
    // not the same product decision: a clamp hands back 0.65 while reporting
    // success, so the tenant's editor shows a value the compiler silently
    // replaced. Prove the ceiling value is separately reachable, and that
    // asking for 1 does NOT produce it.
    const ceiling = ceilingOf(vertical);
    expect(dbOutcome(vertical, ceiling)).toEqual({ accepted: true, value: String(ceiling) });
    expect(dbOutcome(vertical, STOPS.estandar).accepted).toBe(false);
  });
});

describe('surfaces.effect-intensity · the envelope is a closed interval', () => {
  it.each(VERTICALS)('refuses a value BELOW the floor (%s)', (vertical) => {
    const outcome = dbOutcome(vertical, -0.1);
    expect(outcome.accepted).toBe(false);
    // Below the GLOBAL floor (0), so the schema refuses it before the
    // per-vertical envelope is consulted. Asserted as found rather than
    // assumed to take the same path as the ceiling case.
    expect((outcome as { issues: readonly { code: string; path: string }[] }).issues).toEqual([
      { code: 'invalid_value', path: '$.appearance.surfaces.effectIntensity' },
    ]);
  });

  it.each(VERTICALS)('refuses a value ABOVE the global cap (%s)', (vertical) => {
    const beyond = TENANT_THEME_EFFECT_INTENSITY_BOUNDS.max + 0.5;
    const outcome = dbOutcome(vertical, beyond);
    expect(outcome.accepted).toBe(false);
    expect((outcome as { issues: readonly { code: string; path: string }[] }).issues).toEqual([
      { code: 'invalid_value', path: '$.appearance.surfaces.effectIntensity' },
    ]);
  });

  it('states the ceilings this run measured against', () => {
    // Not a duplicate of the envelope: a printed, asserted record of WHICH
    // numbers the rejections above were rejections against, so a reader of the
    // evidence does not have to re-derive them from the compiler source.
    expect(Object.fromEntries(VERTICALS.map((v) => [v, ceilingOf(v)]))).toEqual({
      rottay: 0.65,
      bithire: 0.65,
      evnto: 0.75,
    });
  });
});
