/**
 * The tour family under the shared contract battery, and its focus colour:
 * transparent by default, so the surface and its controls rest on the tenant's
 * focus signature, and outranked by a tenant statement.
 */
import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { tourChromeDeriver } from "..";

const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: firstPartyFixture("rottay") },
  { label: "bithire", theme: firstPartyFixture("bithire") },
  { label: "evnto", theme: firstPartyFixture("evnto") },
  { label: "minimal", theme: MINIMAL_THEME },
  {
    label: "bithire under a tenant floor",
    theme: firstPartyFixture("bithire"),
    tenant: FIXTURE_TENANT_FACTS,
  },
];

describeFamilyContract(tourChromeDeriver, FIXTURES);

describe("chrome/tour focus colour", () => {
  it("stays transparent on every theme, so the tour rests on the tenant's focus signature", () => {
    for (const fixture of FIXTURES) {
      const derived = tourChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(derived["--ds-tour-focus-ring"], fixture.label).toBe("transparent");
    }
    expect(tourChromeDeriver.produces).toContain("--ds-tour-focus-ring");
  });

  it("lets a tenant statement of the colour outrank the transparent default", () => {
    const tenant: FamilyDeriver = {
      family: "stated-tenant-tour-focus",
      rank: "tenant",
      consumes: ["chrome.*"],
      produces: ["--ds-tour-focus-ring"],
      derive: () => ({ "--ds-tour-focus-ring": "currentColor" }),
    };
    const result = runDerivation(buildLoweringContext({ theme: firstPartyFixture("bithire") }), [
      tourChromeDeriver,
      tenant,
    ]);
    expect(result.channels["--ds-tour-focus-ring"]).toBe("currentColor");
    expect(result.provenance.get("--ds-tour-focus-ring")?.rank).toBe("tenant");
  });
});
