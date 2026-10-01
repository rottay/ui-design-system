/**
 * The column-menu family under the shared contract battery: generated from the
 * one template every family answers, never restated here in its own words.
 */
import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import { FAMILY_DERIVERS } from "../../..";
import { columnMenuChromeDeriver, deriveColumnMenuChannels } from "..";

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

describeFamilyContract(columnMenuChromeDeriver, FIXTURES);

describe("chrome/column-menu", () => {
  it("is registered once, at rank derived", () => {
    expect(
      FAMILY_DERIVERS.filter((deriver) => deriver === columnMenuChromeDeriver)
    ).toHaveLength(1);
    expect(columnMenuChromeDeriver.family).toBe("column-menu");
    expect(columnMenuChromeDeriver.rank).toBe("derived");
  });

  it("rides the panel rhythm on the density scale, at today's px when the dial is unset", () => {
    const dense = (px: number) => `calc(${px}px * var(--ds-density-effective-scale, 1))`;
    const vars = deriveColumnMenuChannels();
    expect(columnMenuChromeDeriver.consumes).toContain("density");
    expect({
      header: vars["--ds-column-menu-header-padding"],
      body: vars["--ds-column-menu-body-padding"],
      row: vars["--ds-column-menu-row-padding"],
      sectionGap: vars["--ds-column-menu-section-gap"],
      sectionPadding: vars["--ds-column-menu-section-padding-block-start"],
      footer: vars["--ds-column-menu-footer-padding"],
    }).toEqual({
      header: `${dense(18)} ${dense(20)} ${dense(16)}`,
      body: dense(14),
      row: `${dense(13)} ${dense(15)}`,
      sectionGap: dense(8),
      sectionPadding: dense(14),
      footer: dense(12),
    });
    // The count pill's box is fixed, so its inline padding is too.
    expect(vars["--ds-column-menu-count-padding-inline"]).toBe("8px");
  });
});
