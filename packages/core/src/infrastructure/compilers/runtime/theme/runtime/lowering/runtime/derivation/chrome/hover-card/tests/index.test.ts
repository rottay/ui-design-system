/**
 * The hover-card family under the shared contract battery; it produces no
 * focus colour, because the card is never a focus target.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import { buildLoweringContext } from "../../../../pipeline";
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
  it("is not produced: the card is never a focus target and no skin reads the channel", () => {
    expect(hoverCardChromeDeriver.produces).not.toContain("--ds-hover-card-focus-color");
    expect(hoverCardChromeDeriver.consumes).not.toContain("states.focus");
    for (const fixture of FIXTURES) {
      const derived = hoverCardChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(Object.keys(derived).filter((channel) => channel.includes("focus")), fixture.label).toEqual([]);
    }
    expect(
      readFileSync(
        resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/hover-card/index.css"),
        "utf8"
      )
    ).not.toContain("--ds-hover-card-focus-color");
  });
});
