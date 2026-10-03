/**
 * The hover-card family under the shared contract battery, and its focus
 * colour: transparent by default, so the card's frame rests on the tenant's
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
import { hoverCardChromeDeriver } from "..";

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

describeFamilyContract(hoverCardChromeDeriver, FIXTURES);

describe("chrome/hover-card focus colour", () => {
  it("stays transparent on every theme, so the card's frame rests on the tenant's focus signature", () => {
    for (const fixture of FIXTURES) {
      const derived = hoverCardChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(derived["--ds-hover-card-focus-color"], fixture.label).toBe("transparent");
    }
    expect(hoverCardChromeDeriver.produces).toContain("--ds-hover-card-focus-color");
  });

  it("lets a tenant statement of the colour outrank the transparent default", () => {
    const tenant: FamilyDeriver = {
      family: "stated-tenant-hover-card-focus",
      rank: "tenant",
      consumes: ["chrome.*"],
      produces: ["--ds-hover-card-focus-color"],
      derive: () => ({ "--ds-hover-card-focus-color": "currentColor" }),
    };
    const result = runDerivation(buildLoweringContext({ theme: firstPartyFixture("bithire") }), [
      hoverCardChromeDeriver,
      tenant,
    ]);
    expect(result.channels["--ds-hover-card-focus-color"]).toBe("currentColor");
    expect(result.provenance.get("--ds-hover-card-focus-color")?.rank).toBe("tenant");
  });
});
