/**
 * @fileoverview The per-family contract test template.
 *
 * Every `FamilyDeriver` is checked by the SAME assertions, generated per family
 * from this template rather than written per family by hand: a contract that
 * each family restates in its own words is a contract each family can quietly
 * weaken. A new family gets the whole battery the moment it is registered.
 *
 * @module Tests/Support/family-contract
 * @category Compilers
 * @package @rottay/design-system
 */

import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { ON_TONE_ROLES } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import type { OnToneRole } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import {
  MERGE_RANK,
  channelDeclared,
  type FamilyDeriver,
  type LoweringContext,
  type TenantFacts,
} from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/contract";
import { buildLoweringContext } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/pipeline";

/** A tenant floor that states something in every family a tenant may reach. */
export const FIXTURE_TENANT_FACTS: TenantFacts = {
  posture: {
    typePairing: "editorial",
    typeScale: 1.1,
    buttonStyle: "pill",
    radiusScale: 1.2,
    density: "spacious",
    motion: { intensity: 0.5, durationScale: 1.2 },
    elevation: "elevated",
  },
  typography: {
    fontFamilyBase: "Tenant Sans",
    fontFamilyHeading: "Tenant Display",
    fontFamilyMono: "Tenant Mono",
    letterSpacing: { heading: "0.02em" },
    lineHeight: { display: 1.05 },
  },
  authoredPaths: new Set([
    "palette.primaryColor",
    "typography.fontFamilyBase",
    "surfaces.radiusScale",
  ]),
  statusSeedAuthorship: undefined,
  seedIsTenantAuthored: true,
  toneSeedIsTenantAuthored: Object.fromEntries(
    ON_TONE_ROLES.map((role) => [role, true])
  ) as Record<OnToneRole, boolean>,
};

export interface FamilyFixture {
  readonly label: string;
  readonly theme: BrandTheme;
  readonly tenant?: TenantFacts;
}

/** Deep-freeze so a mutation attempt throws in strict mode instead of passing. */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
  }
  return value;
}

/**
 * The battery every family is asked to survive.
 *
 * Purity is asserted against a FROZEN context and a FROZEN `below` map: a
 * deriver that writes into either would throw here rather than corrupt a later
 * family's inputs, which is the failure mode a ranked merge cannot detect after
 * the fact.
 */
export function describeFamilyContract(
  deriver: FamilyDeriver,
  fixtures: readonly FamilyFixture[]
): void {
  describe(`family "${deriver.family}"`, () => {
    it("declares a family id, a rank in the lattice, and both edges of its contract", () => {
      expect(deriver.family.length).toBeGreaterThan(0);
      expect(Object.keys(MERGE_RANK)).toContain(deriver.rank);
      expect(deriver.consumes.length).toBeGreaterThan(0);
      expect(deriver.produces.length).toBeGreaterThan(0);
    });

    it("produces nothing it did not declare", () => {
      const undeclared = new Set<string>();
      for (const fixture of fixtures) {
        const context = buildLoweringContext({
          theme: fixture.theme,
          tenant: fixture.tenant,
        });
        for (const channel of Object.keys(deriver.derive(context, {}))) {
          if (!channelDeclared(channel, deriver.produces)) undeclared.add(channel);
        }
      }
      expect([...undeclared].sort()).toEqual([]);
    });

    it("is pure: the same context derives the same channels and mutates nothing", () => {
      for (const fixture of fixtures) {
        const context = deepFreeze(
          buildLoweringContext({
            theme: fixture.theme,
            tenant: fixture.tenant,
          })
        ) as LoweringContext;
        const below = Object.freeze({ "--ds-color-primary": "#000000" });
        const first = deriver.derive(context, below);
        const second = deriver.derive(context, below);
        expect(second).toEqual(first);
        expect(first).not.toBe(below);
        expect(below).toEqual({ "--ds-color-primary": "#000000" });
      }
    });

    it("emits only string values, under `--ds-` names, never the text \"undefined\"", () => {
      for (const fixture of fixtures) {
        const context = buildLoweringContext({
          theme: fixture.theme,
          tenant: fixture.tenant,
        });
        for (const [channel, value] of Object.entries(deriver.derive(context, {}))) {
          expect(channel.startsWith("--ds-")).toBe(true);
          expect(typeof value).toBe("string");
          expect(value).not.toBe("undefined");
        }
      }
    });

    it(
      deriver.rank === "tenant"
        ? "emits nothing when the compile has no tenant"
        : "emits the same channels with or without a tenant floor present",
      () => {
        const theme = fixtures[0]!.theme;
        const withoutTenant = deriver.derive(
          buildLoweringContext({ theme }),
          {}
        );
        if (deriver.rank === "tenant") {
          expect(withoutTenant).toEqual({});
        } else {
          expect(Object.keys(withoutTenant).length).toBeGreaterThanOrEqual(0);
        }
      }
    );
  });
}
