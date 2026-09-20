/**
 * The `tag` press transform rides the governed press dial: three authored
 * `surfaces.stateEmphasis` postures resolve to three different scales.
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
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { statesDeriver } from "../../../states";
import { tagChromeDeriver } from "..";

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
  {
    label: "minimal under a tenant floor",
    theme: MINIMAL_THEME,
    tenant: FIXTURE_TENANT_FACTS,
  },
];

describeFamilyContract(tagChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

const PRESS = "--ds-tag-press-transform";
const WIRED_CHAIN = "translateY(0) scale(var(--ds-state-press-scale))";

const context = (theme: FlatTheme) => buildLoweringContext({ theme });

/** The press scale each posture lands on the governed root, end to end. */
function pressScaleFor(emphasis: "subtle" | "medium" | "strong"): string {
  const theme: FlatTheme = { ...MINIMAL_THEME, surfaces: { stateEmphasis: emphasis } };
  const { channels } = runDerivation(context(theme), [statesDeriver, tagChromeDeriver]);
  const transform = channels[PRESS];
  const root = channels["--ds-state-press-scale"];
  expect(transform, `${emphasis}: the press transform reads the governed root`).toBe(WIRED_CHAIN);
  return transform.replace("var(--ds-state-press-scale)", root);
}

describe("chrome/tag press dial", () => {
  it("states the press transform through the governed press root, not a literal", () => {
    const derived = tagChromeDeriver.derive(context(MINIMAL_THEME), {});
    expect(derived[PRESS]).toBe(WIRED_CHAIN);
    expect(derived[PRESS]).not.toContain("0.98");
  });

  it("CAUSALITY: the three emphasis postures resolve to three distinct press scales", () => {
    const subtle = pressScaleFor("subtle");
    const medium = pressScaleFor("medium");
    const strong = pressScaleFor("strong");

    expect(subtle).toBe("translateY(0) scale(0.99)");
    expect(medium).toBe("translateY(0) scale(0.98)");
    expect(strong).toBe("translateY(0) scale(0.965)");
    expect(new Set([subtle, medium, strong]).size).toBe(3);
  });

  it("keeps the unauthored posture byte-identical to the retired literal", () => {
    expect(pressScaleFor("medium")).toBe("translateY(0) scale(0.98)");
  });

  it("leaves the skin fallback as the literal floor for a render with no artifact", () => {
    expect(SKIN).toContain(`transform: var(${PRESS}, translateY(0) scale(0.98));`);
  });

  it("declares the press decision it now consumes", () => {
    expect(tagChromeDeriver.consumes).toContain("states.press");
  });

  it("names only its own family namespace", () => {
    for (const channel of tagChromeDeriver.produces) {
      expect(channel.startsWith("--ds-tag-")).toBe(true);
    }
  });

  it("yields the press channel to a vertical or tenant statement of it", () => {
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: [PRESS],
        derive: () => ({ [PRESS]: rank }),
      };
      const result = runDerivation(context(MINIMAL_THEME), [tagChromeDeriver, stated]);
      expect(result.channels[PRESS]).toBe(rank);
      expect(result.provenance.get(PRESS)?.rank).toBe(rank);
    }
  });
});
