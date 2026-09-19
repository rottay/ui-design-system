/**
 * The widget-board family under the shared contract battery: generated from the
 * one template every family answers, never restated here in its own words.
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
import { FAMILY_DERIVERS } from "../../..";
import { widgetBoardChromeDeriver } from "..";

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

describeFamilyContract(widgetBoardChromeDeriver, FIXTURES);

describe("chrome/widget-board", () => {
  it("is registered once, at rank derived", () => {
    expect(
      FAMILY_DERIVERS.filter((deriver) => deriver === widgetBoardChromeDeriver)
    ).toHaveLength(1);
    expect(widgetBoardChromeDeriver.family).toBe("widget-board");
    expect(widgetBoardChromeDeriver.rank).toBe("derived");
  });

  it("reads the rearrange duration through to its motion rung", () => {
    const skin = readFileSync(
      resolve(
        process.cwd(),
        "src/foundation/tokens/css/presentation/components/skin/widget-board/index.css"
      ),
      "utf8"
    );
    const reads = skin.match(/var\(--ds-motion-rearrange(, var\(--[a-z-]+, [^)]+\))?\)/g) ?? [];
    expect(reads.length).toBeGreaterThan(0);
    for (const read of reads) {
      expect(read).toBe("var(--ds-motion-rearrange, var(--ds-motion-slow, 320ms))");
    }
  });

  it("does not produce channels outside its own namespace", () => {
    const derived = widgetBoardChromeDeriver.derive(
      buildLoweringContext({ theme: firstPartyFixture("bithire") }),
      {}
    );
    /* `--ds-motion-rearrange` is a foundation root (slow × duration scale);
       the family only chains its skin reads to it. */
    expect(derived["--ds-motion-rearrange"]).toBeUndefined();
    /* The runtime placement channels are stamped by the solver and rest at
       `auto`, which no governed root reproduces; the skin declares them. */
    expect(derived["--ds-widget-board-cell-column"]).toBeUndefined();
    expect(derived["--ds-widget-board-cell-row"]).toBeUndefined();
    expect(derived["--ds-widget-board-cell-height"]).toBeUndefined();
  });
});
