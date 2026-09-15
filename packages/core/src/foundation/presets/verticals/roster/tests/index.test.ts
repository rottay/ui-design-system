import { describe, expect, it } from "vitest";


import { FIRST_PARTY_VERTICAL_ROSTER, FIRST_PARTY_VERTICALS } from "..";
import { FIRST_PARTY_BASELINES, firstPartyFixture } from "@tests/support/theme-lowering";

const bithireBrandTheme = firstPartyFixture('bithire');
const evntoBrandTheme = firstPartyFixture('evnto');
const rottayBrandTheme = firstPartyFixture('rottay');

const BRAND_THEME_BY_SLUG = {
  rottay: rottayBrandTheme,
  bithire: bithireBrandTheme,
  evnto: evntoBrandTheme,
} as const;

describe("the roster names a vertical and carries no theme", () => {
  it("has no theme field on any row", () => {
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      expect("theme" in row).toBe(false);
    }
  });

  it("labels the baseline it names: id, name and default mode", () => {
    // The roster is the authority; the composed baseline must restate it exactly.
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      const theme = FIRST_PARTY_BASELINES[row.slug];
      expect(theme.id).toBe(row.themeId);
      expect(theme.name).toBe(row.name);
      expect(theme.appearance.defaultMode).toBe(row.defaultMode);
    }
  });

  it("DRILL: a row whose theme disagrees on the default mode fails the agreement", () => {
    const mutated = { ...FIRST_PARTY_VERTICALS.rottay, defaultMode: "light" as const };
    expect(() => {
      expect(FIRST_PARTY_BASELINES.rottay.appearance.defaultMode).toBe(mutated.defaultMode);
    }).toThrow();
  });
});
